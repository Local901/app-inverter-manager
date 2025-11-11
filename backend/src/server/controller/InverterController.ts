import { IRouter, type RequestHandler, Router } from "express";
import { Controller } from "./Controller.js";
import type { InverterRepository } from "../../repository/InverterRepository.js";
import { JsonEndpoint } from "../endpoints/JsonEndpoint.js";
import { getInverterInfo } from "../../config/Inverter.js";
import { InverterType } from "../../types/Inverter.js";
import { v } from "@local901/validator";
import { NotFound } from "../errors/NotFound.js";
import type { FormConfig } from "../../types/FormConfig.js";
import { actionConfig, type ActionTypes } from "../../config/Action.js";
import { scheduleConfig } from "../../config/Schedule.js";
import { Inverter, type InverterChild } from "../../models/Inverter.js";
import { HttpError } from "../errors/HttpError.js";

const idValidator = v.object({
    id: v.string({ regex: /^[1-9][0-9]*|0$/ }),
});

const createActionParams = v.object({
    id: v.string({ regex: /^[1-9][0-9]*|0$/ }),
    type: v.string<keyof typeof actionConfig>({ enum: Object.keys(actionConfig) }),
});

export class InverterController implements Controller {
    public constructor(
        private readonly inverterRepository: InverterRepository,
    ) {

    }

    private getAllInverters(): RequestHandler {
        return JsonEndpoint(async () => {
            const inverters = await this.inverterRepository.getAllInverters();
            return await Promise.all(inverters.map(async (i) => {
                return i.connect((inverter) => inverter.toShortInfo());
            }));
        });
    }

    private getInverter(): RequestHandler {
        return JsonEndpoint<{ id: string }>(async (req) => {
            if (!idValidator.validate(req.params)) {
                throw new NotFound();
            }

            const id = Number.parseInt(req.params.id);
            const inverter = await this.inverterRepository.getById(id);
            if (!inverter) {
                throw new NotFound();
            }

            return inverter.connect((i) => i.toInfo());
        });
    }

    private deleteInverter(): RequestHandler {
        return JsonEndpoint<{ id: string }>(async (req, res) => {
            if (!idValidator.validate(req.params)) {
                throw new NotFound();
            }

            const id = Number.parseInt(req.params.id);
            if (!await this.inverterRepository.delete(id)) {
                throw new HttpError("Something went wrong");
            }
            res.redirect("/inverter");
            return;
        });
    }

    private getInverterSettings(): RequestHandler {
        return JsonEndpoint<{ id: string }>(async (req) => {
            if (!idValidator.validate(req.params)) {
                throw new NotFound();
            }

            const id = Number.parseInt(req.params.id);
            const inverter = await this.inverterRepository.getById(id);
            if (!inverter) {
                throw new NotFound();
            }

            const info = getInverterInfo(inverter.type);

            if (!info) {
                return [];
            }

            return {
                href: `/api/inverter/${id}/settings`,
                data: {
                    name: {
                        type: "string",
                        min: 1,
                        value: inverter.name,
                    },
                    ...Object.fromEntries(Object.entries(info.config).map(([key, conf]) => [
                        key,
                        {
                            ...conf,
                            value: inverter.options[key],
                        },
                    ])),
                },
            } as FormConfig;
        });
    }

    private postInverterSettings(): RequestHandler {
        return JsonEndpoint<{ id: string}, {}, Record<string, string>>(async (req, res) => {
            if (!idValidator.validate(req.params)) {
                throw new NotFound();
            }

            const id = Number.parseInt(req.params.id);
            const inverter = await this.inverterRepository.getById(id);
            if (!inverter) {
                throw new NotFound();
            }

            await this.inverterRepository.updateOptions(inverter, req.body);
            res.redirect(`/inverter/${id}`);
        });
    }

    private getCreateOptions(): RequestHandler {
        return JsonEndpoint<{ type: string }>(async (req) => {
            const result = getInverterInfo(req.params.type);
            if (!result) {
                throw new NotFound();
            }
            return {
                href: `/api/inverter/create/${req.params.type}`,
                data: {
                    name: {
                        type: "string",
                        required: true,
                        min: 1,
                    },
                    ...result.config,
                }
            } as FormConfig;
        });
    }

    private createInverter(): RequestHandler {
        return JsonEndpoint<{ type: string }, {}, Record<string, string>>(async (req, res) => {
            const inverter = await this.inverterRepository.build(req.params.type, req.body);

            res.redirect(`/inverter/${inverter.id}`);
        });
    }

    private getSubCreateOptions(
        configSet: Record<ActionTypes, (inc: InverterChild) => Promise<FormConfig["data"]>>,
        path: string,
    ): RequestHandler {
        return JsonEndpoint<{ id: string, type: string }>(async (req) => {
            if (!createActionParams.validate(req.params)) {
                throw new NotFound();
            }

            const id = Number.parseInt(req.params.id);
            const type = req.params.type;

            const inverter = await this.inverterRepository.getById(id);
            if (!inverter) {
                throw new NotFound();
            }

            const config = await inverter.connect((i) => configSet[type](i));

            return {
                href: `/api/${path}/create/${type}`,
                data: config,
            } as FormConfig
        });
    }

    public mount(router: IRouter): void {
        const invRouter = Router();

        invRouter.get("/", this.getAllInverters());
        invRouter.get(/\/(?<id>\d+)\/?$/, this.getInverter());
        invRouter.delete(/\/(?<id>\d+)\/?$/, this.deleteInverter());
        invRouter.post(/\/(?<id>\d+)\/delete\/?$/, this.deleteInverter());
        invRouter.get(/\/(?<id>\d+)\/settings\/?$/, this.getInverterSettings());
        invRouter.post(/\/(?<id>\d+)\/settings\/?$/, this.postInverterSettings());

        invRouter.get(/\/(?<id>\d+)\/action\/create\/(?<type>.*)\/?$/, this.getSubCreateOptions(actionConfig, "action"));
        invRouter.get(/\/(?<id>\d+)\/schedule\/create\/(?<type>.*)\/?$/, this.getSubCreateOptions(scheduleConfig, "schedule"));
        
        invRouter.get("/types", JsonEndpoint(() => InverterType));
        invRouter.get("/create/:type", this.getCreateOptions());
        invRouter.post("/create/:type", this.createInverter());

        router.use("/inverter", invRouter);
    }
}

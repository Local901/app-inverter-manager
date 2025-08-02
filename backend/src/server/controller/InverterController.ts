import { IRouter, type RequestHandler, Router } from "express";
import { Controller } from "./Controller.js";
import type { InverterRepository } from "../../repository/InverterRepository.js";
import { JsonEndpoint } from "../endpoints/JsonEndpoint.js";
import { getInverterInfo } from "../../config/Inverter.js";
import { InverterType } from "../../types/Inverter.js";
import type { ActionRepository } from "../../repository/ActionRepository.js";
import { v } from "@local901/validator";
import { NotFound } from "../errors/NotFound.js";
import type { FormConfig } from "../../types/FormConfig.js";
import { actionConfig } from "../../config/Action.js";

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
        private readonly actionRepository: ActionRepository,
    ) {

    }

    private getAllInverters(): RequestHandler {
        return JsonEndpoint(async () => {
            const inverters = await this.inverterRepository.getAllInverters();
            return await Promise.all(inverters.map(async (i) => {
                await i.start();
                const result = await i.toShortInfo();
                await i.stop();
                return result;
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

            await inverter.start();
            const result = await inverter.toInfo();
            await inverter.stop();
            return result;
        });
    }

    private getActions(): RequestHandler {
        return JsonEndpoint<{ id: string }, { start?: string, end?: string }>(async (req) => {
            const id = Number.parseInt(req.params.id);
            if (Number.isNaN(id)) {
                throw new NotFound();
            }
            const start = req.query.start ? new Date(req.query.start) : undefined;
            const end = req.query.end ? new Date(req.query.end) : undefined;

            return this.actionRepository.getActionsForInverter(id, start, end)
                .then((result) => result.map((action) => action.getMessage(start ?? new Date(), end ?? new Date())).filter((a) => !!a));
        })
    }

    private deleteInverter(): RequestHandler {
        return JsonEndpoint<{ id: string }>(async (req, res) => {
            if (!idValidator.validate(req.params)) {
                throw new NotFound();
            }

            const id = Number.parseInt(req.params.id);
            if (!await this.inverterRepository.delete(id)) {
                res.status(500);
                return "Something went wrong";
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

    private getActionCreateOptions(): RequestHandler {
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

            await inverter.start();
            const config = await actionConfig[type](inverter);
            await inverter.stop();

            return {
                href: `/api/action/create/${type}`,
                data: config,
            } as FormConfig
        });
    }

    public mount(router: IRouter): void {
        const invRouter = Router();

        invRouter.get("/", this.getAllInverters());
        invRouter.get(/\/(?<id>\d+)\/?$/, this.getInverter());
        invRouter.delete(/\/(?<id>\d+)\/?$/, this.deleteInverter());
        invRouter.get(/\/(?<id>\d+)\/actions\/?$/, this.getActions());
        invRouter.post(/\/(?<id>\d+)\/delete\/?$/, this.deleteInverter());
        invRouter.get(/\/(?<id>\d+)\/settings\/?$/, this.getInverterSettings());
        invRouter.post(/\/(?<id>\d+)\/settings\/?$/, this.postInverterSettings());

        invRouter.get(/\/(?<id>\d+)\/action\/create\/(?<type>.*)\/?$/, this.getActionCreateOptions());
        
        invRouter.get("/types", JsonEndpoint(() => InverterType));
        invRouter.get("/create/:type", this.getCreateOptions());
        invRouter.post("/create/:type", this.createInverter());

        router.use("/inverter", invRouter);
    }
}

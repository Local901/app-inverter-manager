import { IRouter, type RequestHandler, Router } from "express";
import { Controller } from "./Controller.js";
import { JsonEndpoint } from "../endpoints/JsonEndpoint.js";
import { getInverterInfo } from "../../config/Inverter.js";
import { InverterType, type InverterShortInfoResponse } from "../../types/Inverter.js";
import { v } from "@local901/validator";
import { NotFound } from "../errors/NotFound.js";
import { Inverter } from "../../models/Inverter.js";
import type { EntityManager } from "typeorm";
import { parseSettings } from "../../utilities/Settings.js";
import { Schedule } from "../../models/Schedule.js";
import { InverterSchedule } from "../../models/InverterSchedule.js";

const settingsValidator = v.record<Record<string, string>>(v.string());

const createInverterBodyValidator = v.object({
    name: v.string(),
    type: v.string<InverterType>({ enum: InverterType }),
    settings: settingsValidator,
});

const inverterScheduleUpdateValidator = v.array(v.string({ regex: /\d+/ }));

export class InverterController implements Controller {
    public constructor(private readonly manager: EntityManager) {

    }

    private getAllInverters(): RequestHandler {
        return JsonEndpoint(async () => {
            const inverters: InverterShortInfoResponse[] = [];

            for (const inverter of (await this.manager.find(Inverter))) {
                inverters.push(
                    await inverter.connect((i) => i.toShortInfo()),
                );
            }

            return {
                inverters,
            };
        });
    }

    private createInverter(): RequestHandler {
        return JsonEndpoint(async (req) => {
            const { body } = req;
            v.validateOrThrow(createInverterBodyValidator, body);

            const info = getInverterInfo(body.type);

            if (!info) {
                throw new NotFound();
            }

            const inverter = this.manager.create(Inverter, {
                name: body.name,
                type: body.type,
                options: parseSettings(info?.config, body.settings as Record<string, string>),
            });
            await this.manager.save(inverter);
            return {
                id: inverter.id,
            };
        });
    }

    private getTypeSettings(): RequestHandler {
        return JsonEndpoint<{ type: string }>((req) => {
            if (!v.string<InverterType>({ enum: InverterType }).validate(req.params.type)) {
                throw new NotFound();
            }

            const info = getInverterInfo(req.params.type);
            return info?.config
        });
    }

    private async getSchedules(inverterId: number): Promise<Schedule[]> {
        return this.manager.find(Schedule, {
            where: {
                inverterRelations: {
                    inverterId,
                },
            },
            order: {
                inverterRelations: {
                    order: "ASC",
                },
            },
        });
    }

    private getInverterInfo(): RequestHandler {
        return JsonEndpoint<{ id: string }>(async (req) => {
            const id = Number.parseInt(req.params.id);
            if (isNaN(id)) {
                throw new NotFound();
            }

            const inverter = await this.manager.findOneBy(Inverter, { id });
            if (!inverter) {
                throw new NotFound();
            }

            const info = await inverter.connect((i) => i.toInfo());
            const schedules = await this.getSchedules(inverter.id);

            return {
                ...info,
                schedules: schedules.map((s) => ({
                    id: `${s.id}`,
                    name: s.name,
                    type: s.type,
                })),
            }
        });
    }

    private deleteInverter(): RequestHandler {
        return JsonEndpoint<{ id: string }>(async (req) => {
            const id = Number.parseInt(req.params.id);
            if (isNaN(id)) {
                throw new NotFound();
            }

            await this.manager.delete(Inverter, { id });
        });
    }

    private getInverterSchedules(): RequestHandler {
        return JsonEndpoint<{ id: string }>(async (req) => {
            const id = Number.parseInt(req.params.id);
            if (isNaN(id)) {
                return [];
            }
            const schedules = await this.getSchedules(id);
            return schedules.map((s) => ({
                id: `${s.id}`,
                name: s.name,
                type: s.type,
            }));
        });
    }

    private updateInverterSchedules(): RequestHandler {
        return JsonEndpoint<{ id: string }>(async (req) => {
            const id = Number.parseInt(req.params.id);
            if (isNaN(id)) {
                throw new NotFound();
            }

            const { body } = req;
            v.validateOrThrow(inverterScheduleUpdateValidator, body)

            const ids = body.map((v) => Number.parseInt(v));

            await this.manager.transaction(async (m) => {
                await m.delete(InverterSchedule, { inverterId: id });
                const newRelations = ids.map((scheduleId, index) => m.create(InverterSchedule, {
                    inverterId: id,
                    scheduleId,
                    order: index,
                }));
                await m.save(newRelations);
            });
        });
    }

    private getInverterSettings(): RequestHandler {
        return JsonEndpoint<{ id: string }>(async (req) => {
            const id = Number.parseInt(req.params.id);
            if (isNaN(id)) {
                throw new NotFound();
            }

            const inverter = await this.manager.findOneBy(Inverter, { id });
            if (!inverter) {
                throw new NotFound();
            }

            return Object.fromEntries(Object.entries(inverter.options).map(([key, value]) => [key, `${value}`]));
        });
    }

    private updateInverterSettings(): RequestHandler {
        return JsonEndpoint<{ id: string }>(async (req) => {
            const id = Number.parseInt(req.params.id);
            if (isNaN(id)) {
                throw new NotFound();
            }

            const { body } = req;
            v.validateOrThrow(settingsValidator, body);

            const inverter = await this.manager.findOneBy(Inverter, { id });
            if (!inverter) {
                throw new NotFound();
            }
            
            const info = getInverterInfo(inverter.type);

            const newOptions = parseSettings(
                info?.config.map((s) => {
                    s.default = `${inverter.options[s.key]}`;
                    return s;
                }) ?? [],
                body as Record<string, string>,
            );

            await this.manager.save(this.manager.merge(Inverter, inverter, {
                name: body["$/name"],
                options: newOptions,
            }));
        });
    }

    public mount(router: IRouter): void {
        const invRouter = Router();

        invRouter.get("/", this.getAllInverters());
        invRouter.post("/", this.createInverter());
        invRouter.get("/type", JsonEndpoint(() => InverterType));
        invRouter.get("/type/:type", this.getTypeSettings());
        invRouter.get("/:id", this.getInverterInfo());
        invRouter.delete("/:id", this.deleteInverter());
        invRouter.get("/:id/schedules", this.getInverterSchedules());
        invRouter.put("/:id/schedules", this.updateInverterSchedules());
        invRouter.get("/:id/settings", this.getInverterSettings());
        invRouter.post("/:id/settings", this.updateInverterSettings());

        router.use("/inverter", invRouter);
    }
}

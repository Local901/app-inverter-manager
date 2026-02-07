import { Router, type IRouter, type RequestHandler } from "express";
import type { Controller } from "./Controller.js";
import type { EntityManager } from "typeorm";
import { JsonEndpoint } from "../endpoints/JsonEndpoint.js";
import { Schedule, ScheduleType } from "../../models/Schedule.js";
import { NotFound } from "../errors/NotFound.js";
import { ScheduleItem } from "../../models/ScheduleItem.js";
import { v } from "@local901/validator";

const scheduleBodyValidator = v.object({
    name: v.string(),
    type: v.enum(ScheduleType),
});

const updateScheduleValidator = v.object({
    time_zone: v.int(),
});

const timeSlotBodyValidator = v.object({
    action: v.string(),
    value: v.string({ regex: /^\d+$/ }),
});

const deleteTimeSlotBodyValidator = v.object({
    action: v.string(),
});

export class ScheduleController implements Controller {
    public constructor(private readonly manager: EntityManager) {}

    public getSchedules(): RequestHandler {
        return JsonEndpoint(async () => {
            const schedules = await this.manager.find(Schedule);

            return {
                schedules: schedules.map((schedule) => ({
                    id: `${schedule.id}`,
                    name: schedule.name,
                    type: schedule.type,
                })),
            };
        });
    }

    public createSchedule(): RequestHandler {
        return JsonEndpoint(async (req) => {
            const { body } = req;
            v.validateOrThrow(scheduleBodyValidator, body);

            const schedule = this.manager.create(Schedule, {
                name: body.name,
                type: body.type,
            });
            this.manager.save(schedule);

            return {
                id: schedule.id,
            };
        });
    }

    public getSchedule(): RequestHandler {
        return JsonEndpoint<{ id: string }>(async (req) => {
            const id = Number.parseInt(req.params.id);
            if (isNaN(id)) {
                throw new NotFound();
            }

            const schedule = await this.manager.findOne(Schedule, {
                where: { id },
                relations: {
                    items: true,
                },
            });
            if (!schedule) {
                throw new NotFound();
            }

            return schedule.toJson();
        });
    }

    public updateSchedule(): RequestHandler {
        return JsonEndpoint<{ id: string }>(async (req) => {
            const id = Number.parseInt(req.params.id);
            if (isNaN(id)) {
                throw new NotFound();
            }

            const { body } = req;
            v.validateOrThrow(updateScheduleValidator, body);

            await this.manager.update(Schedule, { id }, { timeZone: body.time_zone });
        });
    }

    public deleteSchedule(): RequestHandler {
        return JsonEndpoint<{ id: string }>(async (req) => {
            const id = Number.parseInt(req.params.id);
            if (isNaN(id)) {
                return;
            }

            await this.manager.delete(Schedule, { id });
        });
    }

    public getTimeSlot(): RequestHandler {
        return JsonEndpoint<{ id: string, timeSlot: string }>(async (req) => {
            const id = Number.parseInt(req.params.id);
            const timeSlot = Number.parseInt(req.params.timeSlot);
            if (isNaN(id) || isNaN(timeSlot)) {
                throw new NotFound();
            }

            const items = await this.manager.findBy(ScheduleItem, {
                scheduleId: id,
                startAt: timeSlot,
            });

            return {
                slot: timeSlot,
                actions: Object.fromEntries(items.map((item) => [item.action, `${item.value}`])),
            };
        });
    }

    public setTimeSlot(): RequestHandler {
        return JsonEndpoint<{ id: string, timeSlot: string }>(async (req) => {
            const id = Number.parseInt(req.params.id);
            const timeSlot = Number.parseInt(req.params.timeSlot);
            if (isNaN(id) || isNaN(timeSlot)) {
                throw new NotFound();
            }

            const { body } = req;
            v.validateOrThrow(timeSlotBodyValidator, body);

            const { action, value: valueString } = body;
            const value = Number.parseInt(valueString);

            const item = await this.manager.findOneBy(ScheduleItem, {
                scheduleId: id,
                startAt: timeSlot,
                action,
            });

            if (!item) {
                await this.manager.save(this.manager.create(ScheduleItem, {
                    scheduleId: id,
                    startAt: timeSlot,
                    action,
                    value,
                }));
                return;
            }
            await this.manager.update(ScheduleItem, { id: item.id }, {
                value,
            });
        });
    }

    public deleteTimeSlot(): RequestHandler {
        return JsonEndpoint<{ id: string, timeSlot: string }>(async (req) => {
            const id = Number.parseInt(req.params.id);
            const timeSlot = Number.parseInt(req.params.timeSlot);
            if (isNaN(id) || isNaN(timeSlot)) {
                throw new NotFound();
            }
            
            const { body } = req;
            v.validateOrThrow(deleteTimeSlotBodyValidator, body);

            await this.manager.delete(ScheduleItem, {
                scheduleId: id,
                startAt: timeSlot,
                action: body.action,
            });
        });
    }

    public mount(router: IRouter): void {
        const scheduleRouter = Router();

        scheduleRouter.get("/", this.getSchedules());
        scheduleRouter.post("/", this.createSchedule());
        scheduleRouter.get("/:id", this.getSchedule());
        scheduleRouter.put("/:id", this.updateSchedule());
        scheduleRouter.delete("/:id", this.deleteSchedule());
        scheduleRouter.get("/:id/:timeSlot", this.getTimeSlot());
        scheduleRouter.post("/:id/:timeSlot", this.setTimeSlot());
        scheduleRouter.delete("/:id/:timeSlot", this.deleteTimeSlot());

        router.use("/schedule", scheduleRouter);
    }
}

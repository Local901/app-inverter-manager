import { Router, type IRouter, type RequestHandler } from "express";
import type { Controller } from "./Controller.js";
import type { ScheduleRepository } from "../../repository/ScheduleRepository.js";
import { JsonEndpoint } from "../endpoints/JsonEndpoint.js";
import { v } from "@local901/validator";
import { NotFound } from "../errors/NotFound.js";
import { InverterType } from "../../types/Inverter.js";
import type { ScheduleCreationInfo } from "../../types/Schedule.js";
import { ActionTypes } from "../../config/Action.js";
import { dayInMinutes } from "../../config/Schedule.js";
import { redirectError } from "../errors/RedirectError.js";

const idValidator = v.object({ id: v.string({ regex: /^\d+$/ }) });
const getScheduleForInverterBodyValidator = v.object({ inverterId: v.string({ regex: /^\d+$/ }) });

const createScheduleParams = v.object({
    type: v.string<ActionTypes>({ enum: ActionTypes }),
});

export class ScheduleController implements Controller {
    public constructor(
        private readonly scheduleRepository: ScheduleRepository,
    ) {}

    private getScheduleForInverter(): RequestHandler {
        return JsonEndpoint<{ inverterId: string }>(async (req) => {
            if (!getScheduleForInverterBodyValidator.validate(req.body)) {
                throw new NotFound();
            }
            const id = Number.parseInt(req.body.inverterId);

            const schedule = await this.scheduleRepository.getScheduleForInverter(id);

            return {
                enabled: true,
                elements: schedule.map((s) => ({
                    id: s.id,
                    action: s.action,
                    value: s.value,
                    from: s.from,
                    to: s.to,
                })),
            };
        });
    }

    private createScheduleElement(): RequestHandler {
        return JsonEndpoint<{ inverterId: string }, {}, Record<keyof ScheduleCreationInfo, string>>(async (req) => {
            if (!createScheduleParams.validate(req.params)) {
                throw new NotFound();
            }

            const id = Number.parseInt(req.body.inverterId);
            const type = req.params.type;

            await this.scheduleRepository.createScheduleElement({
                inverterId: id,
                action: type,
                value: Number.parseInt(req.body.value),
                from: Math.max(0, Math.min(Number.parseInt(req.body.from), dayInMinutes)),
                to: Math.max(0, Math.min(Number.parseInt(req.body.to), dayInMinutes)),
            });

            throw new redirectError(`/inverter/${id}`)
        });
    }

    private deleteScheduleElement(): RequestHandler {
        return JsonEndpoint<{ id: string }>(async (req) => {
            if (!idValidator.validate(req.params)) {
                throw new NotFound();
            }

            const id = Number.parseInt(req.params.id);

            await this.scheduleRepository.deleteScheduleElement(id);
        });
    }

    public mount(router: IRouter): void {
        const scheduleRouter = Router();

        scheduleRouter.get(/\/all\/(?<inverterId>\d+)\/?$/, this.getScheduleForInverter());
        // scheduleRouter.post(/\/(?<id>\d+)\/?$/, );
        scheduleRouter.delete(/\/(?<id>\d+)\/?$/, this.deleteScheduleElement());

        scheduleRouter.get("/types", JsonEndpoint(() => InverterType));
        scheduleRouter.post("/create/:type", this.createScheduleElement());

        router.use("/schedule", scheduleRouter);
    }
}

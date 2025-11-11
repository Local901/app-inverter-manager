import type { InverterChild } from "../models/Inverter.js";
import type { DynamicConfig, FormConfig } from "../types/FormConfig.js";
import type { ScheduleCreationInfo } from "../types/Schedule.js";
import type { ActionTypes } from "./Action.js";

export const dayInMinutes = 24 * 60;

function createSchedule(
    valueConfig: (inverter: InverterChild) => Promise<DynamicConfig>,
): (inverter: InverterChild) => Promise<FormConfig<Omit<ScheduleCreationInfo, "action">>["data"]> {
    return async (inverter) => ({
        inverterId: {
            type: "number",
            value: inverter.id,
            hidden: true,
            required: true,
        },
        value: await valueConfig(inverter),
        from: {
            type: "time-minutes",
            min: 0,
            max: dayInMinutes,
            step: 15,
            required: true,
        },
        to: {
            type: "time-minutes",
            min: 0,
            max: dayInMinutes,
            step: 15,
            required: true,
        }
    });
}

export const scheduleConfig: Record<ActionTypes, (inverter: InverterChild) => Promise<FormConfig<Omit<ScheduleCreationInfo, "action">>["data"]>> = {
    charge: createSchedule(async (inverter) => ({
        type: "slider",
        min: -(await inverter.getMaxDischargeRate()),
        max: await inverter.getMaxChargeRate(),
        step: 100,
        required: true,
    })),
}

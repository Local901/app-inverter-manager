import type { Inverter } from "../models/Inverter.js";
import type { ActionCreationInfo } from "../types/Action.js";
import type { FormConfig } from "../types/FormConfig.js";

export const actionConfig = {
    charge: async (inverter) => ({
        inverterId: {
            type: "number",
            value: inverter.id,
            hidden: true,
            required: true,
        },
        value: {
            type: "slider",
            min: -(await inverter.getMaxDischargeRate()),
            max: await inverter.getMaxChargeRate(),
            step: 100,
            required: true,
        },
        repeatWeekly: {
            type: "boolean",
            default: false,
        },
        activeFrom: {
            type: "datetime",
            required: true,
        },
        activeUntil: {
            type: "datetime",
            required: true,
        }
    }),
} satisfies Record<string, (inverter: Inverter) => Promise<FormConfig<Omit<ActionCreationInfo, "action">>["data"]>>;

export const ActionTypes = Object.keys(actionConfig);
export type ActionTypes = keyof typeof actionConfig;

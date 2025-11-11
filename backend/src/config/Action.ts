import type { InverterChild } from "../models/Inverter.js";
import type { ActionCreationInfo } from "../types/Action.js";
import type { DynamicConfig, FormConfig } from "../types/FormConfig.js";

function createAction(
    valueConfig: (inverter: InverterChild) => Promise<DynamicConfig>,
): (inverter: InverterChild) => Promise<FormConfig<Omit<ActionCreationInfo, "action">>["data"]> {
    return async (inverter) => ({
        inverterId: {
            type: "number",
            value: inverter.id,
            hidden: true,
            required: true,
        },
        value: await valueConfig(inverter),
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
    });
}

export const actionConfig = {
    charge: createAction(async (inverter) => ({
        type: "slider",
        min: -(await inverter.getMaxDischargeRate()),
        max: await inverter.getMaxChargeRate(),
        step: 100,
        required: true,
    })),
} satisfies Record<string, (inverter: InverterChild) => Promise<FormConfig<Omit<ActionCreationInfo, "action">>["data"]>>;

export const ActionTypes = Object.keys(actionConfig);
export type ActionTypes = keyof typeof actionConfig;

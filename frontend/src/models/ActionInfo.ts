import { v } from "@local901/validator";

export interface ActionInfo {
    /** Identifier of the action. */
    id: string;
    /** The action. */
    action: string;
    /** The value this action is set to. */
    value: number;
    /** Does the action repeat every week. */
    repeatsWeekly?: boolean;
    /** Percentage of the range from which it should start. */
    start: number;
    /** Percentage of the range after which it should end. */
    end: number;
}

export const ActionInfoValidator = v.object<ActionInfo>({
    id: v.string(),
    action: v.string(),
    value: v.number(),
    repeatsWeekly: v.optional(v.boolean(), "undefined"),
    start: v.number({ min: 0, max: 1 }),
    end: v.number({ min: 0, max: 1 }),
}, { additionalProperties: true });

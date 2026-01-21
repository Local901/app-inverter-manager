import { v } from "@local901/validator";
import type { JSX } from "solid-js";

export type SettingsNumberType = "integer";
export type SettingsStringType = "text";
export type SettingsDateType = "date";

export type SettingsType = SettingsNumberType | SettingsStringType | SettingsDateType;

export interface FormConfig {
    key: string;
    type: SettingsType;
    default?: string | null;
    optional?: boolean | null;
    min?: number | null;
    max?: number | null;
    regex?: string | null;
}

export function getInputTypeOfType(type: string): JSX.InputHTMLAttributes<HTMLInputElement>["type"] {
    switch (type) {
        case "integer":
            return "number";
        case "text":
            return "text"
    }

    return type as JSX.InputHTMLAttributes<HTMLInputElement>["type"];
}

export const FormConfigValidator = v.array<FormConfig>(v.object({
    key: v.string(),
    type: v.string(),
    default: v.optional(v.string()),
    optional: v.optional(v.boolean()),
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    regex: v.optional(v.string()),
}));

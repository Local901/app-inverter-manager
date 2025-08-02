import { v } from "@local901/validator";

export interface DynamicConfig {
    type: string;
    required?: boolean;
    default?: unknown;
    regex?: string;
    enum?: string[];
    min?: number;
    max?: number;
    step?: number;
    value?: number | string;
    hidden?: boolean;
}

export interface FormConfig {
    href: string;
    data: Record<string, DynamicConfig>;
}

export const FormConfigValidator = v.object<FormConfig>({
    href: v.string(),
    data: v.record(v.object({
        type: v.string(),
        required: v.optional(v.boolean(), "undefined"),
        default: v.any(),
        regex: v.optional(v.string(), "undefined"),
        enum: v.optional(v.array(v.string()), "undefined"),
        min: v.optional(v.number(), "undefined"),
        max: v.optional(v.number(), "undefined"),
        step: v.optional(v.number(), "undefined"),
        value: v.optional(v.or<number | string>([v.number(), v.string()]), "undefined"),
        hidden: v.optional(v.boolean(), "undefined"),
    })),
});

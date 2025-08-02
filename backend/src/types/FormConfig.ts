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

export interface FormConfig<T = Record<string, unknown>> {
    href: string;
    data: Record<keyof T, DynamicConfig>;
}

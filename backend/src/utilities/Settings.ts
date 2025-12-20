import { ErrorType, v, ValidationError } from "@local901/validator";

export type SettingsNumberType = "integer" | `interval-${number}`;
export type SettingsStringType = "text";
export type SettingsDateType = "date";

export type SettingsType = SettingsNumberType | SettingsStringType | SettingsDateType;

export interface SettingProperty {
    key: string;
    type: SettingsType;
    default?: string;
    optional?: boolean;
    min?: number;
    max?: number;
    regex?: string;
}

export type SettingsResult<SETTINGS extends readonly SettingProperty[]> = {
    [I in keyof SETTINGS as SETTINGS[number & I]["key"]]: (
        SETTINGS[number & I]["type"] extends SettingsNumberType
            ? number
            : SETTINGS[number & I]["type"] extends SettingsStringType
                ? string
                : SETTINGS[number & I]["type"] extends SettingsDateType
                    ? Date
                    : never
    ) | (
        SETTINGS[number & I]["optional"] extends true ? undefined : never
    );
}

export function parseSettings<SETTINGS extends readonly SettingProperty[]>(
    settings: SETTINGS,
    input: Record<string, string>,
): SettingsResult<SETTINGS> {
    const result = {} as unknown as SettingsResult<SETTINGS>;

    const errors: [string, ValidationError][] = [];

    for (const property of settings) {
        let value: unknown;
        if (["integer"].includes(property.type)) {
            value = Number.parseInt(input[property.key]);
            if (isNaN(value as number)) {
                if (property.optional) {
                    value = undefined
                } else {
                    errors.push([property.key, new ValidationError(property.type, ErrorType.INCORRECT_TYPE, "Not a number.")]);
                    continue;
                }
            }
            const r = v.number({ min: property.min, max: property.max }).validateReturn(value);
            if (r) {
                errors.push([property.key, r]);
                continue;
            }
        } else if (/interval-\d+/.test(property.type)) {
            const interval = Number.parseInt(property.type.substring(9));
            value = Number.parseInt(input[property.key]);
            if (isNaN(value as number)) {
                if (property.optional) {
                    value = undefined
                } else {
                    errors.push([property.key, new ValidationError(property.type, ErrorType.INCORRECT_TYPE, "Not a number.")]);
                    continue;
                }
            }
            const r = v.number({ min: property.min, max: property.max }).validateReturn(value);
            if (r) {
                errors.push([property.key, r]);
                continue;
            }
            if ((value as number - (property.min ?? 0)) % interval !== 0) {
                errors.push([property.key, new ValidationError(property.type, ErrorType.INCORRECT_FORMAT, `Value doesn't fall on the interval ${interval} starting from ${property.min ?? 0}.`)]);
                continue;
            }
        } else if ("text" === property.type) {
            value = input[property.key];
            if (!value && property.default) {
                value = property.default;
            } else {
                if (!value) {
                    errors.push([property.key, new ValidationError(property.type, ErrorType.INCORRECT_TYPE, "Value undefined.")]);
                    continue;
                }
                const error = v.string({
                    min: property.min,
                    max: property.max,
                    regex: property.regex,
                }).validateReturn(value);

                if (error) {
                    errors.push([property.key, error]);
                }
            }
        } else if ("date" === property.type) {
            try {
                value = new Date(input[property.key]);
                (value as Date).toISOString();
            } catch(e) {
                errors.push([property.key, new ValidationError(property.key, ErrorType.INCORRECT_FORMAT, `${e}`)]);
            }
        }

        if (value !== undefined) {
            // @ts-ignore
            result[property.key] = value;
        }
    }

    if (errors.length) {
        new ValidationError<SettingsResult<SETTINGS>>(
            "object",
            ErrorType.INCORRECT_TYPE,
            "Invalid input",
            Object.fromEntries(errors),
        );
    }
    
    return result;
}

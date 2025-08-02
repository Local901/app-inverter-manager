import type { FormConfig } from "../types/FormConfig.js";
import type { GeneralSettings } from "../types/Inverter.js";

const configInfoTypeType: Partial<Record<string, string>> = {
    number: "number",
    string: "string",
    enum: "string",
};

export type ErrorInfo = {
    key: string,
    message: string,
}

export function createConfig<TYPE extends GeneralSettings>(
    config: FormConfig["data"],
    input: Record<string, string>,
): [TYPE, ErrorInfo[]] {
    const result: Partial<TYPE> = {};
    const errors: ErrorInfo[] = [];

    for(const [key, field] of Object.entries(config)) {
        const inputValue = input[key];
        let output = undefined;

        if (field.default !== undefined && (!inputValue || inputValue === field.default?.toString())) {
            // use default value
            output = undefined;
        } else {
            // parse input value;
            switch (configInfoTypeType[field.type] ?? "") {
                case "number":
                    output = Number.parseFloat(inputValue);
                    if (Number.isNaN(output)) {
                        errors.push({ key, message: "Value was not a number." });
                    }
                    if (field.min && output < field.min) {
                        errors.push({ key, message: `Value has to be at least ${field.min}.` });
                    }
                    if (field.max && output > field.max) {
                        errors.push({ key, message: `Value has to be a maximum of ${field.max}.` });
                    }
                    break;
                case "string":
                    if (field.type === "enum" && !(field.enum ?? []).includes(inputValue)) {
                        errors.push({ key, message: "Value doesn't match list of available options." });
                        continue;
                    }
                    if (field.min && inputValue.length < field.min) {
                        errors.push({ key, message: `Value has to be at least ${field.min} characters long.` });
                        continue;
                    }
                    if (field.max && inputValue.length > field.max) {
                        errors.push({ key, message: `Value has to be a maximum of ${field.max} characters long.` });
                        continue;
                    }
                    if (field.regex && !new RegExp(field.regex).test(inputValue)) {
                        errors.push({ key, message: "Value doesn't match pattern."});
                        continue;
                    }
                    output = inputValue;
                    break;
            }
        }

        // @ts-expect-error doesn't like setting values.
        result[key] = output;
    }
    return [result as TYPE, errors];
}

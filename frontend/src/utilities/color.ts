import { Status } from "src/types/Status";

export type ColorStringType = "primary" | "secondary" | "not-found" | "warning" | "error" | "disabled" | "ok" | ({} & string);

const StatusColorMap: Record<Status, ColorStringType> = {
    [Status.NOT_FOUND]: "not-found",
    [Status.WARNING]: "warning",
    [Status.ERROR]: "error",
    [Status.OFF]: "disabled",
    [Status.OK]: "ok",
}

export function colorToString(color: ColorStringType | Status | undefined): ColorStringType | undefined {
    if (color === undefined) {
        return undefined;
    }
    if (Object.keys(StatusColorMap).includes(color)) {
        return StatusColorMap[color as keyof typeof StatusColorMap];
    }
    return color.toString();
}

export function colorToClass(color: ColorStringType | Status | undefined): `color-${ColorStringType}` | undefined {
    const result = colorToString(color);
    if (result === undefined) {
        return undefined
    }
    return `color-${result}`;
}

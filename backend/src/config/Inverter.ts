import type { Inverter } from "../models/Inverter.js";
import { SMASunnyTripower } from "../models/inverters/SMASunnyTripower.js";
import type { FormConfig } from "../types/FormConfig.js";

export interface InverterClass {
    new (): Inverter;
    config: FormConfig["data"];
}

export const InverterInfos: Record<string, InverterClass | undefined> = {
    "SMASunnyTripower": SMASunnyTripower,
} as const;

export function getInverterInfo(type: string): InverterClass | undefined {
    if (!(type in InverterInfos)) {
        return undefined;
    }
    return InverterInfos[type as keyof typeof InverterInfos];
}

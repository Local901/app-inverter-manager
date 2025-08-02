import type { Status } from "./Status.js";

export const InverterType = [
    "SMASunnyTripower"
] as const;

export type InverterType = typeof InverterType[number];

export type GeneralSettings = Record<string, unknown>;

export interface InverterShortInfoResponse {
    id: number;
    name: string,
    type: string,
    status: Status,
}

export interface InverterInfoResponse {
    id: number;
    name: string,
    type: string,
    status: Status,
    chargeRate: number,
    dischargeRate: number,
    // TODO
}

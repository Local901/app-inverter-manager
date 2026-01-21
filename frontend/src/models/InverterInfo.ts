import { Status } from "../types/Status";
import { v } from "@local901/validator";
import { ScheduleInfo } from "./Schedule.js";

export interface InverterInfo {
    id: number;
    name: string,
    type: string,
    status: Status,
    chargeRate: number,
    dischargeRate: number,
    schedules: Array<{
        id: string,
        name: string,
    }>
}

export const InverterInfoValidator = v.object<InverterInfo>({
    id: v.int(),
    name: v.string(),
    type: v.string(),
    status: v.enum(Status),
    chargeRate: v.int(),
    dischargeRate: v.int(),
    schedules: v.array(ScheduleInfo),
});

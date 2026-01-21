import { v } from "@local901/validator";
import { TimeSlot } from "./TimeSlot.js";

export const ScheduleTypes = [
    "DAY"
] as const;

export interface ScheduleInfoType {
    id: string,
    name: string,
    type: typeof ScheduleTypes[number],
}

export const ScheduleInfo = v.object<ScheduleInfoType>({
    id: v.string(),
    name: v.string(),
    type: v.string<typeof ScheduleTypes[number]>({ enum: ScheduleTypes }),
});

export const SchedulesList = v.object({
    schedules: v.array(ScheduleInfo),
});

export const Schedule = v.object({
    id: v.string(),
    name: v.string(),
    type: v.string<typeof ScheduleTypes[number]>({ enum: ScheduleTypes }),
    timeZone: v.number(),
    time_slots: v.array(TimeSlot),
});

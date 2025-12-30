import { v } from "@local901/validator";
import { TimeSlot } from "./TimeSlot.js";

export const ScheduleTypes = [
    "DAY"
] as const;

export const ScheduleInfo = v.object({
    id: v.string(),
    name: v.string(),
    type: v.string<typeof ScheduleTypes[number]>({ enum: ScheduleTypes }),
}, { additionalProperties: true });

export const SchedulesList = v.object({
    schedules: v.array(ScheduleInfo),
}, { additionalProperties: true });

export const Schedule = v.object({
    id: v.string(),
    name: v.string(),
    type: v.string<typeof ScheduleTypes[number]>({ enum: ScheduleTypes }),
    time_slots: v.array(TimeSlot),
}, { additionalProperties: true });

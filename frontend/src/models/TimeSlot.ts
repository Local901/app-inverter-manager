import { v } from "@local901/validator";

export const TimeSlot = v.object({
    slot: v.int({ min: 0 }),
    action: v.record(v.string()),
}, { additionalProperties: true });

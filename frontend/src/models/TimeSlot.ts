import { v } from "@local901/validator";
import type { VType } from "../types/VType.js";

export const TimeSlot = v.object({
    slot: v.int({ min: 0 }),
    actions: v.record(v.string()),
});

export type TimeslotType = VType<typeof TimeSlot>;

import { Status } from "src/types/Status";
import { v } from "@local901/validator";

export interface InverterInfoShort {
    id: number;
    name: string,
    type: string,
    status: Status,
}

export const InverterInfoShortValidator = v.object<InverterInfoShort>({
    id: v.int(),
    name: v.string(),
    type: v.string(),
    status: v.enum(Status),
});

import { Inverter } from "./Inverter.js";
import { SMASunnyTripower } from "./inverters/SMASunnyTripower.js";
import { InverterSchedule } from "./InverterSchedule.js";
import { Schedule } from "./Schedule.js";
import { ScheduleItem } from "./ScheduleItem.js";

export const models = [
    Inverter,
    SMASunnyTripower,

    Schedule,
    InverterSchedule,
    ScheduleItem,
];

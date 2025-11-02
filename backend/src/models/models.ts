import { Action } from "./Action.js";
import { Inverter } from "./Inverter.js";
import { SMASunnyTripower } from "./inverters/SMASunnyTripower.js";
import { Schedule } from "./Schedule.js";

export const models = [
    Action,

    Inverter,
    SMASunnyTripower,

    Schedule,
];

import type { GeneralSettings } from "../../types/Inverter.js";

export interface InverterData {
    id: number;
    type: string;
    name: string;
    options: GeneralSettings;
}

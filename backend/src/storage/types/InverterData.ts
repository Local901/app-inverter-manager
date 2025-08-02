import type { GeneralSettings } from "src/types/Inverter";

export interface InverterData {
    id: number;
    type: string;
    name: string;
    options: GeneralSettings;
}

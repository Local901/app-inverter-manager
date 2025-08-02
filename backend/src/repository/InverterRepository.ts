import { getInverterInfo } from "../config/Inverter.js";
import type { Inverter } from "../models/Inverter.js";
import type { DataStore } from "../storage/DataStore.js";
import type { InverterData } from "../storage/types/InverterData.js";
import { createConfig } from "../utilities/ConfigValidator.js";

export class InverterRepository {
    public constructor(
        private readonly store: DataStore,
    ) {

    }

    public async getAllInverters(): Promise<Inverter[]> {
        return this.store.getAllInverters()
            .then((data) => Promise.all(data.map((d) => this.instantiateInverter(getInverterInfo(d.type), d))))
            .then((inverters) => inverters.filter((i) => !!i));
    }

    public async getById(id: number): Promise<Inverter | null> {
        return this.store.getInverterById(id)
            .then((data) => data ? this.instantiateInverter(getInverterInfo(data.type), data) : null)
    }

    public async updateOptions(idOrInverter: number | Inverter, rawOptions: Record<string, string>): Promise<boolean> {
        const inverterData = typeof idOrInverter === "number"
            ? await this.store.getInverterById(idOrInverter)
            : idOrInverter;
        if (!inverterData) {
            return false;
        }
        const inverterClass = getInverterInfo(inverterData.type);
        if (!inverterClass) {
            throw new Error("Invalid Property 'Type'");
        }
        const [settings, errors] = createConfig(inverterClass.config, rawOptions);

        if (errors.length) {
            throw new Error(errors.map((error) => `${error.key}:${error.message}`).join("\n"));
        }

        const name = rawOptions.name ?? "";

        return this.store.saveOptions(inverterData.id, name, settings);
    }

    public async build(type: string, rawOptions: Record<string, string>): Promise<Inverter> {
        const inverterClass = getInverterInfo(type);
        if (!inverterClass) {
            throw new Error("Invalid Property 'Type'");
        }
        const [settings, errors] = createConfig(inverterClass.config, rawOptions);

        if (errors.length) {
            throw new Error(errors.map((error) => `${error.key}:${error.message}`).join("\n"));
        }

        const name = rawOptions.name ?? "";

        const data = {
            name: name,
            type: type,
            options: settings,
        } as InverterData;
        data.id = await this.store.saveNewInverter(data);
        return this.instantiateInverter(inverterClass, data);
    }

    private instantiateInverter(inverterClass: new() => Inverter, data: InverterData): Inverter;
    private instantiateInverter(inverterClass: undefined, data: InverterData): null;
    private instantiateInverter(inverterClass: (new() => Inverter) | undefined, data: InverterData): Inverter | null;
    private instantiateInverter(inverterClass: (new() => Inverter) | undefined, data: InverterData): Inverter | null {
        if (inverterClass === undefined) {
            return null;
        }
        const inverter = new inverterClass();
        Object.assign(inverter, {
            id: data.id,
            name: data.name,
            options: data.options,
        });
        return inverter;
    }

    public async delete(id: number): Promise<boolean> {
        return this.store.deleteInverterById(id);
    }
}

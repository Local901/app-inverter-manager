import type { Repository } from "typeorm";
import { getInverterInfo } from "../config/Inverter.js";
import type { Inverter } from "../models/Inverter.js";
import { createConfig } from "../utilities/ConfigValidator.js";
import type { InverterType } from "../types/Inverter.js";

export class InverterRepository {
    public constructor(
        private readonly repo: Repository<Inverter>,
    ) {

    }

    public async getAllInverters(): Promise<Inverter[]> {
        return this.repo.find();
    }

    public async getById(id: number): Promise<Inverter | null> {
        return this.repo.findOneBy({ id });
    }

    public async updateOptions(idOrInverter: number | Inverter, rawOptions: Record<string, string>): Promise<boolean> {
        const inverter = typeof idOrInverter === "number"
            ? await this.getById(idOrInverter)
            : idOrInverter;
        if (!inverter) {
            return false;
        }
        const inverterClass = getInverterInfo(inverter.type);
        if (!inverterClass) {
            throw new Error("Invalid Property 'Type'");
        }
        const [settings, errors] = createConfig(inverterClass.config, rawOptions);

        if (errors.length) {
            throw new Error(errors.map((error) => `${error.key}:${error.message}`).join("\n"));
        }

        this.repo.merge(inverter, {
            name: rawOptions.name,
            options: settings,
        });
        await this.repo.save(inverter);
        return true;
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

        const inverter = this.repo.create({
            name: rawOptions.name ?? "",
            type: type as InverterType,
            options: settings,
        });
        await this.repo.save(inverter);
        return inverter;
    }

    public async delete(id: number): Promise<boolean> {
        return (await this.repo.delete({ id })).affected !== 0;
    }
}

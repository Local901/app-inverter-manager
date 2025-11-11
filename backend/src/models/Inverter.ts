import { Column, Entity, PrimaryGeneratedColumn, TableInheritance } from "typeorm";
import type { GeneralSettings, InverterInfoResponse, InverterShortInfoResponse, InverterType } from "../types/Inverter.js";
import type { Status } from "../types/Status.js";

export type PartialInverterResponse = Omit<InverterInfoResponse, keyof InverterShortInfoResponse>;

@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class Inverter<OPTIONS extends GeneralSettings = GeneralSettings> {
    @PrimaryGeneratedColumn("increment", { type: "int" })
    public readonly id!: number;

    @Column("varchar")
    public readonly name!: string;

    @Column("json")
    public readonly options!: OPTIONS;

    @Column("varchar")
    public readonly type!: InverterType;

    public async connect<T>(callback: (inverter: InverterChild) => Promise<T> | T): Promise<T> {
        throw new Error("Not implemented.");
    }
}

export abstract class InverterChild<OPTIONS extends GeneralSettings = GeneralSettings> extends Inverter<OPTIONS> {
    private hasStarted = 0;
    protected abstract startInverter(): Promise<void>;
    protected abstract stopInverter(): Promise<void>;
    public override async connect<T>(callback: (inverter: InverterChild) => Promise<T> | T): Promise<T> {
        try {
            if (this.hasStarted++ === 0) {
                await this.startInverter();
            }
            return await callback(this);
        } finally {
            if (--this.hasStarted === 0) {
                await this.stopInverter();
            }
        }
    }

    public abstract getStatus(): Promise<Status>;

    public abstract getMaxChargeRate(): Promise<number>;
    public abstract getMaxDischargeRate(): Promise<number>;

    public abstract chargeBattery(wattHour: number): Promise<void>;
    public abstract dischargeBattery(wattHour: number): Promise<void>;

    public async toShortInfo(): Promise<InverterShortInfoResponse> {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            status: await this.getStatus(),
        }
    }
    public async toInfo(): Promise<InverterInfoResponse> {
        return {
            ...await this.toShortInfo(),
            ...await this.getInfo(),
        };
    }

    protected abstract getInfo(): Promise<PartialInverterResponse>;
}

import type { GeneralSettings, InverterInfoResponse, InverterShortInfoResponse, InverterType } from "../types/Inverter.js";
import type { Status } from "../types/Status.js";

export type PartialInverterResponse = Omit<InverterInfoResponse, keyof InverterShortInfoResponse>;

export abstract class Inverter<OPTIONS extends GeneralSettings = GeneralSettings> {
    public readonly id!: number;
    public readonly name!: string;
    public readonly options!: OPTIONS;
    public abstract readonly type: InverterType;

    private hasStarted = false;
    protected abstract startInverter(): Promise<void>;
    protected abstract stopInverter(): Promise<void>;
    public async start(): Promise<void> {
        if (this.hasStarted) {
            return;
        }
        this.hasStarted = true;
        try {
            await this.startInverter();
        } catch (err) {
            console.error(err);
            this.hasStarted = false;
        }
    }
    public async stop(): Promise<void> {
        if (!this.hasStarted) {
            return;
        }
        await this.stopInverter();
        this.hasStarted = false;
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

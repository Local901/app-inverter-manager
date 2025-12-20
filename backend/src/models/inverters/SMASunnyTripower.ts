import { InverterChild, type PartialInverterResponse } from "../Inverter.js";
import { ModbusBuilder, type ModbusClient, type ModbusTcpOptions } from "../../clients/ModbusClient.js";
import type { FormConfig } from "../../types/FormConfig.js";
import { Status } from "../../types/Status.js";
import { ChildEntity } from "typeorm";
import type { SettingProperty } from "../../utilities/Settings.js";

enum ControlMode {
    ACTIVE = 802,
    INACTIVE = 803,
}

export type SMASunnyTripowerSettings = ModbusTcpOptions & {
}

@ChildEntity()
export class SMASunnyTripower extends InverterChild<SMASunnyTripowerSettings> {
    public client?: ModbusClient;

    protected async startInverter(): Promise<void> {
        this.client = await ModbusBuilder.ConnectTcp(this.options);
    }
    
    protected async stopInverter(): Promise<void> {
        await Promise.all([
            new Promise((resolve) => this.client ? this.client.close(resolve) : resolve(undefined))
        ]);
    }

    public async getStatus(): Promise<Status> {
        if (!this.client) {
            return Status.NOT_FOUND;
        }
        // TODO: Add status checking of inverter directly.
        return Status.OK;
    }

    public async getMaxChargeRate(): Promise<number> {
        return 5000;
    }
    public async getMaxDischargeRate(): Promise<number> {
        return 5000;
    }

    public async chargeBattery(wattHour: number): Promise<void> {
        if (!this.client) return; // throw new Error(`Missing connection to ${this.type}::${this.id}`);

        const powerSetPoint = Buffer.allocUnsafe(4);
        powerSetPoint.writeInt32BE(-wattHour); // Has to be negative to charge.

        await this.client.writeRegisters(40149, powerSetPoint);
        await this.client.writeRegisters(40151, [0, wattHour === 0 ? ControlMode.INACTIVE : ControlMode.ACTIVE]);
    }
    public async dischargeBattery(wattHour: number): Promise<void> {
        return this.chargeBattery(-wattHour);
    }

    protected async getInfo(): Promise<PartialInverterResponse> {
        return {
            chargeRate: await this.getMaxChargeRate(),
            dischargeRate: await this.getMaxDischargeRate(),
        };
    }
    static config: SettingProperty[] = [
        {
            key: "ip",
            type: "text",
            regex: "^((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d).?\\b){4}$",
        },
        {
            key: "deviceId",
            type: "integer",
            default: "3",
            min: 0,
        },
        {
            key: "port",
            type: "integer",
            default: "502",
            min: 0,
            max: 65535,
        }
    ];
}

import ModbusRTU from "modbus-serial";

export type ModbusTcpOptions = {
    ip: string;
    /** @default 502 */
    port?: number;
    /**
     * Id of the device.
     * @default 1
     */
    deviceId?: number;
}

export type ModbusClient = ModbusRTU;

export class ModbusBuilder {
    private static createClient(deviceId = 1) {
        const modbusClient = new ModbusRTU();
        modbusClient.setID(deviceId);
        return modbusClient;
    }

    public static async ConnectTcp(options: ModbusTcpOptions): Promise<ModbusClient | undefined> {
        try {
            const client = this.createClient(options.deviceId);

            await client.connectTCP(options.ip, {
                port: options.port ?? 502,
                keepAlive: true,
                timeout: 500,
            });

            return client;
        } catch (error) {
            console.log("Failed to start modbus over TCP");
            console.error(error);
            return undefined;
        }
    }
}

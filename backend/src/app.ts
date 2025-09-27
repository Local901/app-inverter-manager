import { config } from "./config/index.js";
import { ActionRepository } from "./repository/ActionRepository.js";
import { InverterRepository } from "./repository/InverterRepository.js";
import { ScheduleRepository } from "./repository/ScheduleRepository.js";
import { HttpServer } from "./server/HttpServer.js";
import { ActionService } from "./service/ActionService.js";
import stores from "./storage/stores/index.js";
import type { Container } from "./types/Container.js";

export class App {
    private httpServer?: HttpServer;
    private actionService?: ActionService;

    public async start() {
        const store = stores[config.store.type];

        if (!store) {
            throw new Error(`FATAL: No store found matching ${config.store.type}`);
        }

        const storeInstance = new store()
        await storeInstance.start();

        const container: Container = {
            dataStore: storeInstance,
            inverterRepository: new InverterRepository(storeInstance),
            actionRepository: new ActionRepository(storeInstance),
            scheduleRepository: new ScheduleRepository(storeInstance),
        };

        if (config.features.server) {
            console.log("Http server enabled ✅");
            this.httpServer = new HttpServer(config.port, container);
        } else {
            console.log("Http server disabled ❌");
        }
        if (config.features.runActions) {
            console.log("Action management enabled ✅");
            this.actionService = new ActionService(container.inverterRepository, container.actionRepository, container.scheduleRepository);
        } else {
            console.log("Action management disabled ❌");
        }

        await Promise.all([
            this.httpServer?.start(),
            this.actionService?.stop(),
        ]);
    }
}

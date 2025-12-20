import { dataSource } from "./config/DbSource.js";
import { config } from "./config/index.js";
import { HttpServer } from "./server/HttpServer.js";
import { ActionService } from "./service/ActionService.js";
import type { Container } from "./types/Container.js";

export class App {
    private httpServer?: HttpServer;
    private actionService?: ActionService;

    public async start() {
        // !! IMPORTANT !!
        // Initialize dataSource.
        await dataSource.initialize();
        // Run migrations
        await dataSource.runMigrations();
        // !! END IMPORTANT !!

        const container: Container = {
            dataStore: dataSource,
        };

        if (config.features.server) {
            console.log("Http server enabled ✅");
            this.httpServer = new HttpServer(config.port, container);
        } else {
            console.log("Http server disabled ❌");
        }
        if (config.features.runActions) {
            console.log("Action management enabled ✅");
            this.actionService = new ActionService(dataSource.manager);
        } else {
            console.log("Action management disabled ❌");
        }

        await Promise.all([
            this.httpServer?.start(),
            this.actionService?.stop(),
        ]);
    }
}

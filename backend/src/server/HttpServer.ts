import express, { type Express, Router, json, urlencoded } from "express";
import path from "path";
import { config } from "../config/index.js";
import type { Controller } from "./controller/Controller.js";
import { InverterController } from "./controller/InverterController.js";
import type { Container } from "../types/Container.js";
import { ActionController } from "./controller/ActionController.js";

export class HttpServer {
    private readonly app: Express;
    private controllers: Controller[];

    private server?: ReturnType<Express["listen"]>;

    public constructor(
        private readonly port: number,
        container: Container,
    ) {
        this.app = express();
        this.controllers = [
            new InverterController(container.inverterRepository, container.actionRepository),
            new ActionController(container.actionRepository),
        ];

        this.route(this.app);
    }

    public async start() {
        if (this.server) {
            console.log("HTTP server is already started.");
            return;
        }
        this.server = this.app.listen(this.port, () => {
            console.log(`HTTP server listening on port ${this.port}`);
        });
    }

    public async stop() {
        this.server?.close((error) => console.error(error));
        this.server = undefined;
    }

    private route(app: Express) {
        // public files
        app.use(express.static(config.publicFilesPath));

        const apiRoute = Router();
        for (const controller of this.controllers) {
            controller.mount(apiRoute);
        }

        app.use("/api",
            json(),
            urlencoded(),
            apiRoute,
            (req, res) => {
                console.log(req.path);
                res.status(404).send("Not Found");
            }
        );

        app.all("/{*all}", (req, res) => {
            res.sendFile(path.resolve(config.publicFilesPath, "index.html"));
        });
    }
}

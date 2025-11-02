import { Env } from "@local901/env";
import type { DatabaseType, DataSourceOptions } from "typeorm";
import type { BaseDataSourceOptions } from "typeorm/data-source/BaseDataSourceOptions.js";
import { SnakeCaseStrategy } from "./utils/DbNamingStrategy.js";
import { models } from "../models/models.js";
import { migrations } from "./migrations/migrations.js";

function getDbType(input: string): DatabaseType {
    switch(input) {
        case "memory":
        case "sqlite":
            return "sqlite";
        case "mysql":
            return "mysql";
        case "postgres":
            return "postgres";
        default:
            throw new Error("Unknown database type")
    }
}

const debug = Env.boolean("DEBUG", false);
const dbType = getDbType(Env.string("STORE_TYPE", "memory"));

export const config = {
    debug: Env.boolean("DEBUG", false),

    port: Env.number("PORT", 8080),
    publicFilesPath: Env.string("PUBLIC_PATH", "./public"),

    store: {
        type: Env.string("STORE_TYPE", "memory"),
        host: Env.string("STORE_HOST", ""),
        port: Env.string("STORE_PORT", ""),
        database: Env.string("STORE_DATABASE", ""),
        user: Env.string("STORE_USER", ""),
        password: Env.string("STORE_PASS", ""),
    },

    db: {
        type: dbType,
        host: Env.string("STORE_HOST", ""),
        port: Env.int("STORE_PORT", dbType === "postgres" ? 5432 : 3306),
        username: Env.string("STORE_USER", ""),
        password: Env.string("STORE_PASS", ""),
        database: Env.string("STORE_DATABASE", "local-inverter-manager"),
        poolSize: Env.int("STORE_POOL_SIZE", 10),
        migrationRun: true,
        logging: debug ? true : ["error", "warn"],
        maxQueryExecutionTime: 5000,
        namingStrategy: new SnakeCaseStrategy(),
        entities: models,
        migrations: migrations,
    } as DataSourceOptions & BaseDataSourceOptions,

    features: {
        server: !Env.boolean("DISABLE_SERVER", false),
        runActions: !Env.boolean("DISABLE_ACTIONS", false),
    }
} as const;

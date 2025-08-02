import { Env } from "@local901/env";

export const config = {
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

    features: {
        server: !Env.boolean("DISABLE_SERVER", false),
        runActions: !Env.boolean("DISABLE_ACTIONS", false),
    }
} as const;

import suidPlugin from "@suid/vite-plugin";
import path from "path";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
    plugins: [suidPlugin(), solidPlugin(), topLevelAwait()],
    root: "./",
    base: "/",
    server: {
        port: 3000,
        proxy: {
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
            },
        },
    },
    build: {
        target: "esnext",
    },
    resolve: {
        mainFields: ["module"],
        alias: {
            src: path.resolve(__dirname, "./src"),
        },
    },
});

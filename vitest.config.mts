import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        environment: "jsdom",
        globals: true,
        alias: {
            src: path.resolve(import.meta.dirname, "./src"),
            obsidian: path.resolve(import.meta.dirname, "./tests/mocks/obsidian.ts"),
        },
    },
});

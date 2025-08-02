import type { DataStore } from "../DataStore.js";
import { InMemoryStore } from "./InMemoryStore.js";
import { SqlStore } from "./SqlStore.js";

const stores = {
    memory: InMemoryStore,
    mysql: SqlStore,
} as const

export type StoreTypes = keyof typeof stores;

export default stores as Record<string, {
    new (): DataStore;
} | undefined>;

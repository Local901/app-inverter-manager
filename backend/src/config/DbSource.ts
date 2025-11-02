import { DataSource } from "typeorm";
import { config } from "./index.js";

const source = new DataSource(config.db);

export const dataSource = source;
export default source;

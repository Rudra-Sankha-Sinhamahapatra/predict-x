import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "./config";
import * as schema from "./schema/schema";

export * from "./schema/schema";

const client = postgres(config.db as string);

export const db = drizzle(client, {schema});
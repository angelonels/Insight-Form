import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import { env } from "../config/env.js";
import * as schema from "./schema/index.js";

const client = postgres(env.DATABASE_URL, {
  max: 10,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export async function closeDatabase() {
  await client.end();
}

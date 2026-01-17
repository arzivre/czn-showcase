// packages/data-ops/database/setup.ts
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from '@/drizzle'
import { neon } from "@neondatabase/serverless";

let db: NeonHttpDatabase<typeof schema>;

export function initDatabase(connection: {
  host: string;
  username: string;
  password: string;
}) {
  if (db) {
    return db;
  }
  const connectionString = `postgres://${connection.username}:${connection.password}@${connection.host}`;
  const sql = neon(connectionString);
  db = drizzle({ client: sql, schema: schema });
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}
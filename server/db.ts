import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@shared/schema";

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

export const hasDatabase = Boolean(DB_USER && DB_PASSWORD && DB_NAME);

let pool: mysql.Pool | null = null;
export let db: ReturnType<typeof drizzle> | null = null;

if (hasDatabase) {
  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
  });
  db = drizzle(pool, { schema, mode: "default" });
}

// Shared hosting gives us no way to run migrations remotely, so the app
// bootstraps its own schema on startup (idempotent — safe to run every boot).
export async function ensureSchema(): Promise<void> {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(254) NOT NULL UNIQUE,
      language VARCHAR(5) NOT NULL DEFAULT 'en',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      unsubscribed_at TIMESTAMP NULL DEFAULT NULL
    )
  `);
}

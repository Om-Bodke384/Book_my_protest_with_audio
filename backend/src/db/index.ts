import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import * as schema from "./schema.js";
import "dotenv/config";

const { Pool } = pkg;

// Neon (and most managed Postgres hosts) require SSL, but the plain
// `?sslmode=require` query param on the connection string isn't enough for
// node-postgres by itself — it needs the `ssl` option set explicitly.
// Neon uses a certificate chain node can't always verify locally, so we
// disable strict verification the same way Neon's own docs recommend.
const isManagedPostgres =
  process.env.DATABASE_URL?.includes("neon.tech") || process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isManagedPostgres ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });

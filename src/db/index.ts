import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/*
 * Lazy database initialization:
 * - Does NOT throw at import/build time when DATABASE_URL is missing.
 * - Only throws when a query is actually executed without configuration.
 * This allows `next build` to succeed on platforms where env vars are
 * injected at runtime (Netlify, Vercel, Railway, etc.).
 */

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required. Configure it in your deployment environment variables (e.g. a hosted PostgreSQL from Neon, Supabase or Railway)."
    );
  }
  return new Pool({ connectionString: databaseUrl });
}

let _pool: Pool | null = globalForDb.__arenaNextJsPostgresqlPool ?? null;
let _db: NodePgDatabase | null = null;

function getPool(): Pool {
  if (!_pool) {
    _pool = createPool();
    if (process.env.NODE_ENV !== "production") {
      globalForDb.__arenaNextJsPostgresqlPool = _pool;
    }
  }
  return _pool;
}

function getDb(): NodePgDatabase {
  if (!_db) {
    _db = drizzle(getPool());
  }
  return _db;
}

/* Proxy keeps the same `db.select()...` API but defers connection until first use */
export const db: NodePgDatabase = new Proxy({} as NodePgDatabase, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(real);
    }
    return value;
  },
});

export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const real = getPool() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(real);
    }
    return value;
  },
});

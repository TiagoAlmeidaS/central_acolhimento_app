import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

/**
 * Cliente Drizzle compartilhado. Cada spec adiciona seu próprio schema em
 * `src/db/schema/<agregado>.ts` e o reexporta via `src/db/schema/index.ts`.
 *
 * Tenant isolation é aplicado camadas acima (ver `src/lib/tenancy/`).
 */

declare global {
  // eslint-disable-next-line no-var
  var __db_client__: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var __db__: PostgresJsDatabase<typeof schema> | undefined;
}

function makeClient() {
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL não definida. Configure em .env.local (ver .env.example).",
    );
  }
  return postgres(env.DATABASE_URL, {
    max: env.NODE_ENV === "production" ? 10 : 3,
    onnotice: () => {},
  });
}

// Cache em dev para sobreviver ao HMR
export const client = global.__db_client__ ?? (env.DATABASE_URL ? makeClient() : (null as unknown as ReturnType<typeof postgres>));
if (env.NODE_ENV !== "production" && env.DATABASE_URL) global.__db_client__ = client;

export const db: PostgresJsDatabase<typeof schema> =
  global.__db__ ??
  (client
    ? drizzle(client, { schema, logger: env.NODE_ENV === "development" })
    : (null as unknown as PostgresJsDatabase<typeof schema>));
if (env.NODE_ENV !== "production" && env.DATABASE_URL) global.__db__ = db;

export { schema };

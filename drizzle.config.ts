import type { Config } from "drizzle-kit";

/**
 * Cada spec é dona dos arquivos em `src/db/schema/<seu-agregado>.ts`.
 * `src/db/schema/index.ts` reexporta tudo e é shared infra (sem dono específico).
 */
export default {
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
} satisfies Config;

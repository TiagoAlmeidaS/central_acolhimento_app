import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Tabela `users` — identidade cross-tenant.
 *
 * - `telefone` em formato E.164 (ex.: `+5592999887766`) e `unique` global
 *   porque um mesmo número entra com OTP independente de localidade.
 * - Sem RLS: linhas de `users` são compartilhadas entre tenants
 *   (ver `docs/architecture/multi-tenancy.md` §5 — "users e tenants ficam sem RLS").
 *
 * Owner: `auth-agent` (spec `01-auth`).
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  telefone: text("telefone").notNull().unique(),
  fotoUrl: text("foto_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

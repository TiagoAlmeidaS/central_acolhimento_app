import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Tabela `tenants` — uma comunidade/localidade que opera no app.
 *
 * - Identidade composta (nome + cidade + uf) é única — duas localidades
 *   com mesmo apelido em cidades diferentes coexistem.
 * - `sigla` (até 3) e `cor` (HEX) compõem o avatar visual exibido em
 *   `<TenantChip>`, no header e nas telas de boas-vindas.
 * - `criadoPor` referencia o `User` (líder fundador). Quando o usuário
 *   é removido, mantemos a localidade (restrict implícito do ON DELETE
 *   default — ajustar para `set null` se necessário em uma migration
 *   futura quando houver soft-delete de users).
 * - Sem `tenant_id` próprio — esta é a tabela "raiz" do isolamento; as
 *   demais referenciam-na. Sem RLS (ver `multi-tenancy.md` §5).
 *
 * Owner: `tenant-agent` (spec `03-tenant-setup`).
 */
export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nome: text("nome").notNull(),
    cidade: text("cidade").notNull(),
    uf: varchar("uf", { length: 2 }).notNull(),
    denominacao: text("denominacao"),
    sigla: varchar("sigla", { length: 3 }).notNull(),
    cor: varchar("cor", { length: 7 }).notNull(),
    criadoPor: uuid("criado_por")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqLocal: uniqueIndex("uniq_local").on(t.nome, t.cidade, t.uf),
  }),
);

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

/** Cores oficiais da paleta de personalização (8 opções). */
export const TENANT_COLORS = [
  "#2D7FF9",
  "#7C3AED",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#06B6D4",
  "#EF4444",
  "#0F172A",
] as const;

export type TenantColor = (typeof TENANT_COLORS)[number];

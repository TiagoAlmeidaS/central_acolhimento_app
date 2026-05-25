import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { tenants } from "./tenants";

/**
 * Tabela `memberships` — relação User × Tenant com papel e status.
 *
 * Reflete o modelo descrito em `docs/architecture/data-model.md` §2.3 e a
 * máquina de estados em `docs/product/domain-model.md` §4.2.
 *
 * Status:
 *  - `pendente`: cadastro submetido pelo cuidador, aguardando aprovação
 *    do líder da localidade.
 *  - `ativo`: aprovado (ou criado via convite). Pode logar e ver o app.
 *  - `recusado`: líder negou a entrada.
 *  - `removido`: revogado posteriormente (ex.: cuidador se desliga).
 *
 * Papel:
 *  - `lider`: administrador da localidade. Apenas o `Tenant.criadoPor`
 *    inicial é dono da assinatura.
 *  - `cuidador`: membro padrão.
 *
 * Owner: `signup-agent` (spec `02-cuidador-signup`).
 */

export const papelEnum = pgEnum("papel", ["lider", "cuidador"]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "pendente",
  "ativo",
  "recusado",
  "removido",
]);

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /**
     * Nullable para suportar o estado "pré-pendente" do MVP: quando o
     * cuidador submete cadastro mas nenhum tenant existente bate com
     * `(cidade, igreja)`, o registro fica esperando o suporte materializar
     * o tenant ou anexar o membership manualmente.
     */
    tenantId: uuid("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    papel: papelEnum("papel").notNull(),
    status: membershipStatusEnum("status").notNull().default("pendente"),
    /**
     * Mini-bio preenchida no formulário de signup. Pode ser null em
     * memberships criados via convite (spec 04), onde a bio é opcional.
     */
    bio: text("bio"),
    /**
     * Igreja "livre" digitada no signup. Não vira FK porque o cuidador pode
     * digitar antes do líder cadastrar a localidade.
     */
    igreja: text("igreja"),
    cidade: text("cidade"),
    convidadoPor: uuid("convidado_por").references(() => users.id, {
      onDelete: "set null",
    }),
    ativadoEm: timestamp("ativado_em", { withTimezone: true }),
    removidoEm: timestamp("removido_em", { withTimezone: true }),
    motivoRecusa: text("motivo_recusa"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    /**
     * Um usuário pode ter no máximo 1 membership por tenant (independente
     * do status). Recusas/remoções viram update do mesmo registro.
     */
    uniqUserTenant: uniqueIndex("uniq_user_tenant").on(t.userId, t.tenantId),
    idxTenant: index("idx_memberships_tenant").on(t.tenantId),
    idxStatus: index("idx_memberships_tenant_status").on(t.tenantId, t.status),
  }),
);

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;

export type MembershipPapel = (typeof papelEnum.enumValues)[number];
export type MembershipStatus = (typeof membershipStatusEnum.enumValues)[number];

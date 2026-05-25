"use server";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { tenants } from "@/db/schema";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import { sigleFrom as sigleFromUtil } from "@/components/domain/tenant/sigle-from";
import {
  CheckTenantAvailableSchema,
  ProvisionTenantSchema,
  type CheckTenantAvailableInput,
  type ProvisionTenantInput,
} from "@/components/domain/tenant/contracts";

/**
 * Server actions da spec `03-tenant-setup`.
 *
 * - `checkTenantAvailable` — UX de "essa localidade já existe?" no passo 5.
 * - `provisionTenant` — transação que cria Tenant + Membership(lider).
 *   Recebe `stripeSubscriptionId` opcional; o billing real (spec 10)
 *   chama esta ação a partir do webhook `subscription.activated`.
 * - `sigleFrom` — utilitária pura, exposta também em
 *   `@/components/domain/tenant/sigle-from`. A versão deste módulo é
 *   uma server action (RPC) por causa do `'use server'`; para uso
 *   síncrono no client, importe direto do domain.
 *
 * **Acoplamento:**
 *  - `users` → schema do `auth-agent` (já existe).
 *  - `memberships` → schema do `signup-agent` (em paralelo). Aqui usamos
 *    SQL bruto via `sql` template para inserir; o contrato de colunas
 *    está em `docs/architecture/data-model.md §2.2`.
 *  - `subscriptions` → schema do `billing-agent` (Wave 2). Por enquanto
 *    apenas guardamos `stripeSubscriptionId` em log; o registro formal
 *    será feito no webhook do Stripe.
 */

// ─── sigleFrom (re-export como server action) ────────────────────────────

/**
 * Wrapper async — `'use server'` força exports a serem async functions.
 * Para uso síncrono client-side, importe de
 * `@/components/domain/tenant/sigle-from`.
 */
export async function sigleFrom(nome: string): Promise<string> {
  return sigleFromUtil(nome);
}

// ─── checkTenantAvailable ────────────────────────────────────────────────

export type CheckTenantAvailableResult =
  | { ok: true; available: boolean }
  | { ok: false; error: string };

/**
 * Verifica se a tripla (nome, cidade, uf) já está em uso por outra
 * localidade. Não lança — caller decide como mostrar o erro.
 */
export async function checkTenantAvailable(
  input: CheckTenantAvailableInput,
): Promise<CheckTenantAvailableResult> {
  const parsed = CheckTenantAvailableSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos para checagem." };
  }
  const { nome, cidade, uf } = parsed.data;
  try {
    const existing = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(
        and(
          eq(tenants.nome, nome),
          eq(tenants.cidade, cidade),
          eq(tenants.uf, uf),
        ),
      )
      .limit(1);
    return { ok: true, available: existing.length === 0 };
  } catch (err) {
    console.error("[checkTenantAvailable] falha de DB:", err);
    return { ok: false, error: "Erro temporário. Tente novamente." };
  }
}

// ─── provisionTenant ─────────────────────────────────────────────────────

export type ProvisionTenantResult =
  | { ok: true; tenantId: string }
  | { ok: false; error: string; code?: "duplicate" | "auth" | "validation" };

/**
 * Cria a localidade + o membership de líder atomicamente.
 *
 * **Fluxo (feliz):**
 *  1. Valida sessão (líder logado).
 *  2. Valida payload completo via `ProvisionTenantSchema`.
 *  3. Roda `db.transaction(async tx => …)`:
 *     a. Insere `tenants`.
 *     b. Insere `memberships` (papel='lider', status='ativo',
 *        criadoPor=userId).
 *     c. *(opcional)* Stripe `subscriptionId` é apenas logado por ora —
 *        o registro definitivo será feito pelo webhook do
 *        `billing-agent` (spec 10).
 *
 * **Idempotência:** o caller pode reexecutar com a mesma tripla
 * (nome, cidade, uf) — a unique index `uniq_local` garante que não
 * duplica e devolvemos `code='duplicate'`.
 */
export async function provisionTenant(
  input: ProvisionTenantInput,
): Promise<ProvisionTenantResult> {
  let userId: string;
  try {
    const auth = await requireUser();
    userId = auth.userId;
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return {
        ok: false,
        error: "Sessão expirada. Faça login novamente.",
        code: "auth",
      };
    }
    throw err;
  }

  const parsed = ProvisionTenantSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
      code: "validation",
    };
  }
  const data = parsed.data;
  const stripeSubscriptionId = data.stripeSubscriptionId;

  try {
    const tenantId = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(tenants)
        .values({
          nome: data.localidade.nome,
          cidade: data.localidade.cidade,
          uf: data.localidade.uf,
          denominacao: data.localidade.denominacao ?? null,
          sigla: data.personaliza.sigla.toLocaleUpperCase("pt-BR").slice(0, 3),
          cor: data.personaliza.cor,
          criadoPor: userId,
        })
        .returning({ id: tenants.id });
      const tId = inserted[0]?.id;
      if (!tId) throw new Error("INSERT tenants não retornou id.");

      // TODO(signup-agent): trocar por insert tipado quando o schema
      // `memberships` mergear (`src/db/schema/memberships.ts`). Hoje
      // usamos SQL bruto para evitar depender do arquivo do outro
      // subagent, com base no contrato de colunas em
      // `docs/architecture/data-model.md §2.2`.
      await tx.execute(
        sql`INSERT INTO memberships
              (user_id, tenant_id, papel, status, ativado_em)
            VALUES
              (${userId}, ${tId}, 'lider', 'ativo', NOW())
            ON CONFLICT (user_id, tenant_id) DO UPDATE
              SET papel = EXCLUDED.papel,
                  status = EXCLUDED.status,
                  ativado_em = COALESCE(memberships.ativado_em, EXCLUDED.ativado_em)`,
      );

      // TODO(billing-agent): registrar subscription quando webhook
      // chegar. Por ora apenas logamos o id para auditoria.
      if (stripeSubscriptionId) {
        console.info(
          `[provisionTenant] tenant=${tId} stripeSubId=${stripeSubscriptionId}`,
        );
      }

      return tId;
    });

    return { ok: true, tenantId };
  } catch (err) {
    if (isUniqueViolation(err)) {
      return {
        ok: false,
        error:
          "Essa localidade já existe — peça um convite ao líder responsável.",
        code: "duplicate",
      };
    }
    console.error("[provisionTenant] falha:", err);
    return { ok: false, error: "Erro ao criar a localidade. Tente novamente." };
  }
}

// ─── helpers ─────────────────────────────────────────────────────────────

/**
 * Detecta `unique_violation` (PG SQLSTATE 23505) tanto via driver
 * `postgres-js` quanto `pg`. Drizzle não normaliza esse erro.
 */
function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; cause?: { code?: string } };
  if (e.code === "23505") return true;
  if (e.cause?.code === "23505") return true;
  return false;
}

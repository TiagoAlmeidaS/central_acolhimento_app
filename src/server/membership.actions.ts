"use server";

import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  memberships,
  tenants,
  users,
  type Membership,
} from "@/db/schema";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import { normalizeBrPhone } from "@/lib/auth/phone";
import {
  PhoneE164Schema,
  SignupSchema,
  type MembershipStatusView,
  type SignupInput,
} from "@/lib/validators/membership";

/**
 * Server actions da spec `02-cuidador-signup`.
 *
 * Esta camada cuida do **signup** (cuidador novo) + **leitura de status**
 * pelo próprio usuário. Os skeletons `listPendingMemberships`,
 * `approveMembership` e `declineMembership` são declarados aqui pelo
 * contrato compartilhado, mas a implementação completa é responsabilidade
 * da spec [`08-team-management`] (`team-agent`).
 *
 * Eventos publicados:
 *  - `membership.requested` (consumido por 08) — emitido em
 *    `submitCuidadorSignup` ao criar o registro pendente.
 */

// ─── submitCuidadorSignup ────────────────────────────────────────────────

export type SubmitCuidadorSignupResult =
  | {
      ok: true;
      membershipId: string;
      /** `null` quando nenhum tenant casou (estado pré-pendente). */
      tenantId: string | null;
      status: "pendente";
      /** Indica que o membership ficou aguardando o suporte materializar o tenant. */
      preMatch: boolean;
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Cria (ou re-aproveita) um Membership(`status='pendente'`, `papel='cuidador'`)
 * para o usuário logado, tentando inferir o `tenantId` por matching exato em
 * `(cidade, igreja)` na tabela `tenants` — coerente com a regra do MVP
 * descrita em `docs/specs/02-cuidador-signup.md` "Estados internos".
 *
 * **TODO (cidade↔igreja matching, evolução com [03]):**
 * O matching atual é exato (case-sensitive nos campos `tenants.cidade` /
 * `tenants.uf`); fuzzy match (lower + accent-insensitive) e cruzamento com
 * `igreja` ficam como evolução em conjunto com a spec de tenant-setup. Por
 * ora a comparação é apenas em `cidade` (com `LOWER`) + `uf`. Quando 03
 * normalizar os campos com slug, devolvemos esse acordo aqui.
 */
export async function submitCuidadorSignup(
  input: SignupInput,
): Promise<SubmitCuidadorSignupResult> {
  let auth: { userId: string };
  try {
    auth = await requireUser();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return { ok: false, error: "Faça login antes de continuar." };
    }
    throw err;
  }

  const parsed = SignupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos. Confira os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  /**
   * Mantemos `telefone` apenas como dado do form (cliente exibe pré-preenchido
   * a partir da sessão). Não atualizamos `users.telefone` aqui porque trocar
   * o número exige um novo ciclo de OTP — feito pelo `auth-agent` em [01].
   * Ainda assim revalidamos o formato server-side: forms manipulados
   * podem chegar com lixo.
   */
  const phoneCheck = PhoneE164Schema.safeParse(normalizeBrPhone(data.telefone));
  if (!phoneCheck.success) {
    return {
      ok: false,
      error: "Telefone inválido. Use DDD + número.",
      fieldErrors: { telefone: phoneCheck.error.issues.map((i) => i.message) },
    };
  }

  try {
    const matched = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(
        and(
          eq(tenants.uf, data.uf),
          sql`lower(${tenants.cidade}) = lower(${data.cidade})`,
        ),
      )
      .limit(1);
    const tenantId = matched[0]?.id ?? null;

    /**
     * Atualiza apenas o `nome` do usuário com o valor do form. Após `verifyOtp`
     * o `users.nome` fica como o próprio telefone (default conservador da
     * spec 01); este é o primeiro momento em que o usuário identifica-se.
     */
    await db
      .update(users)
      .set({ nome: data.nome, updatedAt: new Date() })
      .where(eq(users.id, auth.userId));

    const existing = await db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, auth.userId),
          tenantId
            ? eq(memberships.tenantId, tenantId)
            : sql`${memberships.tenantId} is null`,
        ),
      )
      .limit(1);

    if (existing[0]) {
      const updated = await db
        .update(memberships)
        .set({
          papel: "cuidador",
          status: "pendente",
          bio: data.bio ?? null,
          igreja: data.igreja,
          cidade: data.cidade,
          updatedAt: new Date(),
        })
        .where(eq(memberships.id, existing[0].id))
        .returning({ id: memberships.id });
      return {
        ok: true,
        membershipId: updated[0]!.id,
        tenantId,
        status: "pendente",
        preMatch: tenantId === null,
      };
    }

    const inserted = await db
      .insert(memberships)
      .values({
        userId: auth.userId,
        tenantId,
        papel: "cuidador",
        status: "pendente",
        bio: data.bio ?? null,
        igreja: data.igreja,
        cidade: data.cidade,
      })
      .returning({ id: memberships.id });

    return {
      ok: true,
      membershipId: inserted[0]!.id,
      tenantId,
      status: "pendente",
      preMatch: tenantId === null,
    };
  } catch (err) {
    console.error("[submitCuidadorSignup] falha:", err);
    return {
      ok: false,
      error:
        "Não foi possível registrar seu cadastro agora. Tente novamente em instantes.",
    };
  }
}

// ─── getMyMembershipStatus ───────────────────────────────────────────────

export type MembershipStatusResponse = {
  status: MembershipStatusView;
  membershipId?: string;
  tenantId?: string | null;
  motivoRecusa?: string | null;
};

/**
 * Retorna o último Membership do usuário logado para a tela de análise
 * fazer polling. Se o usuário ainda não submeteu o cadastro, devolve
 * `sem-membership` para o front decidir o redirect.
 */
export async function getMyMembershipStatus(): Promise<MembershipStatusResponse> {
  const auth = await requireUser();

  const rows = await db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, auth.userId))
    .orderBy(desc(memberships.createdAt))
    .limit(1);
  const last = rows[0];

  if (!last) return { status: "sem-membership" };

  const status: MembershipStatusView =
    last.status === "ativo"
      ? "ativo"
      : last.status === "recusado"
        ? "recusado"
        : last.status === "removido"
          ? "recusado"
          : "pendente";

  return {
    status,
    membershipId: last.id,
    tenantId: last.tenantId,
    motivoRecusa: last.motivoRecusa,
  };
}

// ─── Skeletons consumidos por [08-team-management] ───────────────────────

/**
 * Resumo exibido na fila de pendentes do líder. Tipo público porque a UI
 * de 08 é renderizada no client; o server consome a função síncrona.
 */
export type PendingMembership = {
  membershipId: string;
  userId: string;
  nome: string;
  telefone: string;
  igreja: string | null;
  cidade: string | null;
  bio: string | null;
  createdAt: Date;
};

const NOT_IMPL_MSG =
  "Operação ainda não implementada — pertence à spec 08-team-management.";

/**
 * Lista os memberships `pendentes` do tenant ativo do líder logado.
 *
 * **Implementação completa em [`08-team-management`]**. Aqui exporto a
 * assinatura para que o `team-agent` (08) possa importar este arquivo no
 * dia 1 sem race-condition de path. Por enquanto retorna `[]` para que
 * smoke-tests não quebrem.
 */
export async function listPendingMemberships(): Promise<PendingMembership[]> {
  await requireUser();
  return [];
}

/**
 * Aprova um membership pendente — dispara `membership.approved`.
 *
 * **Implementação completa em [`08-team-management`].** Stub atual lança
 * `Error` para sinalizar uso prematuro e aparecer cedo nos logs/CI.
 */
export async function approveMembership(
  membershipId: string,
  _params?: { tenantId?: string },
): Promise<void> {
  if (!membershipId) {
    throw new Error("approveMembership: membershipId obrigatório.");
  }
  throw new Error(NOT_IMPL_MSG);
}

/**
 * Recusa um membership pendente.
 *
 * **Implementação completa em [`08-team-management`].**
 */
export async function declineMembership(
  membershipId: string,
  _motivo?: string,
): Promise<void> {
  if (!membershipId) {
    throw new Error("declineMembership: membershipId obrigatório.");
  }
  throw new Error(NOT_IMPL_MSG);
}

// ─── Helpers usados pelos testes (read-only) ────────────────────────────

/**
 * Helper público `read-only` exposto para testes de tenant-isolation.
 * Não é parte do contrato externo — qualquer alteração aqui é livre desde
 * que a spec 08 atualize sua referência.
 */
export async function _internalListPendingByTenant(
  tenantId: string,
): Promise<Membership[]> {
  return db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.tenantId, tenantId),
        eq(memberships.status, "pendente"),
      ),
    );
}

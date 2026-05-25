import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { tenants, type Tenant } from "@/db/schema";
import {
  readSession,
  setActiveTenantOnSession,
  UnauthorizedError,
} from "@/lib/auth";

/**
 * API pública de tenancy consumida por todas as outras specs.
 *
 * - `getCurrentTenant` lê o cookie de sessão (definido pelo `auth-agent`)
 *   e materializa o tenant ativo + papel do usuário nele.
 * - `setActiveTenant` apenas re-exporta o helper de sessão para que
 *   consumers não precisem importar de `@/lib/auth` quando estão
 *   pensando em "trocar localidade".
 * - `listMyTenants` retorna todas as localidades em que o user logado
 *   tem `Membership.status='ativo'`. Útil em [11-settings] (TenantSwitcher).
 * - `requireRole` é o gate canônico de autorização ("apenas líder" /
 *   "apenas cuidador") usado nas server actions das demais specs.
 *
 * **Acoplamento com `signup-agent`:** o agregado `memberships` é dele
 * (`src/db/schema/memberships.ts`). Como roda em paralelo, aqui usamos
 * SQL bruto via `sql` template — quando o schema mergear, refatoramos
 * para `eq(memberships.userId, …)` com tipos. O contrato de colunas
 * (`user_id`, `tenant_id`, `papel`, `status`) está congelado em
 * `docs/architecture/data-model.md §2.2` e não muda sem coordenar.
 */

/** Papel do usuário em uma localidade — espelha enum `papel` da tabela `memberships`. */
export type Papel = "lider" | "cuidador";

/**
 * Tenant + papel resolvido. Inclui só os campos do `tenants` que UI/server
 * cuidam no contexto autenticado. Outros campos podem ser carregados
 * sob demanda (`tenants.findById`).
 */
export interface TenantWithRole {
  id: string;
  nome: string;
  cidade: string;
  uf: string;
  denominacao: string | null;
  sigla: string;
  cor: string;
  papel: Papel;
}

/**
 * Drizzle exige que o tipo passado a `db.execute<T>()` extends
 * `Record<string, unknown>` (qualquer linha indexável). Mantemos os
 * campos esperados e adicionamos a index signature para satisfazer.
 */
interface MembershipRow extends Record<string, unknown> {
  papel: Papel;
}

interface TenantWithRoleRow extends Record<string, unknown> {
  id: string;
  nome: string;
  cidade: string;
  uf: string;
  denominacao: string | null;
  sigla: string;
  cor: string;
  papel: Papel;
}

function tenantToView(t: Tenant, papel: Papel): TenantWithRole {
  return {
    id: t.id,
    nome: t.nome,
    cidade: t.cidade,
    uf: t.uf,
    denominacao: t.denominacao,
    sigla: t.sigla,
    cor: t.cor,
    papel,
  };
}

/**
 * Devolve a localidade ativa da sessão atual com o papel do usuário.
 *
 * Retorna `null` se:
 *   1. Não há sessão (deslogado).
 *   2. Sessão sem `activeTenantId` (líder ainda no onboarding etc).
 *   3. Tenant deletado / membership removido (caso de borda).
 *
 * Não lança — quem precisa garantir, chama `requireRole`.
 */
export async function getCurrentTenant(): Promise<TenantWithRole | null> {
  const session = await readSession();
  if (!session?.activeTenantId) return null;

  const rows = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, session.activeTenantId))
    .limit(1);
  const tenant = rows[0];
  if (!tenant) return null;

  // TODO(signup-agent): trocar por `db.select().from(memberships).where(...)`
  // quando o schema `memberships` estiver disponível.
  const memberships = await db.execute<MembershipRow>(
    sql`SELECT papel FROM memberships
        WHERE user_id = ${session.userId}
          AND tenant_id = ${session.activeTenantId}
          AND status = 'ativo'
        LIMIT 1`,
  );
  const membership = pickFirstRow<MembershipRow>(memberships);
  if (!membership) return null;

  return tenantToView(tenant, membership.papel);
}

/**
 * Re-exporta `setActiveTenantOnSession` com um nome mais natural:
 * `setActiveTenant(tenantId)` é o que o `<TenantSwitcher>` da spec 11
 * vai consumir. Mantemos a versão original em `@/lib/auth` para o
 * `auth-agent` continuar com a interface dele.
 *
 * **Validação de pertencimento** — antes de gravar o cookie, garantimos
 * que o usuário tem `Membership.status='ativo'` para esse tenant. Sem
 * isso, alguém com sessão poderia "rotacionar" para um tenant qualquer
 * passando o id no client.
 */
export async function setActiveTenant(tenantId: string): Promise<void> {
  const session = await readSession();
  if (!session) throw new UnauthorizedError();

  const memberships = await db.execute<MembershipRow>(
    sql`SELECT papel FROM memberships
        WHERE user_id = ${session.userId}
          AND tenant_id = ${tenantId}
          AND status = 'ativo'
        LIMIT 1`,
  );
  if (!pickFirstRow(memberships)) {
    throw new TenantAccessError(tenantId);
  }

  await setActiveTenantOnSession(tenantId);
}

/**
 * Limpa o tenant ativo do cookie sem fazer logout. Útil quando o usuário
 * é removido do último membership e precisa cair na tela de
 * `escolha-localidade`.
 */
export async function clearActiveTenant(): Promise<void> {
  await setActiveTenantOnSession(null);
}

/**
 * Lista as localidades do usuário logado nas quais ele tem
 * `Membership.status='ativo'`. Pode retornar lista vazia (líder
 * recém-cadastrado ainda no fluxo de tenant-setup).
 */
export async function listMyTenants(): Promise<TenantWithRole[]> {
  const session = await readSession();
  if (!session) return [];

  const rows = await db.execute<TenantWithRoleRow>(
    sql`SELECT t.id, t.nome, t.cidade, t.uf, t.denominacao, t.sigla, t.cor, m.papel
        FROM tenants t
        INNER JOIN memberships m ON m.tenant_id = t.id
        WHERE m.user_id = ${session.userId}
          AND m.status = 'ativo'
        ORDER BY t.nome ASC`,
  );
  return rowsAsArray<TenantWithRoleRow>(rows).map((r) => ({
    id: r.id,
    nome: r.nome,
    cidade: r.cidade,
    uf: r.uf,
    denominacao: r.denominacao ?? null,
    sigla: r.sigla,
    cor: r.cor,
    papel: r.papel,
  }));
}

/**
 * Garante que existe um tenant ativo na sessão E que o papel do usuário
 * nele bate com o esperado. Lança ao primeiro problema — útil dentro de
 * server actions: `await requireRole('lider')` no topo da função.
 */
export async function requireRole(role: Papel): Promise<TenantWithRole> {
  const t = await getCurrentTenant();
  if (!t) throw new TenantAccessError(null);
  if (t.papel !== role) throw new ForbiddenRoleError(role, t.papel);
  return t;
}

/**
 * Disparada quando o usuário tenta operar em um tenant que não pertence
 * (ou cuja sessão está sem tenant ativo). Status 401 — equivalente
 * lógico ao `UnauthorizedError`, mas separado para que callers possam
 * distinguir "deslogado" de "logado em outro tenant".
 */
export class TenantAccessError extends Error {
  readonly status = 401;
  constructor(tenantId: string | null) {
    super(
      tenantId
        ? `Sem permissão para o tenant ${tenantId}.`
        : "Sessão sem tenant ativo selecionado.",
    );
    this.name = "TenantAccessError";
  }
}

/**
 * Lançado quando o papel do usuário no tenant ativo não autoriza a
 * operação. Status 403.
 */
export class ForbiddenRoleError extends Error {
  readonly status = 403;
  constructor(
    public readonly required: Papel,
    public readonly actual: Papel,
  ) {
    super(
      `Operação restrita a ${required}. Papel atual: ${actual}.`,
    );
    this.name = "ForbiddenRoleError";
  }
}

// ─── Helpers de compat com `db.execute` (postgres-js / pg) ───────────────

/**
 * `db.execute` em drizzle-orm pode devolver `T[]` (postgres-js) ou
 * `{ rows: T[] }` (node-postgres). Normalizamos aqui para um array
 * sempre.
 */
function rowsAsArray<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (
    result &&
    typeof result === "object" &&
    "rows" in result &&
    Array.isArray((result as { rows?: unknown }).rows)
  ) {
    return (result as { rows: T[] }).rows;
  }
  return [];
}

function pickFirstRow<T>(result: unknown): T | undefined {
  return rowsAsArray<T>(result)[0];
}

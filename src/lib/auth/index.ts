import { readSession, type SessionPayload } from "./session";

/**
 * API pública do módulo auth para outras specs:
 *
 *  - `requireUser()`   → garante usuário autenticado.
 *  - `requireTenant()` → garante usuário + tenant ativo no cookie.
 *  - `setActiveTenant()` → re-exporta `setActiveTenantOnSession` para
 *    compatibilidade com a assinatura da spec.
 *
 * Importam:
 *   `import { requireUser, requireTenant } from "@/lib/auth"`
 */

export {
  createSession,
  destroySession,
  readSession,
  setActiveTenantOnSession,
  setActiveTenantOnSession as setActiveTenant,
  encodeSession,
  decodeSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  SessionSchema,
  type SessionPayload,
} from "./session";

export {
  sendOtpLimiter,
  verifyOtpLimiter,
  type RateLimiter,
  type RateLimitResult,
} from "./rate-limit";

/**
 * Erro lançado quando um caller não-autenticado tenta acessar uma server
 * action protegida. As specs consumidoras tratam:
 *
 *   try { await requireUser() } catch (e) { redirect('/login') }
 *
 * Não usamos `redirect()` aqui porque a função pode rodar em contexto
 * que não é Server Component (ex.: rota de API, server action).
 */
export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor(message = "Não autenticado.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class TenantNotSelectedError extends Error {
  readonly status = 401;
  constructor(message = "Sessão sem tenant ativo selecionado.") {
    super(message);
    this.name = "TenantNotSelectedError";
  }
}

/**
 * Garante que existe sessão válida. Lança `UnauthorizedError` quando
 * não houver cookie ou o JWT for inválido/expirado.
 */
export async function requireUser(): Promise<{ userId: string }> {
  const session = await readSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return { userId: session.userId };
}

/**
 * Garante sessão + tenant ativo selecionado.
 *
 * @remarks
 * **TODO (wave 2):** este helper precisa validar `Membership.status='ativo'`
 * para o `userId` + `tenantId`, mas o schema `memberships` é do
 * `signup-agent` (spec 02). Quando 02 + 03 mergearem, atualizar aqui para:
 *
 *   1. Buscar `membership` com `(userId, tenantId, status='ativo')`.
 *   2. Retornar `papel` real (lider | cuidador) em vez do default.
 *   3. Se membership não existir/inativo → `TenantNotSelectedError`.
 *
 * Por ora retornamos `papel: 'cuidador'` como default conservador (menor
 * privilégio) e confiamos que o cookie só recebe `activeTenantId` via
 * `setActiveTenantOnSession`, que será chamado pelo tenant-agent depois
 * de validar a relação User↔Tenant.
 */
export async function requireTenant(): Promise<{
  userId: string;
  tenantId: string;
  papel: "lider" | "cuidador";
}> {
  const session = await readSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  if (!session.activeTenantId) {
    throw new TenantNotSelectedError();
  }
  return {
    userId: session.userId,
    tenantId: session.activeTenantId,
    papel: "cuidador",
  };
}

/**
 * Variante "safe" que não lança — útil em layouts/server components que
 * só querem decidir se mostram CTA de login vs logado.
 */
export async function getOptionalUser(): Promise<{
  userId: string;
  activeTenantId?: string;
} | null> {
  const session: SessionPayload | null = await readSession();
  if (!session) return null;
  return {
    userId: session.userId,
    activeTenantId: session.activeTenantId,
  };
}

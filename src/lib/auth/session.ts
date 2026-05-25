import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";
import { env } from "@/lib/env";

/**
 * Sessão Acolhe — JWT assinado guardado em cookie httpOnly.
 *
 * Estratégia: **stateless JWT** (sem tabela `sessions` em DB). Vantagens:
 *  - Validar sessão é uma operação síncrona/local — sem round-trip ao DB.
 *  - Revogação é feita pela troca de `AUTH_SECRET` ou pelo cookie expirar.
 *
 * Trade-off conhecido: não há *forced logout* server-side por usuário até o
 * cookie expirar (30 dias). Quando precisarmos disso (banimento, troca de
 * senha massiva), criamos `sessions` como tabela e validamos `jti`.
 *
 * Payload mínimo:
 *  - `userId`     — sempre presente após `verifyOtp`.
 *  - `activeTenantId` — opcional; setado pela spec `03-tenant-setup`
 *    (via `setActiveTenantOnSession`) quando o usuário entra em uma
 *    localidade.
 */

export const SESSION_COOKIE_NAME = "acolhe_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dias

export const SessionSchema = z.object({
  userId: z.string().uuid(),
  activeTenantId: z.string().uuid().optional(),
});

export type SessionPayload = z.infer<typeof SessionSchema>;

/**
 * Em test/dev sem `AUTH_SECRET` configurado, geramos um segredo determinístico
 * (NÃO usar em produção). O `EnvSchema` aceita `AUTH_SECRET` opcional para
 * não travar CI; aqui detectamos a ausência e usamos fallback explícito.
 */
function getSecretKey(): Uint8Array {
  const raw =
    env.AUTH_SECRET ??
    (env.NODE_ENV === "production"
      ? ""
      : "dev-only-secret-do-not-use-in-prod-32+chars");
  if (!raw) {
    throw new Error(
      "AUTH_SECRET ausente em produção. Configure em .env (mín. 16 chars).",
    );
  }
  return new TextEncoder().encode(raw);
}

async function signSessionJwt(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .setIssuer("acolhe")
    .setAudience("acolhe-app")
    .sign(getSecretKey());
}

async function verifySessionJwt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: "acolhe",
      audience: "acolhe-app",
    });
    const parsed = SessionSchema.safeParse(payload);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Codifica e assina um payload — exposto para testes unitários. */
export async function encodeSession(payload: SessionPayload): Promise<string> {
  return signSessionJwt(payload);
}

/** Verifica/decodifica um token — exposto para testes unitários. */
export async function decodeSession(
  token: string,
): Promise<SessionPayload | null> {
  return verifySessionJwt(token);
}

/**
 * Cria a sessão e grava o cookie httpOnly. Sobrescreve qualquer sessão
 * anterior (útil em "trocar de conta" via OTP novamente).
 */
export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signSessionJwt(payload);
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Lê a sessão do cookie. Retorna `null` se ausente ou inválida. */
export async function readSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionJwt(token);
}

/** Apaga o cookie de sessão (logout). */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
}

/**
 * Atualiza apenas `activeTenantId` na sessão preservando o `userId`.
 *
 * Chamado pela spec `03-tenant-setup` ao final do onboarding e pela spec
 * `11-settings` no TenantSwitcher.
 */
export async function setActiveTenantOnSession(
  tenantId: string | null,
): Promise<void> {
  const current = await readSession();
  if (!current) {
    throw new Error(
      "Não é possível trocar tenant: sessão inexistente. Faça login.",
    );
  }
  await createSession({
    userId: current.userId,
    activeTenantId: tenantId ?? undefined,
  });
}

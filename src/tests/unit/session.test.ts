// @vitest-environment node

import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@/tests/factories";
import { makeFakeSessionPayload } from "@/tests/factories/auth";

/**
 * Sessão JWT — testes unitários do `src/lib/auth/session.ts`.
 *
 * Mockamos `next/headers` para um cookie-jar em memória, já que
 * `cookies()` só funciona dentro de um request real de Next. Isso nos
 * deixa exercitar `createSession`, `readSession` e `destroySession`
 * sem rodar o servidor inteiro.
 */

interface CookieOpts {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
}
const cookieStore = new Map<string, { value: string }>();
const cookiesMock = {
  get: vi.fn((name: string) => cookieStore.get(name)),
  set: vi.fn((name: string, value: string, _opts?: CookieOpts) => {
    cookieStore.set(name, { value });
  }),
  delete: vi.fn((name: string) => {
    cookieStore.delete(name);
  }),
};

vi.mock("next/headers", () => ({
  cookies: async () => cookiesMock,
  headers: async () => new Map(),
}));

import {
  createSession,
  readSession,
  destroySession,
  encodeSession,
  decodeSession,
  setActiveTenantOnSession,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

beforeEach(() => {
  cookieStore.clear();
  vi.clearAllMocks();
});

describe("encode/decode JWT", () => {
  it("roundtrip preserva o payload", async () => {
    const payload = makeFakeSessionPayload({
      activeTenantId: faker.string.uuid(),
    });
    const token = await encodeSession(payload);
    const decoded = await decodeSession(token);
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.activeTenantId).toBe(payload.activeTenantId);
  });

  it("decode rejeita token corrompido", async () => {
    const decoded = await decodeSession("nao-eh-um-jwt-valido");
    expect(decoded).toBeNull();
  });

  it("decode rejeita assinatura inválida", async () => {
    const payload = makeFakeSessionPayload();
    const token = await encodeSession(payload);
    const tampered = token.slice(0, -4) + "xxxx";
    const decoded = await decodeSession(tampered);
    expect(decoded).toBeNull();
  });
});

describe("createSession / readSession / destroySession", () => {
  it("createSession grava o cookie httpOnly", async () => {
    const payload = makeFakeSessionPayload();
    await createSession(payload);
    expect(cookiesMock.set).toHaveBeenCalledOnce();
    const [name, , opts] = cookiesMock.set.mock.calls[0]!;
    expect(name).toBe(SESSION_COOKIE_NAME);
    expect(opts).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    expect(opts?.maxAge).toBeGreaterThan(60 * 60 * 24 * 29); // ~30 dias
  });

  it("readSession retorna o payload original após criar", async () => {
    const payload = makeFakeSessionPayload({
      activeTenantId: faker.string.uuid(),
    });
    await createSession(payload);
    const session = await readSession();
    expect(session).toMatchObject({
      userId: payload.userId,
      activeTenantId: payload.activeTenantId,
    });
  });

  it("readSession retorna null quando cookie ausente", async () => {
    const session = await readSession();
    expect(session).toBeNull();
  });

  it("destroySession remove o cookie", async () => {
    await createSession(makeFakeSessionPayload());
    await destroySession();
    expect(cookiesMock.delete).toHaveBeenCalledWith(SESSION_COOKIE_NAME);
    cookieStore.delete(SESSION_COOKIE_NAME);
    expect(await readSession()).toBeNull();
  });
});

describe("setActiveTenantOnSession", () => {
  it("preserva userId e troca activeTenantId", async () => {
    const initial = makeFakeSessionPayload();
    await createSession(initial);
    const tenantId = faker.string.uuid();
    await setActiveTenantOnSession(tenantId);
    const session = await readSession();
    expect(session?.userId).toBe(initial.userId);
    expect(session?.activeTenantId).toBe(tenantId);
  });

  it("aceita null para limpar o tenant ativo", async () => {
    await createSession(
      makeFakeSessionPayload({ activeTenantId: faker.string.uuid() }),
    );
    await setActiveTenantOnSession(null);
    const session = await readSession();
    expect(session?.activeTenantId).toBeUndefined();
  });

  it("falha se não há sessão prévia", async () => {
    await expect(setActiveTenantOnSession(faker.string.uuid())).rejects.toThrow(
      /sessão inexistente/i,
    );
  });
});

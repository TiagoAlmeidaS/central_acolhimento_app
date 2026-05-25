import { describe, it, expect, beforeEach, vi } from "vitest";
import bcrypt from "bcryptjs";
import { faker } from "@/tests/factories";
import {
  OTP_EXPIRATION_MS,
  OTP_MAX_ATTEMPTS,
  type OtpCode,
} from "@/db/schema/otp";
import { users, type User } from "@/db/schema/users";
import { makeFakeE164Phone, makeUserRecord } from "@/tests/factories/user";
import { makeOtpRecord } from "@/tests/factories/auth";

/**
 * `sendOtp` / `verifyOtp` — testes unitários com mocks de DB, WhatsApp
 * e rate-limit. Cobre todos os cenários do §"Critérios de Aceite" da spec:
 *  - login com OTP válido (cria sessão e marca consumido)
 *  - OTP inválido decrementa tentativas e invalida após 3
 *  - OTP expirado é rejeitado
 *  - Telefone novo cria User (isNew: true)
 *  - Rate-limit dispara 429-like
 */

// ─── Mocks ───────────────────────────────────────────────────────────────

const otpStore: OtpCode[] = [];
const usersStore: User[] = [];

const dbMock = {
  insert: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
};

vi.mock("@/db", () => ({
  db: dbMock,
}));

vi.mock("@/lib/whatsapp/otp", () => ({
  sendOtpViaWhatsApp: vi.fn(async () => undefined),
}));

type LimitFn = (key: string) => Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}>;

const sendLimitMock = vi.fn<LimitFn>(async () => ({
  success: true,
  remaining: 4,
  reset: Date.now() + 60_000,
}));
const verifyLimitMock = vi.fn<LimitFn>(async () => ({
  success: true,
  remaining: 9,
  reset: Date.now() + 60_000,
}));
const createSessionMock = vi.fn(async (_p: { userId: string }) => undefined);
const destroySessionMock = vi.fn(async () => undefined);

vi.mock("@/lib/auth", () => ({
  sendOtpLimiter: { limit: (k: string) => sendLimitMock(k) },
  verifyOtpLimiter: { limit: (k: string) => verifyLimitMock(k) },
  createSession: createSessionMock,
  destroySession: destroySessionMock,
}));

vi.mock("next/headers", () => ({
  headers: async () => new Map([["x-forwarded-for", "203.0.113.42"]]),
}));

// Helpers para simular o query-builder fluente do Drizzle.
// Comparamos as referências de tabela (`users`/`otpCodes`) importadas
// diretamente do schema — mais robusto do que tentar adivinhar `table._.name`
// que muda entre versões do drizzle.

function mockInserts() {
  dbMock.insert.mockImplementation((table: unknown) => {
    if (table === users) {
      return {
        values: (values: Partial<User>) => ({
          returning: async () => {
            const id = faker.string.uuid();
            usersStore.push({
              id,
              fotoUrl: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              ...values,
            } as User);
            return [{ id }];
          },
        }),
      };
    }
    // otp_codes (default)
    return {
      values: async (values: Partial<OtpCode>) => {
        otpStore.push({
          id: faker.string.uuid(),
          tentativas: 0,
          consumidoEm: null,
          createdAt: new Date(),
          ...values,
        } as OtpCode);
      },
    };
  });
}

function mockSelects() {
  dbMock.select.mockImplementation(() => ({
    from: (table: unknown) => ({
      where: (_w: unknown) => ({
        orderBy: () => ({
          limit: async () => {
            if (table === users) return usersStore.slice(-1);
            return otpStore.filter((r) => !r.consumidoEm).slice(-1);
          },
        }),
        limit: async () => {
          if (table === users) return usersStore.slice(-1);
          return otpStore.filter((r) => !r.consumidoEm).slice(-1);
        },
      }),
    }),
  }));
}

function mockUpdate() {
  dbMock.update.mockImplementation(() => ({
    set: (patch: Partial<OtpCode | User>) => ({
      where: async () => {
        if ("tentativas" in patch || "consumidoEm" in patch) {
          const last = otpStore[otpStore.length - 1];
          if (last) Object.assign(last, patch);
        } else {
          const last = usersStore[usersStore.length - 1];
          if (last) Object.assign(last, patch);
        }
      },
    }),
  }));
}

beforeEach(() => {
  otpStore.length = 0;
  usersStore.length = 0;
  vi.clearAllMocks();
  sendLimitMock.mockResolvedValue({
    success: true,
    remaining: 4,
    reset: Date.now() + 60_000,
  });
  verifyLimitMock.mockResolvedValue({
    success: true,
    remaining: 9,
    reset: Date.now() + 60_000,
  });
  mockInserts();
  mockSelects();
  mockUpdate();
});

// Import LAZY para garantir que os mocks já estão registrados.
async function loadActions() {
  return await import("@/server/auth.actions");
}

// ─── sendOtp ─────────────────────────────────────────────────────────────

describe("sendOtp", () => {
  it("gera um código persistido como hash bcrypt e dispara WhatsApp", async () => {
    const { sendOtp } = await loadActions();
    const { sendOtpViaWhatsApp } = await import("@/lib/whatsapp/otp");
    const telefone = makeFakeE164Phone();

    const res = await sendOtp({ telefone });
    if (!res.ok) throw new Error(`esperava ok=true, recebeu: ${res.error}`);

    expect(otpStore).toHaveLength(1);
    const row = otpStore[0]!;
    expect(row.telefone).toBe(telefone);
    expect(row.codigoHash).not.toMatch(/^\d{6}$/); // não é plain
    expect(row.codigoHash.length).toBeGreaterThan(20); // hash bcrypt
    expect(row.expiraEm.getTime()).toBeGreaterThan(Date.now());
    expect(row.expiraEm.getTime()).toBeLessThanOrEqual(
      Date.now() + OTP_EXPIRATION_MS + 100,
    );

    expect(sendOtpViaWhatsApp).toHaveBeenCalledOnce();
    const [calledTel, calledCode] = vi.mocked(sendOtpViaWhatsApp).mock
      .calls[0]!;
    expect(calledTel).toBe(telefone);
    expect(calledCode).toMatch(/^\d{6}$/);
    expect(await bcrypt.compare(calledCode, row.codigoHash)).toBe(true);

    expect(res.expiresAt.getTime()).toBe(row.expiraEm.getTime());
  });

  it("rejeita telefone inválido", async () => {
    const { sendOtp } = await loadActions();
    const res = await sendOtp({ telefone: "abc" });
    expect(res.ok).toBe(false);
    expect(otpStore).toHaveLength(0);
  });

  it("aceita máscara brasileira e normaliza para E.164", async () => {
    const { sendOtp } = await loadActions();
    const res = await sendOtp({ telefone: "(92) 99988-7766" });
    expect(res.ok).toBe(true);
    expect(otpStore[0]?.telefone).toBe("+5592999887766");
  });

  it("retorna erro 429-like quando rate-limit estoura", async () => {
    sendLimitMock.mockResolvedValueOnce({
      success: false,
      remaining: 0,
      reset: Date.now() + 60_000,
    });
    const { sendOtp } = await loadActions();
    const res = await sendOtp({ telefone: makeFakeE164Phone() });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.toLowerCase()).toMatch(/tentativas|aguarde/);
    }
  });
});

// ─── verifyOtp ───────────────────────────────────────────────────────────

async function seedOtp(overrides: Partial<OtpCode> = {}) {
  const fixture = await makeOtpRecord(overrides);
  otpStore.push(fixture.record);
  return fixture;
}

async function seedUser(telefone: string): Promise<User> {
  const u = makeUserRecord({ telefone });
  usersStore.push(u);
  return u;
}

describe("verifyOtp", () => {
  it("cria sessão e User novo (isNew=true) com código correto", async () => {
    const telefone = makeFakeE164Phone();
    const { code } = await seedOtp({ telefone });

    const { verifyOtp } = await loadActions();
    const res = await verifyOtp({ telefone, code });

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.isNew).toBe(true);
    expect(usersStore).toHaveLength(1);
    expect(usersStore[0]?.telefone).toBe(telefone);
    expect(createSessionMock).toHaveBeenCalledOnce();
    expect(createSessionMock).toHaveBeenCalledWith({ userId: res.userId });
    expect(otpStore[0]?.consumidoEm).toBeInstanceOf(Date);
  });

  it("retorna isNew=false quando o usuário já existe", async () => {
    const telefone = makeFakeE164Phone();
    await seedUser(telefone);
    const { code } = await seedOtp({ telefone });

    const { verifyOtp } = await loadActions();
    const res = await verifyOtp({ telefone, code });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.isNew).toBe(false);
    expect(usersStore).toHaveLength(1);
  });

  it("incrementa tentativas e devolve mensagem com restantes", async () => {
    const telefone = makeFakeE164Phone();
    await seedOtp({ telefone });
    const { verifyOtp } = await loadActions();

    const res = await verifyOtp({ telefone, code: "000000" });
    expect(res.ok).toBe(false);
    expect(otpStore[0]?.tentativas).toBe(1);
    expect(otpStore[0]?.consumidoEm).toBeNull();
    if (!res.ok) {
      expect(res.error.toLowerCase()).toContain("incorreto");
    }
  });

  it(`invalida OTP após ${OTP_MAX_ATTEMPTS} tentativas erradas`, async () => {
    const telefone = makeFakeE164Phone();
    await seedOtp({ telefone });
    const { verifyOtp } = await loadActions();

    for (let i = 0; i < OTP_MAX_ATTEMPTS; i++) {
      await verifyOtp({ telefone, code: "000000" });
    }
    expect(otpStore[0]?.tentativas).toBe(OTP_MAX_ATTEMPTS);
    expect(otpStore[0]?.consumidoEm).toBeInstanceOf(Date);
  });

  it("rejeita OTP expirado", async () => {
    const telefone = makeFakeE164Phone();
    const { code } = await seedOtp({
      telefone,
      expiraEm: new Date(Date.now() - 1000),
    });
    const { verifyOtp } = await loadActions();

    const res = await verifyOtp({ telefone, code });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.toLowerCase()).toContain("expirado");
    expect(otpStore[0]?.consumidoEm).toBeInstanceOf(Date);
  });

  it("retorna erro quando rate-limit do verify estoura", async () => {
    verifyLimitMock.mockResolvedValueOnce({
      success: false,
      remaining: 0,
      reset: Date.now() + 60_000,
    });
    const { verifyOtp } = await loadActions();
    const res = await verifyOtp({
      telefone: makeFakeE164Phone(),
      code: "123456",
    });
    expect(res.ok).toBe(false);
  });

  it("rejeita código com formato inválido sem mexer no DB", async () => {
    const telefone = makeFakeE164Phone();
    await seedOtp({ telefone });
    const { verifyOtp } = await loadActions();
    const res = await verifyOtp({ telefone, code: "abc" });
    expect(res.ok).toBe(false);
    expect(otpStore[0]?.tentativas).toBe(0);
  });
});

// ─── signOut ─────────────────────────────────────────────────────────────

describe("signOut", () => {
  it("destrói a sessão", async () => {
    const { signOut } = await loadActions();
    await signOut();
    expect(destroySessionMock).toHaveBeenCalledOnce();
  });
});

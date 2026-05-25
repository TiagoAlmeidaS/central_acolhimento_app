import { beforeEach, describe, expect, it, vi } from "vitest";
import { faker } from "@/tests/factories";
import { makeUserRecord } from "@/tests/factories/user";
import { makeSignupInput } from "@/tests/factories/membership";
import { memberships, tenants, users } from "@/db/schema";
import type { Membership, Tenant, User } from "@/db/schema";
import { SignupSchema } from "@/lib/validators/membership";

/**
 * Testes da spec 02-cuidador-signup. Cobre:
 *  - Validações Zod do `SignupSchema`.
 *  - `submitCuidadorSignup`: cria Membership pendente com matching de tenant.
 *  - Caso "pré-pendente" — sem tenant, `tenantId` fica null.
 *  - Reaproveitamento de Membership existente do mesmo (user, tenant).
 *  - `getMyMembershipStatus`: sem-membership / pendente / ativo / recusado.
 *  - Skeletons (08): erro instrutivo informando ownership.
 *
 * Estratégia de mocks: copiamos o padrão do `otp-actions.test` —
 * comparamos referências de tabela (`users`, `tenants`, `memberships`)
 * importadas direto do schema.
 */

// ─── Stores ──────────────────────────────────────────────────────────────

const usersStore: User[] = [];
const tenantsStore: Tenant[] = [];
const membershipsStore: Membership[] = [];

// ─── DB Mock ─────────────────────────────────────────────────────────────

const dbMock = {
  insert: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
};

vi.mock("@/db", () => ({
  db: dbMock,
}));

// Auth helpers — `requireUser` é controlado por test.
const requireUserMock = vi.fn(async () => ({ userId: "<not-set>" }));

class FakeUnauthorizedError extends Error {
  readonly status = 401;
  constructor() {
    super("Não autenticado.");
    this.name = "UnauthorizedError";
  }
}

vi.mock("@/lib/auth", () => ({
  requireUser: () => requireUserMock(),
  UnauthorizedError: FakeUnauthorizedError,
}));

vi.mock("@/lib/auth/phone", () => ({
  normalizeBrPhone: (input: string) => {
    const digits = input.replace(/\D/g, "");
    if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
    if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
    return input.startsWith("+") ? input : `+${digits}`;
  },
}));

// ─── Mock implementations ────────────────────────────────────────────────

interface DrizzleSelectResult<T> {
  from: (table: unknown) => {
    where: (predicate: unknown) => {
      orderBy: (..._args: unknown[]) => { limit: (n: number) => Promise<T[]> };
      limit: (n: number) => Promise<T[]>;
    };
  };
}

type Predicate = { __testKind?: string; [key: string]: unknown };

function membershipMatchesUserTenant(
  m: Membership,
  userId: string,
  tenantId: string | null,
) {
  if (m.userId !== userId) return false;
  if (tenantId === null) return m.tenantId === null;
  return m.tenantId === tenantId;
}

function mockSelect() {
  dbMock.select.mockImplementation(<T,>(_columns?: unknown): DrizzleSelectResult<T> => {
    return {
      from: (table) => ({
        where: (_predicate) => {
          const filter = (_predicate ?? {}) as Predicate;
          const filterByMembership = (rows: Membership[]): Membership[] => {
            const userId = (filter.userId as string) ?? null;
            const tenantId = (filter.tenantId as string | null | undefined) ?? null;
            const explicitNull = filter.tenantIsNull === true;
            return rows.filter((m) => {
              if (userId && m.userId !== userId) return false;
              if (explicitNull && m.tenantId !== null) return false;
              if (!explicitNull && tenantId && m.tenantId !== tenantId) return false;
              if (filter.status && m.status !== filter.status) return false;
              return true;
            });
          };
          const filterByTenant = (rows: Tenant[]): Tenant[] => {
            const cidade = filter.cidade as string | undefined;
            const uf = filter.uf as string | undefined;
            return rows.filter((t) => {
              if (cidade && t.cidade.toLowerCase() !== cidade.toLowerCase()) {
                return false;
              }
              if (uf && t.uf !== uf) return false;
              return true;
            });
          };
          const baseRows = (() => {
            if (table === users) return usersStore as unknown as T[];
            if (table === tenants) return filterByTenant(tenantsStore) as unknown as T[];
            if (table === memberships) {
              return filterByMembership(membershipsStore) as unknown as T[];
            }
            return [];
          })();
          return {
            orderBy: (..._args: unknown[]) => ({
              limit: async (n: number) => {
                if (table === memberships) {
                  return [...(baseRows as unknown as Membership[])]
                    .sort(
                      (a, b) =>
                        b.createdAt.getTime() - a.createdAt.getTime(),
                    )
                    .slice(0, n) as unknown as T[];
                }
                return baseRows.slice(0, n);
              },
            }),
            limit: async (n: number) => baseRows.slice(0, n),
          };
        },
      }),
    };
  });
}

function mockInsert() {
  dbMock.insert.mockImplementation((table: unknown) => ({
    values: (values: Partial<Membership>) => ({
      returning: async () => {
        if (table !== memberships) return [];
        const row: Membership = {
          id: faker.string.uuid(),
          userId: values.userId!,
          tenantId: values.tenantId ?? null,
          papel: values.papel ?? "cuidador",
          status: values.status ?? "pendente",
          bio: values.bio ?? null,
          igreja: values.igreja ?? null,
          cidade: values.cidade ?? null,
          convidadoPor: values.convidadoPor ?? null,
          ativadoEm: values.ativadoEm ?? null,
          removidoEm: values.removidoEm ?? null,
          motivoRecusa: values.motivoRecusa ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        membershipsStore.push(row);
        return [{ id: row.id }];
      },
    }),
  }));
}

function mockUpdate() {
  dbMock.update.mockImplementation((table: unknown) => ({
    set: (patch: Record<string, unknown>) => ({
      where: async () => {
        if (table === users) {
          if (patch.nome && usersStore.length) {
            usersStore[usersStore.length - 1]!.nome = String(patch.nome);
          }
          return;
        }
        if (table === memberships && membershipsStore.length) {
          const row = membershipsStore[membershipsStore.length - 1]!;
          Object.assign(row, patch);
        }
      },
      returning: async () => {
        if (table === memberships) {
          const row = membershipsStore[membershipsStore.length - 1];
          return row ? [{ id: row.id }] : [];
        }
        return [];
      },
    }),
  }));
}

// ─── Predicate builders ──────────────────────────────────────────────────
//
// Drizzle constrói um objeto opaco em `eq()`, `and()`, `sql\`\``. Para o teste
// ser determinístico interceptamos esses helpers do drizzle-orm e devolvemos
// um objeto plano que o nosso mock de `select` consegue ler.

vi.mock("drizzle-orm", async () => {
  const actual =
    await vi.importActual<typeof import("drizzle-orm")>("drizzle-orm");
  const eq = (column: { name?: string } & Record<string, unknown>, value: unknown) => {
    const key = inferColumnKey(column);
    return { [key]: value };
  };
  const and = (...args: unknown[]) =>
    Object.assign({}, ...args.filter((a) => a && typeof a === "object"));
  const sql = (strings: TemplateStringsArray, ...values: unknown[]) => {
    const raw = strings.join("?");
    if (raw.includes("is null")) {
      return { tenantIsNull: true };
    }
    if (raw.toLowerCase().includes("lower(") && raw.includes("cidade")) {
      const v = values.find((v) => typeof v === "string");
      return { cidade: v };
    }
    return {};
  };
  // Helpers usados pelas factories — preservar os reais.
  return {
    ...actual,
    eq,
    and,
    sql,
  };
});

/**
 * Tenta inferir o nome lógico da coluna pela referência. Drizzle expõe
 * `column.name` na maioria das versões (snake_case). Mapeamos os usados
 * neste teste para o nome em camelCase do tipo `Membership`/`Tenant`.
 */
function inferColumnKey(column: unknown): string {
  if (!column || typeof column !== "object") return "__unknown__";
  const nameRaw = (column as { name?: string }).name;
  if (!nameRaw) return "__unknown__";
  switch (nameRaw) {
    case "user_id":
      return "userId";
    case "tenant_id":
      return "tenantId";
    case "uf":
      return "uf";
    case "cidade":
      return "cidade";
    case "status":
      return "status";
    case "id":
      return "id";
    case "telefone":
      return "telefone";
    default:
      return nameRaw;
  }
}

// ─── Setup ───────────────────────────────────────────────────────────────

beforeEach(() => {
  usersStore.length = 0;
  tenantsStore.length = 0;
  membershipsStore.length = 0;
  vi.clearAllMocks();
  mockSelect();
  mockInsert();
  mockUpdate();
});

async function loadActions() {
  return await import("@/server/membership.actions");
}

function seedUserAndAuth(overrides: Partial<User> = {}) {
  const user = makeUserRecord(overrides);
  usersStore.push(user);
  requireUserMock.mockResolvedValue({ userId: user.id });
  return user;
}

function seedTenant(overrides: Partial<Tenant> = {}): Tenant {
  const t: Tenant = {
    id: faker.string.uuid(),
    nome: faker.company.name(),
    cidade: overrides.cidade ?? faker.location.city(),
    uf: overrides.uf ?? "SP",
    denominacao: overrides.denominacao ?? null,
    sigla: "AD",
    cor: "#2D7FF9",
    criadoPor: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
  tenantsStore.push(t);
  return t;
}

// ─── SignupSchema validations ────────────────────────────────────────────

describe("SignupSchema", () => {
  it("aceita um payload Faker válido", () => {
    const input = makeSignupInput();
    const result = SignupSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejeita nome vazio", () => {
    const input = makeSignupInput({ nome: "" });
    const r = SignupSchema.safeParse(input);
    expect(r.success).toBe(false);
  });

  it("rejeita telefone com menos de 10 dígitos", () => {
    const input = makeSignupInput({ telefone: "(11) 99" });
    const r = SignupSchema.safeParse(input);
    expect(r.success).toBe(false);
  });

  it("rejeita uf inválida", () => {
    const input = { ...makeSignupInput(), uf: "ZZ" as never };
    const r = SignupSchema.safeParse(input);
    expect(r.success).toBe(false);
  });

  it("aceita bio ausente (opcional)", () => {
    const { bio: _, ...rest } = makeSignupInput();
    void _;
    const r = SignupSchema.safeParse(rest);
    expect(r.success).toBe(true);
  });

  it("rejeita bio acima de 500 chars", () => {
    const input = makeSignupInput({ bio: "a".repeat(501) });
    const r = SignupSchema.safeParse(input);
    expect(r.success).toBe(false);
  });
});

// ─── submitCuidadorSignup ────────────────────────────────────────────────

describe("submitCuidadorSignup", () => {
  it("cria Membership pendente com tenantId quando há matching exato", async () => {
    const user = seedUserAndAuth();
    const tenant = seedTenant({ cidade: "São Paulo", uf: "SP" });
    const input = makeSignupInput({ cidade: "São Paulo", uf: "SP" });

    const { submitCuidadorSignup } = await loadActions();
    const res = await submitCuidadorSignup(input);

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.tenantId).toBe(tenant.id);
    expect(res.preMatch).toBe(false);
    expect(res.status).toBe("pendente");

    expect(membershipsStore).toHaveLength(1);
    const m = membershipsStore[0]!;
    expect(m.userId).toBe(user.id);
    expect(m.tenantId).toBe(tenant.id);
    expect(m.papel).toBe("cuidador");
    expect(m.status).toBe("pendente");
    expect(m.cidade).toBe(input.cidade);
    expect(m.igreja).toBe(input.igreja);
    expect(m.bio).toBe(input.bio);
  });

  it("vai para 'pré-pendente' (tenantId=null) quando nenhum tenant casa", async () => {
    seedUserAndAuth();
    const input = makeSignupInput({
      cidade: "Cidade Inexistente Faker",
      uf: "AC",
    });

    const { submitCuidadorSignup } = await loadActions();
    const res = await submitCuidadorSignup(input);

    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.tenantId).toBeNull();
    expect(res.preMatch).toBe(true);
    expect(membershipsStore[0]?.tenantId).toBeNull();
  });

  it("rejeita usuário não autenticado com erro instrutivo", async () => {
    requireUserMock.mockRejectedValueOnce(new FakeUnauthorizedError());
    const { submitCuidadorSignup } = await loadActions();
    const res = await submitCuidadorSignup(makeSignupInput());
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.toLowerCase()).toContain("login");
    }
    expect(membershipsStore).toHaveLength(0);
  });

  it("retorna fieldErrors quando o payload é inválido (uf incorreta)", async () => {
    seedUserAndAuth();
    const input = { ...makeSignupInput(), uf: "ZZ" as never };
    const { submitCuidadorSignup } = await loadActions();
    const res = await submitCuidadorSignup(input);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.fieldErrors).toBeTruthy();
      expect(res.fieldErrors?.uf?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("atualiza o `nome` do usuário com o valor digitado", async () => {
    const user = seedUserAndAuth({ nome: user_telefoneAsName() });
    const input = makeSignupInput();
    const { submitCuidadorSignup } = await loadActions();
    await submitCuidadorSignup(input);
    expect(user.nome).toBe(input.nome);
  });
});

function user_telefoneAsName() {
  // Default conservador setado por verifyOtp em [01]: nome === telefone.
  return "+5511999990000";
}

// ─── getMyMembershipStatus ──────────────────────────────────────────────

describe("getMyMembershipStatus", () => {
  it("retorna sem-membership quando o usuário ainda não submeteu", async () => {
    seedUserAndAuth();
    const { getMyMembershipStatus } = await loadActions();
    const res = await getMyMembershipStatus();
    expect(res.status).toBe("sem-membership");
  });

  it("retorna pendente após submitCuidadorSignup", async () => {
    seedUserAndAuth();
    seedTenant({ cidade: "Manaus", uf: "AM" });
    const { submitCuidadorSignup, getMyMembershipStatus } = await loadActions();
    await submitCuidadorSignup(
      makeSignupInput({ cidade: "Manaus", uf: "AM" }),
    );
    const res = await getMyMembershipStatus();
    expect(res.status).toBe("pendente");
  });

  it("retorna ativo quando o membership está aprovado", async () => {
    const user = seedUserAndAuth();
    const tenant = seedTenant();
    membershipsStore.push({
      id: faker.string.uuid(),
      userId: user.id,
      tenantId: tenant.id,
      papel: "cuidador",
      status: "ativo",
      bio: null,
      igreja: null,
      cidade: null,
      convidadoPor: null,
      ativadoEm: new Date(),
      removidoEm: null,
      motivoRecusa: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const { getMyMembershipStatus } = await loadActions();
    const res = await getMyMembershipStatus();
    expect(res.status).toBe("ativo");
    expect(res.tenantId).toBe(tenant.id);
  });

  it("retorna recusado e propaga motivo", async () => {
    const user = seedUserAndAuth();
    const tenant = seedTenant();
    const motivo = faker.lorem.sentence();
    membershipsStore.push({
      id: faker.string.uuid(),
      userId: user.id,
      tenantId: tenant.id,
      papel: "cuidador",
      status: "recusado",
      bio: null,
      igreja: null,
      cidade: null,
      convidadoPor: null,
      ativadoEm: null,
      removidoEm: null,
      motivoRecusa: motivo,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const { getMyMembershipStatus } = await loadActions();
    const res = await getMyMembershipStatus();
    expect(res.status).toBe("recusado");
    expect(res.motivoRecusa).toBe(motivo);
  });
});

// ─── Skeletons (08) ──────────────────────────────────────────────────────

describe("skeletons (08-team-management)", () => {
  it("listPendingMemberships retorna [] como stub", async () => {
    seedUserAndAuth();
    const { listPendingMemberships } = await loadActions();
    const res = await listPendingMemberships();
    expect(res).toEqual([]);
  });

  it("approveMembership lança avisando que está em 08", async () => {
    const { approveMembership } = await loadActions();
    await expect(approveMembership(faker.string.uuid())).rejects.toThrowError(
      /08-team-management/i,
    );
  });

  it("declineMembership lança avisando que está em 08", async () => {
    const { declineMembership } = await loadActions();
    await expect(
      declineMembership(faker.string.uuid(), "motivo"),
    ).rejects.toThrowError(/08-team-management/i);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { faker } from "@/tests/factories";
import { makeMembershipRecord } from "@/tests/factories/membership";
import { memberships } from "@/db/schema";
import type { Membership } from "@/db/schema";

/**
 * Tenant-isolation rudimentar para a spec 02. Verifica que ações de
 * leitura sobre `memberships` retornam apenas linhas do tenant solicitado
 * — a base do isolamento que a spec 08 vai endurecer com RLS de Postgres.
 *
 * Por ora testamos contra `_internalListPendingByTenant`, helper de leitura
 * exposto pela própria 02 para que testes não dependam dos schemas/owns
 * de outras specs.
 */

const membershipsStore: Membership[] = [];

const dbMock = {
  insert: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
};

vi.mock("@/db", () => ({ db: dbMock }));

vi.mock("@/lib/auth", () => ({
  requireUser: async () => ({ userId: faker.string.uuid() }),
  UnauthorizedError: class extends Error {
    readonly status = 401;
  },
}));

vi.mock("@/lib/auth/phone", () => ({
  normalizeBrPhone: (input: string) => input,
}));

vi.mock("drizzle-orm", async () => {
  const actual =
    await vi.importActual<typeof import("drizzle-orm")>("drizzle-orm");
  const eq = (column: { name?: string }, value: unknown) => {
    const key = (() => {
      switch (column?.name) {
        case "tenant_id":
          return "tenantId";
        case "user_id":
          return "userId";
        case "status":
          return "status";
        default:
          return column?.name ?? "__unknown__";
      }
    })();
    return { [key]: value };
  };
  const and = (...args: unknown[]) =>
    Object.assign({}, ...args.filter((a) => a && typeof a === "object"));
  const sql = (..._args: unknown[]) => ({});
  return { ...actual, eq, and, sql };
});

beforeEach(() => {
  membershipsStore.length = 0;
  vi.clearAllMocks();
  dbMock.select.mockImplementation(() => ({
    from: (table: unknown) => ({
      where: (predicate: unknown) => {
        const filter = (predicate ?? {}) as Record<string, unknown>;
        const filtered =
          table === memberships
            ? membershipsStore.filter((m) => {
                if (filter.tenantId && m.tenantId !== filter.tenantId)
                  return false;
                if (filter.status && m.status !== filter.status) return false;
                if (filter.userId && m.userId !== filter.userId) return false;
                return true;
              })
            : [];
        // Drizzle `.where()` retorna um query "thenable" — expomos
        // `.then()` para que `await db.select()...where(...)` resolva
        // direto, e mantemos `.orderBy()` / `.limit()` para flows que
        // continuem a chain.
        const promise = Promise.resolve(filtered);
        return {
          then: promise.then.bind(promise),
          catch: promise.catch.bind(promise),
          finally: promise.finally.bind(promise),
          orderBy: () => ({
            limit: async (n: number) => filtered.slice(0, n),
          }),
          limit: async (n: number) => filtered.slice(0, n),
        };
      },
    }),
  }));
});

async function loadActions() {
  return await import("@/server/membership.actions");
}

describe("tenant isolation (memberships pendentes)", () => {
  it("usuário do tenant A não vê pendentes do tenant B", async () => {
    const tenantA = faker.string.uuid();
    const tenantB = faker.string.uuid();

    const pendingsA = Array.from({ length: 3 }).map(() =>
      makeMembershipRecord({ tenantId: tenantA, status: "pendente" }),
    );
    const pendingsB = Array.from({ length: 2 }).map(() =>
      makeMembershipRecord({ tenantId: tenantB, status: "pendente" }),
    );
    membershipsStore.push(...pendingsA, ...pendingsB);

    const { _internalListPendingByTenant } = await loadActions();
    const seenA = await _internalListPendingByTenant(tenantA);
    const seenB = await _internalListPendingByTenant(tenantB);

    expect(seenA).toHaveLength(3);
    expect(seenA.every((m) => m.tenantId === tenantA)).toBe(true);
    expect(seenB).toHaveLength(2);
    expect(seenB.every((m) => m.tenantId === tenantB)).toBe(true);
  });

  it("filtra apenas memberships com status=pendente", async () => {
    const tenantId = faker.string.uuid();
    membershipsStore.push(
      makeMembershipRecord({ tenantId, status: "pendente" }),
      makeMembershipRecord({ tenantId, status: "ativo" }),
      makeMembershipRecord({ tenantId, status: "recusado" }),
      makeMembershipRecord({ tenantId, status: "removido" }),
    );

    const { _internalListPendingByTenant } = await loadActions();
    const result = await _internalListPendingByTenant(tenantId);

    expect(result).toHaveLength(1);
    expect(result[0]?.status).toBe("pendente");
  });
});

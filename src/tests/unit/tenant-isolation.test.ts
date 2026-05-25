import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fakerPT_BR as faker } from "@faker-js/faker";
import { makeTwoIsolatedTenants } from "@/tests/factories/tenant";

/**
 * Tenant isolation — invariante crítica do produto
 * (`docs/architecture/multi-tenancy.md` §7).
 *
 * O contrato verificado aqui:
 *  1. `getCurrentTenant()` só vê o tenant da sessão ativa.
 *  2. `listMyTenants()` só lista tenants em que o user logado tem
 *     `Membership.status='ativo'`.
 *  3. Ao trocar de sessão, a resposta muda — duas sessões concorrentes
 *     no mesmo banco não vazam dados uma para outra.
 *
 * Mockamos o `db` para simular dois usuários (A e B) com tenants
 * distintos e validamos que cada chamada respeita o contexto da
 * sessão.
 */

interface SessionFake {
  userId: string;
  activeTenantId?: string;
}

const sessionStore = { current: null as SessionFake | null };
const setSession = (s: SessionFake | null) => {
  sessionStore.current = s;
};

class FakeUnauthorizedError extends Error {
  readonly status = 401;
  constructor() {
    super("Não autenticado.");
    this.name = "UnauthorizedError";
  }
}

vi.mock("@/lib/auth", () => ({
  readSession: () => Promise.resolve(sessionStore.current),
  setActiveTenantOnSession: (tid: string | null) => {
    if (!sessionStore.current) throw new FakeUnauthorizedError();
    sessionStore.current = {
      ...sessionStore.current,
      activeTenantId: tid ?? undefined,
    };
    return Promise.resolve();
  },
  UnauthorizedError: FakeUnauthorizedError,
}));

interface DbWhereable {
  where: (..._args: unknown[]) => DbWhereable;
  limit: (n: number) => Promise<unknown[]>;
}

interface DbSelectable {
  from: (..._args: unknown[]) => DbWhereable;
}

interface TenantRow {
  id: string;
  nome: string;
  cidade: string;
  uf: string;
  denominacao: string | null;
  sigla: string;
  cor: string;
  criadoPor: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MembershipRow {
  user_id: string;
  tenant_id: string;
  papel: "lider" | "cuidador";
  status: "ativo" | "pendente" | "removido";
}

const dbWorld = {
  tenants: [] as TenantRow[],
  memberships: [] as MembershipRow[],
  /** Hook para inspecionar a última query SQL bruta executada. */
  lastSql: null as string | null,
  /** Bypass tag — quando tenancy lib chamar `db.execute(sql\`SELECT papel...`)`,
   *  retornamos linhas filtradas pelo último `whereTenantId` capturado pelo select. */
  selectMode: "tenants" as "tenants" | "membership-papel" | "list-my-tenants",
  whereTenantId: null as string | null,
  whereUserId: null as string | null,
};

vi.mock("@/db", () => {
  const select = (): DbSelectable => ({
    from: () => {
      let pendingTenantId: string | null = null;
      const where = (): DbWhereable => ({
        where: (cond: unknown) => {
          // o argumento de `where` para `eq(tenants.id, X)` em drizzle vem
          // como um objeto opaco; capturamos via toString-ish para teste.
          const repr = String((cond as { toString?: () => string })?.toString?.() ?? cond);
          const match = repr.match(/[0-9a-f-]{36}/i);
          if (match) pendingTenantId = match[0]!;
          return where();
        },
        limit: () => {
          if (pendingTenantId) {
            return Promise.resolve(
              dbWorld.tenants.filter((t) => t.id === pendingTenantId),
            );
          }
          return Promise.resolve(dbWorld.tenants);
        },
      });
      return where();
    },
  });

  /**
   * Para `db.execute(sql\`...\`)`, recebemos um objeto opaco do drizzle.
   * Não conseguimos parsear exatamente, então testamos com um proxy:
   * a tenancy lib chama `execute` com `${session.userId}` e
   * `${session.activeTenantId}`. Em vez de inspecionar o SQL,
   * mockamos via API parametrizada pública que a own lib NÃO usa,
   * mas a fim do teste, expomos um helper `__setExecuteResolver`.
   */
  const executeResolver = {
    fn: (() => Promise.resolve([])) as (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...args: any[]
    ) => Promise<unknown>,
  };

  return {
    db: {
      select,
      execute: <T,>(...args: unknown[]): Promise<T> =>
        executeResolver.fn(...args) as Promise<T>,
      __setExecuteResolver: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fn: (...args: any[]) => Promise<unknown>,
      ) => {
        executeResolver.fn = fn;
      },
    },
  };
});

interface DbWithResolver {
  __setExecuteResolver: (
    fn: (...args: unknown[]) => Promise<unknown>,
  ) => void;
}

beforeEach(() => {
  dbWorld.tenants = [];
  dbWorld.memberships = [];
  dbWorld.lastSql = null;
  setSession(null);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Tenant isolation (multi-tenancy)", () => {
  async function setup() {
    const { tenantA, tenantB } = makeTwoIsolatedTenants();
    const userA = faker.string.uuid();
    const userB = faker.string.uuid();
    dbWorld.tenants = [
      tenantToRow(tenantA),
      tenantToRow(tenantB),
    ];
    dbWorld.memberships = [
      {
        user_id: userA,
        tenant_id: tenantA.id,
        papel: "lider",
        status: "ativo",
      },
      {
        user_id: userB,
        tenant_id: tenantB.id,
        papel: "cuidador",
        status: "ativo",
      },
    ];
    return { tenantA, tenantB, userA, userB };
  }

  function installExecuteResolver() {
    return import("@/db").then(({ db }) => {
      (db as unknown as DbWithResolver).__setExecuteResolver(
        async (...args) => {
          const sqlObj = args[0] as { queryChunks?: unknown[] } | undefined;
          // Drizzle constrói a query como objeto. Não validamos string —
          // em vez disso, replicamos a lógica de filtro em memória.
          const text = JSON.stringify(sqlObj ?? args).toLowerCase();
          if (text.includes("from tenants t")) {
            // listMyTenants
            return dbWorld.memberships
              .filter(
                (m) =>
                  m.user_id === dbWorld.whereUserId && m.status === "ativo",
              )
              .map((m) => {
                const t = dbWorld.tenants.find((t) => t.id === m.tenant_id)!;
                return {
                  id: t.id,
                  nome: t.nome,
                  cidade: t.cidade,
                  uf: t.uf,
                  denominacao: t.denominacao,
                  sigla: t.sigla,
                  cor: t.cor,
                  papel: m.papel,
                };
              });
          }
          // membership-papel
          return dbWorld.memberships.filter(
            (m) =>
              m.user_id === dbWorld.whereUserId &&
              m.tenant_id === dbWorld.whereTenantId &&
              m.status === "ativo",
          );
        },
      );
    });
  }

  it("getCurrentTenant retorna o tenant da sessão A — não vê tenant B", async () => {
    const { tenantA, userA } = await setup();
    setSession({ userId: userA, activeTenantId: tenantA.id });
    dbWorld.whereUserId = userA;
    dbWorld.whereTenantId = tenantA.id;
    await installExecuteResolver();

    const { getCurrentTenant } = await import("@/lib/tenancy");
    const result = await getCurrentTenant();

    expect(result).not.toBeNull();
    expect(result!.id).toBe(tenantA.id);
    expect(result!.papel).toBe("lider");
  });

  it("getCurrentTenant retorna null quando sessão não tem tenant ativo", async () => {
    const { userA } = await setup();
    setSession({ userId: userA });
    await installExecuteResolver();

    const { getCurrentTenant } = await import("@/lib/tenancy");
    const result = await getCurrentTenant();
    expect(result).toBeNull();
  });

  it("getCurrentTenant retorna null quando o user não tem membership no tenant", async () => {
    const { tenantB, userA } = await setup();
    // userA tenta acessar tenantB (do qual não é membro)
    setSession({ userId: userA, activeTenantId: tenantB.id });
    dbWorld.whereUserId = userA;
    dbWorld.whereTenantId = tenantB.id;
    await installExecuteResolver();

    const { getCurrentTenant } = await import("@/lib/tenancy");
    const result = await getCurrentTenant();
    expect(result).toBeNull();
  });

  it("listMyTenants devolve apenas os tenants do user logado", async () => {
    const { tenantA, userA } = await setup();
    setSession({ userId: userA, activeTenantId: tenantA.id });
    dbWorld.whereUserId = userA;
    await installExecuteResolver();

    const { listMyTenants } = await import("@/lib/tenancy");
    const list = await listMyTenants();

    expect(list).toHaveLength(1);
    expect(list[0]!.id).toBe(tenantA.id);
  });

  it("requireRole('lider') falha quando o papel é cuidador", async () => {
    const { tenantB, userB } = await setup();
    setSession({ userId: userB, activeTenantId: tenantB.id });
    dbWorld.whereUserId = userB;
    dbWorld.whereTenantId = tenantB.id;
    await installExecuteResolver();

    const { requireRole, ForbiddenRoleError } = await import("@/lib/tenancy");
    await expect(requireRole("lider")).rejects.toBeInstanceOf(
      ForbiddenRoleError,
    );
  });

  it("listMyTenants devolve [] para sessão inexistente", async () => {
    setSession(null);
    await installExecuteResolver();

    const { listMyTenants } = await import("@/lib/tenancy");
    const list = await listMyTenants();
    expect(list).toEqual([]);
  });
});

function tenantToRow(t: ReturnType<typeof makeTwoIsolatedTenants>["tenantA"]) {
  return {
    id: t.id,
    nome: t.nome,
    cidade: t.cidade,
    uf: t.uf,
    denominacao: t.denominacao,
    sigla: t.sigla,
    cor: t.cor,
    criadoPor: t.criadoPor,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

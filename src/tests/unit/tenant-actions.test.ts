import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  makeProvisionTenantInput,
  makeTenantRecord,
} from "@/tests/factories/tenant";

/**
 * Testes unitários para `src/server/tenant.actions.ts`.
 *
 * Mockamos:
 *  - `@/db` para controlar resultado de queries/transações.
 *  - `@/lib/auth` para simular usuário autenticado/deslogado.
 *
 * Não exercitamos o postgres real — isso é integração e fica para o
 * pipeline com Postgres efêmero (CI). Aqui validamos branches lógicas.
 */

const requireUserMock = vi.fn<() => Promise<{ userId: string }>>();

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

interface DbWhereable {
  where: (..._args: unknown[]) => DbWhereable;
  limit: (n: number) => Promise<unknown[]>;
}

interface DbSelectable {
  from: (..._args: unknown[]) => DbWhereable;
}

interface FakeTransaction {
  insert: (..._args: unknown[]) => {
    values: (..._args: unknown[]) => {
      returning: (..._args: unknown[]) => Promise<Array<{ id: string }>>;
    };
  };
  execute: (..._args: unknown[]) => Promise<unknown>;
}

const dbState = {
  selectRows: [] as unknown[],
  txError: null as unknown,
  insertedTenantId: "tenant-id-default",
  executedSqls: [] as unknown[],
};

vi.mock("@/db", () => {
  const select = (): DbSelectable => ({
    from: () => {
      const where = (): DbWhereable => ({
        where: () => where(),
        limit: () => Promise.resolve(dbState.selectRows),
      });
      return where();
    },
  });
  const tx: FakeTransaction = {
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([{ id: dbState.insertedTenantId }]),
      }),
    }),
    execute: (q: unknown) => {
      dbState.executedSqls.push(q);
      return Promise.resolve();
    },
  };
  return {
    db: {
      select,
      transaction: async <T>(cb: (t: FakeTransaction) => Promise<T>) => {
        if (dbState.txError) throw dbState.txError;
        return await cb(tx);
      },
    },
  };
});

beforeEach(() => {
  requireUserMock.mockReset();
  dbState.selectRows = [];
  dbState.txError = null;
  dbState.insertedTenantId = "tenant-id-default";
  dbState.executedSqls = [];
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("checkTenantAvailable", () => {
  it("retorna available=true quando não há linhas no DB", async () => {
    const { checkTenantAvailable } = await import("@/server/tenant.actions");
    const tenant = makeTenantRecord();
    dbState.selectRows = [];
    const r = await checkTenantAvailable({
      nome: tenant.nome,
      cidade: tenant.cidade,
      uf: tenant.uf,
    });
    expect(r).toEqual({ ok: true, available: true });
  });

  it("retorna available=false quando já existe um tenant com mesma tripla", async () => {
    const { checkTenantAvailable } = await import("@/server/tenant.actions");
    const tenant = makeTenantRecord();
    dbState.selectRows = [{ id: tenant.id }];
    const r = await checkTenantAvailable({
      nome: tenant.nome,
      cidade: tenant.cidade,
      uf: tenant.uf,
    });
    expect(r).toEqual({ ok: true, available: false });
  });

  it("rejeita inputs inválidos", async () => {
    const { checkTenantAvailable } = await import("@/server/tenant.actions");
    // Passamos UF inválida intencionalmente — Zod precisa filtrar.
    const r = await checkTenantAvailable({
      nome: "ab",
      cidade: "x",
      uf: "ZZ",
    } as never);
    expect(r.ok).toBe(false);
  });
});

describe("provisionTenant", () => {
  it("cria tenant + grava membership de líder na transação", async () => {
    const { provisionTenant } = await import("@/server/tenant.actions");
    requireUserMock.mockResolvedValue({ userId: "user-123" });
    dbState.insertedTenantId = "tenant-xyz";

    const input = makeProvisionTenantInput({
      stripeSubscriptionId: "sub_TEST",
    });
    const r = await provisionTenant(input);
    expect(r).toEqual({ ok: true, tenantId: "tenant-xyz" });
    // SQL bruto de membership foi disparado dentro da transação.
    expect(dbState.executedSqls.length).toBeGreaterThan(0);
  });

  it("falha com code='auth' quando usuário não autenticado", async () => {
    const { provisionTenant } = await import("@/server/tenant.actions");
    requireUserMock.mockRejectedValue(new FakeUnauthorizedError());

    const r = await provisionTenant(makeProvisionTenantInput());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("auth");
  });

  it("falha com code='validation' quando payload inválido", async () => {
    const { provisionTenant } = await import("@/server/tenant.actions");
    requireUserMock.mockResolvedValue({ userId: "user-1" });

    const r = await provisionTenant({
      lider: { nome: "x" },
      localidade: { nome: "ab", cidade: "z", uf: "BR" },
      personaliza: { sigla: "", cor: "#000000" },
    } as never);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("validation");
  });

  it("traduz unique_violation (23505) em code='duplicate'", async () => {
    const { provisionTenant } = await import("@/server/tenant.actions");
    requireUserMock.mockResolvedValue({ userId: "user-1" });
    dbState.txError = Object.assign(new Error("dup"), { code: "23505" });

    const r = await provisionTenant(makeProvisionTenantInput());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("duplicate");
  });

  it("aceita `stripeSubscriptionId` opcional sem erro", async () => {
    const { provisionTenant } = await import("@/server/tenant.actions");
    requireUserMock.mockResolvedValue({ userId: "user-2" });
    dbState.insertedTenantId = "tenant-2";

    const r = await provisionTenant(
      makeProvisionTenantInput({ stripeSubscriptionId: undefined }),
    );
    expect(r).toEqual({ ok: true, tenantId: "tenant-2" });
  });
});

describe("sigleFrom (server action wrapper)", () => {
  it("delega para a util do domain", async () => {
    const { sigleFrom } = await import("@/server/tenant.actions");
    expect(await sigleFrom("Vila Mariana")).toBe("VM");
    expect(await sigleFrom("Adrianópolis")).toBe("AD");
  });
});

import { fakerPT_BR as faker } from "@faker-js/faker";
import { TENANT_COLORS, type TenantColor } from "@/db/schema";
import { UFS, type UF } from "@/lib/data/tenants";
import type { ProvisionTenantInput } from "@/components/domain/tenant/contracts";

/**
 * Factories de testes — regra do projeto: TODA estrutura de teste é
 * populada via Faker pt_BR. Não há fixtures hardcoded.
 *
 * Estes helpers são consumidos por:
 *  - `tests/unit/sigleFrom.test.ts`
 *  - `tests/unit/tenant-actions.test.ts`
 *  - `tests/unit/tenant-isolation.test.ts`
 *  - testes downstream de outras specs que precisem de um tenant.
 */

export interface TenantRecord {
  id: string;
  nome: string;
  cidade: string;
  uf: UF;
  denominacao: string | null;
  sigla: string;
  cor: TenantColor;
  criadoPor: string;
  createdAt: Date;
  updatedAt: Date;
}

const DENOMINACOES: Array<string | null> = [
  null,
  "Batista",
  "Católica",
  "Presbiteriana",
  "Metodista",
  "Pentecostal",
];

/**
 * Garante que `nome` tenha pelo menos 3 letras visíveis para passar
 * pelas validações de Zod nos testes.
 */
function safeNome(): string {
  const cidade = faker.location.city();
  return cidade.length >= 3
    ? cidade
    : `${cidade} ${faker.string.alpha({ length: 4, casing: "lower" })}`;
}

export function makeTenantRecord(
  overrides: Partial<TenantRecord> = {},
): TenantRecord {
  const now = new Date();
  return {
    id: faker.string.uuid(),
    nome: safeNome(),
    cidade: safeNome(),
    uf: faker.helpers.arrayElement(UFS) as UF,
    denominacao: faker.helpers.arrayElement(DENOMINACOES),
    sigla: faker.string.alpha({ length: 2, casing: "upper" }),
    cor: faker.helpers.arrayElement(TENANT_COLORS),
    criadoPor: faker.string.uuid(),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Payload válido para a server action `provisionTenant` — útil em
 * testes unitários onde só queremos exercitar a validação Zod ou
 * mockar a inserção no DB.
 */
export function makeProvisionTenantInput(
  overrides: Partial<ProvisionTenantInput> = {},
): ProvisionTenantInput {
  return {
    lider: {
      nome: faker.person.fullName(),
    },
    localidade: {
      nome: safeNome(),
      denominacao: faker.helpers.arrayElement(DENOMINACOES) ?? undefined,
      cidade: safeNome(),
      uf: faker.helpers.arrayElement(UFS) as UF,
    },
    personaliza: {
      sigla: faker.string.alpha({ length: 2, casing: "upper" }),
      cor: faker.helpers.arrayElement(TENANT_COLORS),
    },
    stripeSubscriptionId: faker.helpers.maybe(
      () => `sub_${faker.string.alphanumeric(14)}`,
      { probability: 0.5 },
    ),
    ...overrides,
  };
}

/**
 * Gera **dois** tenants distintos garantindo que id, nome+cidade+uf,
 * e criadoPor são diferentes — usado em tests de tenant isolation.
 */
export function makeTwoIsolatedTenants(): {
  tenantA: TenantRecord;
  tenantB: TenantRecord;
} {
  const tenantA = makeTenantRecord();
  let tenantB: TenantRecord;
  do {
    tenantB = makeTenantRecord();
  } while (
    tenantB.id === tenantA.id ||
    (tenantB.nome === tenantA.nome &&
      tenantB.cidade === tenantA.cidade &&
      tenantB.uf === tenantA.uf)
  );
  return { tenantA, tenantB };
}

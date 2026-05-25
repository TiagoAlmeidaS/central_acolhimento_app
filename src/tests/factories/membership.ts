import { faker } from "@/tests/factories";
import type {
  Membership,
  MembershipPapel,
  MembershipStatus,
} from "@/db/schema";
import { UFS } from "@/lib/data/tenants";

/**
 * Factories para a spec `02-cuidador-signup`. A regra do projeto manda
 * usar `@faker-js/faker/locale/pt_BR` em todo dado de teste — reaproveitamos
 * a instância exportada por `src/tests/factories/index.ts`.
 */

export interface MembershipFakeOverrides {
  id?: string;
  userId?: string;
  tenantId?: string | null;
  papel?: MembershipPapel;
  status?: MembershipStatus;
  bio?: string | null;
  igreja?: string | null;
  cidade?: string | null;
  convidadoPor?: string | null;
  ativadoEm?: Date | null;
  removidoEm?: Date | null;
  motivoRecusa?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Cria uma linha plausível da tabela `memberships`. Os defaults refletem
 * o caminho mais comum: cuidador `pendente`, sem aprovação ainda. Cada
 * teste customiza só o que importa via `overrides`.
 */
export function makeMembershipRecord(
  overrides: MembershipFakeOverrides = {},
): Membership {
  const created = overrides.createdAt ?? faker.date.recent({ days: 7 });
  const status: MembershipStatus = overrides.status ?? "pendente";
  return {
    id: overrides.id ?? faker.string.uuid(),
    userId: overrides.userId ?? faker.string.uuid(),
    tenantId: overrides.tenantId ?? faker.string.uuid(),
    papel: overrides.papel ?? "cuidador",
    status,
    bio: overrides.bio ?? faker.lorem.sentence({ min: 6, max: 12 }),
    igreja:
      overrides.igreja ??
      `${faker.helpers.arrayElement([
        "Central",
        "Zona Sul",
        "Zona Norte",
        "Sede",
        "Bairro",
      ])} · ${faker.location.city()}`,
    cidade: overrides.cidade ?? faker.location.city(),
    convidadoPor: overrides.convidadoPor ?? null,
    ativadoEm:
      overrides.ativadoEm ??
      (status === "ativo" ? faker.date.recent({ days: 5 }) : null),
    removidoEm:
      overrides.removidoEm ??
      (status === "removido" ? faker.date.recent({ days: 1 }) : null),
    motivoRecusa:
      overrides.motivoRecusa ??
      (status === "recusado" ? faker.lorem.sentence({ min: 4, max: 8 }) : null),
    createdAt: created,
    updatedAt: overrides.updatedAt ?? created,
  };
}

/**
 * Versão "input" — payload esperado por `submitCuidadorSignup`. Não inclui
 * id/timestamps porque o server preenche. Útil em testes de integração.
 */
export interface SignupInputFakeOverrides {
  nome?: string;
  telefone?: string;
  uf?: (typeof UFS)[number];
  cidade?: string;
  igreja?: string;
  bio?: string;
}

export function makeSignupInput(overrides: SignupInputFakeOverrides = {}) {
  const ddd = faker.string.numeric({ length: 2, exclude: ["0"] });
  const numero = faker.string.numeric({ length: 9 });
  return {
    nome: overrides.nome ?? faker.person.fullName(),
    telefone: overrides.telefone ?? `(${ddd}) ${numero.slice(0, 5)}-${numero.slice(5)}`,
    uf: overrides.uf ?? faker.helpers.arrayElement(UFS),
    cidade: overrides.cidade ?? faker.location.city(),
    igreja:
      overrides.igreja ??
      `${faker.helpers.arrayElement([
        "Central",
        "Zona Sul",
        "Zona Norte",
        "Comunidade",
      ])} · ${faker.location.city()}`,
    bio: overrides.bio ?? faker.lorem.paragraph({ min: 1, max: 3 }),
  } as const;
}

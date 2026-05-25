import { faker as fakerEn } from "@faker-js/faker";
import { fakerPT_BR as faker } from "@faker-js/faker";
import { STATUS_KEYS, type StatusKey } from "@/lib/data/status";

/**
 * Factories para testes — regra do projeto: TODA estrutura de teste
 * que precisa de dados é populada via Faker (`@faker-js/faker/locale/pt_BR`)
 * para garantir variedade e evitar copy-paste em fixtures.
 *
 * Importe `faker` aqui para usar a mesma semente entre helpers.
 */
export { faker };

export interface UserFake {
  id: string;
  nome: string;
  telefone: string;
  foto: string;
  papel: "cuidador" | "lider";
}

export function makeUser(overrides: Partial<UserFake> = {}): UserFake {
  return {
    id: faker.string.uuid(),
    nome: faker.person.fullName(),
    telefone: faker.phone.number({ style: "international" }),
    foto: fakerEn.image.avatar(),
    papel: faker.helpers.arrayElement(["cuidador", "lider"]),
    ...overrides,
  };
}

export interface AssistidoFake {
  id: string;
  nome: string;
  cidade: string;
  telefone: string;
  status: StatusKey;
  resumo: string;
}

export function makeAssistido(
  overrides: Partial<AssistidoFake> = {},
): AssistidoFake {
  return {
    id: faker.string.uuid(),
    nome: faker.person.fullName(),
    cidade: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
    telefone: faker.phone.number({ style: "international" }),
    status: faker.helpers.arrayElement(STATUS_KEYS),
    resumo: faker.lorem.sentence({ min: 8, max: 14 }),
    ...overrides,
  };
}

export interface TenantFake {
  id: string;
  nome: string;
  cidade: string;
  sigla: string;
  cor: string;
}

export function makeTenant(overrides: Partial<TenantFake> = {}): TenantFake {
  const nome = faker.location.city();
  return {
    id: faker.string.uuid(),
    nome,
    cidade: `${nome}, ${faker.location.state({ abbreviated: true })}`,
    sigla: nome.slice(0, 2).toUpperCase(),
    cor: faker.color.rgb({ format: "hex" }),
    ...overrides,
  };
}

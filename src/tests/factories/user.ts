import { faker } from "./index";
import type { NewUser, User } from "@/db/schema/users";

/**
 * Factory de `User` (record do schema Drizzle) com Faker pt_BR.
 *
 * Separada do `makeUser` (que está em `factories/index.ts` e representa o
 * shape "UserFake" usado em UI fakes) para evitar churn — aqui retornamos
 * a forma persistida real (E.164 com `+55`, timestamps Date, foto_url snake_case).
 *
 * Owner: `auth-agent` (spec `01-auth`).
 */

export function makeUserRecord(overrides: Partial<NewUser> = {}): User {
  const now = new Date();
  return {
    id: faker.string.uuid(),
    nome: faker.person.fullName(),
    telefone: makeFakeE164Phone(),
    fotoUrl: faker.image.avatar(),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as User;
}

/**
 * Telefone celular BR no formato E.164.
 * Gera `+55` + DDD (2) + `9` (marcador de celular) + 8 dígitos.
 */
export function makeFakeE164Phone(): string {
  const ddd = faker.string.numeric({ length: 2, exclude: ["0"] });
  const rest = faker.string.numeric(8);
  return `+55${ddd}9${rest}`;
}

/**
 * Telefone formatado com máscara do front (`(00) 00000-0000`) — útil
 * para testar `maskBrPhone` e `normalizeBrPhone` lado a lado.
 */
export function makeFakeMaskedPhone(): string {
  const ddd = faker.string.numeric({ length: 2, exclude: ["0"] });
  const a = faker.string.numeric(5);
  const b = faker.string.numeric(4);
  return `(${ddd}) ${a}-${b}`;
}

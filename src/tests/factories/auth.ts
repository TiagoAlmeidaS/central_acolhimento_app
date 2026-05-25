import bcrypt from "bcryptjs";
import { faker } from "./index";
import {
  OTP_CODE_LENGTH,
  OTP_EXPIRATION_MS,
  type NewOtpCode,
  type OtpCode,
} from "@/db/schema/otp";
import { makeFakeE164Phone } from "./user";

/**
 * Factories de OTP usadas nos testes de `sendOtp` / `verifyOtp`.
 *
 * `makeOtpRecord` gera o código E o hash bcrypt — devolve os dois para que
 * o teste possa simular "WhatsApp recebido" (código plain) e a linha
 * persistida em `otp_codes` (hash). O bcrypt aqui usa cost 4 para ficar
 * rápido em testes (~5ms vs ~80ms do cost 10 de produção).
 */

const TEST_BCRYPT_COST = 4;

export interface OtpFixture {
  /** Linha persistida em `otp_codes`. */
  record: OtpCode;
  /** Código plain de 6 dígitos — o que o usuário "digita" no teste. */
  code: string;
}

export async function makeOtpRecord(
  overrides: Partial<NewOtpCode> & { code?: string } = {},
): Promise<OtpFixture> {
  const { code: codeOverride, ...rest } = overrides;
  const code = codeOverride ?? faker.string.numeric(OTP_CODE_LENGTH);
  const codigoHash = await bcrypt.hash(code, TEST_BCRYPT_COST);
  const now = new Date();
  const record: OtpCode = {
    id: faker.string.uuid(),
    telefone: makeFakeE164Phone(),
    codigoHash,
    tentativas: 0,
    expiraEm: new Date(now.getTime() + OTP_EXPIRATION_MS),
    consumidoEm: null,
    createdAt: now,
    ...rest,
  } as OtpCode;
  return { record, code };
}

/**
 * Sessão fake (payload do JWT) — usada nos testes de `session.ts`.
 */
export function makeFakeSessionPayload(
  overrides: Partial<{
    userId: string;
    activeTenantId: string | undefined;
  }> = {},
): { userId: string; activeTenantId?: string } {
  return {
    userId: faker.string.uuid(),
    activeTenantId: undefined,
    ...overrides,
  };
}

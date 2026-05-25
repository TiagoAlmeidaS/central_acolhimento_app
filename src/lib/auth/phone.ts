/**
 * Helpers de telefone BR.
 *
 * Mantidos separados das server actions porque em arquivos com diretiva
 * `"use server"` **todas as exports precisam ser funções async** — o que
 * impede expor sync helpers compartilhados com o client.
 */

/** Quantidade máxima de dígitos aceita para um celular BR. */
export const PHONE_DIGITS_MAX = 11;

/**
 * Aceita `(92) 99988-7766`, `92999887766`, `+5592999887766` etc. e devolve
 * sempre E.164 com `+55` quando o DDI estiver ausente.
 */
export function normalizeBrPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
  return input.trim().startsWith("+") ? input.trim() : `+${digits}`;
}

/** Máscara de input usada no LoginForm (`(00) 00000-0000`). */
export function maskBrPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, PHONE_DIGITS_MAX);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Valida que tem 10 ou 11 dígitos (DDD + 8 ou 9). */
export function isValidBrPhone(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

/**
 * Ofusca um telefone E.164 para exibir na tela de OTP:
 *   `+5592999887766` → `(92) ••••-7766`
 */
export function maskTelefoneForOtp(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  const local = digits.startsWith("55") ? digits.slice(2) : digits;
  if (local.length < 4) return e164;
  const ddd = local.slice(0, 2);
  const tail = local.slice(-4);
  return `(${ddd}) ••••-${tail}`;
}

/**
 * Gera um código OTP de 6 dígitos uniforme via `crypto.getRandomValues`.
 * Exposto como helper puro para que testes consigam validar o formato sem
 * importar a server action inteira.
 */
export function generateOtpCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, "0");
}

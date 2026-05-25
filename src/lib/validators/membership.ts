import { z } from "zod";
import { UFS } from "@/lib/data/tenants";

/**
 * Schemas Zod compartilhados pela spec `02-cuidador-signup` entre cliente
 * e servidor. A regra é: o front valida no submit usando o mesmo schema
 * que o servidor reusa em `submitCuidadorSignup`, evitando divergência.
 *
 * O `PhoneSchema` aceita máscara livre `(92) 99988-7766` ou já
 * normalizado `+5592999887766`. A normalização para E.164 acontece via
 * `normalizeBrPhone` antes do parse do server.
 */

/** Enum derivado da lista oficial de UFs (em `lib/data/tenants`). */
export const UfEnum = z.enum(UFS, {
  message: "Selecione um estado válido.",
});
export type Uf = z.infer<typeof UfEnum>;

/**
 * Telefone BR pré-normalização — aceita máscara visual ou apenas dígitos.
 * O front valida só "tem ao menos 10 dígitos"; o server depois normaliza
 * e re-valida em E.164 via `PhoneE164Schema` (definido aqui também para
 * uso interno em server actions).
 */
export const PhoneSchema = z
  .string({ message: "Informe o telefone." })
  .transform((value) => value.trim())
  .refine(
    (value) => value.replace(/\D/g, "").length >= 10,
    "Telefone deve ter DDD + número (ex.: 92 99988-7766).",
  );

/** Telefone já em E.164 (`+55` + DDD + número), validado server-side. */
export const PhoneE164Schema = z
  .string()
  .regex(/^\+55\d{10,11}$/, "Formato esperado: +55 DDD número.");

/**
 * Schema de submissão do cadastro de cuidador. Combina os campos que o
 * formulário recolhe; `bio` é opcional e limitada a 500 chars.
 */
export const SignupSchema = z.object({
  nome: z
    .string({ message: "Informe seu nome." })
    .trim()
    .min(3, "Nome muito curto."),
  telefone: PhoneSchema,
  uf: UfEnum,
  cidade: z
    .string({ message: "Informe a cidade." })
    .trim()
    .min(2, "Cidade muito curta."),
  igreja: z
    .string({ message: "Informe a sua igreja/localidade." })
    .trim()
    .min(2, "Identifique a igreja para o líder validar."),
  bio: z
    .string()
    .trim()
    .max(500, "Bio limitada a 500 caracteres.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type SignupInput = z.infer<typeof SignupSchema>;

/**
 * Estados retornados por `getMyMembershipStatus()`. `sem-membership` é o
 * caso em que o usuário ainda não submeteu signup.
 */
export const MembershipStatusViewSchema = z.enum([
  "sem-membership",
  "pendente",
  "ativo",
  "recusado",
]);

export type MembershipStatusView = z.infer<typeof MembershipStatusViewSchema>;

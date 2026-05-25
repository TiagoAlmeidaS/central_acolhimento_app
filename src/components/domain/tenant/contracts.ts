import { z } from "zod";
import { TENANT_COLORS } from "@/db/schema";
import { UFS } from "@/lib/data/tenants";

/**
 * Schemas/contratos compartilhados client↔server da spec
 * `03-tenant-setup`. Mantidos fora de `tenant.actions.ts` (que é
 * `'use server'`) para que o client possa importar sem virar RPC.
 *
 * Espelha §Contratos da spec; mudanças aqui exigem atualizar a doc.
 */

const UfEnum = z.enum(UFS);

export const TenantSetupSchema = z.object({
  lider: z.object({
    nome: z.string().trim().min(3, "Informe ao menos 3 letras."),
  }),
  localidade: z.object({
    nome: z.string().trim().min(3, "Nome muito curto."),
    denominacao: z
      .string()
      .trim()
      .max(60)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : undefined)),
    cidade: z.string().trim().min(2, "Cidade muito curta."),
    uf: UfEnum,
  }),
  personaliza: z.object({
    sigla: z
      .string()
      .trim()
      .min(1, "Sigla mínima de 1 letra.")
      .max(3, "Até 3 letras."),
    cor: z.enum(TENANT_COLORS),
  }),
});

export type TenantSetupInput = z.infer<typeof TenantSetupSchema>;

export const CheckTenantAvailableSchema = z.object({
  nome: z.string().trim().min(3),
  cidade: z.string().trim().min(2),
  uf: UfEnum,
});

export type CheckTenantAvailableInput = z.infer<
  typeof CheckTenantAvailableSchema
>;

export const ProvisionTenantSchema = TenantSetupSchema.extend({
  stripeSubscriptionId: z.string().min(3).optional(),
});

export type ProvisionTenantInput = z.infer<typeof ProvisionTenantSchema>;

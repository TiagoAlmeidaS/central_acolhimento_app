/**
 * Reexport central de schemas Drizzle.
 *
 * Cada spec adiciona seu agregado em `src/db/schema/<agregado>.ts` e
 * reexporta aqui. Cuidado: este arquivo é shared infra — sem dono específico.
 * Edits são *additive* (só adicionar imports), nunca remover linhas alheias.
 */

// Wave 1 — quando cada spec criar seu schema, descomenta:
export * from "./users";
export * from "./otp";
export * from "./tenants";
export * from "./memberships";

export const __SCHEMA_PLACEHOLDER__ = true as const;

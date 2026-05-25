/**
 * Lista mock de tenants (localidades) — usada para visualizar
 * `<TenantChip>` no playground antes da spec 03-tenant-setup
 * persistir no banco. Substituir por leitura do DB quando 03 fechar.
 */

export interface TenantMock {
  id: string;
  nome: string;
  cidade: string;
  sigla: string;
  cor: string;
}

export const TENANTS_MOCK: TenantMock[] = [
  {
    id: "manaus-adrianopolis",
    nome: "Adrianópolis",
    cidade: "Manaus, AM",
    sigla: "AD",
    cor: "#2D7FF9",
  },
  {
    id: "sp-vila-mariana",
    nome: "Vila Mariana",
    cidade: "São Paulo, SP",
    sigla: "VM",
    cor: "#10B981",
  },
  {
    id: "fortaleza-aldeota",
    nome: "Aldeota",
    cidade: "Fortaleza, CE",
    sigla: "AL",
    cor: "#F59E0B",
  },
];

/**
 * Resolve tenant por id; fallback para o primeiro garante que o chip
 * nunca renderize vazio durante desenvolvimento.
 */
export function tenantById(id: string | null | undefined): TenantMock {
  return TENANTS_MOCK.find((t) => t.id === id) ?? TENANTS_MOCK[0]!;
}

/** Lista oficial de UFs do Brasil — uso em selects de endereço. */
export const UFS = [
  "AC",
  "AL",
  "AM",
  "AP",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MG",
  "MS",
  "MT",
  "PA",
  "PB",
  "PE",
  "PI",
  "PR",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SE",
  "SP",
  "TO",
] as const;

export type UF = (typeof UFS)[number];

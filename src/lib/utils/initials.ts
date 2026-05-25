/**
 * Extrai iniciais (até 2) de um nome — fallback visual usado em
 * Avatar e TenantChip quando não há foto/sigla.
 */
export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * Gera a sigla de uma localidade a partir do nome.
 *
 * Algoritmo (mesmo do protótipo `app/screens-tenant-setup.jsx`):
 *  - Sem nome → "?"
 *  - Uma palavra → primeiras 2 letras (UPPER).
 *  - Duas ou mais → primeira letra da primeira + primeira da última.
 *
 * Limita a 3 caracteres porque a coluna `tenants.sigla` é `varchar(3)`.
 *
 * @example
 *   sigleFrom("Vila Mariana")  // "VM"
 *   sigleFrom("Adrianópolis")  // "AD"
 *   sigleFrom("Centro Salvador BA") // "CB"
 */
export function sigleFrom(nome: string | undefined | null): string {
  const trimmed = (nome ?? "").trim();
  if (!trimmed) return "?";
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0]!.slice(0, 2).toLocaleUpperCase("pt-BR");
  }
  const first = words[0]![0] ?? "";
  const last = words[words.length - 1]![0] ?? "";
  return (first + last).toLocaleUpperCase("pt-BR").slice(0, 3);
}

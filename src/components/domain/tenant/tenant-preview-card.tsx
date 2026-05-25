import { Card } from "@/components/ui/card";

export interface TenantPreviewCardProps {
  /** Sigla até 3 letras (auto-uppercase). */
  sigla: string;
  /** Cor da paleta. */
  cor: string;
  /** Nome da localidade exibido na card. */
  nome: string;
  /** Cidade + UF mostrados como subtítulo. */
  cidade: string;
  uf: string;
}

/**
 * Card de prévia "Como sua localidade aparecerá no app" usada no passo
 * de personalização. Replica o card de prévia de
 * `TenantPersonalizaScreen` (protótipo).
 */
export function TenantPreviewCard({
  sigla,
  cor,
  nome,
  cidade,
  uf,
}: TenantPreviewCardProps) {
  const display = (sigla || "?").toLocaleUpperCase("pt-BR").slice(0, 3);
  return (
    <Card padding={20} className="flex items-center gap-3.5">
      <div
        className="flex items-center justify-center text-white font-bold tracking-tight2"
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: cor,
          fontSize: 22,
          boxShadow: `0 8px 20px ${cor}50`,
        }}
        aria-hidden="true"
      >
        {display}
      </div>
      <div>
        <div className="text-[11px] font-bold text-text-3 uppercase tracking-[0.06em]">
          Prévia
        </div>
        <div className="mt-0.5 text-[17px] font-bold text-text tracking-tight2">
          Comunidade {nome || "—"}
        </div>
        <div className="mt-0.5 text-[12.5px] text-text-2">
          {cidade ? `${cidade}, ${uf}` : "Cidade, UF"}
        </div>
      </div>
    </Card>
  );
}

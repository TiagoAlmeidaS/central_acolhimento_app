import { cloneElement, type ReactElement } from "react";
import Link from "next/link";
import { IconChevronRight } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

export interface EscolhaPerfilCardProps {
  icon: ReactElement<{ size?: number }>;
  label: string;
  hint: string;
  href: string;
  /** Cartão de destaque (com badge "Recomendado" e borda azul). */
  featured?: boolean;
}

/**
 * Cartão de seleção de perfil exibido em `/escolha-perfil`.
 *
 * Espelha visualmente o `EscolhaPerfilScreen` do protótipo
 * (`docs/_prototype/app/screens-tenant-setup.jsx`):
 *  - Caixa grande com ícone à esquerda, título + hint, chevron à direita.
 *  - Variante `featured` ganha um halo azul + badge "Recomendado".
 *
 * É um Link (`<a>`) porque os destinos são páginas públicas dos
 * subagents 03 (líder) e 02 (cuidador). Substituível por `<button>` mais
 * tarde caso precise de feedback de carregamento.
 */
export function EscolhaPerfilCard({
  icon,
  label,
  hint,
  href,
  featured = false,
}: EscolhaPerfilCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-start gap-3.5 p-5 rounded-[18px] text-left",
        "bg-surface border-[2px] transition-shadow duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        featured
          ? "border-accent shadow-[0_8px_28px_rgba(45,127,249,0.15),0_0_0_4px_rgba(45,127,249,0.08)] hover:shadow-[0_10px_32px_rgba(45,127,249,0.18),0_0_0_4px_rgba(45,127,249,0.12)]"
          : "border-border shadow-card hover:shadow-md",
      )}
      data-testid="escolha-perfil-card"
      data-featured={featured ? "true" : undefined}
    >
      {featured && (
        <span
          className={cn(
            "absolute -top-2.5 right-4 px-2.5 py-1 rounded-full",
            "bg-accent text-white text-[10.5px] font-bold uppercase tracking-[0.06em]",
          )}
        >
          Recomendado
        </span>
      )}
      <div
        className={cn(
          "size-12 rounded-[14px] flex items-center justify-center flex-shrink-0",
          featured
            ? "bg-accent-bg text-accent"
            : "bg-surface-2 text-text-2",
        )}
        aria-hidden="true"
      >
        {cloneElement(icon, { size: 24 })}
      </div>
      <div className="flex-1 pt-[3px] min-w-0">
        <span className="block text-[15.5px] font-bold tracking-tight2 text-text">
          {label}
        </span>
        <span className="block mt-1 text-[13px] leading-[1.45] tracking-tight2 text-text-2">
          {hint}
        </span>
      </div>
      <IconChevronRight
        size={18}
        className="self-center flex-shrink-0 text-text-3"
        aria-hidden="true"
      />
    </Link>
  );
}

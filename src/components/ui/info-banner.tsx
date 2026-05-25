import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { IconHelpCircle } from "@/components/icons";

export interface InfoBannerProps {
  /** Ícone à esquerda — default é interrogação informativa. */
  icon?: ReactNode;
  /**
   * Tom do banner — `info` (acento azul, default) ou `warning` (laranja).
   * O tom `urgente` é reservado para mensagens críticas.
   */
  tone?: "info" | "warning" | "urgente";
  className?: string;
  children: ReactNode;
}

const TONE_CLASSES: Record<NonNullable<InfoBannerProps["tone"]>, string> = {
  info: "bg-accent-bg border-accent/20 text-text [&_svg]:text-accent",
  warning:
    "bg-status-aguardando-bg border-status-aguardando/30 text-status-aguardando [&_svg]:text-status-aguardando",
  urgente:
    "bg-status-urgente-bg border-status-urgente/30 text-status-urgente [&_svg]:text-status-urgente",
};

export function InfoBanner({
  icon,
  tone = "info",
  className,
  children,
}: InfoBannerProps) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 px-4 py-3.5 rounded-[14px] border",
        "text-[13.5px] leading-relaxed tracking-tight2",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <span className="flex-shrink-0 flex pt-[1px]">
        {icon ?? <IconHelpCircle size={20} />}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

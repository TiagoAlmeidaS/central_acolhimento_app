import { cn } from "@/lib/utils/cn";
import { STATUS, type StatusKey } from "@/lib/data/status";

export interface StatusPillProps {
  status: StatusKey;
  size?: "xs" | "sm" | "md";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<StatusPillProps["size"]>, string> = {
  xs: "text-[11px] px-2 py-[3px] rounded-lg",
  sm: "text-[12px] px-2.5 py-1 rounded-lg",
  md: "text-[13px] px-3 py-1.5 rounded-[10px]",
};

/**
 * Pílula colorida indicando o status do assistido. Cores vêm da tabela
 * oficial (`STATUS`). Cores são inline porque o catálogo é dinâmico —
 * mais barato que gerar classes Tailwind para cada combinação fg/bg.
 */
export function StatusPill({ status, size = "sm", className }: StatusPillProps) {
  const def = STATUS[status];
  if (!def) return null;
  const label = def.shortLabel ?? def.label;
  return (
    <span
      className={cn(
        "inline-block font-semibold leading-tight whitespace-nowrap tracking-tight2",
        SIZE_CLASSES[size],
        className,
      )}
      style={{ background: def.bg, color: def.fg }}
      aria-label={`Status: ${def.label}`}
    >
      {label}
    </span>
  );
}

export interface StatusDotProps {
  status: StatusKey;
  size?: number;
  className?: string;
}

/** Bolinha colorida do status — útil em listas densas. */
export function StatusDot({ status, size = 8, className }: StatusDotProps) {
  const def = STATUS[status];
  if (!def) return null;
  return (
    <span
      className={cn("inline-block rounded-full flex-shrink-0", className)}
      style={{ width: size, height: size, background: def.dot }}
      aria-label={`Status: ${def.label}`}
    />
  );
}

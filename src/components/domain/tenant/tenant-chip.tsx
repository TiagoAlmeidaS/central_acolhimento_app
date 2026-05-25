import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { tenantById } from "@/lib/data/tenants";

export interface TenantChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type"> {
  tenantId: string;
  size?: "sm" | "md";
}

const SIZE: Record<
  NonNullable<TenantChipProps["size"]>,
  { h: string; pad: string; dot: number; text: string }
> = {
  sm: { h: "h-7", pad: "pl-[6px] pr-2.5", dot: 18, text: "text-[11.5px]" },
  md: { h: "h-8", pad: "pl-[6px] pr-3", dot: 22, text: "text-[12.5px]" },
};

/**
 * Chip da localidade atual — mostra sigla colorida + nome.
 * Quando recebe `onClick` vira um botão (usado pelo TenantSwitcher).
 */
export function TenantChip({
  tenantId,
  size = "md",
  onClick,
  className,
  ...rest
}: TenantChipProps) {
  const tenant = tenantById(tenantId);
  const dims = SIZE[size];
  const isInteractive = typeof onClick === "function";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      className={cn(
        "inline-flex items-center gap-2 rounded-pill",
        "bg-surface border border-border text-text font-sans",
        dims.h,
        dims.pad,
        isInteractive
          ? "cursor-pointer hover:bg-surface-2"
          : "cursor-default",
        "disabled:opacity-100",
        className,
      )}
      aria-label={`Localidade: ${tenant.nome}, ${tenant.cidade}`}
      {...rest}
    >
      <span
        className="inline-flex items-center justify-center rounded-full text-white font-bold"
        style={{
          width: dims.dot,
          height: dims.dot,
          background: tenant.cor,
          fontSize: dims.dot * 0.45,
        }}
        aria-hidden="true"
      >
        {tenant.sigla}
      </span>
      <span className={cn("font-semibold tracking-tight2", dims.text)}>
        {tenant.nome}
      </span>
    </button>
  );
}

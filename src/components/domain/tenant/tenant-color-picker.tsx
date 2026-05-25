"use client";

import { cn } from "@/lib/utils/cn";
import { TENANT_COLORS, type TenantColor } from "@/db/schema";

export interface TenantColorPickerProps {
  value: TenantColor;
  onChange: (color: TenantColor) => void;
  className?: string;
}

/**
 * Paleta fixa de 8 cores (`TENANT_COLORS`) renderizada em grid 8 colunas
 * — replica `TenantPersonalizaScreen` do protótipo.
 *
 * Acessibilidade: cada bola é um botão `aria-pressed` com `aria-label`
 * legível ("Cor #2D7FF9"); leitor de tela anuncia a seleção.
 */
export function TenantColorPicker({
  value,
  onChange,
  className,
}: TenantColorPickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Cor da localidade"
      className={cn("grid grid-cols-8 gap-2.5", className)}
    >
      {TENANT_COLORS.map((c) => {
        const selected = c === value;
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`Cor ${c}`}
            onClick={() => onChange(c)}
            className={cn(
              "aspect-square rounded-full transition-transform",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              "active:scale-95",
            )}
            style={{
              background: c,
              border: selected
                ? "3px solid var(--surface)"
                : "3px solid transparent",
              boxShadow: selected
                ? `0 0 0 2px ${c}, 0 4px 10px ${c}40`
                : "0 1px 3px rgba(15,23,42,0.1)",
            }}
          />
        );
      })}
    </div>
  );
}

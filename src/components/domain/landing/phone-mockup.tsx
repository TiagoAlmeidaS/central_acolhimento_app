import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface PhoneMockupProps {
  children: ReactNode;
  /** Tema visual da moldura (afeta cor da casca interna). */
  theme?: "light" | "dark";
  /** Rotação em graus para empilhamento decorativo. */
  rotate?: number;
  /** Escala visual — útil para "esconder" um phone atrás do principal. */
  scale?: number;
  className?: string;
}

/**
 * Moldura estática de telefone para a landing — RSC pura, sem
 * dependência de `min-h-dvh`. Diferente da `PhoneFrame` de QA,
 * esta moldura tem altura fixa (`h-[560px]`) e respeita o
 * container do hero/seções marketing.
 *
 * O `notch` é desenhado direto no SVG para evitar imports extras.
 */
export function PhoneMockup({
  children,
  theme = "light",
  rotate = 0,
  scale = 1,
  className,
}: PhoneMockupProps) {
  const transform = `rotate(${rotate}deg) scale(${scale})`;
  const isDark = theme === "dark";
  return (
    <div
      className={cn(
        "relative w-[280px] sm:w-[300px] h-[560px] sm:h-[600px] rounded-[40px]",
        "border border-black/10 shadow-2xl overflow-hidden",
        "transition-transform duration-150 ease-out",
        isDark ? "bg-[#131A2A]" : "bg-[#F5F5F7]",
        className,
      )}
      style={{ transform }}
      aria-hidden="true"
    >
      <div
        className={cn(
          "relative h-7 flex items-center justify-center",
          isDark ? "bg-[#131A2A] text-white/80" : "bg-[#F5F5F7] text-[#0F172A]",
        )}
      >
        <span className="absolute left-5 text-[11px] font-semibold tracking-tight2">
          9:41
        </span>
        <span
          className={cn(
            "absolute top-1.5 left-1/2 -translate-x-1/2 h-[18px] w-[110px] rounded-full",
            isDark ? "bg-black" : "bg-[#0F172A]",
          )}
        />
        <div className="absolute right-5 flex items-center gap-1">
          <span
            className={cn(
              "inline-block h-[7px] w-[14px] rounded-[2px] border border-current",
            )}
          />
        </div>
      </div>
      <div className="relative h-[calc(100%-1.75rem)] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

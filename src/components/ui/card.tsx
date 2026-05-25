import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Padding em px. Aceita 0 para casos especiais (ex.: imagem topo). */
  padding?: number;
  /** Marca a card como clicável (cursor + hover sutil). */
  onClick?: HTMLAttributes<HTMLDivElement>["onClick"];
  children?: ReactNode;
}

/**
 * Superfície branca padrão do app — usada em listas, KPIs, formulários.
 * Quando `onClick` está presente vira `role="button"` para a11y.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, padding = 18, style, onClick, children, ...rest },
  ref,
) {
  const isClickable = typeof onClick === "function";
  return (
    <div
      ref={ref}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                (e.currentTarget as HTMLElement).click();
              }
            }
          : undefined
      }
      className={cn(
        "rounded-card border border-border bg-surface shadow-card",
        isClickable && "cursor-pointer transition-shadow hover:shadow-md",
        className,
      )}
      style={{ padding, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
});

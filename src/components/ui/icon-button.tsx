import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

/**
 * Botão circular para ícones (header, navegação, ações inline).
 * Variantes equivalentes ao `IconBtn` do protótipo:
 *  - flat    → sem fundo
 *  - soft    → superfície-2 (default no protótipo)
 *  - outlined→ superfície + borda
 *  - tinted  → fundo do acento, conteúdo no acento
 */
const iconButtonVariants = cva(
  [
    "inline-flex items-center justify-center rounded-full flex-shrink-0",
    "transition-colors duration-120",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),
  {
    variants: {
      variant: {
        flat: "bg-transparent text-text hover:bg-surface-2",
        soft: "bg-surface-2 text-text hover:bg-border",
        outlined:
          "bg-surface text-text border border-border hover:bg-surface-2",
        tinted: "bg-accent-bg text-accent hover:bg-accent/15",
      },
      size: {
        sm: "size-8",
        md: "size-9",
        lg: "size-10",
      },
    },
    defaultVariants: { variant: "soft", size: "lg" },
  },
);

type NativeButton = ButtonHTMLAttributes<HTMLButtonElement>;
type IconButtonVariantProps = VariantProps<typeof iconButtonVariants>;

export interface IconButtonProps
  extends Omit<NativeButton, "color" | "children">,
    IconButtonVariantProps {
  icon: ReactNode;
  /** Aria label é obrigatório porque o conteúdo é só ícone. */
  "aria-label": string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { className, variant, size, icon, type = "button", ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(iconButtonVariants({ variant, size }), className)}
        {...rest}
      >
        {icon}
      </button>
    );
  },
);

export { iconButtonVariants };

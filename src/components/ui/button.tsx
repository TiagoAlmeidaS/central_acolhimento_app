import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

/**
 * Variantes alinhadas ao protótipo `app/ui.jsx`:
 *  - primary  → acento azul, CTA principal
 *  - secondary→ superfície + borda forte, contexto neutro
 *  - whatsapp → verde de canal (convite, OTP, contato)
 *  - ghost    → sem fundo, ação terciária
 *  - link     → estilo de hyperlink
 *  - danger   → vermelho urgente para confirmações destrutivas
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-semibold tracking-tight2 font-sans",
    "transition-[transform,background] duration-120 ease-out",
    "active:scale-[0.985]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white border-[1.5px] border-transparent shadow-primary hover:bg-accent-strong",
        secondary:
          "bg-surface text-text border-[1.5px] border-border-strong hover:bg-surface-2",
        ghost:
          "bg-transparent text-text border-[1.5px] border-transparent hover:bg-surface-2",
        whatsapp:
          "bg-whatsapp text-white border-[1.5px] border-transparent shadow-whatsapp hover:bg-whatsapp-strong",
        danger:
          "bg-status-urgente text-white border-[1.5px] border-transparent hover:opacity-90",
        link:
          "bg-transparent text-accent border-0 px-0 shadow-none hover:underline underline-offset-2",
      },
      size: {
        sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-[10px]",
        md: "h-11 px-4 text-[14px] gap-2 rounded-[12px]",
        lg: "h-[54px] px-5 text-[15.5px] gap-2.5 rounded-[14px]",
      },
      full: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
      full: false,
    },
  },
);

type NativeButton = ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends Omit<NativeButton, "color">,
    ButtonVariantProps {
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
}

/**
 * Botão principal — segue a tabela de variantes do design system.
 * Quando `loading` está ativo o botão fica desabilitado e mostra um
 * spinner inline (ícones do usuário são suprimidos para não brigar).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant,
      size,
      full,
      icon,
      iconRight,
      loading = false,
      disabled,
      children,
      type = "button",
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(buttonVariants({ variant, size, full }), className)}
        {...rest}
      >
        {loading ? <Spinner /> : icon}
        {children}
        {!loading && iconRight}
      </button>
    );
  },
);

function Spinner() {
  return (
    <span
      className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
  );
}

export { buttonVariants };

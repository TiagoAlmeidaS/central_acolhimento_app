import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  /** Mensagem de erro — quando presente, sobrepõe o `hint` visualmente. */
  error?: string;
  /** Ícone exibido à direita do campo (cor do acento). */
  icon?: ReactNode;
}

/**
 * Input padronizado: label associada por id, font-size 16px (anti-zoom iOS),
 * borda e altura iguais ao protótipo (54px / radius 14).
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    label,
    hint,
    error,
    icon,
    id,
    type = "text",
    "aria-describedby": ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? `input-${reactId}`;
  const hintId = hint || error ? `${inputId}-hint` : undefined;
  const describedBy = [ariaDescribedBy, hintId].filter(Boolean).join(" ") || undefined;
  const hasError = Boolean(error);
  return (
    <div className="flex flex-col gap-2 min-w-0">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13.5px] font-semibold text-text tracking-tight2"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex items-center gap-2.5 h-[54px] px-[18px] rounded-[14px]",
          "bg-surface border-[1.5px]",
          hasError ? "border-status-urgente" : "border-border",
          "focus-within:border-accent transition-colors",
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            "flex-1 min-w-0 border-0 outline-none bg-transparent font-sans",
            "text-text tracking-tight2 placeholder:text-text-3",
            className,
          )}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {icon && (
          <span className="text-accent flex" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      {(hint || error) && (
        <span
          id={hintId}
          className={cn(
            "text-xs",
            hasError ? "text-status-urgente" : "text-text-3",
          )}
          aria-live={hasError ? "polite" : undefined}
        >
          {error ?? hint}
        </span>
      )}
    </div>
  );
});

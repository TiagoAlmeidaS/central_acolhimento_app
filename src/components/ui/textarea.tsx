import {
  forwardRef,
  useId,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { className, label, hint, error, id, rows = 4, ...rest },
    ref,
  ) {
    const reactId = useId();
    const inputId = id ?? `textarea-${reactId}`;
    const hintId = hint || error ? `${inputId}-hint` : undefined;
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
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          aria-invalid={hasError || undefined}
          aria-describedby={hintId}
          className={cn(
            "px-[18px] py-[16px] rounded-[14px] bg-surface border-[1.5px]",
            hasError ? "border-status-urgente" : "border-border",
            "resize-none font-sans text-text tracking-tight2 leading-relaxed",
            "outline-none focus-visible:border-accent placeholder:text-text-3",
            className,
          )}
          {...rest}
        />
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
  },
);

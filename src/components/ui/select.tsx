import {
  forwardRef,
  useId,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";
import { IconChevronDown } from "@/components/icons";

export type SelectOption =
  | string
  | {
      value: string;
      label: string;
    };

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  icon?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      className,
      label,
      hint,
      error,
      icon,
      placeholder,
      options,
      id,
      value,
      ...rest
    },
    ref,
  ) {
    const reactId = useId();
    const inputId = id ?? `select-${reactId}`;
    const hintId = hint || error ? `${inputId}-hint` : undefined;
    const hasError = Boolean(error);
    const hasValue = Boolean(value);
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
            "relative flex items-center gap-2.5 h-[54px] px-[18px] rounded-[14px]",
            "bg-surface border-[1.5px]",
            hasError ? "border-status-urgente" : "border-border",
            "focus-within:border-accent transition-colors",
          )}
        >
          {icon && (
            <span className="text-accent flex" aria-hidden="true">
              {icon}
            </span>
          )}
          <select
            ref={ref}
            id={inputId}
            value={value}
            aria-invalid={hasError || undefined}
            aria-describedby={hintId}
            className={cn(
              "flex-1 min-w-0 appearance-none border-0 outline-none bg-transparent font-sans",
              "tracking-tight2 pr-6",
              hasValue ? "text-text" : "text-accent",
              className,
            )}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => {
              const v = typeof opt === "string" ? opt : opt.value;
              const l = typeof opt === "string" ? opt : opt.label;
              return (
                <option key={v} value={v}>
                  {l}
                </option>
              );
            })}
          </select>
          <span
            className="pointer-events-none absolute right-[18px] text-accent flex"
            aria-hidden="true"
          >
            <IconChevronDown size={18} />
          </span>
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
  },
);

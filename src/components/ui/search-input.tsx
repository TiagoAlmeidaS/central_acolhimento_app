import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils/cn";
import { IconSearch } from "@/components/icons";

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Label visualmente oculto mas lido por screen readers. */
  srLabel?: string;
}

/**
 * Variante "barra de busca" — visual mais alto/limpo e ícone à esquerda
 * em vez de à direita. Equivalente ao `SearchInput` do protótipo.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      className,
      placeholder = "Buscar por nome ou cidade",
      srLabel = "Buscar",
      id,
      ...rest
    },
    ref,
  ) {
    const reactId = useId();
    const inputId = id ?? `search-${reactId}`;
    return (
      <div className="flex items-center gap-3 h-[52px] px-[18px] rounded-[14px] bg-surface border-[1.5px] border-border focus-within:border-accent text-accent">
        <label htmlFor={inputId} className="sr-only">
          {srLabel}
        </label>
        <IconSearch size={20} aria-hidden="true" />
        <input
          ref={ref}
          id={inputId}
          type="search"
          placeholder={placeholder}
          inputMode="search"
          className={cn(
            "flex-1 min-w-0 border-0 outline-none bg-transparent font-sans",
            "text-text tracking-tight2 placeholder:text-text-3",
            className,
          )}
          {...rest}
        />
      </div>
    );
  },
);

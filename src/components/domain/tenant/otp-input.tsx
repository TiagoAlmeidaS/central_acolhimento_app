"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils/cn";

export interface OtpInputProps {
  /** Valor atual de 6 dígitos (string com 0..6 chars). */
  value: string;
  onChange: (next: string) => void;
  /** Callback quando o 6º dígito é preenchido — útil para auto-submit. */
  onComplete?: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  /** id base para a11y; cada input vira `${id}-${i}`. */
  id?: string;
  /** Label invisível para leitores de tela. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Input segmentado de OTP — replica o visual do passo 2/5 de
 * `TenantOtpScreen` no protótipo, mas em forma reutilizável.
 *
 * **Por que vive em `domain/tenant/`** — o `auth-agent` ainda não
 * exportou um componente OTP compartilhado, e a spec proíbe tocar
 * `src/components/ui/`. Quando 01-auth definir um `<OtpInput>` em UI,
 * podemos deletar este e migrar.
 *
 * Comportamentos UX:
 *  - Foco move-se ao digitar.
 *  - Backspace volta para o input anterior se o atual estiver vazio.
 *  - Paste de 6 dígitos preenche tudo de uma vez (suporta SMS auto-fill).
 *  - `inputMode="numeric"` aciona teclado numérico no iOS/Android.
 */
export const OtpInput = forwardRef<HTMLDivElement, OtpInputProps>(
  function OtpInput(
    {
      value,
      onChange,
      onComplete,
      length = 6,
      autoFocus,
      disabled,
      id = "otp",
      ariaLabel = "Código de verificação",
      className,
    },
    ref,
  ) {
    const inputs = useRef<Array<HTMLInputElement | null>>([]);
    const [active, setActive] = useState(0);

    useEffect(() => {
      if (autoFocus) inputs.current[0]?.focus();
    }, [autoFocus]);

    const digits = Array.from({ length }, (_, i) => value[i] ?? "");

    const replaceAt = (i: number, ch: string) => {
      const next = digits.slice();
      next[i] = ch;
      const joined = next.join("").slice(0, length);
      onChange(joined);
      if (joined.length === length && ch && onComplete) {
        onComplete(joined);
      }
    };

    const handleChange = (i: number, raw: string) => {
      const cleaned = raw.replace(/\D/g, "");
      if (!cleaned) {
        replaceAt(i, "");
        return;
      }
      if (cleaned.length === length) {
        // Paste / SMS autofill — preenche tudo.
        onChange(cleaned);
        if (onComplete) onComplete(cleaned);
        inputs.current[length - 1]?.focus();
        setActive(length - 1);
        return;
      }
      const ch = cleaned.slice(-1);
      replaceAt(i, ch);
      if (i < length - 1) {
        setActive(i + 1);
        inputs.current[i + 1]?.focus();
      }
    };

    const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !digits[i] && i > 0) {
        e.preventDefault();
        setActive(i - 1);
        inputs.current[i - 1]?.focus();
        replaceAt(i - 1, "");
        return;
      }
      if (e.key === "ArrowLeft" && i > 0) {
        e.preventDefault();
        setActive(i - 1);
        inputs.current[i - 1]?.focus();
      }
      if (e.key === "ArrowRight" && i < length - 1) {
        e.preventDefault();
        setActive(i + 1);
        inputs.current[i + 1]?.focus();
      }
    };

    const handlePaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
      if (!pasted) return;
      e.preventDefault();
      if (pasted.length >= length) {
        onChange(pasted.slice(0, length));
        inputs.current[length - 1]?.focus();
        setActive(length - 1);
        if (onComplete) onComplete(pasted.slice(0, length));
        return;
      }
      // Cola parcial: começa do input atual.
      const next = digits.slice();
      let cursor = i;
      for (const ch of pasted) {
        if (cursor >= length) break;
        next[cursor++] = ch;
      }
      const joined = next.join("");
      onChange(joined);
      const last = Math.min(cursor, length - 1);
      setActive(last);
      inputs.current[last]?.focus();
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        className={cn("flex items-center justify-center gap-2", className)}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            id={`${id}-${i}`}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={d}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={() => setActive(i)}
            onPaste={(e) => handlePaste(i, e)}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={length}
            aria-label={`Dígito ${i + 1} de ${length}`}
            className={cn(
              "w-[46px] h-[58px] text-center font-bold text-[26px]",
              "rounded-[12px] bg-surface tracking-tight2 tabular-nums",
              "border-[1.5px] outline-none transition-[border-color,box-shadow] duration-150",
              active === i ? "border-accent" : "border-border",
              "focus:border-accent",
              "disabled:opacity-60 disabled:cursor-not-allowed",
            )}
            style={{
              boxShadow:
                active === i ? "0 0 0 4px rgba(45,127,249,0.12)" : undefined,
              fontSize: 26,
            }}
          />
        ))}
      </div>
    );
  },
);

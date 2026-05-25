"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { Button } from "@/components/ui";
import { IconArrowRight, IconWhatsappFilled } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { sendOtp, verifyOtp } from "@/server/auth.actions";

/**
 * Tela OTP — espelha o `TenantOtpScreen` do protótipo, sem `StepBar`
 * porque o login direto não está dentro do wizard de tenant-setup.
 *
 * Estado:
 *  - 6 inputs de 1 dígito; auto-advance ao digitar, backspace recua.
 *  - Cola de código (`onPaste`) preenche todos os campos de uma vez.
 *  - Contador de 45s antes de re-habilitar "Reenviar código".
 *  - Botão "Verificar e continuar" desabilitado até preencher.
 */

const RESEND_SECONDS = 45;
const CODE_LENGTH = 6;

interface OtpFormProps {
  telefone: string;
  telefoneMasked: string;
}

export function OtpForm({ telefone, telefoneMasked }: OtpFormProps) {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  const [active, setActive] = useState(0);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isVerifying, startVerify] = useTransition();
  const [isResending, startResend] = useTransition();
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const setDigit = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    if (error) setError(null);
    if (v && i < CODE_LENGTH - 1) {
      setActive(i + 1);
      refs.current[i + 1]?.focus();
    }
  };

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      e.preventDefault();
      setActive(i - 1);
      refs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      setActive(i - 1);
      refs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowRight" && i < CODE_LENGTH - 1) {
      e.preventDefault();
      setActive(i + 1);
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const data = e.clipboardData.getData("text").replace(/\D/g, "");
    if (data.length < 2) return;
    e.preventDefault();
    const digits = data.slice(0, CODE_LENGTH).split("");
    setCode((prev) => {
      const next = [...prev];
      for (let i = 0; i < CODE_LENGTH; i++) next[i] = digits[i] ?? "";
      return next;
    });
    const last = Math.min(digits.length, CODE_LENGTH) - 1;
    setActive(last);
    refs.current[last]?.focus();
  };

  const filled = code.every((d) => d.length === 1);

  const handleVerify = useCallback(() => {
    if (!filled) return;
    startVerify(async () => {
      const result = await verifyOtp({ telefone, code: code.join("") });
      if (!result.ok) {
        setError(result.error);
        setCode(Array(CODE_LENGTH).fill(""));
        setActive(0);
        refs.current[0]?.focus();
        return;
      }
      // Roteamento pós-login. Quando o `tenant-agent` finalizar a parte
      // de tenant ativo na sessão, podemos roteamos para `/` (app) ou
      // `/escolha-localidade` conforme o caso. Por ora:
      //  - novo usuário → /escolha-perfil (signup-agent)
      //  - usuário existente → /
      // Ambas usam `router.push(string)` (não-typed) para evitar amarrar
      // typed-routes a páginas de outros agentes ainda em construção.
      router.push(result.isNew ? "/escolha-perfil" : "/");
    });
  }, [code, filled, router, telefone]);

  const handleResend = () => {
    setError(null);
    setInfo(null);
    startResend(async () => {
      const r = await sendOtp({ telefone });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setInfo("Novo código enviado.");
      setSeconds(RESEND_SECONDS);
    });
  };

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <div className="flex-1 overflow-y-auto px-[22px] pt-10 pb-6 flex flex-col gap-[22px]">
        <div
          className="w-[72px] h-[72px] rounded-[22px] self-center flex items-center justify-center mt-2"
          style={{ background: "#DCFCE7", color: "#15803D" }}
        >
          <IconWhatsappFilled size={36} />
        </div>

        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight3 leading-[1.15] text-center text-text">
            Verificação por WhatsApp
          </h1>
          <p className="mt-2.5 text-sm leading-[1.55] text-text-2 tracking-tight2 text-center text-pretty">
            Enviamos um código de 6 dígitos para{" "}
            <span className="text-text font-bold">{telefoneMasked}</span>
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          {code.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              onFocus={() => setActive(i)}
              onPaste={handlePaste}
              inputMode="numeric"
              maxLength={1}
              autoComplete="one-time-code"
              aria-label={`Dígito ${i + 1} de ${CODE_LENGTH}`}
              className={cn(
                "w-[46px] h-[58px] text-center text-[26px] font-bold tracking-tight2",
                "text-text bg-surface rounded-[12px] border-[1.5px] outline-none",
                "transition-colors duration-150 tabular-nums",
                active === i
                  ? "border-accent shadow-[0_0_0_4px_rgba(45,127,249,0.12)]"
                  : "border-border",
                error && "border-status-urgente",
              )}
            />
          ))}
        </div>

        {error && (
          <p
            className="text-center text-[13px] font-semibold text-status-urgente -mt-2"
            role="alert"
          >
            {error}
          </p>
        )}
        {info && !error && (
          <p
            className="text-center text-[13px] font-semibold text-whatsapp-strong -mt-2"
            aria-live="polite"
          >
            {info}
          </p>
        )}

        <div className="text-center text-[13px] text-text-2 tracking-tight2">
          Não recebeu?{" "}
          {seconds > 0 ? (
            <span>
              Reenvie em{" "}
              <span className="text-text font-semibold tabular-nums">
                {seconds}s
              </span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="p-0 bg-transparent border-0 text-accent text-[13px] font-bold tracking-tight2 hover:underline underline-offset-4 disabled:opacity-50"
            >
              {isResending ? "Reenviando…" : "Reenviar código"}
            </button>
          )}
        </div>
      </div>

      <div className="px-[22px] pt-3.5 pb-7 border-t border-border bg-surface">
        <Button
          variant="primary"
          full
          iconRight={<IconArrowRight />}
          disabled={!filled || isVerifying}
          loading={isVerifying}
          onClick={handleVerify}
        >
          Verificar e continuar
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepBar } from "@/components/ui/step-bar";
import {
  IconArrowRight,
  IconWhatsappFilled,
} from "@/components/icons";
import { useTenantSetupStore } from "@/components/domain/tenant/tenant-setup-store-provider";
import { OtpInput } from "@/components/domain/tenant/otp-input";

/**
 * Passo 2/5 · Verificação WhatsApp.
 *
 * **Implementação atual (Wave 1):** verificação simulada client-side —
 * qualquer código de 6 dígitos avança o fluxo. Em modo dev mostramos a
 * dica "use 000000".
 *
 * **TODO (auth-agent):** quando 01-auth expor um helper "OTP de
 * confirmação" (que NÃO recria sessão e NÃO envia SMS, apenas verifica
 * que o usuário tem acesso ao WhatsApp do telefone na sessão), trocar
 * a chamada simulada por essa server action.
 *
 * Por que não usar `verifyOtp` direto: a server action `verifyOtp` de
 * `auth.actions.ts` cria uma nova sessão e gera um novo código no DB —
 * UX/auditoria ruim para uma reconfirmação dentro do onboarding.
 */
export default function OtpPage() {
  const router = useRouter();
  const telefone = useTenantSetupStore((s) => s.lider.telefone);
  const otpVerified = useTenantSetupStore((s) => s.otpVerified);
  const setOtpVerified = useTenantSetupStore((s) => s.setOtpVerified);

  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(45);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  // Se o passo 2 já foi validado nesta sessão, deixa visível o estado.
  useEffect(() => {
    if (otpVerified) setCode("123456");
  }, [otpVerified]);

  const filled = code.length === 6;

  const ofuscado = obscurePhone(telefone);

  const onContinue = () => {
    if (!filled) return;
    // TODO(auth-agent): chamar verifyOtpForActiveUser quando existir.
    if (!/^\d{6}$/.test(code)) {
      setError("Use os 6 dígitos numéricos enviados.");
      return;
    }
    setOtpVerified(true);
    router.push("/tenant-setup/localidade");
  };

  const onResend = () => {
    setSeconds(45);
    setError(null);
    // TODO(auth-agent): disparar sendOtp/sendOtpForActiveUser.
  };

  return (
    <div className="flex flex-col h-dvh bg-bg">
      <StepBar
        current={2}
        total={5}
        onBack={() => router.push("/tenant-setup/identidade")}
      />
      <div className="flex-1 overflow-y-auto px-[22px] pb-6 flex flex-col gap-5">
        <div
          className="self-center mt-2 flex items-center justify-center"
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            background: "#DCFCE7",
            color: "#15803D",
          }}
          aria-hidden="true"
        >
          <IconWhatsappFilled size={36} />
        </div>

        <div>
          <h1 className="m-0 text-center text-[24px] font-bold tracking-tight3 text-text leading-[1.15]">
            Verificação por WhatsApp
          </h1>
          <p className="mt-2.5 text-center text-sm text-text-2 leading-relaxed tracking-tight2 text-pretty">
            Enviamos um código de 6 dígitos para{" "}
            <span className="text-text font-bold">{ofuscado}</span>
          </p>
        </div>

        <OtpInput
          value={code}
          onChange={setCode}
          onComplete={(v) => {
            setCode(v);
            setError(null);
          }}
          autoFocus
          ariaLabel="Código de verificação WhatsApp"
        />

        {error && (
          <div
            role="alert"
            className="text-center text-[13px] text-status-urgente"
          >
            {error}
          </div>
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
              onClick={onResend}
              className="bg-transparent border-0 text-accent text-[13px] font-bold cursor-pointer tracking-tight2"
            >
              Reenviar código
            </button>
          )}
        </div>

        {process.env.NODE_ENV !== "production" && (
          <div className="text-center text-[11px] text-text-3">
            Em dev: digite qualquer 6 dígitos (ex.: 000000) para avançar.
          </div>
        )}
      </div>
      <footer className="px-[22px] pt-3.5 pb-7 border-t border-border bg-surface">
        <Button
          variant="primary"
          full
          disabled={!filled}
          iconRight={<IconArrowRight />}
          onClick={onContinue}
        >
          Verificar e continuar
        </Button>
      </footer>
    </div>
  );
}

/**
 * Esconde o miolo do número, deixando DDD + 4 últimos visíveis.
 * Aceita formatos brasileiros com ou sem +55 e máscaras visuais.
 */
function obscurePhone(raw: string): string {
  if (!raw) return "seu WhatsApp";
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) return raw;
  const ddd = digits.length >= 12 ? digits.slice(2, 4) : digits.slice(0, 2);
  const last4 = digits.slice(-4);
  return `(${ddd}) •••••-${last4}`;
}

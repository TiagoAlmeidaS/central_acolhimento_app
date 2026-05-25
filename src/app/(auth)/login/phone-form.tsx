"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ChangeEvent } from "react";
import { Button, Input } from "@/components/ui";
import {
  IconArrowRight,
  IconPhone,
  IconWhatsappFilled,
} from "@/components/icons";
import { sendOtp } from "@/server/auth.actions";
import {
  isValidBrPhone,
  maskBrPhone,
  normalizeBrPhone,
} from "@/lib/auth/phone";

/**
 * Formulário expansível usado em `/login`:
 *
 * 1. Estado inicial: botão verde "Entrar com WhatsApp" (clone do protótipo).
 * 2. Após clicar: revela o `Input` mascarado + CTA "Enviar código".
 * 3. Submit chama `sendOtp` e, em sucesso, navega para `/otp?tel=…`.
 */
export function LoginPhoneForm() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTelefone(maskBrPhone(e.target.value));
    if (error) setError(null);
  };

  const handleSubmit = () => {
    if (!isValidBrPhone(telefone)) {
      setError("Digite DDD + número completo.");
      return;
    }
    const e164 = normalizeBrPhone(telefone);
    startTransition(async () => {
      const res = await sendOtp({ telefone: e164 });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/otp?tel=${encodeURIComponent(e164)}`);
    });
  };

  if (!expanded) {
    return (
      <Button
        variant="whatsapp"
        icon={<IconWhatsappFilled />}
        full
        onClick={() => setExpanded(true)}
      >
        Entrar com WhatsApp
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full self-stretch">
      <Input
        label="Telefone (WhatsApp)"
        value={telefone}
        onChange={onChange}
        placeholder="(00) 00000-0000"
        icon={<IconPhone />}
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        error={error ?? undefined}
        hint={error ? undefined : "Enviaremos um código de 6 dígitos."}
      />
      <Button
        variant="primary"
        full
        iconRight={<IconArrowRight />}
        disabled={!isValidBrPhone(telefone) || isPending}
        loading={isPending}
        onClick={handleSubmit}
      >
        Enviar código
      </Button>
      <button
        type="button"
        className="self-center text-[13px] font-semibold text-text-2 hover:text-text mt-1"
        onClick={() => setExpanded(false)}
        disabled={isPending}
      >
        Voltar
      </button>
    </div>
  );
}

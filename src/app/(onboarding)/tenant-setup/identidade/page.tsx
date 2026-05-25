"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InfoBanner } from "@/components/ui/info-banner";
import { StepBar } from "@/components/ui/step-bar";
import {
  IconArrowRight,
  IconPhone,
  IconUser,
} from "@/components/icons";
import { useTenantSetupStore } from "@/components/domain/tenant/tenant-setup-store-provider";

/**
 * Passo 1/5 · Identidade do líder.
 *
 * Campos: nome + telefone (já vem do session via `SeedHydratorClient`,
 * editável). Validação leve (≥3 letras, ≥10 dígitos numéricos).
 */
export default function IdentidadePage() {
  const router = useRouter();
  const lider = useTenantSetupStore((s) => s.lider);
  const setLider = useTenantSetupStore((s) => s.setLider);

  const valid =
    lider.nome.trim().length > 2 &&
    lider.telefone.replace(/\D/g, "").length >= 10;

  return (
    <div className="flex flex-col h-dvh bg-bg">
      <StepBar
        current={1}
        total={5}
        onBack={() => router.push("/login")}
      />
      <div className="flex-1 overflow-y-auto px-[22px] pb-6 flex flex-col gap-5">
        <div>
          <h1 className="m-0 text-[26px] font-bold tracking-tight4 text-text leading-[1.1]">
            Vamos começar por você.
          </h1>
          <p className="mt-2.5 text-sm text-text-2 leading-relaxed tracking-tight2 text-pretty">
            Como líder responsável, seus dados ficam vinculados à localidade
            que você vai criar.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Seu nome completo"
            value={lider.nome}
            onChange={(e) => setLider({ nome: e.target.value })}
            placeholder="Ex: Daniel Bemol"
            icon={<IconUser />}
            autoComplete="name"
          />
          <Input
            label="Telefone (WhatsApp)"
            value={lider.telefone}
            onChange={(e) => setLider({ telefone: e.target.value })}
            placeholder="(00) 00000-0000"
            icon={<IconPhone />}
            inputMode="tel"
            autoComplete="tel"
            hint="Enviaremos um código por WhatsApp para verificar."
          />
        </div>

        <InfoBanner>
          Você será o{" "}
          <span className="font-bold text-accent">administrador</span> desta
          localidade — quem aprova cuidadores e gerencia a assinatura.
        </InfoBanner>
      </div>
      <footer className="px-[22px] pt-3.5 pb-7 border-t border-border bg-surface">
        <Button
          variant="primary"
          full
          disabled={!valid}
          iconRight={<IconArrowRight />}
          onClick={() => router.push("/tenant-setup/otp")}
        >
          Continuar
        </Button>
      </footer>
    </div>
  );
}

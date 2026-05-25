"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepBar } from "@/components/ui/step-bar";
import { IconArrowRight } from "@/components/icons";
import { useTenantSetupStore } from "@/components/domain/tenant/tenant-setup-store-provider";
import { TenantColorPicker } from "@/components/domain/tenant/tenant-color-picker";
import { TenantPreviewCard } from "@/components/domain/tenant/tenant-preview-card";
import { sigleFrom } from "@/components/domain/tenant/sigle-from";
import { TENANT_COLORS, type TenantColor } from "@/db/schema";

/**
 * Passo 4/5 · Personalização. Sigla auto-gerada (editável) + cor da
 * paleta fixa de 8 opções. Mostra prévia em tempo real.
 */
export default function PersonalizaPage() {
  const router = useRouter();
  const localidade = useTenantSetupStore((s) => s.localidade);
  const personaliza = useTenantSetupStore((s) => s.personaliza);
  const setPersonaliza = useTenantSetupStore((s) => s.setPersonaliza);

  // Auto-gera sigla quando o usuário ainda não personalizou
  // (entrou no passo após digitar nome no passo anterior).
  useEffect(() => {
    if (!personaliza.sigla && localidade.nome) {
      const auto = sigleFrom(localidade.nome);
      if (auto && auto !== "?") {
        setPersonaliza({ sigla: auto });
      }
    }
  }, [personaliza.sigla, localidade.nome, setPersonaliza]);

  // Garante uma cor default mesmo se a store rehidratar com cor ausente.
  useEffect(() => {
    if (!personaliza.cor) {
      setPersonaliza({ cor: TENANT_COLORS[0] });
    }
  }, [personaliza.cor, setPersonaliza]);

  const sigla = personaliza.sigla;
  const cor = personaliza.cor || TENANT_COLORS[0];

  const trimmed = sigla.trim();
  const valid = trimmed.length >= 1 && trimmed.length <= 3;

  return (
    <div className="flex flex-col h-dvh bg-bg">
      <StepBar
        current={4}
        total={5}
        onBack={() => router.push("/tenant-setup/localidade")}
      />
      <div className="flex-1 overflow-y-auto px-[22px] pb-6 flex flex-col gap-5">
        <div>
          <h1 className="m-0 text-[26px] font-bold tracking-tight4 text-text leading-[1.1]">
            Identidade visual.
          </h1>
          <p className="mt-2.5 text-sm text-text-2 leading-relaxed tracking-tight2 text-pretty">
            Sua localidade aparece com essas cores em todos os cantos do app.
          </p>
        </div>

        <TenantPreviewCard
          sigla={sigla}
          cor={cor}
          nome={localidade.nome}
          cidade={localidade.cidade}
          uf={localidade.uf || ""}
        />

        <Input
          label="Sigla (até 3 letras)"
          value={sigla}
          onChange={(e) =>
            setPersonaliza({
              sigla: e.target.value.toLocaleUpperCase("pt-BR").slice(0, 3),
            })
          }
          placeholder="AD"
          maxLength={3}
          hint="Geramos uma automaticamente, mas você pode mudar."
        />

        <div>
          <div className="text-[13.5px] font-bold text-text tracking-tight2 mb-2.5">
            Cor da localidade
          </div>
          <TenantColorPicker
            value={cor as TenantColor}
            onChange={(c) => setPersonaliza({ cor: c })}
          />
        </div>
      </div>
      <footer className="px-[22px] pt-3.5 pb-7 border-t border-border bg-surface">
        <Button
          variant="primary"
          full
          disabled={!valid}
          iconRight={<IconArrowRight />}
          onClick={() => router.push("/tenant-setup/revisao")}
        >
          Continuar
        </Button>
      </footer>
    </div>
  );
}

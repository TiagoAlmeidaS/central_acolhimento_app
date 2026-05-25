"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StepBar } from "@/components/ui/step-bar";
import {
  IconArrowRight,
  IconChurch,
  IconMapPin,
} from "@/components/icons";
import { useTenantSetupStore } from "@/components/domain/tenant/tenant-setup-store-provider";
import { UFS, type UF } from "@/lib/data/tenants";

const DENOMINACOES = [
  "Batista",
  "Católica",
  "Presbiteriana",
  "Metodista",
  "Assembleia",
  "Adventista",
  "Pentecostal",
  "Outra",
  "Prefiro não dizer",
];

/**
 * Passo 3/5 · Dados da localidade. Nome + denominação (opcional) +
 * cidade + UF.
 */
export default function LocalidadePage() {
  const router = useRouter();
  const localidade = useTenantSetupStore((s) => s.localidade);
  const setLocalidade = useTenantSetupStore((s) => s.setLocalidade);

  const valid =
    localidade.nome.trim().length > 2 &&
    localidade.cidade.trim().length >= 2 &&
    !!localidade.uf;

  return (
    <div className="flex flex-col h-dvh bg-bg">
      <StepBar
        current={3}
        total={5}
        onBack={() => router.push("/tenant-setup/otp")}
      />
      <div className="flex-1 overflow-y-auto px-[22px] pb-6 flex flex-col gap-5">
        <div>
          <h1 className="m-0 text-[26px] font-bold tracking-tight4 text-text leading-[1.1]">
            Sobre a sua localidade.
          </h1>
          <p className="mt-2.5 text-sm text-text-2 leading-relaxed tracking-tight2 text-pretty">
            Esses dados ajudam sua equipe a se reconhecer no app.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Nome da localidade"
            value={localidade.nome}
            onChange={(e) => setLocalidade({ nome: e.target.value })}
            placeholder="Ex: Adrianópolis"
            icon={<IconChurch />}
            hint="Como sua comunidade é chamada no dia-a-dia."
          />
          <Select
            label="Denominação (opcional)"
            value={localidade.denominacao}
            onChange={(e) => setLocalidade({ denominacao: e.target.value })}
            placeholder="Selecione (opcional)"
            options={DENOMINACOES}
          />
          <div className="grid gap-3 grid-cols-[110px_1fr]">
            <Select
              label="Estado"
              value={localidade.uf}
              onChange={(e) =>
                setLocalidade({ uf: e.target.value as UF | "" })
              }
              placeholder="UF"
              options={UFS as unknown as string[]}
            />
            <Input
              label="Cidade"
              value={localidade.cidade}
              onChange={(e) => setLocalidade({ cidade: e.target.value })}
              placeholder="Cidade sede"
              icon={<IconMapPin />}
            />
          </div>
        </div>
      </div>
      <footer className="px-[22px] pt-3.5 pb-7 border-t border-border bg-surface">
        <Button
          variant="primary"
          full
          disabled={!valid}
          iconRight={<IconArrowRight />}
          onClick={() => router.push("/tenant-setup/personaliza")}
        >
          Continuar
        </Button>
      </footer>
    </div>
  );
}

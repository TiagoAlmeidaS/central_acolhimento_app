"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  IconCalendar,
  IconPlus,
  IconUsers,
} from "@/components/icons";
import { useTenantSetupStore } from "@/components/domain/tenant/tenant-setup-store-provider";
import { WelcomeHero } from "@/components/domain/tenant/welcome-hero";

/**
 * Tela "Bem-vindo, líder" pós-pagamento.
 *
 * **Como o usuário chega aqui:** após o `billing-agent` confirmar o
 * checkout (e seu webhook chamar `provisionTenant`), ele redireciona
 * para `/tenant-setup/bem-vindo`. Por enquanto qualquer link direto
 * para a rota também funciona — útil para QA do visual.
 *
 * CTAs:
 *  - Convidar primeira pessoa → `/equipe/convidar` (spec 04).
 *  - Ir para o app → `/` (placeholder; quando a Wave 3 fechar, aponta
 *    para o dashboard/home conforme papel).
 */
export default function BemVindoPage() {
  const router = useRouter();
  const lider = useTenantSetupStore((s) => s.lider);
  const localidade = useTenantSetupStore((s) => s.localidade);
  const personaliza = useTenantSetupStore((s) => s.personaliza);

  const primeiroNome = (lider.nome || "").trim().split(/\s+/)[0] || "Líder";
  const cor = personaliza.cor || "#2D7FF9";
  const sigla = personaliza.sigla || "?";
  const cidadeUf =
    localidade.cidade && localidade.uf
      ? `${localidade.cidade}, ${localidade.uf}`
      : "sua comunidade";

  return (
    <div className="flex flex-col h-dvh bg-bg">
      <div className="flex-1 overflow-y-auto px-7 pt-10 pb-6 flex flex-col gap-6">
        <WelcomeHero
          sigla={sigla}
          cor={cor}
          primeiroNome={primeiroNome}
          localidadeNome={localidade.nome || "—"}
          cidadeUf={cidadeUf}
        />

        <Card padding={18} className="w-full text-left">
          <div className="text-[13.5px] font-bold text-text tracking-tight2 mb-3">
            Primeiros passos
          </div>
          <div className="flex flex-col gap-3">
            <FirstStepRow
              icon={<IconUsers size={16} />}
              label="Convide os cuidadores"
              hint="O WhatsApp é o canal de convite — eles entram em segundos."
            />
            <FirstStepRow
              icon={<IconPlus size={16} />}
              label="Cadastre os primeiros assistidos"
              hint="Adicione manualmente ou peça ao agente IA via Mensagens."
            />
            <FirstStepRow
              icon={<IconCalendar size={16} />}
              label="Marque a primeira visita"
              hint="A agenda da localidade fica visível para toda a equipe."
            />
          </div>
        </Card>
      </div>
      <footer className="px-[22px] pt-3.5 pb-7 border-t border-border bg-surface flex flex-col gap-2.5">
        <Button
          variant="primary"
          full
          icon={<IconUsers />}
          onClick={() => router.push("/equipe/convidar")}
        >
          Convidar a primeira pessoa
        </Button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="px-3 py-2.5 bg-transparent border-0 text-text-2 text-[13.5px] font-semibold cursor-pointer tracking-tight2"
        >
          Vou convidar mais tarde
        </button>
      </footer>
    </div>
  );
}

function FirstStepRow({
  icon,
  label,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex gap-3 items-start">
      <div
        aria-hidden="true"
        className="flex items-center justify-center bg-accent-bg text-accent rounded-[10px] flex-shrink-0"
        style={{ width: 32, height: 32 }}
      >
        {icon}
      </div>
      <div className="flex-1 pt-[1px]">
        <div className="text-[13.5px] font-bold text-text tracking-tight2">
          {label}
        </div>
        <div className="mt-0.5 text-xs text-text-2 leading-snug">{hint}</div>
      </div>
    </div>
  );
}

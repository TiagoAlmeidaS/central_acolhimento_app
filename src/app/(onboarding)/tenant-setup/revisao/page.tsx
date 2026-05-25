"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { InfoBanner } from "@/components/ui/info-banner";
import { StepBar } from "@/components/ui/step-bar";
import { IconArrowRight } from "@/components/icons";
import { useTenantSetupStore } from "@/components/domain/tenant/tenant-setup-store-provider";
import { checkTenantAvailable } from "@/server/tenant.actions";

/**
 * Passo 5/5 · Revisão antes do checkout.
 *
 * Mostra hero card + dados do líder + "o que acontece depois".
 * Antes de mandar para os planos chamamos `checkTenantAvailable` para
 * dar feedback imediato de duplicata (o constraint unique resolve no
 * provisionTenant final, mas é melhor avisar o usuário antes do
 * checkout para não cobrar e ter que estornar).
 *
 * **Handoff para `billing-agent`:** após o "Escolher o plano" o usuário
 * cai em `/assinatura/planos` (rota da spec 10). Quando essa spec não
 * tiver fechado ainda, o link é apenas um stub que mostra "Em breve".
 */
export default function RevisaoPage() {
  const router = useRouter();
  const lider = useTenantSetupStore((s) => s.lider);
  const localidade = useTenantSetupStore((s) => s.localidade);
  const personaliza = useTenantSetupStore((s) => s.personaliza);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onContinue = () => {
    setError(null);
    if (!localidade.uf) {
      setError("Estado (UF) é obrigatório — volte ao passo 3.");
      return;
    }
    const uf = localidade.uf;
    startTransition(async () => {
      const result = await checkTenantAvailable({
        nome: localidade.nome,
        cidade: localidade.cidade,
        uf,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (!result.available) {
        setError(
          "Essa localidade já existe em " +
            `${localidade.cidade}, ${localidade.uf}. ` +
            "Peça um convite ao líder responsável.",
        );
        return;
      }
      // TODO(billing-agent): trocar por router.push("/assinatura/planos")
      // quando a spec 10 fechar a rota; por enquanto a rota não existe.
      router.push("/assinatura/planos");
    });
  };

  const cor = personaliza.cor;
  const sigla = personaliza.sigla.toLocaleUpperCase("pt-BR").slice(0, 3) || "?";

  return (
    <div className="flex flex-col h-dvh bg-bg">
      <StepBar
        current={5}
        total={5}
        onBack={() => router.push("/tenant-setup/personaliza")}
      />
      <div className="flex-1 overflow-y-auto px-[22px] pb-6 flex flex-col gap-5">
        <div>
          <h1 className="m-0 text-[26px] font-bold tracking-tight4 text-text leading-[1.1]">
            Confirme antes de criar.
          </h1>
          <p className="mt-2.5 text-sm text-text-2 leading-relaxed tracking-tight2 text-pretty">
            Falta só escolher o plano. Você tem 14 dias grátis antes da
            primeira cobrança.
          </p>
        </div>

        <div
          className="relative overflow-hidden rounded-[22px] p-[22px] text-white"
          style={{
            background: `linear-gradient(135deg, ${cor} 0%, ${cor}d0 100%)`,
            boxShadow: `0 12px 32px ${cor}40`,
          }}
        >
          <div
            aria-hidden="true"
            className="absolute -right-8 -top-8 rounded-full"
            style={{
              width: 120,
              height: 120,
              background: "rgba(255,255,255,0.12)",
            }}
          />
          <div className="relative">
            <div
              className="flex items-center justify-center font-bold tracking-tight2 mb-3.5"
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "rgba(255,255,255,0.2)",
                fontSize: 20,
              }}
            >
              {sigla}
            </div>
            <div className="text-[11px] font-bold opacity-85 uppercase tracking-[0.08em]">
              Nova localidade
            </div>
            <div className="mt-1 text-[22px] font-bold tracking-tight3">
              Comunidade {localidade.nome || "—"}
            </div>
            <div className="mt-1 text-[13px] opacity-90">
              {localidade.cidade || "—"}, {localidade.uf || "—"}
              {localidade.denominacao ? ` · ${localidade.denominacao}` : ""}
            </div>
          </div>
        </div>

        <Card padding={0}>
          <div className="px-[18px] py-3.5 border-b border-border">
            <div className="text-[11px] font-bold text-text-3 uppercase tracking-[0.06em]">
              Líder responsável
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Avatar name={lider.nome || "—"} size={42} />
              <div className="flex-1 min-w-0">
                <div className="text-[14.5px] font-bold text-text tracking-tight2">
                  {lider.nome || "—"}
                </div>
                <div className="mt-0.5 text-[12.5px] text-text-2">
                  {lider.telefone || "—"}
                </div>
              </div>
              <div className="text-[10.5px] font-bold text-accent bg-accent-bg px-2 py-1 rounded-pill uppercase tracking-[0.04em]">
                Admin
              </div>
            </div>
          </div>

          <div className="px-[18px] py-3.5">
            <div className="text-[11px] font-bold text-text-3 uppercase tracking-[0.06em] mb-2">
              O que acontece depois
            </div>
            {[
              "Escolha um plano e inicie 14 dias grátis",
              "Convide sua equipe pelo WhatsApp",
              "Comece a cadastrar os primeiros assistidos",
            ].map((t, i) => (
              <div
                key={i}
                className="flex gap-3 items-start py-1.5"
              >
                <div
                  className="flex items-center justify-center text-[11px] font-extrabold text-accent bg-accent-bg rounded-full flex-shrink-0 mt-[1px]"
                  style={{ width: 22, height: 22 }}
                  aria-hidden="true"
                >
                  {i + 1}
                </div>
                <div className="flex-1 text-[13.5px] text-text leading-snug tracking-tight2 pt-0.5">
                  {t}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {error && <InfoBanner tone="urgente">{error}</InfoBanner>}
      </div>
      <footer className="px-[22px] pt-3.5 pb-7 border-t border-border bg-surface">
        <Button
          variant="primary"
          full
          loading={isPending}
          iconRight={<IconArrowRight />}
          onClick={onContinue}
        >
          Escolher o plano
        </Button>
      </footer>
    </div>
  );
}

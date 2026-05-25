import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { IconCheck, IconLock, IconX } from "@/components/icons";
import { SectionLabel } from "./section-label";
import { cn } from "@/lib/utils/cn";

interface PricingFeature {
  ok: boolean;
  text: string;
}

interface Plan {
  id: "essencial" | "pro";
  nome: string;
  descricao: string;
  preco: number;
  destaque?: boolean;
  features: PricingFeature[];
}

const PLANOS: Plan[] = [
  {
    id: "essencial",
    nome: "Essencial",
    descricao: "Para iniciar o cuidado pastoral organizado.",
    preco: 19.9,
    features: [
      { ok: true, text: "Até 50 assistidos por localidade" },
      { ok: true, text: "Até 8 cuidadores" },
      { ok: true, text: "200 interações IA / mês" },
      { ok: true, text: "Login + convites por WhatsApp" },
      { ok: false, text: "Suporte por WhatsApp" },
      { ok: false, text: "Multi-localidade" },
    ],
  },
  {
    id: "pro",
    nome: "Pró",
    descricao: "Para comunidades que crescem e querem todo o agente IA.",
    preco: 29.9,
    destaque: true,
    features: [
      { ok: true, text: "Assistidos ilimitados" },
      { ok: true, text: "Cuidadores ilimitados" },
      { ok: true, text: "Interações IA ilimitadas" },
      { ok: true, text: "Suporte WhatsApp prioritário" },
      { ok: true, text: "Múltiplas localidades por líder" },
      { ok: true, text: "Histórico sem expiração + export PDF" },
    ],
  },
];

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function PricingCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-5 rounded-3xl bg-surface p-8 transition-shadow",
        plan.destaque
          ? "border-2 border-accent shadow-[0_24px_60px_rgba(45,127,249,0.18)] md:scale-[1.02]"
          : "border border-border shadow-card",
      )}
    >
      {plan.destaque && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-pill bg-accent px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
          Mais escolhido
        </span>
      )}

      <div>
        <div className="text-[19px] font-extrabold tracking-tight3 text-text">
          {plan.nome}
        </div>
        <p className="mt-1 text-[13.5px] leading-snug tracking-tight2 text-text-2">
          {plan.descricao}
        </p>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-[44px] font-extrabold leading-none tracking-[-0.04em] text-text tabular-nums sm:text-[48px]">
          {BRL.format(plan.preco)}
        </span>
        <span className="text-[15px] font-medium text-text-2">/mês</span>
      </div>

      <Link
        href="/login"
        className={buttonVariants({
          variant: plan.destaque ? "primary" : "secondary",
          size: "md",
          full: true,
        })}
      >
        {plan.destaque ? "Começar 14 dias grátis" : "Escolher plano"}
      </Link>

      <div className="h-px bg-border" />

      <ul className="flex flex-col gap-2.5">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5">
            <span
              className={cn(
                "mt-0.5 grid size-[18px] flex-shrink-0 place-items-center rounded-full",
                f.ok
                  ? "bg-[rgba(34,197,94,0.16)] text-[#16A34A]"
                  : "bg-surface-2 text-text-3",
              )}
              aria-hidden="true"
            >
              {f.ok ? (
                <IconCheck size={11} sw={3} />
              ) : (
                <IconX size={10} sw={2.5} />
              )}
            </span>
            <span
              className={cn(
                "text-[14px] leading-snug tracking-tight2",
                f.ok ? "text-text" : "text-text-3",
              )}
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Seção de preços (Essencial × Pró). Preços referenciados em
 * `docs/product/overview.md §5`. CTA leva pro `/login` (que
 * encaminhará o líder para o fluxo de criação de localidade).
 */
export function PricingSection() {
  return (
    <section
      id="pricing"
      className="bg-bg px-5 py-20 sm:px-8 md:py-28"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Preços</SectionLabel>
          <h2
            id="pricing-heading"
            className="mt-4 text-balance text-[34px] font-extrabold leading-[1.1] tracking-tight5 text-text sm:text-[42px]"
          >
            Um líder paga.
            <br />
            <span className="text-text-3">Toda a equipe usa.</span>
          </h2>
          <p className="mt-4 text-pretty text-[15.5px] leading-relaxed tracking-tight2 text-text-2 sm:text-[16px]">
            Cuidadores convidados não pagam nada. Cancele a qualquer momento,
            sem multa e sem fidelidade.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {PLANOS.map((p) => (
            <PricingCard key={p.id} plan={p} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3.5 py-2 text-[13px] tracking-tight2 text-text-2">
            <IconLock size={14} color="var(--text-3)" />
            Pagamento processado pela Stripe · 14 dias grátis em ambos os
            planos
          </div>
        </div>
      </div>
    </section>
  );
}

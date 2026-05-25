import Link from "next/link";
import { IconArrowRight } from "@/components/icons";

/**
 * CTA final em gradiente. Replicação direta do `FinalCTA` do
 * protótipo, com link para `/login` (entrada do fluxo de criação
 * de localidade).
 */
export function FinalCTA() {
  return (
    <section className="bg-bg px-5 pb-20 pt-12 sm:px-8 md:pb-28">
      <div className="mx-auto max-w-6xl">
        <div
          className="relative overflow-hidden rounded-[28px] px-7 py-14 text-center text-white sm:rounded-[32px] sm:px-12 sm:py-16"
          style={{
            background: "linear-gradient(135deg, #2D7FF9 0%, #7C3AED 100%)",
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-12 -top-24 size-72 rounded-full bg-white/[0.08]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-36 -right-16 size-96 rounded-full bg-white/[0.06]"
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-balance text-[32px] font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-[40px] md:text-[44px]">
              Crie a sua localidade em <em className="not-italic">5 minutos</em>.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-pretty text-[15px] leading-relaxed tracking-tight2 text-white/85 sm:text-[17px]">
              Comece a usar a Acolhe agora — 14 dias grátis, sem cartão de
              crédito necessário.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex h-[54px] items-center gap-2 rounded-[14px] bg-white px-6 text-[15.5px] font-bold tracking-tight2 text-accent shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-transform hover:scale-[1.02] active:scale-[0.985]"
              >
                Criar minha localidade
                <IconArrowRight size={18} />
              </Link>
              <a
                href="mailto:contato@acolhe.app"
                className="inline-flex h-[54px] items-center rounded-[14px] border-[1.5px] border-white/30 px-6 text-[15.5px] font-semibold tracking-tight2 text-white transition-colors hover:bg-white/10"
              >
                Falar com vendas
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

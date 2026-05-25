import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { IconArrowRight, IconSparkle, IconVideo } from "@/components/icons";
import { PhoneMockup } from "./phone-mockup";
import { HomeMockScreen, AgendaMockScreen } from "./mock-screens";

/**
 * Seção hero — dois mockups empilhados em desktop, headline em gradiente,
 * CTA primário ("Criar localidade") + secundário ("Ver demonstração").
 */
export function LandingHero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-bg pb-16 pt-12 sm:pt-16 md:pb-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-48 size-[600px] rounded-full opacity-80"
        style={{
          background:
            "radial-gradient(circle, rgba(45,127,249,0.16) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3.5 py-1.5 text-[12.5px] font-bold tracking-tight2 shadow-card">
            <IconSparkle size={13} color="var(--accent)" />
            <span className="text-text-2">Agente IA pastoral</span>
            <span className="text-text-3">·</span>
            <span className="text-text">Beta aberta</span>
          </div>

          <h1 className="mt-6 text-[44px] font-extrabold leading-[1.02] tracking-[-0.045em] text-text sm:text-[56px] lg:text-[64px]">
            Cuide do seu rebanho{" "}
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, #2D7FF9 0%, #7C3AED 100%)",
              }}
            >
              como nunca antes.
            </span>
          </h1>

          <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed tracking-tight2 text-text-2 sm:text-[19px]">
            A Acolhe é uma central de cuidado pastoral para comunidades de fé.
            Cada localidade tem seu espaço fechado, com agente de IA que ajuda
            cuidadores a acompanhar irmãos com amor e organização.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className={buttonVariants({ variant: "primary", size: "lg" })}
            >
              Criar minha localidade
              <IconArrowRight size={18} />
            </Link>
            <Link
              href="#how"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              <IconVideo size={18} />
              Ver demonstração
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <div className="flex">
              {[
                { letters: "MA", bg: "#2D7FF9" },
                { letters: "TO", bg: "#7C3AED" },
                { letters: "CL", bg: "#16A34A" },
                { letters: "DA", bg: "#EA580C" },
                { letters: "RB", bg: "#0F172A" },
              ].map((a, i) => (
                <span
                  key={a.letters}
                  className="-ml-2 grid size-8 place-items-center rounded-full border-[2px] border-bg text-[11px] font-bold text-white"
                  style={{ background: a.bg, zIndex: 5 - i }}
                  aria-hidden="true"
                >
                  {a.letters}
                </span>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="#F59E0B"
                  >
                    <path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 7-6.3-3.3-6.3 3.3L7 14.2l-5-4.9 7-1z" />
                  </svg>
                ))}
              </div>
              <p className="text-[13px] text-text-2">
                <span className="font-bold text-text">+240 comunidades</span>{" "}
                já acolhendo
              </p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto flex h-[560px] w-full items-center justify-center sm:h-[640px] md:h-[680px]">
          <div className="absolute -left-2 top-12 opacity-90 sm:left-4 md:-left-6">
            <PhoneMockup rotate={-7} scale={0.84}>
              <AgendaMockScreen />
            </PhoneMockup>
          </div>
          <div className="relative z-10">
            <PhoneMockup rotate={2}>
              <HomeMockScreen />
            </PhoneMockup>
          </div>
        </div>
      </div>
    </section>
  );
}

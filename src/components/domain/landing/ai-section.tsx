import { IconSparkle } from "@/components/icons";
import { PhoneMockup } from "./phone-mockup";
import { ChatMockScreen } from "./mock-screens";

const PROMPTS = [
  "Cadastre o irmão João da Silva, aguardando",
  "Quem visitou a Lúcia esta semana?",
  "Marca uma visita pro Carlos na sexta às 19h",
];

/**
 * Seção "Agente IA pastoral" com fundo escuro, gradientes radiais e
 * um mockup do chat. Sempre claro internamente para preservar a
 * legibilidade do conteúdo da tela do app.
 */
export function AISection() {
  return (
    <section
      aria-labelledby="ai-heading"
      className="relative overflow-hidden px-5 py-20 text-white sm:px-8 md:py-28"
      style={{
        background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-48 size-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.30) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -right-24 size-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(45,127,249,0.22) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-[1fr_0.9fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-pill bg-[rgba(124,58,237,0.2)] px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-[#C4B5FD]">
            <IconSparkle size={13} />
            Agente IA pastoral
          </span>
          <h2
            id="ai-heading"
            className="mt-5 text-balance text-[34px] font-extrabold leading-[1.05] tracking-tight5 text-white sm:text-[42px] md:text-[48px]"
          >
            Sua liderança conversa,
            <br />
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #C4B5FD 0%, #93C5FD 100%)",
              }}
            >
              a IA executa.
            </span>
          </h2>
          <p className="mt-5 max-w-[520px] text-pretty text-[16px] leading-relaxed tracking-tight2 text-[#94A3B8] sm:text-[18px]">
            Cadastre, mude status, marque visitas ou peça resumos no
            linguajar mais natural possível. O agente conhece sua localidade,
            responde no tom certo e <strong className="text-white">confirma
            antes</strong> de tomar ação.
          </p>

          <ul className="mt-7 max-w-[480px] space-y-2.5">
            {PROMPTS.map((q) => (
              <li
                key={q}
                className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-[14px] italic tracking-tight2 text-[#E2E8F0]"
              >
                &ldquo;{q}&rdquo;
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center">
          <PhoneMockup>
            <ChatMockScreen />
          </PhoneMockup>
        </div>
      </div>
    </section>
  );
}

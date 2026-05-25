import type { ReactElement } from "react";
import { cloneElement } from "react";
import { Card } from "@/components/ui/card";
import { SectionLabel } from "./section-label";
import {
  IconCalendar,
  IconChart,
  IconShield,
  IconSparkle,
  IconUsers,
  IconWhatsapp,
  type IconBaseProps,
} from "@/components/icons";

interface Feature {
  icon: ReactElement<IconBaseProps>;
  title: string;
  body: string;
  color: string;
  background: string;
}

const FEATURES: Feature[] = [
  {
    icon: <IconUsers />,
    title: "Localidade fechada",
    body: "Cada igreja tem seu espaço próprio. Dados não se misturam — só sua liderança e cuidadores enxergam.",
    color: "#2D7FF9",
    background: "#E8F1FE",
  },
  {
    icon: <IconSparkle />,
    title: "Agente IA pastoral",
    body: "Cadastre irmãos, mude status e busque informações com linguagem natural. A IA conhece sua localidade.",
    color: "#7C3AED",
    background: "rgba(124,58,237,0.12)",
  },
  {
    icon: <IconWhatsapp />,
    title: "Conexão por WhatsApp",
    body: "Login, convites e notificações vão pelo WhatsApp. Sem cadastros complicados — sua equipe entra em segundos.",
    color: "#16A34A",
    background: "rgba(34,197,94,0.12)",
  },
  {
    icon: <IconCalendar />,
    title: "Agenda compartilhada",
    body: "Visitas, ligações e reuniões em um só lugar. Toda a equipe sabe quem está cuidando de quem.",
    color: "#EA580C",
    background: "#FFEDD5",
  },
  {
    icon: <IconShield />,
    title: "Aprovação por liderança",
    body: "Cuidadores se cadastram ou são convidados. A liderança aprova quem entra — proteção real para os assistidos.",
    color: "#0F172A",
    background: "var(--surface-2)",
  },
  {
    icon: <IconChart />,
    title: "Histórico que dura",
    body: "Linha do tempo de cada irmão. Notas, decisões, marcos. Nada se perde quando alguém deixa a equipe.",
    color: "#0891B2",
    background: "#CFFAFE",
  },
];

/**
 * Grid de 6 features (3×2 desktop, 2×3 tablet, 1×6 mobile).
 * As cores são inline porque a paleta de cada card é dinâmica e não
 * justifica criar utilitários Tailwind para cada combinação.
 */
export function FeaturesGrid() {
  return (
    <section
      id="features"
      className="bg-surface px-5 py-20 sm:px-8 sm:py-24 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Funcionalidades</SectionLabel>
          <h2 className="mt-4 text-balance text-[34px] font-extrabold leading-[1.1] tracking-tight5 text-text sm:text-[44px]">
            Tudo que sua equipe de cuidadores precisa.
          </h2>
          <p className="mt-4 text-pretty text-[16px] leading-relaxed tracking-tight2 text-text-2 sm:text-[17px]">
            Construído desde o início para o ritmo real de uma comunidade —
            não é CRM corporativo.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title}>
              <Card
                padding={28}
                className="flex h-full flex-col gap-4"
                style={{ borderRadius: 22 }}
              >
                <div
                  className="grid size-[52px] place-items-center rounded-[14px]"
                  style={{ background: f.background, color: f.color }}
                  aria-hidden="true"
                >
                  {cloneElement(f.icon, { size: 26 })}
                </div>
                <div>
                  <h3 className="text-[18px] font-bold tracking-tight3 text-text">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-pretty text-[14.5px] leading-relaxed tracking-tight2 text-text-2">
                    {f.body}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

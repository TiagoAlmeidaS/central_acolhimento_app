import { StatusPill, StatusDot } from "@/components/domain/assistido/status-pill";
import {
  IconBell,
  IconHome,
  IconCalendar,
  IconMessage,
  IconSettings,
  IconSparkle,
  IconPlus,
  IconClock,
  IconMapPin,
} from "@/components/icons";
import type { StatusKey } from "@/lib/data/status";
import { cn } from "@/lib/utils/cn";

/**
 * Mockups estáticos das telas do app usados no hero/AISection da landing.
 * RSC puro — sem `useState`, sem `useEffect`. Cada tela compõe primitives
 * existentes (`Card`, `StatusPill`, ícones, etc.) para representar fielmente
 * o produto sem importar imagens externas (regra do `landing-agent`).
 */

interface MockAvatarProps {
  initials: string;
  color?: string;
  size?: number;
}

function MockAvatar({
  initials,
  color = "#E2E8F0",
  size = 40,
}: MockAvatarProps) {
  return (
    <span
      className="flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.36,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

interface MockBottomNavProps {
  active?: "home" | "agenda" | "mensagens" | "ajustes";
}

function MockBottomNav({ active = "home" }: MockBottomNavProps) {
  const items: Array<{
    key: NonNullable<MockBottomNavProps["active"]>;
    label: string;
    icon: React.ReactNode;
  }> = [
    { key: "home", label: "Início", icon: <IconHome size={22} /> },
    { key: "agenda", label: "Agenda", icon: <IconCalendar size={22} /> },
    {
      key: "mensagens",
      label: "Mensagens",
      icon: <IconMessage size={22} />,
    },
    { key: "ajustes", label: "Ajustes", icon: <IconSettings size={22} /> },
  ];
  return (
    <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-border bg-surface pb-3.5 pt-2.5">
      {items.map((it) => {
        const isActive = it.key === active;
        return (
          <div
            key={it.key}
            className={cn(
              "flex flex-col items-center gap-0.5 text-[10.5px] font-semibold tracking-tight2",
              isActive ? "text-accent" : "text-text-3",
            )}
          >
            {it.icon}
            <span>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

interface MockAssistido {
  nome: string;
  initials: string;
  cor: string;
  status: StatusKey;
  resumo: string;
}

const ASSISTIDOS: MockAssistido[] = [
  {
    nome: "Carlos Almeida",
    initials: "CA",
    cor: "#2D7FF9",
    status: "urgente",
    resumo: "Internado · UTI · próxima visita amanhã",
  },
  {
    nome: "Lúcia Pereira",
    initials: "LP",
    cor: "#7C3AED",
    status: "acompanhamento",
    resumo: "Visita semanal · família retomou cultos",
  },
  {
    nome: "Pedro Souza",
    initials: "PS",
    cor: "#16A34A",
    status: "aguardando",
    resumo: "Aguarda contato · indicação Ir. Marta",
  },
  {
    nome: "Marta Lima",
    initials: "ML",
    cor: "#EA580C",
    status: "concluido",
    resumo: "Acolhimento finalizado · 6 visitas",
  },
];

/**
 * Tela "Início" mostrando a lista de assistidos da localidade. É a
 * versão estática do que existe em `app/screens-main.jsx`.
 */
export function HomeMockScreen() {
  return (
    <div className="relative h-full overflow-hidden bg-bg">
      <div className="px-[18px] pb-2 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-3">
              Bom dia
            </div>
            <h2 className="mt-0.5 text-[20px] font-extrabold tracking-tight3 text-text">
              Daniel
            </h2>
          </div>
          <div className="relative flex size-9 items-center justify-center rounded-full bg-surface text-text-2 shadow-card">
            <IconBell size={18} />
            <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-status-urgente text-[9px] font-bold text-white">
              3
            </span>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-1.5 py-1 pr-3">
          <span
            className="grid size-5 place-items-center rounded-full text-[9px] font-bold text-white"
            style={{ background: "#2D7FF9" }}
            aria-hidden="true"
          >
            AD
          </span>
          <span className="text-[12px] font-semibold tracking-tight2 text-text">
            Adrianópolis
          </span>
        </div>
      </div>

      <div className="px-[18px] pb-3">
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { label: "Urgentes", value: 3, status: "urgente" as StatusKey },
              {
                label: "Aguardam",
                value: 6,
                status: "aguardando" as StatusKey,
              },
              {
                label: "Ativos",
                value: 18,
                status: "acompanhamento" as StatusKey,
              },
            ] as const
          ).map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl border border-border bg-surface px-2.5 py-2"
            >
              <div className="flex items-center gap-1.5">
                <StatusDot status={kpi.status} size={7} />
                <span className="text-[10px] font-semibold uppercase tracking-tight2 text-text-3">
                  {kpi.label}
                </span>
              </div>
              <div className="mt-0.5 text-[20px] font-extrabold tracking-tight4 text-text">
                {kpi.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 px-[18px] pb-24">
        <div className="flex items-center justify-between text-[12px] font-bold uppercase tracking-tight2 text-text-3">
          <span>Acolhimentos</span>
          <span className="font-semibold normal-case tracking-tight2 text-accent">
            Ver todos
          </span>
        </div>
        {ASSISTIDOS.map((a) => (
          <div
            key={a.nome}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
          >
            <MockAvatar initials={a.initials} color={a.cor} size={42} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[13.5px] font-bold tracking-tight2 text-text">
                  {a.nome}
                </span>
                <StatusPill status={a.status} size="xs" />
              </div>
              <p className="mt-0.5 truncate text-[11.5px] tracking-tight2 text-text-2">
                {a.resumo}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-[78px] right-4 flex size-12 items-center justify-center rounded-full bg-accent text-white shadow-primary">
        <IconPlus size={22} sw={2.4} />
      </div>

      <MockBottomNav active="home" />
    </div>
  );
}

interface MockAgendaItem {
  hora: string;
  titulo: string;
  contexto: string;
  status: StatusKey;
  local?: string;
}

const AGENDA: MockAgendaItem[] = [
  {
    hora: "09:00",
    titulo: "Visita · Carlos Almeida",
    contexto: "Hospital · UTI",
    status: "urgente",
    local: "Av. Djalma Batista, 1719",
  },
  {
    hora: "14:30",
    titulo: "Ligação · Lúcia Pereira",
    contexto: "Acompanhamento semanal",
    status: "acompanhamento",
  },
  {
    hora: "19:00",
    titulo: "Reunião de equipe",
    contexto: "Cuidadores · todos",
    status: "aguardando",
  },
];

/**
 * Tela "Agenda" mostrando compromissos do dia para a equipe.
 */
export function AgendaMockScreen() {
  return (
    <div className="relative h-full overflow-hidden bg-bg">
      <div className="px-[18px] pb-3 pt-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-3">
          Hoje · Terça, 12 mar
        </div>
        <h2 className="mt-1 text-[22px] font-extrabold tracking-tight3 text-text">
          Agenda
        </h2>
      </div>

      <div className="space-y-2.5 px-[18px] pb-24">
        {AGENDA.map((item) => (
          <div
            key={item.hora}
            className="flex gap-3 rounded-2xl border border-border bg-surface p-3.5"
          >
            <div className="flex flex-col items-center pt-0.5">
              <span className="text-[13px] font-extrabold tracking-tight3 text-text">
                {item.hora}
              </span>
              <span className="mt-1 inline-block">
                <StatusDot status={item.status} size={9} />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13.5px] font-bold tracking-tight2 text-text">
                  {item.titulo}
                </span>
                <StatusPill status={item.status} size="xs" />
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11.5px] text-text-2">
                <IconClock size={12} />
                <span>{item.contexto}</span>
              </div>
              {item.local && (
                <div className="mt-1 flex items-center gap-1 text-[11.5px] text-text-3">
                  <IconMapPin size={12} />
                  <span className="truncate">{item.local}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <MockBottomNav active="agenda" />
    </div>
  );
}

interface MockChatBubble {
  from: "user" | "ai" | "system";
  text: string;
}

const CHAT: MockChatBubble[] = [
  {
    from: "user",
    text: "Cadastra o irmão João da Silva, aguardando contato.",
  },
  {
    from: "ai",
    text: "Posso cadastrar João da Silva com status Aguardando em Adrianópolis. Confirma?",
  },
  { from: "system", text: "Cadastro confirmado · status Aguardando" },
  {
    from: "user",
    text: "Quem visitou a Lúcia esta semana?",
  },
  {
    from: "ai",
    text: "A Lúcia recebeu duas visitas: ter (Marta) e sex (Tiago). Quer agendar mais uma?",
  },
];

/**
 * Tela "Mensagens" / chat com o agente IA. Mostra a confirmação que
 * a IA emite antes de tomar ação (princípio "a IA confirma, nunca presume").
 */
export function ChatMockScreen() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-bg">
      <div className="flex items-center gap-3 border-b border-border bg-surface px-[18px] py-3">
        <div
          className="flex size-9 items-center justify-center rounded-full text-white"
          style={{
            background: "linear-gradient(135deg, #2D7FF9 0%, #7C3AED 100%)",
          }}
        >
          <IconSparkle size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-bold tracking-tight2 text-text">
            Agente Acolhe
          </div>
          <div className="text-[11px] text-text-2">
            Conhece a localidade Adrianópolis
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-hidden px-[18px] py-3">
        {CHAT.map((b, i) => {
          if (b.from === "system") {
            return (
              <div
                key={i}
                className="mx-auto inline-flex items-center gap-1.5 rounded-pill bg-accent-bg px-3 py-1 text-[10.5px] font-semibold text-accent"
              >
                <IconSparkle size={11} />
                {b.text}
              </div>
            );
          }
          const isUser = b.from === "user";
          return (
            <div
              key={i}
              className={cn("flex w-full", isUser && "justify-end")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-[12px] leading-snug tracking-tight2",
                  isUser
                    ? "bg-accent text-white"
                    : "border border-border bg-surface text-text",
                )}
              >
                {b.text}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border bg-surface px-[18px] pb-3 pt-2">
        <div className="flex items-center gap-2 rounded-pill border border-border-strong bg-surface-2 px-3 py-2 text-[12px] text-text-3">
          Pergunte algo ao agente…
          <span className="ml-auto inline-flex size-7 items-center justify-center rounded-full bg-accent text-white">
            <IconSparkle size={14} />
          </span>
        </div>
      </div>
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { IconShield, IconLock, IconUsers } from "@/components/icons";
import { SectionLabel } from "./section-label";

interface TenantCardItem {
  sigla: string;
  nome: string;
  cidade: string;
  cor: string;
  membros: number;
  ativos: number;
}

const TENANTS: TenantCardItem[] = [
  {
    sigla: "AD",
    nome: "Adrianópolis",
    cidade: "Manaus, AM",
    cor: "#2D7FF9",
    membros: 12,
    ativos: 38,
  },
  {
    sigla: "VM",
    nome: "Vila Mariana",
    cidade: "São Paulo, SP",
    cor: "#10B981",
    membros: 8,
    ativos: 24,
  },
  {
    sigla: "AL",
    nome: "Aldeota",
    cidade: "Fortaleza, CE",
    cor: "#F59E0B",
    membros: 15,
    ativos: 47,
  },
];

/**
 * Seção "Cada localidade é fechada" — split layout, texto à esquerda
 * e ilustração à direita com três tenant-chips coloridos empilhados,
 * cada um lacrado por um cadeado.
 */
export function TenantSection() {
  return (
    <section id="how" className="bg-bg px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <SectionLabel>Cada localidade é fechada</SectionLabel>
            <h2 className="mt-4 text-balance text-[34px] font-extrabold leading-[1.05] tracking-tight5 text-text sm:text-[42px]">
              Sua comunidade.
              <br />
              <span className="text-text-3">Seus dados. Só seus.</span>
            </h2>
            <p className="mt-5 max-w-[520px] text-pretty text-[16px] leading-relaxed tracking-tight2 text-text-2 sm:text-[17px]">
              No Acolhe, cada localidade é um espaço lacrado. Nenhum cuidador
              de outra igreja, nenhum líder de outra cidade, nenhum servidor
              externo consegue ler ou listar pessoas que não estão sob seu
              cuidado. Tenant é sagrado.
            </p>

            <ul className="mt-7 space-y-3">
              {[
                {
                  icon: <IconShield size={18} />,
                  text: "Banco isolado por localidade — zero compartilhamento entre igrejas",
                },
                {
                  icon: <IconUsers size={18} />,
                  text: "Apenas líderes da localidade aprovam quem entra na equipe",
                },
                {
                  icon: <IconLock size={18} />,
                  text: "Exportações restringidas · LGPD em primeiro lugar",
                },
              ].map((item) => (
                <li
                  key={item.text}
                  className="flex items-start gap-3 text-[14.5px] tracking-tight2 text-text"
                >
                  <span className="mt-0.5 grid size-7 flex-shrink-0 place-items-center rounded-full bg-accent-bg text-accent">
                    {item.icon}
                  </span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="space-y-4">
              {TENANTS.map((t, i) => (
                <Card
                  key={t.nome}
                  padding={20}
                  className="relative flex items-center gap-4"
                  style={{
                    borderRadius: 20,
                    transform: `translateX(${i * 14}px)`,
                  }}
                >
                  <span
                    className="grid size-12 flex-shrink-0 place-items-center rounded-2xl text-[14px] font-extrabold text-white shadow-card"
                    style={{ background: t.cor }}
                    aria-hidden="true"
                  >
                    {t.sigla}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-bold tracking-tight3 text-text">
                        {t.nome}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-pill bg-surface-2 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-tight2 text-text-3">
                        <IconLock size={10} />
                        Lacrada
                      </span>
                    </div>
                    <p className="text-[12.5px] tracking-tight2 text-text-2">
                      {t.cidade}
                    </p>
                    <div className="mt-2 flex gap-3 text-[11.5px] text-text-3">
                      <span>
                        <strong className="font-bold text-text">
                          {t.membros}
                        </strong>{" "}
                        cuidadores
                      </span>
                      <span>
                        <strong className="font-bold text-text">
                          {t.ativos}
                        </strong>{" "}
                        ativos
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-8 -inset-y-8 -z-10 rounded-[40px] opacity-70"
              style={{
                background:
                  "radial-gradient(circle at 60% 50%, rgba(45,127,249,0.12) 0%, transparent 70%)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { IconHeart } from "@/components/icons";

interface FooterColumn {
  title: string;
  links: Array<{ label: string; href: string }>;
}

const COLUMNS: FooterColumn[] = [
  {
    title: "Produto",
    links: [
      { label: "Funcionalidades", href: "#features" },
      { label: "Preços", href: "#pricing" },
      { label: "Agente IA", href: "#features" },
      { label: "Novidades", href: "#" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contato", href: "mailto:contato@acolhe.app" },
      { label: "Imprensa", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "#" },
      { label: "Privacidade", href: "#" },
      { label: "LGPD", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
];

/**
 * Rodapé marketing. Grid de 4 colunas em desktop (marca + 3 listas),
 * colapsa para 1 coluna no mobile.
 */
export function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface px-5 pb-10 pt-14 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2.5"
              aria-label="Acolhe"
            >
              <span className="flex size-8 items-center justify-center rounded-[9px] bg-accent text-white">
                <IconHeart size={17} />
              </span>
              <span className="text-[17px] font-extrabold tracking-tight3 text-text">
                Acolhe
              </span>
            </Link>
            <p className="mt-3.5 max-w-xs text-pretty text-[13.5px] leading-relaxed tracking-tight2 text-text-2">
              Central de acolhimento pastoral para comunidades de fé. Feita no
              Brasil para o ritmo real da igreja local.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-text">
                {col.title}
              </p>
              <ul className="mt-3.5 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[13.5px] tracking-tight2 text-text-2 transition-colors hover:text-accent"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-[12.5px] text-text-3">
          <p>© {year} Acolhe · CNPJ 00.000.000/0001-00</p>
          <p>v0.1 · Manaus, AM</p>
        </div>
      </div>
    </footer>
  );
}

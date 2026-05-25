import Link from "next/link";
import { IconHeart } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";

const NAV_LINKS: Array<[label: string, href: string]> = [
  ["Funcionalidades", "#features"],
  ["Como funciona", "#how"],
  ["Preços", "#pricing"],
  ["Perguntas", "#faq"],
];

/**
 * Header sticky da landing — RSC, sem scroll listener.
 * Usa `backdrop-blur` + fundo semi-transparente para o efeito de
 * leitura ao rolar (em vez do `useEffect` do protótipo).
 */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-bg/70 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="Acolhe · Página inicial"
        >
          <span className="flex size-8 items-center justify-center rounded-[9px] bg-accent text-white">
            <IconHeart size={17} />
          </span>
          <span className="text-[17px] font-extrabold tracking-tight3 text-text">
            Acolhe
          </span>
        </Link>

        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Navegação principal"
        >
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-[14px] font-semibold tracking-tight2 text-text-2 transition-colors hover:text-text"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-[14px] font-semibold tracking-tight2 text-text transition-colors hover:text-accent sm:inline-flex"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ size: "sm", variant: "primary" })}
            aria-label="Criar minha localidade"
          >
            Criar localidade
          </Link>
        </div>
      </div>
    </header>
  );
}

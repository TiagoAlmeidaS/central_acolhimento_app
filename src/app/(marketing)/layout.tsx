import type { ReactNode } from "react";
import { LandingHeader } from "@/components/domain/landing/header";
import { LandingFooter } from "@/components/domain/landing/footer";

/**
 * Layout do route group `(marketing)`.
 *
 * Decisão: optei pela **Opção A** (mover landing pro `(marketing)`),
 * apagando o `src/app/page.tsx` placeholder. Isso isola completamente
 * a marketing das telas autenticadas — futuramente `/sobre`, `/precos`,
 * `/blog` herdam esta moldura sem reescrever header/footer.
 *
 * Diferente do `(auth)` layout, este NÃO restringe a `max-w-phone`:
 * marketing é desktop-first (com mobile-first per-seção), então o
 * limite vem do container interno de cada componente (`max-w-7xl`).
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-text">
      <LandingHeader />
      <main className="flex-1" id="main">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}

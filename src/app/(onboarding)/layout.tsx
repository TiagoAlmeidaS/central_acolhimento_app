import type { ReactNode } from "react";

/**
 * Layout do grupo `(onboarding)` — telas pós-login que precedem a
 * entrada no app principal:
 *
 *  - `/analise` (signup-agent · spec 02): cuidador esperando aprovação.
 *  - `/tenant-setup/*` (tenant-agent · spec 03): líder fundando uma
 *    localidade.
 *
 * É visualmente equivalente ao layout `(auth)`: superfície centralizada
 * com largura máxima `max-w-phone`, sem `BottomNav`. Cada página gerencia
 * o próprio padding e CTAs sticky-bottom.
 *
 * **Coordenação:** este layout é um arquivo **shared infra** entre o
 * `signup-agent` e o `tenant-agent`. Edits aqui são *aditivos* — preserve
 * comportamentos definidos por outros agentes ao mesclar.
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh flex bg-bg text-text">
      <div className="mx-auto w-full max-w-phone flex flex-col min-h-dvh">
        {children}
      </div>
    </main>
  );
}

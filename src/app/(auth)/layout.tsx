import type { ReactNode } from "react";

/**
 * Layout do grupo `(auth)` — login + OTP.
 *
 * Neutro e centralizado: sem `BottomNav`, sem header global. Cada tela
 * controla seu próprio padding interno e CTAs sticky-bottom. Limite
 * `max-w-phone` (440px) garante que em desktop o conteúdo não estique.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh flex bg-bg text-text">
      <div className="mx-auto w-full max-w-phone flex flex-col min-h-dvh">
        {children}
      </div>
    </main>
  );
}

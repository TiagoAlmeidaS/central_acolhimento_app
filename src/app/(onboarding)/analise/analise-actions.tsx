"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, InfoBanner } from "@/components/ui";
import { IconLogout, IconRefresh } from "@/components/icons";
import { signOut } from "@/server/auth.actions";
import { getMyMembershipStatus } from "@/server/membership.actions";

interface AnaliseActionsProps {
  /** Estado inicial vindo do server — evita "flicker" no primeiro render. */
  statusInicial: "pendente" | "ativo" | "recusado" | "sem-membership";
  motivoInicial?: string | null;
}

/**
 * Botões interativos da tela de análise. O server component renderiza o
 * shell estático (ilustração, stepper, copy) e este client gerencia:
 *
 *  - Polling manual via `Verificar Status` (server action `getMyMembershipStatus`).
 *  - Logout via `signOut`.
 *  - Feedback visual (toast/banner) entre tentativas.
 *
 * Mudanças relevantes:
 *  - `ativo` → `router.push('/')`.
 *  - `recusado` → mostra motivo + bloqueia botão Verificar.
 *  - `sem-membership` → trata como erro (usuário caiu aqui sem signup).
 */
export function AnaliseActions({
  statusInicial,
  motivoInicial,
}: AnaliseActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(statusInicial);
  const [motivo, setMotivo] = useState<string | null>(motivoInicial ?? null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isChecking, startCheck] = useTransition();
  const [isLoggingOut, startLogout] = useTransition();

  const handleCheck = () => {
    setFeedback(null);
    startCheck(async () => {
      const result = await getMyMembershipStatus();
      setStatus(result.status);
      setMotivo(result.motivoRecusa ?? null);
      if (result.status === "ativo") {
        router.push("/");
        return;
      }
      if (result.status === "recusado") {
        setFeedback("Cadastro recusado pela liderança.");
        return;
      }
      if (result.status === "sem-membership") {
        router.push("/cadastro");
        return;
      }
      setFeedback("Ainda em análise — você será notificado por WhatsApp.");
    });
  };

  const handleLogout = () => {
    startLogout(async () => {
      await signOut();
      router.push("/login");
    });
  };

  const recusado = status === "recusado";

  return (
    <div className="flex flex-col gap-2.5">
      {recusado && (
        <InfoBanner tone="urgente">
          {motivo
            ? `Sua solicitação foi recusada: ${motivo}`
            : "Sua solicitação foi recusada pela liderança. Fale com o suporte para entender."}
        </InfoBanner>
      )}
      {!recusado && feedback && (
        <InfoBanner tone="warning">{feedback}</InfoBanner>
      )}
      <Button
        variant="primary"
        full
        icon={<IconRefresh />}
        onClick={handleCheck}
        disabled={isChecking || recusado}
        loading={isChecking}
      >
        Verificar Status
      </Button>
      <Button
        variant="secondary"
        full
        icon={<IconLogout />}
        onClick={handleLogout}
        disabled={isLoggingOut}
        loading={isLoggingOut}
      >
        Sair / Logout
      </Button>
    </div>
  );
}

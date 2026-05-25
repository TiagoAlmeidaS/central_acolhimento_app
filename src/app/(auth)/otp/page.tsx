import Link from "next/link";
import { OtpForm } from "./otp-form";
import { maskTelefoneForOtp, normalizeBrPhone } from "@/lib/auth/phone";

/**
 * Tela `/otp` — verificação do código de 6 dígitos.
 *
 * Recebe `?tel=…` (E.164) na query string. Sem `tel`, exibe fallback que
 * manda o usuário de volta ao `/login`. O telefone é validado novamente
 * no server-side (`verifyOtp`) — aqui é só uma comodidade de UX.
 */
export const metadata = {
  title: "Verificar código",
};

interface OtpPageProps {
  searchParams: Promise<{ tel?: string }>;
}

export default async function OtpPage({ searchParams }: OtpPageProps) {
  const { tel } = await searchParams;
  if (!tel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center gap-4">
        <h1 className="text-xl font-bold tracking-tight3">
          Onde está o telefone?
        </h1>
        <p className="text-sm text-text-2 max-w-xs">
          Sua sessão de verificação expirou. Volte ao login para receber um
          novo código.
        </p>
        <Link
          href="/login"
          className="text-accent font-semibold underline underline-offset-4"
        >
          Voltar ao login
        </Link>
      </div>
    );
  }
  const e164 = normalizeBrPhone(tel);
  const ofuscado = maskTelefoneForOtp(e164);

  return <OtpForm telefone={e164} telefoneMasked={ofuscado} />;
}

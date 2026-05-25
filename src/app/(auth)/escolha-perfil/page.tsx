import Link from "next/link";
import { redirect } from "next/navigation";
import { IconArrowLeft, IconChurch, IconUsers } from "@/components/icons";
import { EscolhaPerfilCard } from "@/components/domain/membership";
import { requireUser } from "@/lib/auth";
import { getMyMembershipStatus } from "@/server/membership.actions";

/**
 * Tela `/escolha-perfil` — após login, o usuário escolhe o perfil:
 *  - **Líder** → `/tenant-setup/identidade` (spec 03)
 *  - **Cuidador** → `/cadastro` (spec 02)
 *
 * Conforme `docs/specs/02-cuidador-signup.md` "Cuidador já tem Membership
 * ativo": se o usuário já tem qualquer membership `ativo`, pulamos esta
 * tela e mandamos direto para `/`. Idempotente.
 *
 * Auth: requer sessão — sem ela não tem o que escolher.
 */
export const metadata = {
  title: "Escolha do Perfil",
};

export default async function EscolhaPerfilPage() {
  try {
    await requireUser();
  } catch {
    redirect("/login");
  }

  const status = await getMyMembershipStatus();
  if (status.status === "ativo") redirect("/");
  if (status.status === "pendente") redirect("/analise");

  return (
    <div className="flex flex-col h-dvh bg-bg">
      <div className="px-[18px] pt-2 pb-3.5 flex items-center gap-2">
        <Link
          href="/login"
          aria-label="Voltar ao login"
          className="size-10 rounded-full inline-flex items-center justify-center text-text hover:bg-surface-2 transition-colors"
        >
          <IconArrowLeft />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-7 pb-6 flex flex-col gap-[22px]">
        <div>
          <h1 className="m-0 text-[30px] font-extrabold tracking-tight5 leading-[1.05] text-text">
            Como você vai
            <br />
            <span className="text-accent">usar a Acolhe?</span>
          </h1>
          <p className="mt-3.5 text-[14.5px] leading-[1.55] tracking-tight2 text-text-2 text-pretty">
            Cada localidade é um espaço fechado — escolha como quer entrar.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <EscolhaPerfilCard
            icon={<IconChurch />}
            label="Sou líder de uma localidade"
            hint="Vou criar uma nova localidade e convidar a equipe de cuidadores."
            href="/tenant-setup/identidade"
            featured
          />
          <EscolhaPerfilCard
            icon={<IconUsers />}
            label="Sou cuidador"
            hint="Vou ajudar a acolher irmãos. Aguardo aprovação ou um convite."
            href="/cadastro"
          />
        </div>
      </div>
    </div>
  );
}

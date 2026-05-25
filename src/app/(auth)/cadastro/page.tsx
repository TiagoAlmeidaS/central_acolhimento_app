import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { IconArrowLeft } from "@/components/icons";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { maskBrPhone } from "@/lib/auth/phone";
import { getMyMembershipStatus } from "@/server/membership.actions";
import { CadastroForm } from "./cadastro-form";

/**
 * Tela `/cadastro` — formulário do cuidador (`02-cuidador-signup`).
 *
 * Componente server: faz o gate de auth, busca telefone/nome do usuário
 * para pré-popular o form e delega o restante para `<CadastroForm>`.
 */
export const metadata = {
  title: "Cadastro de Cuidador",
};

export default async function CadastroPage() {
  let auth: { userId: string };
  try {
    auth = await requireUser();
  } catch {
    redirect("/login");
  }

  const status = await getMyMembershipStatus();
  if (status.status === "ativo") redirect("/");
  if (status.status === "pendente") redirect("/analise");

  const rows = await db
    .select({ telefone: users.telefone, nome: users.nome })
    .from(users)
    .where(eq(users.id, auth.userId))
    .limit(1);
  const u = rows[0];

  /**
   * `users.telefone` está em E.164 (`+5592...`); precisamos da máscara
   * brasileira `(92) 99988-7766` para ficar editável no form.
   */
  const telefonePadrao = u?.telefone
    ? maskBrPhone(u.telefone.replace(/^\+55/, ""))
    : "";
  /**
   * Se o `nome` ainda é igual ao telefone (default conservador setado
   * por `verifyOtp` em [01]), tratamos como "vazio" para o usuário
   * preencher de fato.
   */
  const nomePadrao = u?.nome && u.nome !== u.telefone ? u.nome : "";

  return (
    <div className="flex flex-col h-dvh bg-bg">
      <div className="px-[18px] pt-2 pb-3 flex items-center gap-2">
        <Link
          href="/escolha-perfil"
          aria-label="Voltar"
          className="size-10 rounded-full inline-flex items-center justify-center text-text hover:bg-surface-2 transition-colors"
        >
          <IconArrowLeft />
        </Link>
        <h1 className="flex-1 text-center text-[17px] font-bold tracking-tight2 text-text mr-10">
          Cadastro de Cuidador
        </h1>
      </div>
      <CadastroForm telefonePadrao={telefonePadrao} nomePadrao={nomePadrao} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import type { ReactNode } from "react";

import { db } from "@/db";
import { users } from "@/db/schema";
import { readSession } from "@/lib/auth";
import { TenantSetupStoreProvider } from "@/components/domain/tenant/tenant-setup-store-provider";
import { SeedHydratorClient } from "@/components/domain/tenant/seed-hydrator-client";

/**
 * Layout do fluxo `tenant-setup`. Funciona como gate:
 *
 *  - Sem sessão → `/login` (manda voltar pelo `auth-agent`).
 *  - Com sessão → permite prosseguir; o passo 1 lida com nome em branco.
 *
 * Carrega `userId` + `telefone` do DB para que o passo 1 já abra com
 * o telefone autenticado pré-preenchido (e o passo 2 saiba qual número
 * está validando).
 *
 * Não criamos `(onboarding)/layout.tsx` global aqui — o `signup-agent`
 * pode precisar de um próprio para a fila de análise. Cada onboarding
 * mantém seu gate localmente para evitar acoplamento.
 */
export default async function TenantSetupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await readSession();
  if (!session) {
    redirect("/login");
  }

  // Busca telefone real do usuário para pré-preencher o passo 1.
  // Se DB indisponível em dev (sem DATABASE_URL), seguimos sem seed —
  // o passo 1 abre vazio, o que é aceitável.
  let seedNome = "";
  let seedTelefone = "";
  try {
    const rows = await db
      .select({ nome: users.nome, telefone: users.telefone })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);
    const u = rows[0];
    if (u) {
      seedNome = u.nome === u.telefone ? "" : u.nome;
      seedTelefone = u.telefone;
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[tenant-setup/layout] DB indisponível, seguindo sem seed:",
        err,
      );
    }
  }

  return (
    <TenantSetupStoreProvider userId={session.userId}>
      <SeedHydratorClient nome={seedNome} telefone={seedTelefone} />
      <main className="min-h-dvh bg-bg flex flex-col mx-auto w-full max-w-phone">
        {children}
      </main>
    </TenantSetupStoreProvider>
  );
}

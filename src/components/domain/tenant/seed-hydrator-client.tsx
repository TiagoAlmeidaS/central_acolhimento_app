"use client";

import { useEffect, useRef } from "react";
import { useTenantSetupStore } from "./tenant-setup-store-provider";

/**
 * Hidrata o store com `nome`/`telefone` vindos da sessão server-side
 * **apenas na primeira montagem e apenas se a store ainda estiver
 * vazia** — assim o usuário que voltou para refresh-no-meio-do-flow
 * não perde os dados que já tinha digitado.
 *
 * Esse componente não renderiza nada visível; existe para que o layout
 * server consiga hidratar a store client com dados autenticados sem
 * precisar passar por URL search params.
 */
export function SeedHydratorClient({
  nome,
  telefone,
}: {
  nome: string;
  telefone: string;
}) {
  const setLider = useTenantSetupStore((s) => s.setLider);
  const current = useTenantSetupStore((s) => s.lider);
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    // Aplica patches só onde o usuário ainda não digitou nada.
    const patch: Partial<{ nome: string; telefone: string }> = {};
    if (!current.nome && nome) patch.nome = nome;
    if (!current.telefone && telefone) patch.telefone = telefone;
    if (patch.nome || patch.telefone) setLider(patch);
  }, [nome, telefone, current.nome, current.telefone, setLider]);

  return null;
}

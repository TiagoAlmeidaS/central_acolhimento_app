import { redirect } from "next/navigation";

/**
 * `/tenant-setup` cai diretamente no primeiro passo. A persistência
 * Zustand já garante que o usuário vai voltar de onde parou — basta
 * acessar a URL do passo correspondente, que mostramos como link nos
 * convites/emails de retorno.
 */
export default function TenantSetupIndex() {
  redirect("/tenant-setup/identidade");
}

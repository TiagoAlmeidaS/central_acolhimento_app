import Link from "next/link";
import { BrandMark } from "@/components/ui";
import { LoginPhoneForm } from "./phone-form";

/**
 * Tela `/login` — BrandMark + título + CTA WhatsApp expansível.
 *
 * O CTA "Entrar com WhatsApp" expande inline um formulário de telefone
 * (mais um passo mas sem mudar de rota — UX igual ao protótipo, onde
 * Tela 1 + Tela 2 estão no mesmo grupo de auth).
 */
export const metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-dvh px-7">
      <div className="flex-1 flex flex-col items-center justify-center gap-[22px] pt-10 text-center">
        <BrandMark size={86} />
        <div className="max-w-[320px]">
          <h1 className="m-0 text-[30px] font-extrabold tracking-tight5 leading-[1.1] text-text">
            Central de Acolhimento
          </h1>
          <p className="mt-3.5 text-[15.5px] leading-[1.55] text-text-2 tracking-tight2 text-pretty">
            Gerencie e cuide dos irmãos assistidos com amor e eficiência.
          </p>
        </div>
      </div>

      <div className="pb-7 flex flex-col gap-[18px] items-center">
        <LoginPhoneForm />
        <Link
          href="/escolha-perfil"
          className="bg-transparent border-0 p-1 text-accent text-[15px] font-bold tracking-tight2 hover:underline underline-offset-4"
        >
          Cadastre-se aqui
        </Link>
        <div className="h-px bg-border self-stretch" />
        <p className="text-[11.5px] text-text-3 leading-[1.5] tracking-tight2 max-w-[320px] text-center">
          Ao entrar, você concorda com nossos{" "}
          <span className="underline">Termos de Uso</span> e{" "}
          <span className="underline">Política de Privacidade</span>
        </p>
      </div>
    </div>
  );
}

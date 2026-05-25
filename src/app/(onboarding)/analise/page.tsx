import { redirect } from "next/navigation";
import {
  Button,
  Card,
  IconButton,
  InfoBanner,
  StatusStepper,
} from "@/components/ui";
import {
  IconArrowRight,
  IconCheck,
  IconHelpCircle,
  IconHourglass,
  IconLock,
  IconUsersFilled,
} from "@/components/icons";
import { requireUser } from "@/lib/auth";
import { getMyMembershipStatus } from "@/server/membership.actions";
import { AnaliseActions } from "./analise-actions";

/**
 * Tela `/analise` — espera de aprovação pelo líder.
 *
 * Replica o `AnaliseScreen` do protótipo
 * (`docs/_prototype/app/screens-onboarding.jsx`). O server component faz
 * o gate (auth + redireciona se já está aprovado) e desenha o shell
 * estático; um client component (`<AnaliseActions>`) cuida da interação
 * de polling + logout.
 */
export const metadata = {
  title: "Cadastro em Análise",
};

export default async function AnalisePage() {
  try {
    await requireUser();
  } catch {
    redirect("/login");
  }

  const status = await getMyMembershipStatus();
  if (status.status === "ativo") redirect("/");
  if (status.status === "sem-membership") redirect("/cadastro");

  const steps = [
    { label: "Enviado", icon: <IconCheck /> },
    { label: "Análise", icon: <IconHourglass /> },
    { label: "Acesso", icon: <IconLock /> },
  ];

  return (
    <div className="flex flex-col h-dvh bg-bg">
      <div className="px-[22px] pt-2 pb-4 flex items-center gap-3">
        <div
          className="size-10 rounded-[12px] bg-accent-bg text-accent flex items-center justify-center"
          aria-hidden="true"
        >
          <IconUsersFilled size={22} />
        </div>
        <h1 className="flex-1 m-0 text-[17px] font-bold tracking-tight2 text-text">
          Central de Acolhimento
        </h1>
        <IconButton
          variant="soft"
          size="md"
          icon={<IconHelpCircle />}
          aria-label="Ajuda"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-[22px] pb-[22px] flex flex-col gap-[22px]">
        <div
          className="h-[220px] rounded-[24px] flex items-center justify-center relative overflow-hidden"
          style={{ background: "#FED7AA" }}
          aria-hidden="true"
        >
          <div
            className="w-[130px] h-[150px] bg-white rounded-[12px] p-5 flex flex-col gap-2.5 justify-start"
            style={{
              boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
              transform: "rotate(-4deg)",
            }}
          >
            {[60, 80, 50, 70, 40].map((w, i) => (
              <div
                key={i}
                className="h-[5px] rounded-full"
                style={{ width: `${w}%`, background: "#E2E8F0" }}
              />
            ))}
            <div
              className="mt-auto self-end w-[18px] h-[22px]"
              style={{
                background: "#FCA5A5",
                clipPath:
                  "polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)",
              }}
            />
          </div>
          <div
            className="absolute size-[78px] rounded-full border-[7px]"
            style={{
              left: "35%",
              top: "50%",
              transform: "translate(-50%, -30%)",
              borderColor: "#0F172A",
              background: "rgba(255,255,255,0.12)",
            }}
          />
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "74%",
              width: "38px",
              height: "7px",
              background: "#0F172A",
              borderRadius: "4px",
              transform: "rotate(40deg)",
            }}
          />
        </div>

        <div>
          <h2 className="m-0 mb-2.5 text-[24px] font-extrabold tracking-tight3 leading-[1.15] text-center text-text">
            Cadastro em Análise
          </h2>
          <p className="m-0 text-[14.5px] leading-[1.55] tracking-tight2 text-text-2 text-center text-pretty">
            Sua solicitação foi recebida. Para garantir a segurança dos irmãos
            assistidos, a liderança está validando seu perfil.
          </p>
        </div>

        <div className="py-1">
          <StatusStepper steps={steps} current={1} />
        </div>

        <InfoBanner>
          Este processo geralmente leva até{" "}
          <span className="text-accent font-bold">24 horas</span>. Você receberá
          uma notificação assim que seu acesso for liberado.
        </InfoBanner>

        <AnaliseActions
          statusInicial={status.status}
          motivoInicial={status.motivoRecusa ?? null}
        />

        <Card className="text-center">
          <div className="text-[14.5px] font-bold tracking-tight2 text-text mb-1">
            Precisa de ajuda urgente?
          </div>
          <div className="text-[13px] leading-[1.5] tracking-tight2 text-text-2 mb-3">
            Fale com a liderança da sua localidade para agilizar o processo.
          </div>
          <Button variant="link" iconRight={<IconArrowRight />} size="md">
            Falar com o Suporte
          </Button>
        </Card>
      </div>
    </div>
  );
}

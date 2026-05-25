import { IconCheck } from "@/components/icons";

export interface WelcomeHeroProps {
  sigla: string;
  cor: string;
  /** Primeiro nome do líder (ex: "Daniel"). */
  primeiroNome: string;
  /** Nome da localidade. */
  localidadeNome: string;
  /** Cidade + UF formatados. */
  cidadeUf: string;
}

/**
 * Hero da tela "Bem-vindo, líder" — mostra o avatar grande da
 * localidade com selo verde de check e mensagem de sucesso.
 *
 * Replica o topo de `TenantBemVindoScreen` (protótipo). Mantida
 * desacoplada da Card de "Primeiros passos" para que outras telas
 * (ex.: `convite-aceito`) possam reutilizar só o hero.
 */
export function WelcomeHero({
  sigla,
  cor,
  primeiroNome,
  localidadeNome,
  cidadeUf,
}: WelcomeHeroProps) {
  return (
    <div className="flex flex-col items-center text-center gap-5">
      <div
        className="relative flex items-center justify-center text-white font-bold tracking-tight4"
        style={{
          width: 110,
          height: 110,
          borderRadius: 30,
          background: `linear-gradient(135deg, ${cor} 0%, ${cor}cc 100%)`,
          boxShadow: `0 18px 36px ${cor}50`,
          fontSize: 38,
        }}
      >
        {sigla.toLocaleUpperCase("pt-BR").slice(0, 3) || "?"}
        <span
          className="absolute -right-2 -top-2 flex items-center justify-center rounded-full text-white"
          style={{
            width: 38,
            height: 38,
            background: "#22C55E",
            border: "3px solid var(--bg)",
            boxShadow: "0 4px 8px rgba(34,197,94,0.4)",
          }}
          aria-hidden="true"
        >
          <IconCheck size={20} sw={3} />
        </span>
      </div>
      <div>
        <h1 className="m-0 text-[28px] font-bold tracking-tight5 text-text leading-[1.1]">
          Pronto, {primeiroNome}!
          <br />
          <span style={{ color: cor }}>
            Comunidade {localidadeNome} criada.
          </span>
        </h1>
        <p className="mt-3.5 text-[14.5px] text-text-2 leading-relaxed tracking-tight2">
          Sua localidade está ativa em{" "}
          <span className="text-text font-bold">{cidadeUf}</span>. Agora vamos
          preparar a equipe?
        </p>
      </div>
    </div>
  );
}

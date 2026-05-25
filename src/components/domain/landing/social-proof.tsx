const COMUNIDADES = [
  "Adrianópolis · AM",
  "Vila Mariana · SP",
  "Aldeota · CE",
  "Batel · PR",
  "Pituba · BA",
  "Boa Viagem · PE",
];

/**
 * Faixa "comunidades em todo o Brasil já confiam" — réplica do
 * `SocialProof` do protótipo, agora como RSC pura.
 */
export function SocialProof() {
  return (
    <section
      aria-label="Comunidades que confiam na Acolhe"
      className="border-y border-border bg-surface px-5 py-10 sm:px-8"
    >
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-text-3">
          Comunidades em todo o Brasil já confiam
        </p>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
          {COMUNIDADES.map((c) => (
            <li
              key={c}
              className="text-[14px] font-bold tracking-tight2 text-text-2 sm:text-[15px]"
            >
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

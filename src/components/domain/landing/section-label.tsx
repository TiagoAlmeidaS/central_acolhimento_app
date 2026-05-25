import type { ReactNode } from "react";

export interface SectionLabelProps {
  children: ReactNode;
}

/**
 * Pílula curta usada acima dos `<h2>` de cada seção do marketing.
 * Replica `SectionLabel` de `docs/_prototype/app/landing.jsx`.
 */
export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-pill bg-accent-bg px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-accent">
      <span
        aria-hidden="true"
        className="inline-block size-1.5 rounded-full bg-accent"
      />
      {children}
    </span>
  );
}

import { cn } from "@/lib/utils/cn";

export interface BrandMarkProps {
  size?: number;
  /** Cor de fundo do quadrado arredondado. */
  bg?: string;
  /** Cor do coração (acento). */
  fg?: string;
  className?: string;
}

/**
 * Marca do app — coração com selo de check, usado no splash, login
 * e outras telas de onboarding. Equivalente ao `BrandMark` do protótipo.
 */
export function BrandMark({
  size = 72,
  bg = "#E8F1FE",
  fg = "#2D7FF9",
  className,
}: BrandMarkProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center shadow-primary",
        className,
      )}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: bg,
      }}
      role="img"
      aria-label="Acolhe"
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill="none"
        stroke={fg}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 21s-7-4.5-9.5-9.2A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5.8C19 16.5 12 21 12 21z" />
      </svg>
      <div
        className="absolute flex items-center justify-center rounded-full text-white"
        style={{
          right: -size * 0.08,
          top: -size * 0.06,
          width: size * 0.32,
          height: size * 0.32,
          background: fg,
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        }}
        aria-hidden="true"
      >
        <svg
          width={size * 0.18}
          height={size * 0.18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12l5 5L20 6" />
        </svg>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils/cn";

export interface StatusBarProps {
  /** Força contraste branco — usado dentro do PhoneFrame escuro. */
  dark?: boolean;
  className?: string;
}

/**
 * Mock do notch do iPhone — usado apenas dentro do `PhoneFrame` no
 * playground/QA. NÃO renderizar em produção (não é status bar real).
 */
export function StatusBar({ dark = false, className }: StatusBarProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-center justify-between flex-shrink-0",
        "h-[50px] px-7 font-bold text-[15px] tracking-tight2",
        dark ? "text-white" : "text-[#0F172A]",
        className,
      )}
    >
      <span className="pt-3.5">9:41</span>
      <div className="pt-3.5 flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 17 11">
          <rect x="0" y="7" width="3" height="4" rx="0.5" fill="currentColor" />
          <rect x="4.5" y="5" width="3" height="6" rx="0.5" fill="currentColor" />
          <rect x="9" y="3" width="3" height="8" rx="0.5" fill="currentColor" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="currentColor" />
        </svg>
        <svg width="24" height="11" viewBox="0 0 24 11">
          <rect
            x="0.5"
            y="0.5"
            width="20"
            height="10"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.4"
          />
          <rect x="2" y="2" width="17" height="7" rx="1.5" fill="currentColor" />
          <rect
            x="21.5"
            y="3.5"
            width="1.5"
            height="4"
            rx="0.7"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}

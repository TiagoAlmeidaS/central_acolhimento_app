import { Fragment, type ReactElement, cloneElement } from "react";
import { cn } from "@/lib/utils/cn";

export interface StatusStepperStep {
  label: string;
  icon: ReactElement<{ size?: number }>;
}

export interface StatusStepperProps {
  steps: StatusStepperStep[];
  /** Índice (0-based) do passo atual. */
  current: number;
  className?: string;
}

/**
 * Mostra o progresso de um onboarding multistep (ex.: análise do cuidador).
 * Cada passo tem três estados: feito (verde), atual (azul com halo) e
 * futuro (cinza outlined). Conectores entre passos refletem o progresso.
 */
export function StatusStepper({ steps, current, className }: StatusStepperProps) {
  return (
    <ol
      className={cn(
        "flex items-start justify-between gap-1 px-2",
        className,
      )}
      aria-label="Progresso"
    >
      {steps.map((step, i) => {
        const isCurrent = i === current;
        const isDone = i < current;
        const isFuture = i > current;
        return (
          <Fragment key={step.label}>
            <li className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[60px]">
              <div
                className={cn(
                  "size-11 rounded-full flex items-center justify-center text-white",
                  isDone && "bg-[#22C55E]",
                  isCurrent && "bg-accent shadow-[0_0_0_6px_rgba(45,127,249,0.12)]",
                  isFuture && "bg-surface-2 text-text-3 border-[1.5px] border-border-strong",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {cloneElement(step.icon, { size: 20 })}
              </div>
              <span
                className={cn(
                  "text-[10.5px] font-bold uppercase tracking-[0.05em] text-center",
                  isCurrent && "text-accent",
                  isDone && "text-text",
                  isFuture && "text-text-3",
                )}
              >
                {step.label}
              </span>
            </li>
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "flex-1 h-[2px] mt-[21px] rounded-full",
                  i < current ? "bg-[#22C55E]" : "bg-border",
                )}
              />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}

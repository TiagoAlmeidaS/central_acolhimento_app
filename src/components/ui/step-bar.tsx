import { cn } from "@/lib/utils/cn";
import { IconButton } from "./icon-button";
import { IconArrowLeft } from "@/components/icons";

export interface StepBarProps {
  /** Passo atual (1-based para o label, 0-based interno). */
  current: number;
  total: number;
  onBack?: () => void;
  onSkip?: () => void;
  /** Texto do botão "pular" — default "Pular". Esconde se vazio. */
  skipLabel?: string;
  className?: string;
}

/**
 * Cabeçalho de fluxo multistep com voltar + barra de progresso + pular.
 * Usado em tenant-setup, signup, cadastro de assistido.
 */
export function StepBar({
  current,
  total,
  onBack,
  onSkip,
  skipLabel = "Pular",
  className,
}: StepBarProps) {
  const safeCurrent = Math.max(1, Math.min(current, total));
  const progress = (safeCurrent / total) * 100;
  return (
    <div
      className={cn("flex items-center gap-3 px-[22px] py-3", className)}
      role="navigation"
      aria-label={`Passo ${safeCurrent} de ${total}`}
    >
      {onBack && (
        <IconButton
          variant="flat"
          size="md"
          icon={<IconArrowLeft />}
          aria-label="Voltar"
          onClick={onBack}
          className="-ml-2"
        />
      )}
      <div className="flex-1 h-[5px] rounded-full bg-surface-2 overflow-hidden">
        <div
          className="h-full bg-accent transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-[12px] font-semibold text-text-2 tracking-tight2">
        {safeCurrent}/{total}
      </span>
      {onSkip && skipLabel && (
        <button
          type="button"
          onClick={onSkip}
          className="text-[13px] font-semibold text-accent tracking-tight2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
        >
          {skipLabel}
        </button>
      )}
    </div>
  );
}

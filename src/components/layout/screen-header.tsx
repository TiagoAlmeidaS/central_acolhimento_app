import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { IconButton } from "@/components/ui/icon-button";
import { IconArrowLeft } from "@/components/icons";
import { TenantChip } from "@/components/domain/tenant/tenant-chip";

export interface ScreenHeaderProps {
  title: string;
  /** Quando informado, mostra o `<TenantChip>` abaixo do título. */
  tenantId?: string | null;
  /** Slot à direita — tipicamente um `<IconButton>` ou `<Avatar>`. */
  right?: ReactNode;
  /** Mostra botão voltar à esquerda do título. */
  back?: boolean;
  onBack?: () => void;
  /** Reduz o padding superior em telas com `StatusBar` mockado acima. */
  lift?: boolean;
  className?: string;
}

/**
 * Cabeçalho padrão das telas autenticadas. Mantém o título e o
 * indicador de localidade visíveis enquanto o conteúdo rola.
 */
export function ScreenHeader({
  title,
  tenantId,
  right,
  back,
  onBack,
  lift = true,
  className,
}: ScreenHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center gap-3 bg-bg",
        lift ? "pt-1 px-[22px] pb-3.5" : "px-[22px] pb-3.5",
        className,
      )}
    >
      {back && (
        <IconButton
          variant="flat"
          size="lg"
          icon={<IconArrowLeft />}
          aria-label="Voltar"
          onClick={onBack}
          className="-ml-2"
        />
      )}
      <div className="flex-1 min-w-0">
        <h1 className="m-0 text-[22px] font-bold tracking-tight3 text-text leading-[1.15]">
          {title}
        </h1>
        {tenantId && (
          <div className="mt-1.5">
            <TenantChip tenantId={tenantId} size="sm" />
          </div>
        )}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </header>
  );
}

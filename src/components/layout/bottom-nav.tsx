"use client";

import { cloneElement, type ReactElement } from "react";
import { cn } from "@/lib/utils/cn";
import {
  IconHome,
  IconCalendar,
  IconMessage,
  IconSettings,
  IconChart,
} from "@/components/icons";

export type BottomNavTab = "home" | "agenda" | "mensagens" | "ajustes";
export type BottomNavRole = "cuidador" | "lider";

export interface BottomNavProps {
  tab: BottomNavTab;
  onTab: (tab: BottomNavTab) => void;
  role?: BottomNavRole;
  /** Badge no item urgente — número de notificações no Painel/Início. */
  urgentBadge?: number;
  className?: string;
}

interface NavItem {
  key: BottomNavTab;
  label: string;
  icon: ReactElement<{ size?: number; sw?: number }>;
  badge?: number;
}

/**
 * Barra fixa de navegação inferior, 4 abas, com safe-area iOS.
 * A primeira aba muda conforme o papel: Cuidador vê "Início" (ícone home);
 * Líder vê "Painel" (ícone chart) — sai direto para o dashboard.
 */
export function BottomNav({
  tab,
  onTab,
  role = "cuidador",
  urgentBadge,
  className,
}: BottomNavProps) {
  const firstTab: NavItem =
    role === "lider"
      ? {
          key: "home",
          label: "Painel",
          icon: <IconChart />,
          badge: urgentBadge,
        }
      : {
          key: "home",
          label: "Início",
          icon: <IconHome />,
          badge: urgentBadge,
        };

  const items: NavItem[] = [
    firstTab,
    { key: "agenda", label: "Agenda", icon: <IconCalendar /> },
    { key: "mensagens", label: "Mensagens", icon: <IconMessage /> },
    { key: "ajustes", label: "Ajustes", icon: <IconSettings /> },
  ];

  return (
    <nav
      role="tablist"
      aria-label="Navegação principal"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30",
        "pt-2.5 pb-[max(28px,env(safe-area-inset-bottom))]",
        "bg-surface border-t border-border",
        "flex justify-around",
        "mx-auto max-w-phone",
        className,
      )}
    >
      {items.map((it) => {
        const active = tab === it.key;
        return (
          <button
            key={it.key}
            role="tab"
            type="button"
            aria-selected={active}
            aria-label={it.label}
            onClick={() => onTab(it.key)}
            className={cn(
              "relative flex-1 flex flex-col items-center gap-1 py-1",
              "text-[11.5px] font-semibold tracking-tight2 font-sans bg-transparent",
              "transition-colors duration-120 min-h-11",
              active ? "text-accent" : "text-text-3",
            )}
          >
            {cloneElement(it.icon, { size: 24, sw: active ? 2.2 : 1.8 })}
            <span>{it.label}</span>
            {it.badge !== undefined && it.badge > 0 && (
              <span
                aria-label={`${it.badge} novos`}
                className="absolute top-0 right-1/4 min-w-[18px] h-[18px] px-1 rounded-full bg-status-urgente text-white text-[10px] font-bold flex items-center justify-center"
              >
                {it.badge > 9 ? "9+" : it.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

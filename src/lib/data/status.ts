/**
 * Catálogo de status de assistido — fonte da verdade visual.
 * Replicado de `app/data.jsx` (protótipo UMD).
 * Quando 05-assistidos persistir no banco, este dicionário continua
 * sendo a referência de label/cor; só o storage muda.
 */

export const STATUS_KEYS = [
  "urgente",
  "aguardando",
  "acompanhamento",
  "concluido",
] as const;

export type StatusKey = (typeof STATUS_KEYS)[number];

export interface StatusDef {
  key: StatusKey;
  label: string;
  shortLabel?: string;
  fg: string;
  bg: string;
  dot: string;
}

export const STATUS: Record<StatusKey, StatusDef> = {
  urgente: {
    key: "urgente",
    label: "Urgente",
    fg: "#E11D48",
    bg: "#FFE4E6",
    dot: "#E11D48",
  },
  aguardando: {
    key: "aguardando",
    label: "Aguardando",
    fg: "#C2410C",
    bg: "#FFEDD5",
    dot: "#EA580C",
  },
  acompanhamento: {
    key: "acompanhamento",
    label: "Em Acompanhamento",
    shortLabel: "Acompanhando",
    fg: "#1D4ED8",
    bg: "#DBEAFE",
    dot: "#2563EB",
  },
  concluido: {
    key: "concluido",
    label: "Concluído",
    fg: "#15803D",
    bg: "#DCFCE7",
    dot: "#16A34A",
  },
};

export const STATUS_ORDER: readonly StatusKey[] = STATUS_KEYS;

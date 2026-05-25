import { IconSvg, type IconBaseProps } from "./base";

/**
 * Conjunto de ícones em traço (stroke 1.8 padrão) — 24×24 viewBox,
 * `currentColor` por default para herdar a cor do contexto.
 * Portado de `app/icons.jsx` com API equivalente.
 */

export const IconArrowLeft = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </IconSvg>
);

export const IconArrowRight = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </IconSvg>
);

export const IconChevronRight = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="m9 6 6 6-6 6" />
  </IconSvg>
);

export const IconChevronDown = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="m6 9 6 6 6-6" />
  </IconSvg>
);

export const IconPlus = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M12 5v14M5 12h14" />
  </IconSvg>
);

export const IconX = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </IconSvg>
);

export const IconCheck = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M5 12l5 5L20 6" />
  </IconSvg>
);

export const IconSearch = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </IconSvg>
);

export const IconHome = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
  </IconSvg>
);

export const IconCalendar = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </IconSvg>
);

export const IconMessage = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M21 12a8 8 0 0 1-12 7l-5 1 1-5a8 8 0 1 1 16-3z" />
  </IconSvg>
);

export const IconSettings = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </IconSvg>
);

export const IconUser = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </IconSvg>
);

export const IconUsers = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 21a6 6 0 0 1 12 0" />
    <circle cx="17" cy="10" r="2.5" />
    <path d="M15 21a5 5 0 0 1 6.5-4.8" />
  </IconSvg>
);

export const IconPhone = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9z" />
  </IconSvg>
);

export const IconChurch = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M12 2v4M10 4h4" />
    <path d="M12 6 5 11v10h14V11z" />
    <path d="M9 21v-5h6v5" />
  </IconSvg>
);

export const IconLock = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </IconSvg>
);

export const IconHourglass = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M6 2h12M6 22h12" />
    <path d="M6 2v4l6 6-6 6v4M18 2v4l-6 6 6 6v4" />
  </IconSvg>
);

export const IconRefresh = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
  </IconSvg>
);

export const IconLogout = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 17l-5-5 5-5M5 12h11" />
  </IconSvg>
);

export const IconHelpCircle = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 4M12 17h.01" />
  </IconSvg>
);

export const IconShield = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
  </IconSvg>
);

export const IconWhatsapp = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M20.5 12a8.5 8.5 0 1 1-15.6 4.7L3.5 20l3.4-1.3A8.5 8.5 0 0 0 20.5 12z" />
    <path
      d="M9 9.5c0 2.5 3 5.5 5.5 5.5l1.5-1.3-1.8-1-1 .7c-1-.4-1.8-1.2-2.2-2.2l.7-1-1-1.8L9 9.5z"
      fill="currentColor"
      stroke="none"
    />
  </IconSvg>
);

export const IconMore = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </IconSvg>
);

export const IconMapPin = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="2.5" />
  </IconSvg>
);

export const IconVideo = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <rect x="3" y="6" width="14" height="12" rx="2" />
    <path d="m21 8-4 4 4 4z" />
  </IconSvg>
);

export const IconClock = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </IconSvg>
);

export const IconHeart = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M12 21s-7-4.5-9.5-9.2A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5.8C19 16.5 12 21 12 21z" />
  </IconSvg>
);

export const IconSparkle = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M19 16l.7 2 2 .7-2 .7L19 22l-.7-2.6-2-.7 2-.7z" />
  </IconSvg>
);

export const IconSwap = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M16 3l4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16" />
  </IconSvg>
);

export const IconBell = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9z" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </IconSvg>
);

export const IconSend = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </IconSvg>
);

export const IconMic = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </IconSvg>
);

export const IconDoc = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </IconSvg>
);

export const IconChart = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <rect x="7" y="11" width="3" height="6" rx="0.5" />
    <rect x="12" y="8" width="3" height="9" rx="0.5" />
    <rect x="17" y="13" width="3" height="4" rx="0.5" />
  </IconSvg>
);

export const IconFilter = (p: IconBaseProps) => (
  <IconSvg {...p}>
    <path d="M3 5h18M6 12h12M10 19h4" />
  </IconSvg>
);

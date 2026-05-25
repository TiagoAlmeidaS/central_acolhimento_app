---
title: Design System · Acolhe
kind: ArchitectureNote
owner: design-acolhe
status: stable
updated: 2026-05-25
---

# Design System

Fonte original dos tokens: `Central Acolhimento.html` (CSS variables `--bg`, `--accent`…) e `app/ui.jsx` (componentes React UMD).

A migração para Next.js mantém **100% dos tokens visuais**; só muda a tecnologia (CSS vars + Tailwind + classes utilitárias).

---

## 1. Tipografia

| Token | Valor |
|---|---|
| `--font-sans` | `'Plus Jakarta Sans', system-ui, sans-serif` |
| Pesos usados | 400, 500, 600, 700, 800 |

Importar via `next/font/google` no `app/layout.tsx`:

```tsx
import { Plus_Jakarta_Sans } from 'next/font/google';
const sans = Plus_Jakarta_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });
```

Letter-spacing reduzido (`-0.02em` a `-0.035em`) em headings — característica visual já presente no protótipo, replicar em `tailwind.config.ts`.

---

## 2. Tokens de cor

### Tema claro

```css
--bg: #F5F5F7;
--surface: #FFFFFF;
--surface-2: #F8F9FB;
--border: #E8EAEE;
--border-strong: #D5D9E0;

--text: #0F172A;
--text-2: #4B5563;
--text-3: #94A3B8;

--accent: #2D7FF9;
--accent-strong: #1F6BE0;
--accent-bg: #E8F1FE;

--shadow-card: 0 1px 2px rgba(15,23,42,0.04), 0 1px 0 rgba(15,23,42,0.02);
```

### Tema escuro

```css
--bg: #0B1220;
--surface: #131A2A;
--surface-2: #1B2336;
--border: #232C42;
--border-strong: #344058;

--text: #F1F5F9;
--text-2: #94A3B8;
--text-3: #64748B;

--accent: #60A5FA;
--accent-strong: #3B82F6;
--accent-bg: rgba(96,165,250,0.14);

--shadow-card: 0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.25);
```

### Cores funcionais (status)

Vindas de `app/data.jsx`:

| Status | Fg | Bg | Dot |
|---|---|---|---|
| Urgente | `#E11D48` | `#FFE4E6` | `#E11D48` |
| Aguardando | `#C2410C` | `#FFEDD5` | `#EA580C` |
| Acompanhamento | `#1D4ED8` | `#DBEAFE` | `#2563EB` |
| Concluído | `#15803D` | `#DCFCE7` | `#16A34A` |

### Cores de localidade

8 opções fixas (perpetuadas no protótipo `TENANT_COLORS`):

`#2D7FF9` · `#7C3AED` · `#10B981` · `#F59E0B` · `#EC4899` · `#06B6D4` · `#EF4444` · `#0F172A`

---

## 3. Tailwind config

```ts
// tailwind.config.ts (resumo)
export default {
  darkMode: ['class'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-sans)', 'system-ui'] },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        text: { DEFAULT: 'var(--text)', 2: 'var(--text-2)', 3: 'var(--text-3)' },
        accent: { DEFAULT: 'var(--accent)', strong: 'var(--accent-strong)', bg: 'var(--accent-bg)' },
        status: {
          urgente: { DEFAULT: '#E11D48', bg: '#FFE4E6' },
          aguardando: { DEFAULT: '#C2410C', bg: '#FFEDD5' },
          acompanhamento: { DEFAULT: '#1D4ED8', bg: '#DBEAFE' },
          concluido: { DEFAULT: '#15803D', bg: '#DCFCE7' },
        },
      },
      borderRadius: { card: '18px', pill: '999px' },
      boxShadow: { card: 'var(--shadow-card)' },
      letterSpacing: { tight2: '-0.02em', tight3: '-0.025em', tight4: '-0.03em' },
    },
  },
};
```

---

## 4. Componentes base (spec [00-foundations])

Equivalência protótipo → Next.js:

| Protótipo (`app/ui.jsx`) | Next.js component | Path proposto |
|---|---|---|
| `Button` (variants `primary`, `secondary`, `whatsapp`, `ghost`, `link`) | `<Button>` | `components/ui/button.tsx` |
| `IconBtn` | `<IconButton>` | `components/ui/icon-button.tsx` |
| `Input`, `Textarea`, `Select`, `SearchInput` | shadcn-like inputs | `components/ui/input*.tsx` |
| `Card` | `<Card>` | `components/ui/card.tsx` |
| `Avatar` (com `online`, `name`, `src`) | `<Avatar>` | `components/ui/avatar.tsx` |
| `StatusPill` | `<StatusPill>` | `components/domain/assistido/status-pill.tsx` |
| `TenantChip` | `<TenantChip>` | `components/domain/tenant/tenant-chip.tsx` |
| `BrandMark` | `<BrandMark>` | `components/ui/brand-mark.tsx` |
| `BottomNav` | `<BottomNav>` (Client) | `components/layout/bottom-nav.tsx` |
| `StatusBar` (phone notch) | `<StatusBar>` (dev-only) | `components/layout/status-bar.tsx` |
| `PhoneFrame` | `<PhoneFrame>` (dev/QA) | `components/layout/phone-frame.tsx` |
| `ScreenHeader` | `<ScreenHeader>` | `components/layout/screen-header.tsx` |
| `InfoBanner` | `<InfoBanner>` | `components/ui/info-banner.tsx` |
| `StatusStepper` | `<StatusStepper>` | `components/ui/status-stepper.tsx` |
| `StepBar` | `<StepBar>` | `components/ui/step-bar.tsx` |
| Ícones (`app/icons.jsx`) | `<Icon*>` | `components/icons/*.tsx` |

---

## 5. Ícones

- Stroke style, 24×24 box, stroke-width 1.8 padrão (override por prop `sw`).
- Set já existe em `app/icons.jsx`: `IconArrowLeft`, `IconUser`, `IconPhone`, `IconChurch`, `IconCheck`, `IconLock`, `IconHourglass`, `IconRefresh`, `IconLogout`, `IconUsersFilled`, `IconUsers`, `IconHelpCircle`, `IconShield`, `IconWhatsappFilled`, `IconWhatsapp`, `IconMore`, `IconPlus`, `IconX`, `IconChevronRight`, `IconChevronDown`, `IconMapPin`, `IconCalendar`, `IconVideo`, `IconClock`, `IconHeart`, `IconSparkle`, `IconSwap`, `IconBell`, `IconSend`, `IconMic`, `IconDoc`, `IconArrowRight`, `IconVerified`.
- Migração: exportar como React components em `components/icons/`. Manter API `size` + `sw` + `color`.

---

## 6. Tokens de espaçamento

- Padding lateral padrão: **18 px** (cards) / **22 px** (telas com title).
- Gap vertical entre seções: **18–22 px**.
- Border-radius:
  - Cards: 18
  - Botões: 12 (sm) / 14 (md) / 16 (lg)
  - Pílulas: 999
  - Avatares: circle ou 14 (squircle).

---

## 7. Animações

- Transições de 120–150 ms ease-in-out (matching protótipo).
- Skeleton: pulsar com 1.2 s.
- Loading do chat IA: 3 dots em sequência 1.2 s (animation `chatDot`).

---

## 8. Acessibilidade

- Contraste mínimo AA em todas as combinações fg/bg em ambos os temas.
- Foco visível (`focus-visible`) em todos os interactivos com `outline 2px var(--accent)`.
- `prefers-reduced-motion`: desativar transições não-essenciais.
- Áreas touchable mínimas 44×44.
- Labels associadas a inputs (atributo `htmlFor`).
- `aria-live="polite"` em erros de form e toasts.
- Idioma `pt-BR` no `<html lang>`.

---

## 9. Dark mode

Toggle persistente em `localStorage('acolhe.theme')` + `class="dark"` no `<html>` (Tailwind dark variant). Default = system preference.

A spec [11-settings] possui o toggle UI.

---

## 10. Princípios

- **Densidade de informação alta**, mas com respiro.
- **Hierarquia por peso**, não por tamanho (700–800 vs 500–600).
- **Cores funcionais para sinalizar**, neutras para dominar.
- **Dark mode é cidadão de primeira classe**, não afterthought.
- **Componentes não tomam decisão de layout** — wrappers se encarregam.

---

*Leitura complementar:* [`overview.md`](./overview.md) · spec [`../specs/00-foundations.md`](../specs/00-foundations.md)

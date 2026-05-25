---
name: 00-foundations
title: Foundations · Design System + Shell
kind: Spec
owner: ds-agent
status: done
size: M
depends_on: []
parallel_safe_with: ["12-landing"]
blocks: ["01-auth","02-cuidador-signup","03-tenant-setup","04-invitations","05-assistidos","06-agenda","07-mensagens-ia","08-team-management","09-dashboard-lider","10-billing-stripe","11-settings"]
owns:
  - src/components/ui/**
  - src/components/layout/**
  - src/components/icons/**
  - src/styles/**
  - tailwind.config.ts
  - src/app/layout.tsx
  - src/app/manifest.ts
  - src/lib/utils/cn.ts
may-read: []
updated: 2026-05-25
---

# 00 · Foundations (Design System + App Shell)

## Problema

Sem componentes base, tokens e shell mobile-first, nenhuma outra spec pode começar. Esta spec entrega o **chassi visual** do app, equivalente ao que `app/ui.jsx`, `app/icons.jsx` e os tokens em `Central Acolhimento.html` fazem no protótipo.

## User Stories

- Como **dev de qualquer feature**, eu quero importar `<Button>`, `<Input>`, `<Avatar>`, `<Card>`, `<StatusPill>` prontos para não reimplementar.
- Como **usuário do app**, eu quero a mesma experiência visual em modo claro e escuro.
- Como **usuário no mobile**, eu quero o shell com bottom-nav, safe-areas iOS e zero zoom inesperado em inputs.

## Escopo

### Entrega 1 · Tokens + Tailwind

- `src/styles/globals.css` com CSS vars (light + dark) replicando os blocos `--bg`, `--surface`… do `Central Acolhimento.html`.
- `tailwind.config.ts` mapeando cores/spacing/radius/shadow conforme [`../architecture/design-system.md`](../architecture/design-system.md).
- Fonte Plus Jakarta Sans via `next/font/google`.

### Entrega 2 · Componentes UI primitivos

Replicar de `app/ui.jsx` com API equivalente (ver tabela em design-system §4):

- `<Button>` com `variant`, `size`, `full`, `icon`, `iconRight`, `disabled`, `loading`
- `<IconButton>` (`size`, `variant: 'flat'|'soft'|'tinted'`)
- `<Input>`, `<Textarea>`, `<Select>`, `<SearchInput>` (com `label`, `hint`, `icon`, validation state)
- `<Card>` (`padding`, `onClick`)
- `<Avatar>` (`src`, `name`, `size`, `online`, `ring`)
- `<StatusPill>` (`status`, `size`)
- `<StatusFilterRow>` (chips de filtro)
- `<InfoBanner>` (`icon`, children)
- `<TenantChip>` (`tenantId`, `size`)
- `<BrandMark>` (`size`)
- `<StatusStepper>` (`steps`, `current`)
- `<StepBar>` (`current`, `total`, `onBack`, `onSkip`)

### Entrega 3 · Layout & Shell

- `<BottomNav>` Client component com `tab`, `onTab`, `role`. 4 abas:
  - Cuidador: Início · Agenda · Mensagens · Ajustes
  - Líder: Dashboard · Agenda · Mensagens · Ajustes
- `<ScreenHeader>` (`title`, `tenantId`, `right`)
- `<PhoneFrame>` (somente dev/QA, lazy-load só em desktop)
- `app/layout.tsx` root: provider de tema, `<html lang="pt-BR">`, font, manifest link
- `app/manifest.ts` (PWA básico)

### Entrega 4 · Ícones

Migrar `app/icons.jsx` para `components/icons/*.tsx` mantendo API (`size`, `sw`, `color`).

## Critérios de Aceite

```gherkin
Dado um componente <Button> com variant="primary"
Quando renderizado no tema dark
Então deve usar var(--accent) com contraste AA

Dado o app aberto em iPhone 12 (390x844)
Quando o usuário toca em qualquer input
Então não há zoom indesejado (font-size >= 16px)

Dado prefers-color-scheme: dark no SO
E o usuário não tem preferência salva
Quando o app carrega
Então o tema escuro é aplicado

Dado a tela autenticada com BottomNav
Quando o usuário troca de aba
Então a transição é instantânea e a aba ativa muda visualmente

Dado um componente <StatusPill status="urgente" />
Então a cor de fundo é #FFE4E6 (light) e o foreground é #E11D48
```

## Files / paths a criar

```
src/styles/globals.css
src/styles/tokens.css            # opcional, importado pelo globals
tailwind.config.ts
src/lib/utils/cn.ts              # helper de classnames
src/app/layout.tsx
src/app/manifest.ts
src/components/ui/{button,icon-button,input,textarea,select,search-input,card,avatar,info-banner,brand-mark,status-stepper,step-bar}.tsx
src/components/domain/assistido/status-pill.tsx
src/components/domain/tenant/tenant-chip.tsx
src/components/layout/{bottom-nav,screen-header,phone-frame,status-bar}.tsx
src/components/icons/index.ts
src/components/icons/*.tsx
```

## Testes (Faker)

- **Unit (Vitest):** snapshot test por componente com 3 variantes mínimas
- **Acessibilidade:** `axe-core/react` em `<Button>`, `<Input>`, `<Select>`
- **Tema:** test `renderiza tokens corretos em dark/light`
- **Faker:** quando precisar de dados (ex. avatar names), usar `faker.person.fullName()`

## Events Published / Consumed

- Não publica nem consome eventos de domínio.

## Riscos & Notas

- `next/font` no app router exige cuidado para não criar layout shift.
- `<PhoneFrame>` deve ser **opt-in** (não renderizar em produção mobile).
- Não esquecer `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">`.
- Inputs de telefone devem usar `inputMode="tel"`; OTP `inputMode="numeric"`.

## Definition of Done

- [ ] Storybook ou doc page em `/dev/ds` listando todos componentes
- [ ] Lighthouse score > 90 em página em branco com shell
- [ ] Dark mode toggle funcional (tokens trocam)
- [ ] Manifest PWA com ícone 512x512
- [ ] 0 erros de TS, 0 warns de a11y nos componentes-chave

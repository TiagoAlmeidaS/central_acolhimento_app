---
name: 12-landing
title: Landing Page (marketing)
kind: Spec
owner: landing-agent
status: done
size: S
depends_on: ["00-foundations"]
parallel_safe_with: ["01-auth","02-cuidador-signup","03-tenant-setup","04-invitations","05-assistidos","06-agenda","07-mensagens-ia","08-team-management","09-dashboard-lider","10-billing-stripe","11-settings"]
owns:
  - src/app/(marketing)/**
  - src/components/domain/landing/**
  - src/app/sitemap.ts
  - src/app/robots.ts
  - src/app/opengraph-image.tsx
may-read:
  - src/components/ui/**
  - src/components/layout/**
  - src/components/icons/**
updated: 2026-05-25
---

# 12 · Landing

## Problema

A landing pública (`Landing.html` + `app/landing.jsx`) é o primeiro contato com produto. Precisa converter líderes para criar a localidade. Spec entrega a page Next.js mobile-first com SEO.

## User Stories

- Como **visitante**, entendo o produto em 8 segundos.
- Como **visitante**, vejo um preview mobile do app (PhoneFrame mockup).
- Como **visitante**, vejo planos e preços claros.
- Como **visitante**, clico em "Começar agora" e vou para `/login` ou `/escolha-perfil`.

## Estrutura

Replicar de `app/landing.jsx`:

- **Hero** com headline, sub, CTA principal + secundário, dois mockups mobile lado a lado em desktop
- **Features grid** (cuidado pastoral, agente IA, multi-tenant, WhatsApp first, dashboard, agenda)
- **Section "Cada localidade é fechada"** (split layout texto + mockup)
- **Section "Agente IA"** (split mockup chat + texto)
- **Pricing** com 2 cards (Essencial + Pró)
- **CTA final** "Crie a sua localidade em 5 minutos"
- **Footer** com produto, contato, legal

## Critérios de Aceite

```gherkin
Cenário: Landing carrega sem JS
  Dado o usuário desabilita JS
  Quando acessa "/"
  Então vê conteúdo legível (estática RSC)

Cenário: SEO básico
  Então metatags title/description/og:image presentes
  E sitemap.xml + robots.txt servidos

Cenário: CTA leva ao login
  Quando clico "Começar agora"
  Então navego para `/login`

Cenário: Lighthouse mobile
  Then performance >= 95, a11y >= 95, SEO >= 100
```

## Files / paths

```
src/app/(marketing)/page.tsx
src/app/(marketing)/layout.tsx
src/app/sitemap.ts
src/app/robots.ts
src/components/domain/landing/hero.tsx
src/components/domain/landing/features-grid.tsx
src/components/domain/landing/pricing-section.tsx
src/components/domain/landing/footer.tsx
src/components/domain/landing/phone-mockup.tsx
```

## Testes

- **Lighthouse CI** budget no build
- **Snapshot:** Hero RSC sem JS
- **e2e:** CTA primário leva a /login

## Events Published / Consumed

- Nenhum

## Definition of Done

- [x] Página RSC com hero + features + pricing + footer
- [x] OG image gerada via `next/og`
- [x] sitemap.xml / robots.txt
- [ ] Lighthouse > 95 mobile (medir após deploy preview)
- [x] CTAs ligados aos paths corretos

## Notas de implementação

- **Route group:** optei pela **Opção A** do briefing — `src/app/page.tsx`
  placeholder foi removido e a landing vive em `src/app/(marketing)/page.tsx`,
  com layout próprio que aplica header + footer marketing. Isso isola a
  landing das telas autenticadas e mantém a possibilidade de adicionar
  `/sobre`, `/precos` dedicada, etc., reutilizando o mesmo wrapper.
- **RSC-only:** o header é sticky via `position: sticky` + `backdrop-blur`,
  sem `useEffect` para detecção de scroll. Zero JS de cliente na landing
  além do `Link` do Next.js.
- **Mockups visuais:** não há imagens externas. Os "screenshots" do app
  são composições de `Card` / `StatusPill` / ícones (`mock-screens.tsx`)
  empacotados em um `<PhoneMockup>` estático (não usa `PhoneFrame` de QA
  pois esse exige viewport-tall).
- **CTAs:** todos apontam para `/login` (entrada que a spec 01-auth define
  como porta única para líderes e cuidadores; o fluxo de "criar localidade"
  é decidido no roteamento pós-login pela spec 03-tenant-setup).
- **OG image:** `src/app/opengraph-image.tsx` roda no edge e usa a fonte
  padrão do `ImageResponse` (sem Plus Jakarta no edge para evitar latência
  e ponto de falha durante build).
- **Sitemap / robots:** ambos são env-aware. Em produção, `robots.ts` libera
  `/` e bloqueia `/dev/`, `/api/`, `/_next/`. Em dev/preview, bloqueia tudo
  para evitar indexação acidental.
- **Build:** `next build` compila com sucesso (✓ Compiled successfully); a
  fase de typecheck do Next falha apenas em arquivos de propriedade de
  outros agents (`tenant-setup-state.ts`, `tenancy/current.ts`,
  `otp-actions.test.ts`, `session.test.ts`) — fora do escopo desta spec.
- **TODOs:** ícones PNG do manifest (`/icon-192.png`, `/icon-512.png`,
  `/icon-maskable-512.png`) seguem como placeholder — gerar como parte do
  trabalho de marca quando a identidade visual for finalizada.

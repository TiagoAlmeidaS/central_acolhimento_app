---
title: Arquitetura · Stack e Estrutura
kind: ArchitectureOverview
owner: tech-acolhe
status: stable
updated: 2026-05-25
---

# Arquitetura — Visão Geral

## 1. Stack alvo

| Camada | Escolha | Por quê |
|---|---|---|
| **Framework** | **Next.js 15+** (App Router, RSC, Server Actions) | SSR + edge + DX. Mobile-first não exige nativo. |
| **Linguagem** | TypeScript estrito | Domínio sensível (LGPD), tipos previnem erro |
| **UI** | React Server Components + Client Components onde precisar | Menos JS no client mobile |
| **Estilo** | Tailwind CSS + CSS variables (tokens do protótipo) | Tokens já mapeados em `Central Acolhimento.html` |
| **Componentes base** | shadcn/ui (adaptados) + componentes próprios | Velocidade + customização |
| **Auth** | NextAuth (Auth.js v5) com provider **WhatsApp OTP custom** | OTP é único caminho |
| **DB** | Postgres (Supabase ou Neon) | RLS para tenant isolation |
| **ORM** | **Drizzle ORM** | Migration-first, type-safe, leve |
| **Validação** | Zod | Schemas compartilhados client/server |
| **Pagamentos** | Stripe (Checkout + Webhooks + Customer Portal) | Padrão BR (cartão + PIX via Stripe) |
| **IA** | Anthropic Claude (`@anthropic-ai/sdk`) | Já usado no protótipo via `window.claude.complete` |
| **WhatsApp** | Meta Cloud API (oficial) ou provider tipo Zenvia/Twilio | OTP + notificações |
| **Filas/jobs** | Inngest ou trigger.dev | Webhooks, lembretes, OTP expiration |
| **Observabilidade** | Sentry (errors) + PostHog (analytics) | LGPD-friendly |
| **Testes** | Vitest + Playwright + **@faker-js/faker** | Dados sintéticos por regra do projeto |
| **Deploy** | Vercel (web) + Supabase (DB) | Edge runtime onde possível |

> ADR detalhada: [`../adr/0001-stack-nextjs-mobile-first.md`](../adr/0001-stack-nextjs-mobile-first.md).

---

## 2. Estrutura de pastas (Next.js app router)

```
src/
├── app/
│   ├── (marketing)/             # Landing — público
│   │   └── page.tsx
│   ├── (auth)/                  # Login / OTP / signup público
│   │   ├── login/
│   │   ├── otp/
│   │   ├── cadastro/
│   │   └── escolha-perfil/
│   ├── (onboarding)/            # Fluxos antes do dashboard
│   │   ├── tenant-setup/        # 5 passos do líder fundador
│   │   ├── convite/[token]/     # Convite recebido
│   │   └── analise/             # Em análise (cuidador self-signup)
│   ├── (app)/                   # SHELL autenticado (BottomNav)
│   │   ├── layout.tsx           # carrega tenant ativo, bottom-nav
│   │   ├── home/                # cuidador
│   │   ├── dashboard/           # líder
│   │   ├── assistidos/
│   │   │   ├── novo/
│   │   │   └── [id]/
│   │   │       ├── editar/
│   │   │       └── agendar-reuniao/
│   │   ├── agenda/
│   │   ├── mensagens/
│   │   ├── equipe/
│   │   │   └── convidar/
│   │   ├── ajustes/
│   │   └── assinatura/
│   │       ├── planos/
│   │       ├── checkout/
│   │       ├── faturas/
│   │       └── cancelar/
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── stripe/
│   │   │   └── whatsapp/
│   │   └── trpc/                # opcional
│   └── layout.tsx               # root (theme provider, fonts)
│
├── components/
│   ├── ui/                      # primitivas (Button, Input, Avatar…) [00-foundations]
│   ├── domain/
│   │   ├── assistido/           # AssistidoCard, StatusPill…    [05]
│   │   ├── agenda/              # AgendaItem, MeetingForm…       [06]
│   │   ├── billing/             # PlanCard, BrandDot…            [10]
│   │   ├── ia/                  # ChatBubble, AIInput…           [07]
│   │   └── dashboard/           # KpiCard, FunnelBar, VisitChart [09]
│   ├── layout/                  # PhoneFrame, BottomNav, ScreenHeader [00]
│   └── icons/                   # Icon* (24x24 stroke 1.8)       [00]
│
├── lib/
│   ├── auth/                    # OTP, NextAuth config
│   ├── db/                      # drizzle client
│   ├── stripe/
│   ├── whatsapp/                # OTP + notificações
│   ├── claude/                  # client + prompts do agente
│   ├── tenancy/                 # getCurrentTenant, hasRole…
│   ├── validators/              # zod schemas compartilhados
│   └── utils/
│
├── server/                      # SERVER ACTIONS por domínio
│   ├── auth.actions.ts          # [01]
│   ├── tenant.actions.ts        # [03]
│   ├── membership.actions.ts    # [02], [08]
│   ├── invite.actions.ts        # [04]
│   ├── assistido.actions.ts     # [05]
│   ├── meeting.actions.ts       # [06]
│   ├── chat.actions.ts          # [07]
│   ├── dashboard.actions.ts     # [09]
│   ├── billing.actions.ts       # [10]
│   └── settings.actions.ts      # [11]
│
├── db/
│   ├── schema/                  # 1 arquivo por agregado
│   │   ├── tenants.ts
│   │   ├── users.ts
│   │   ├── memberships.ts
│   │   ├── invites.ts
│   │   ├── assistidos.ts
│   │   ├── timeline.ts
│   │   ├── meetings.ts
│   │   ├── subscriptions.ts
│   │   ├── invoices.ts
│   │   └── chat.ts
│   ├── migrations/
│   └── index.ts
│
├── tests/
│   ├── factories/               # builders com Faker  [todas]
│   ├── unit/
│   ├── integration/
│   └── e2e/                     # Playwright (mobile viewport)
│
└── styles/
    ├── globals.css              # tokens (light/dark) — vem do protótipo
    └── tailwind.config.ts
```

> **Regra de ouro de ownership:** cada spec em `docs/specs/NN-*.md` declara quais caminhos pode tocar. Subagent que mexe fora do escopo causa conflito.

---

## 3. Camadas e responsabilidade

```
┌───────────────────────────────────────────────────────────┐
│ Apresentação · React Server Components                     │
│   - app/**/page.tsx                                        │
│   - components/                                            │
└────────────┬──────────────────────────────────────────────┘
             │ (Server Action call ou direct DB read em RSC)
             ▼
┌───────────────────────────────────────────────────────────┐
│ Aplicação · Server Actions ('use server')                  │
│   - server/*.actions.ts                                    │
│   - sempre: auth → validate zod → enforce tenancy → exec   │
└────────────┬──────────────────────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────────────────────┐
│ Domínio · Funções puras                                    │
│   - lib/tenancy, lib/validators, regras de negócio         │
└────────────┬──────────────────────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────────────────────┐
│ Infra · Drizzle, Stripe, Claude, WhatsApp                 │
│   - lib/db, lib/stripe, lib/claude, lib/whatsapp          │
└───────────────────────────────────────────────────────────┘
```

---

## 4. Princípio mobile-first

| Decisão | Implementação |
|---|---|
| Layout parte de 380 px de largura | Tailwind: `min-h-dvh`, container = `mx-auto max-w-md` |
| Bottom-nav fixo, safe-area iOS | `pb-[env(safe-area-inset-bottom)]` |
| Toques de 44×44 mínimo | Tailwind class `min-h-11 min-w-11` |
| Inputs sem zoom indesejado iOS | `font-size: 16px` mínimo nos inputs |
| Sem hover-only states | Estados visíveis no foco/touch |
| Imagens responsive com `next/image` + `sizes="(min-width:768px) 380px, 100vw"` | |
| Web App Manifest + ícones (PWA-ready) | `app/manifest.ts` |
| Tema dark via `prefers-color-scheme` + toggle persistente | tokens já em CSS vars |
| Desktop = mobile centralizado com PhoneFrame opcional para QA | `(app)/layout.tsx` |

---

## 5. Runtime e edge

| Coisa | Runtime | Motivo |
|---|---|---|
| Páginas RSC de leitura | Edge | Latência ↓, leitura de DB via HTTP Drizzle |
| Server Actions de mutação | Node | Driver TCP / Stripe SDK |
| Webhooks Stripe / WhatsApp | Node | Validação de assinatura |
| Claude calls | Node ou Edge | Streaming preferido |

---

## 6. Multi-tenancy resumido

- `tenantId` é injetado a cada request via cookie/session ativo.
- Drizzle middleware aplica `WHERE tenant_id = $current` em toda query.
- Postgres RLS como **segunda camada de defesa** (defense in depth).
- Detalhes em [`multi-tenancy.md`](./multi-tenancy.md).

---

## 7. Eventos e assíncrono

Webhooks chegam → entram em fila (Inngest) → consumidores idempotentes mutam DB.

Eventos publicados internamente (ver [`../product/domain-model.md`](../product/domain-model.md) §5) viram **jobs** quando relevantes:

| Evento | Job |
|---|---|
| `invite.sent` | `whatsapp.sendInvite` |
| `meeting.created` | `whatsapp.notifyAssistido` + `calendar.icsBlob` |
| `assistido.status_changed → urgente` | `whatsapp.notifyTeam` |
| `subscription.cancelled` | `tenant.scheduleFreeze(7d)` |

---

## 8. Segurança & LGPD

- **OTP via WhatsApp**, sem senhas (rotaciona implícito)
- **Cookies httpOnly, SameSite=Lax**, refresh por OTP step-up sensível
- **Rate-limit** (`@upstash/ratelimit`) em login, OTP, invite-send
- **Audit log** em `TimelineEvent` para mutações de assistido
- **Soft-delete** com purga em 90 dias
- **Export por usuário titular** (LGPD art. 15) via `/ajustes/meus-dados`
- **Sem PII em logs** — sanitizar antes de Sentry

---

## 9. Performance (orçamentos)

| Métrica | Orçamento |
|---|---|
| LCP (página principal autenticada) em 4G | < 2.5 s |
| Bundle JS por rota | < 90 KB gzip |
| Time-to-interactive em iPhone 12 mid-tier | < 3 s |
| Server Action cold response (p95) | < 600 ms |
| Postgres query p95 | < 80 ms |

---

## 10. CI/CD (resumo)

- PR triggers: `lint → typecheck → vitest → playwright (mobile preset) → build`
- Migrations: `drizzle-kit generate` checado, aplicado em deploy
- Preview Deploy Vercel por PR
- Webhooks têm endpoint **separado** por ambiente

---

*Leitura complementar:* [`multi-tenancy.md`](./multi-tenancy.md) · [`data-model.md`](./data-model.md) · [`design-system.md`](./design-system.md)

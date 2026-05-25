# Central de Acolhimento

> Plataforma mobile-first para lideranças locais coordenarem acolhimento e cuidadores trabalharem em rede.

[![CI](https://github.com/TiagoAlmeidaS/central_acolhimento_app/actions/workflows/ci.yml/badge.svg)](https://github.com/TiagoAlmeidaS/central_acolhimento_app/actions/workflows/ci.yml)

---

## Sumário

- [Visão geral](#visão-geral)
- [Stack](#stack)
- [Quickstart local](#quickstart-local)
- [Scripts](#scripts)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Documentação](#documentação)
- [Deploy (Vercel)](#deploy-vercel)
- [Contribuindo](#contribuindo)

---

## Visão geral

A **Central de Acolhimento** é um SaaS multi-tenant onde:

- **Líderes** criam uma localidade (tenant), convidam a equipe e gerenciam fila de assistidos.
- **Cuidadores** se cadastram em uma ou mais localidades, conduzem reuniões e acompanham histórico.
- **Cada localidade** tem identidade visual, regras e branding próprios, com cobrança via Stripe.

A arquitetura, fluxos e specs estão em [`docs/`](./docs/README.md).

## Stack

| Camada              | Tecnologia                                           |
| ------------------- | ---------------------------------------------------- |
| Framework           | Next.js 15 (App Router, RSC, Server Actions)         |
| Linguagem           | TypeScript estrito                                   |
| UI / Styling        | Tailwind CSS + design tokens próprios                |
| Banco de dados      | Postgres (Neon em produção) via Drizzle ORM          |
| Auth                | OTP via WhatsApp + JWT (jose)                        |
| Rate-limit          | Upstash Redis                                        |
| Pagamentos          | Stripe (subscriptions + webhooks)                    |
| IA                  | Anthropic Claude (`@anthropic-ai/sdk`)               |
| Testes              | Vitest, Testing Library, Faker.js, Playwright (e2e)  |
| Hospedagem          | Vercel (preview por PR + produção em `main`)         |

## Quickstart local

```bash
git clone git@github.com:TiagoAlmeidaS/central_acolhimento_app.git
cd central_acolhimento_app
npm install
cp .env.example .env.local
# edite .env.local conforme necessário (em dev, deixe WHATSAPP_DEV_MODE=true)
npm run dev
```

Aplicação disponível em <http://localhost:3000>. Showcase do design system em <http://localhost:3000/dev/ds>.

## Scripts

```bash
npm run dev         # next dev (com hot reload)
npm run build       # build de produção
npm run start       # roda o build
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # vitest run
npm run test:watch  # vitest watch
npm run e2e         # playwright (quando configurado)
npm run format      # prettier --write .
```

## Variáveis de ambiente

Todas as envs são validadas em [`src/lib/env.ts`](./src/lib/env.ts) via Zod. Para a lista completa e como obter cada credencial, veja:

- [`docs/operations/environments.md`](./docs/operations/environments.md) — mapa de envs por ambiente
- [`docs/operations/integrations/`](./docs/operations/integrations/) — guia por serviço (Neon, Stripe, WhatsApp, Anthropic, Upstash)

## Estrutura do projeto

```
.
├── .github/workflows/      # CI (lint/typecheck/test/build)
├── docs/                   # documentação (specs, ADRs, operação, integrações)
├── src/
│   ├── app/                # rotas Next.js (App Router)
│   ├── components/         # UI primitives + domain components
│   ├── db/                 # schemas Drizzle + cliente
│   ├── lib/                # utilidades, env, auth, tenancy, whatsapp...
│   ├── server/             # server actions agrupadas por feature
│   ├── styles/             # globals.css + tokens
│   └── tests/              # vitest setup + factories Faker + unit tests
├── drizzle.config.ts
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── vitest.config.ts
```

## Documentação

Toda decisão de produto, arquitetura, feature e operação está sob [`docs/`](./docs/README.md), no estilo Backstage TechDocs.

- **[`docs/product/`](./docs/product/)** — visão, domínio, user-flows
- **[`docs/architecture/`](./docs/architecture/)** — stack, multi-tenancy, design-system
- **[`docs/specs/`](./docs/specs/)** — 13 specs de features (uma por subagent)
- **[`docs/adr/`](./docs/adr/)** — decisões arquiteturais
- **[`docs/operations/`](./docs/operations/)** — CI/CD, Vercel, ambientes
- **[`docs/operations/integrations/`](./docs/operations/integrations/)** — setup de cada serviço externo

## Deploy (Vercel)

Esta aplicação foi otimizada para Vercel:

- `vercel.json` define framework, região (`gru1` — São Paulo) e headers de segurança.
- Cada PR ganha **Preview Deployment** automático.
- `main` faz deploy em produção.
- Envs são gerenciadas em **Vercel → Settings → Environment Variables** (não commitar segredos).

Passo a passo completo em [`docs/operations/vercel.md`](./docs/operations/vercel.md).

## Contribuindo

1. Crie sua branch a partir de `main`: `git checkout -b feat/nome-da-feature`.
2. Siga as convenções:
   - Commits **Conventional Commits** (`feat:`, `fix:`, `docs:`...).
   - PR title segue o mesmo padrão (validado pelo workflow `pr-checks`).
3. Garanta CI verde: `npm run lint && npm run typecheck && npm test && npm run build`.
4. Atualize `docs/` quando criar/mudar features (veja regra em [`docs/specs/`](./docs/specs/)).

---

Made with care.

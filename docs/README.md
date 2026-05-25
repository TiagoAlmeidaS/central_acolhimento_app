---
title: Central de Acolhimento — Portal de Documentação
kind: Documentation
owner: produto-acolhe
status: discovery
updated: 2026-05-25
---

# Central de Acolhimento · Portal

> Espaço único de referência (estilo *Backstage TechDocs*) para o app **Central de Acolhimento** — agora sendo reescrito em **Next.js mobile-first**.

Toda funcionalidade, contrato negocial, API, decisão arquitetural e fluxo de UX vive nesta pasta. Mudou produto → atualizou doc.

---

## 1. Mapa rápido

| Camada | Pasta | Quando ler |
|---|---|---|
| Visão de produto, personas, glossário, jornadas | [`product/`](./product/) | Antes de tocar qualquer feature |
| Stack, multi-tenancy, schema, design tokens | [`architecture/`](./architecture/) | Antes de escrever código |
| Decisões registradas (ADR) | [`adr/`](./adr/) | Quando algo mudar de rumo |
| Specs implementáveis (1 spec = 1 subagent) | [`specs/`](./specs/) | Para abrir trabalho em paralelo |
| CI/CD, Vercel, ambientes, runbooks | [`operations/`](./operations/) | Antes de deployar ou rotacionar segredo |
| Setup de integrações (Neon, Stripe, WhatsApp...) | [`operations/integrations/`](./operations/integrations/) | Quando ligar um serviço externo de verdade |

> Comece pelo [Overview de Produto](./product/overview.md) e depois pelo [Mapa de Specs](./specs/README.md), que explica como paralelizar a entrega.

---

## 2. O que é o produto (TL;DR)

A **Acolhe** é uma *central de cuidado pastoral* multi-tenant. Cada **localidade** (igreja, célula, comunidade) é um *tenant fechado* em que líderes e cuidadores acompanham **assistidos** com:

- Lista de casos com **status** (Urgente · Aguardando · Em acompanhamento · Concluído)
- **Agenda** compartilhada de visitas, ligações e reuniões
- **Agente de IA** (chat) para cadastrar, buscar e mudar status em linguagem natural
- **Dashboard** operacional para líderes (KPIs + funil + capacidade da equipe)
- **Assinatura via Stripe** (R$ 19,90 Essencial · R$ 29,90 Pró · 14 dias grátis)
- **Convites por WhatsApp** + autenticação por **OTP** (WhatsApp)

Detalhes em [`product/overview.md`](./product/overview.md).

---

## 3. Pastas em detalhe

### 3.1 `product/`
Linguagem ubíqua, personas, jornadas e domínio. Sem código.

- [`overview.md`](./product/overview.md) — visão, problema, personas, princípios
- [`domain-model.md`](./product/domain-model.md) — entidades e relacionamentos do dia-a-dia
- [`user-flows.md`](./product/user-flows.md) — jornadas ponta a ponta (líder funda · cuidador convidado · IA agenda visita…)

### 3.2 `architecture/`
Como o sistema é construído.

- [`overview.md`](./architecture/overview.md) — stack Next.js mobile-first, módulos, runtime
- [`multi-tenancy.md`](./architecture/multi-tenancy.md) — isolamento por `tenantId`, escolha do modelo
- [`data-model.md`](./architecture/data-model.md) — schema Drizzle/Postgres
- [`design-system.md`](./architecture/design-system.md) — tokens, tipografia, componentes

### 3.3 `adr/`
Registros de decisão (estilo MADR curto).

- [`0001-stack-nextjs-mobile-first.md`](./adr/0001-stack-nextjs-mobile-first.md)
- [`0002-multi-tenancy-strategy.md`](./adr/0002-multi-tenancy-strategy.md)

### 3.4 `specs/`
**O coração do trabalho paralelizável.** Cada arquivo é uma feature autônoma, pensada para ser tocada por **um único subagent** sem conflito.

Leia primeiro o índice: [`specs/README.md`](./specs/README.md) — contém o **grafo de dependências**, a **matriz de ownership de arquivos** e o **plano de paralelismo recomendado** (wave 0, wave 1, wave 2).

### 3.5 `operations/`
Como o produto vive em produção: pipeline CI/CD, deploy na Vercel, mapa de ambientes e setup de cada serviço externo.

- [`operations/README.md`](./operations/README.md) — princípios de operação
- [`operations/ci-cd.md`](./operations/ci-cd.md) — GitHub Actions
- [`operations/vercel.md`](./operations/vercel.md) — passo a passo do deploy
- [`operations/environments.md`](./operations/environments.md) — inventário de envs
- [`operations/integrations/`](./operations/integrations/) — Neon, Stripe, WhatsApp, Anthropic, Upstash

---

## 4. Convenções de documentação

Toda spec/feature/API negocial DEVE conter:

1. **Frontmatter YAML** com `name`, `kind`, `owner`, `status`, `depends_on`, `parallel_safe_with`
2. **Problem statement** — qual dor resolve
3. **User stories** em formato `Como… eu quero… para…`
4. **Critérios de aceite** em Gherkin (`Dado/Quando/Então`)
5. **Contratos** (entidades, APIs, eventos)
6. **Telas** (referência aos protótipos atuais em `app/screens-*.jsx`)
7. **Ownership de arquivos** — quais paths o subagent **pode tocar** e quais **não pode**
8. **Plano de testes** com dados *fakes* (Faker.js), incluindo unit, integração, e2e
9. **Riscos & dependências**

---

## 5. Princípios

- **Mobile-first é literal**: design parte de 380 px e cresce. Nada de adaptar desktop pra mobile.
- **Tenant é fronteira de privacidade**: dados de uma localidade jamais vazam para outra.
- **WhatsApp é o canal**: convite, OTP, notificação — tudo passa por lá.
- **IA é assistente, não autônoma**: o agente sempre confirma antes de mudar estado.
- **Líder paga, equipe usa**: só o líder responsável vê billing.
- **Specs primeiro, código depois**: nenhum PR sem spec atualizada nesta pasta.

---

## 6. Status atual

| Item | Estado |
|---|---|
| Protótipos React UMD (HTML standalone) | ✅ existem em `app/*.jsx` e `Central Acolhimento.html` |
| Landing estática | ✅ `Landing.html` + `app/landing.jsx` |
| Backend / banco | ❌ não existe ainda |
| Migração para Next.js | 🚧 começando agora — guiada pelas specs |

---

## 7. Como contribuir

1. Pegue uma spec em `pending` no [índice de specs](./specs/README.md).
2. Atualize o `status` para `in_progress` no frontmatter da spec.
3. Trabalhe **apenas** dentro dos paths listados em `owns:` da spec.
4. Abra PR referenciando a spec (`Closes spec/05-assistidos`).
5. Atualize a doc se algo mudou.

---

*Última atualização: 2026-05-25 · descoberta inicial a partir dos protótipos em `app/`.*

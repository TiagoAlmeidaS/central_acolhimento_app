---
name: 09-dashboard-lider
title: Dashboard do Líder
kind: Spec
owner: dashboard-agent
status: pending
size: M
depends_on: ["00-foundations","01-auth","03-tenant-setup","05-assistidos","06-agenda","08-team-management"]
parallel_safe_with: ["07-mensagens-ia","10-billing-stripe","11-settings","04-invitations"]
owns:
  - src/app/(app)/dashboard/**
  - src/server/dashboard.actions.ts
  - src/components/domain/dashboard/**
may-read:
  - src/server/assistido.actions.ts
  - src/server/meeting.actions.ts
  - src/server/membership.actions.ts
  - src/lib/tenancy/**
  - src/components/ui/**
updated: 2026-05-25
---

# 09 · Dashboard do Líder

## Problema

Líder precisa de **visão operacional** em 5 segundos: quantos urgentes, quem está livre, quantas visitas previstas. Spec replica `app/screens-dashboard.jsx` com dados reais agregados.

## User Stories

- Como **líder**, ao abrir a Home (`/`) sou levado direto ao Dashboard.
- Como **líder**, vejo 4 KPIs principais (Ativos · Urgentes · Aguardando · Tempo médio resposta).
- Como **líder**, vejo o funil por status como barras horizontais.
- Como **líder**, vejo gráfico de 7 dias de visitas.
- Como **líder**, vejo capacidade da equipe (online/cap).
- Como **líder**, clico em "Ver todos assistidos" → lista completa.

## Tela (referência `app/screens-dashboard.jsx`)

- ScreenHeader com TenantChip + nome da localidade
- Saudação "{nomeLíder}, hoje na localidade…"
- Grid 2×2 de KpiCard (ativos, urgentes, aguardando, tempo resposta)
- Card "Funil de acolhimento" com barras de cada status (FunnelBar)
- Card "Visitas dos últimos 7 dias" (VisitChart com bars)
- Card "Equipe" com lista de 3-4 cuidadores mais ativos + capacidade
- CTAs: `Ver assistidos` / `Equipe`

## Critérios de Aceite

```gherkin
Cenário: Líder na Home
  Dado eu sou líder ativo no tenant T
  Quando abro "/"
  Então sou redirecionado para "/dashboard" (ou Dashboard é renderizado inline)

Cenário: Métricas agregadas só do tenant
  Dado tenant T com 12 assistidos
  E tenant U com 8 assistidos
  Quando agrego métricas
  Então KPI "Total" = 12 (e não 20)

Cenário: KPIs em tempo razoável
  Dado tenant com 200 assistidos e 500 reuniões
  Quando o dashboard carrega
  Então TTFB < 500ms (Server Component com cache 30s)

Cenário: Cuidador NÃO acessa
  Dado eu sou cuidador (não líder)
  Quando tento /dashboard
  Então redireciono para /home
```

## Contratos

```ts
export const DashboardSnapshot = z.object({
  totals: z.object({
    ativos: z.number(),
    urgentes: z.number(),
    aguardando: z.number(),
    semCuidador: z.number(),
    concluidosMes: z.number(),
  }),
  tempoMedioResposta: z.string(),    // "2h 48min"
  novosNaSemana: z.number(),
  crescimentoSemana: z.number(),     // % vs semana anterior
  funil: z.array(z.object({ key: AssistidoStatus, label: z.string(), count: z.number() })),
  visitas7d: z.array(z.object({ dia: z.string(), n: z.number() })),
  equipe: z.array(z.object({
    id: z.string(), nome: z.string(), fotoUrl: z.string().nullable(),
    online: z.boolean(), casosAtivos: z.number(),
    capacidade: z.enum(['baixa','normal','alta']),
  })),
});

// server/dashboard.actions.ts
'use server';
export async function loadDashboard(): Promise<DashboardSnapshot>;
```

`loadDashboard` faz 3-4 queries paralelas (assistidos counts, meetings 7d, memberships+casos). Pode ser cacheado por `tenantId` em memória LRU por 30s.

## Files / paths

```
src/app/(app)/dashboard/page.tsx                      # RSC server
src/components/domain/dashboard/kpi-card.tsx
src/components/domain/dashboard/funnel-bar.tsx
src/components/domain/dashboard/visit-chart.tsx
src/components/domain/dashboard/team-mini-list.tsx
src/server/dashboard.actions.ts
src/lib/dashboard/derive-metrics.ts                   # funções puras
src/tests/dashboard/derive-metrics.test.ts
```

## Testes (Faker)

```ts
import { faker } from '@faker-js/faker/locale/pt_BR';
// gera 12 assistidos com mix de status e roda deriveMetrics → snapshot
```

- **Unit:** `deriveMetrics` é determinístico para input fixo
- **Integration:** loadDashboard agrega corretamente com dados Faker
- **Tenancy:** 2 tenants × 10 assistidos cada — leitura cruzada zerada
- **Performance:** loadDashboard p95 < 200ms com 200 assistidos

## Events Published

- Nenhum

## Events Consumed

- `assistido.status_changed` → invalidar cache
- `meeting.created` → invalidar cache
- `membership.approved` → invalidar cache

## Riscos

- **Cache stale:** 30s é tolerável; mutações principais invalidam.
- **Agregação cara em tenant grande:** se necessário, materializar view em background.

## Definition of Done

- [ ] KPIs + funil + chart 7d funcionando com dados reais
- [ ] Authz "só líder"
- [ ] Cache 30s
- [ ] Testes de tenancy passando

---
name: 05-assistidos
title: Assistidos · CRUD, Lista, Detalhes, Timeline
kind: Spec
owner: assistidos-agent
status: pending
size: L
depends_on: ["00-foundations","01-auth","03-tenant-setup"]
parallel_safe_with: ["06-agenda","07-mensagens-ia","08-team-management","09-dashboard-lider","11-settings","04-invitations","10-billing-stripe"]
blocks: []
publishes_contracts:
  - AssistidoSummary
  - AssistidoFull
  - listAssistidos
  - getAssistido
  - createAssistido
  - updateAssistido
  - addTimelineEvent
  - setStatus
owns:
  - src/app/(app)/home/**
  - src/app/(app)/assistidos/**
  - src/server/assistido.actions.ts
  - src/db/schema/assistidos.ts
  - src/db/schema/timeline.ts
  - src/components/domain/assistido/**
  - src/lib/validators/assistido.ts
may-read:
  - src/lib/tenancy/**
  - src/components/ui/**
updated: 2026-05-25
---

# 05 · Assistidos (CRUD + Timeline)

> ⚠️ **Contratos públicos**: as server actions e tipos listados em `publishes_contracts:` são **consumidos por outras specs** (06, 07, 09). O subagent desta spec deve abrir um **PR-skeleton** com as assinaturas no dia 1, antes da implementação completa, para não bloquear as paralelas.

## Problema

O **assistido** é a entidade central. Esta spec é o coração funcional do app:
- Lista ("Meus Assistidos" para cuidador, "Todos da localidade" para líder)
- Detalhes com timeline, ações rápidas, mudança de status
- Editar perfil e contexto pastoral
- Criar novo manualmente (FAB +)

## User Stories

- Como **cuidador**, vejo lista dos assistidos sob meu cuidado ou da minha localidade.
- Como **cuidador**, busco por nome ou cidade e filtro por status.
- Como **cuidador**, abro o perfil e registro notas, mudo status, marco contatos.
- Como **cuidador**, edito contexto pastoral (família, situação, observações).
- Como **líder**, vejo os assistidos da localidade inteira.
- Como **dev de outra spec** (06, 07, 09), consumo `listAssistidos()` sem reinventar.

## Telas (referência `app/screens-main.jsx`)

### `HomeScreen`
- Saudação "Olá, {primeiroNome}"
- Título: "Meus Assistidos" (cuidador) ou "Assistidos da localidade" (showBack)
- Avatar tappable → vai pra Ajustes
- TenantChip
- SearchInput
- StatusFilterRow (chips: Todos, Urgente, Aguardando, Acompanhamento, Concluído)
- Lista de `AssistidoCard` ordenada por `STATUS_ORDER`
- FAB azul para novo

### `DetalhesScreen`
- Hero card: avatar 86, nome, cidade, StatusPill, botões `WhatsApp` + `Reunião`
- Quick actions horizontais: `Liguei agora`, `Marcar contato`, `Oração`
- Próxima reunião (se houver) com link
- Card "Informações de contato" (telefone, cidade, cuidador, último contato) + botão Editar
- Card "Atualizar status" (dropdown com 4 status)
- Card "Resumo do agente" (IA generated)
- Card Timeline com TimelineItem por evento + inline "Adicionar nota"

### `EditarAssistidoScreen`
- Avatar grande + botão alterar foto
- Inputs: nome, telefone, cidade
- Section "Contexto pastoral": família, contexto/situação, observações (textareas)
- CTA `Salvar alterações`

### `NovoIrmaoScreen` (não estava no protótipo detalhado mas referenciado no app.jsx)
- Form curto: nome, telefone, cidade, status inicial = `aguardando`
- Opcional: atribuir cuidador
- CTA `Cadastrar`

## Critérios de Aceite

```gherkin
Cenário: Listagem por papel
  Dado eu sou cuidador no tenant T
  Quando abro a Home
  Então vejo só os assistidos do tenant T
  E não vejo nenhum de outro tenant

Cenário: Filtro por status
  Dado a lista tem 6 assistidos: 1 urgente, 2 aguardando, 2 acompanhamento, 1 concluído
  Quando filtro por "Urgente"
  Então vejo apenas 1 card

Cenário: Mudança de status gera timeline
  Dado o assistido "Carlos" com status="urgente"
  Quando mudo status para "acompanhamento"
  Então TimelineEvent kind='sistema' é criado com meta {de:'urgente', para:'acompanhamento'}
  E Assistido.updatedAt é atualizado

Cenário: Adicionar nota
  Dado eu na tela de Detalhes
  Quando escrevo "Liguei e conversei por 20 min" e salvo
  Então TimelineEvent kind='nota' é criado com autorId=eu

Cenário: WhatsApp deep link
  Dado o assistido tem telefone "+55 92 99812 4477"
  Quando clico no botão WhatsApp
  Então abre `https://wa.me/5592998124477`

Cenário: Cuidador não vê assistido de outro
  Dado tenant A com assistidos e tenant B com assistidos
  Quando autenticado no tenant A
  Então listAssistidos() retorna só os de A (RLS bloqueia mesmo se o filtro código falhar)
```

## Contratos publicados

```ts
// src/lib/validators/assistido.ts (compartilhado)
export const AssistidoStatus = z.enum(['urgente','aguardando','acompanhamento','concluido']);
export const AssistidoSummary = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  cidade: z.string(),
  fotoUrl: z.string().nullable(),
  status: AssistidoStatus,
  cuidadorNome: z.string().nullable(),
  ultimoContatoEm: z.date().nullable(),
});
export const AssistidoFull = AssistidoSummary.extend({
  telefone: z.string().nullable(),
  resumo: z.string().nullable(),
  contextoPastoral: z.object({
    familia: z.string().nullable(),
    contexto: z.string().nullable(),
    observacoes: z.string().nullable(),
  }).nullable(),
  timeline: z.array(TimelineEventSchema),
});
```

### Server actions (assinaturas — publicar no PR-skeleton)

```ts
'use server';
export async function listAssistidos(filter?: {
  status?: AssistidoStatus[];
  cuidadorId?: string | 'me' | 'qualquer';
  search?: string;
}): Promise<AssistidoSummary[]>;

export async function getAssistido(id: string): Promise<AssistidoFull | null>;

export async function createAssistido(input: {
  nome: string; telefone?: string; cidade: string;
  status?: AssistidoStatus; cuidadorId?: string;
}): Promise<AssistidoFull>;

export async function updateAssistido(id: string, patch: Partial<UpdateAssistidoInput>): Promise<AssistidoFull>;

export async function setStatus(id: string, status: AssistidoStatus): Promise<AssistidoFull>;

export async function addTimelineEvent(input: {
  assistidoId: string; kind: 'nota'|'ai'|'sistema'; texto: string; meta?: Json;
}): Promise<TimelineEvent>;

export async function quickAction(id: string, action: 'liguei'|'contatado'|'oracao'): Promise<TimelineEvent>;
```

## Estado e UX

- Lista usa **streaming RSC** (Suspense + skeleton de 3 cards).
- Detalhes usa Server Component + Client Component pequeno para inline-note add.
- Mudança de status é **optimistic** (UI atualiza, server revalida).
- WhatsApp button = `<a href="https://wa.me/...">` (deep link nativo).

## Files / paths

```
src/app/(app)/home/page.tsx                                  # cuidador: lista; líder: redireciona pra /dashboard
src/app/(app)/assistidos/page.tsx                            # lista cheia (acessada pelo líder via dashboard)
src/app/(app)/assistidos/novo/page.tsx
src/app/(app)/assistidos/[id]/page.tsx                       # detalhes
src/app/(app)/assistidos/[id]/editar/page.tsx
src/components/domain/assistido/assistido-card.tsx
src/components/domain/assistido/status-filter-row.tsx
src/components/domain/assistido/quick-actions.tsx
src/components/domain/assistido/timeline-item.tsx
src/components/domain/assistido/kv-row.tsx
src/components/domain/assistido/add-note.tsx
src/server/assistido.actions.ts
src/db/schema/assistidos.ts
src/db/schema/timeline.ts
src/lib/validators/assistido.ts
src/tests/factories/assistido.factory.ts
```

## Testes (Faker)

```ts
import { faker } from '@faker-js/faker/locale/pt_BR';
export const assistidoFactory = (tenantId: string, overrides = {}) => ({
  tenantId,
  nome: faker.person.fullName(),
  telefone: '+55' + faker.string.numeric(11),
  cidade: faker.location.city(),
  status: faker.helpers.arrayElement(['urgente','aguardando','acompanhamento','concluido']),
  resumo: faker.lorem.sentence(),
  ultimoContatoEm: faker.date.recent({ days: 30 }),
  ...overrides,
});
```

- **Unit:** validação Zod, ordenação por STATUS_ORDER
- **Integration:** CRUD completo + timeline atualiza
- **Integration:** mudança de status gera evento sistema
- **Tenancy:** 2 tenants × 3 assistidos cada — cuidador de A nunca vê de B
- **Performance:** listAssistidos com 200 registros < 100ms p95
- **e2e:** novo irmão, abrir detalhes, mudar status, adicionar nota

## Events Published

- `assistido.created`
- `assistido.status_changed` (consumido por [09-dashboard], [07-ia])
- `assistido.timeline_added`

## Events Consumed

- Nenhum direto, mas é o produtor central que outros agregam

## Riscos

- **N+1 em timeline:** sempre joinar/preload eventos limitados (últimos 50).
- **Foto upload:** v1 só URLs externas (avatar); upload via S3 fica para v2.
- **Soft-delete:** garantir filtro `deletedAt IS NULL` em toda query.

## Definition of Done

- [ ] CRUD completo + timeline + quick actions
- [ ] Filtros e busca funcionando client-side
- [ ] PR-skeleton publicado no dia 1 da Wave 3
- [ ] Contratos exportados em `lib/validators/assistido.ts`
- [ ] Testes Faker + tenancy passando
- [ ] Otimistic updates suaves

---
name: 06-agenda
title: Agenda · Reuniões / Visitas / Ligações
kind: Spec
owner: agenda-agent
status: pending
size: M
depends_on: ["00-foundations","01-auth","03-tenant-setup","05-assistidos"]
parallel_safe_with: ["07-mensagens-ia","08-team-management","09-dashboard-lider","11-settings","04-invitations","10-billing-stripe"]
blocks: []
publishes_contracts:
  - MeetingSummary
  - listMeetings
  - createMeeting
  - updateMeeting
owns:
  - src/app/(app)/agenda/**
  - src/app/(app)/assistidos/[id]/agendar-reuniao/**
  - src/server/meeting.actions.ts
  - src/db/schema/meetings.ts
  - src/components/domain/agenda/**
  - src/lib/validators/meeting.ts
may-read:
  - src/server/assistido.actions.ts
  - src/lib/tenancy/**
  - src/components/ui/**
updated: 2026-05-25
---

# 06 · Agenda

## Problema

A equipe pastoral precisa coordenar visitas, ligações e reuniões. Sem agenda compartilhada por localidade, ninguém sabe quem vai onde. Esta spec entrega a aba **Agenda** e o formulário **Agendar Reunião**.

## User Stories

- Como **cuidador**, vejo próximas reuniões da minha localidade ordenadas no tempo.
- Como **cuidador**, agendo uma visita/ligação/online direto do perfil do assistido.
- Como **cuidador**, configuro notificação WhatsApp para o assistido.
- Como **dev de [09-dashboard]**, consumo `listMeetings({ next: 7 })`.

## Telas

### `AgendaScreen`
- Header "Agenda"
- Filtros: Todas · Hoje · Semana
- Lista de `AgendaItem` agrupada por dia (Hoje, Amanhã, Quinta-feira…)
- Tap em item → detalhes do assistido vinculado [05]

### `AgendarReuniaoScreen` (vinda do perfil do assistido)
- Card "Reunião com [Assistido]" pré-preenchido
- Picker de tipo: presencial · online · ligação (radio com ícones)
- Título (auto: "Visita · Nome Sobrenome")
- Date + Time pickers
- Duração (select)
- Local (string ou link, depende do tipo)
- Notas (textarea)
- Toggle "Notificar pelo WhatsApp"
- CTA `Agendar e adicionar à agenda`

## Critérios de Aceite

```gherkin
Cenário: Criar reunião presencial
  Dado o assistido "Carlos"
  Quando crio uma reunião presencial para amanhã 19:00 com 1h
  Então um Meeting é criado (tenantId, assistidoId, inicioEm, tipo='presencial')
  E um TimelineEvent kind='sistema' é criado no assistido
  E se notificarWhatsapp=true, um job é enfileirado

Cenário: Reunião sem assistido (reunião interna da equipe)
  Quando crio uma reunião sem assistidoId vinculado
  Então o Meeting é criado normalmente
  E não dispara timeline em nenhum assistido

Cenário: Lista da semana
  Dado 4 reuniões: 2 hoje, 1 amanhã, 1 daqui 5 dias
  Quando filtro por "Semana"
  Então vejo as 4 ordenadas por inicioEm

Cenário: Cancelar reunião
  Dado Meeting agendado
  Quando marco como 'cancelada'
  Então sumiu da lista padrão (filtro padrão exclui canceladas)

Cenário: Marca como realizada
  Dado Meeting passado
  Quando marco como 'realizada'
  Então TimelineEvent kind='sistema' criado e Assistido.ultimoContatoEm atualizado
```

## Contratos

```ts
export const MeetingType = z.enum(['presencial','online','ligacao']);
export const MeetingStatus = z.enum(['agendada','realizada','cancelada']);
export const MeetingSummary = z.object({
  id: z.string(),
  titulo: z.string(),
  tipo: MeetingType,
  inicioEm: z.date(),
  duracaoMin: z.number(),
  assistidoId: z.string().nullable(),
  assistidoNome: z.string().nullable(),
  urgente: z.boolean(),
  local: z.string().nullable(),
  status: MeetingStatus,
});
```

### Server actions

```ts
'use server';
export async function listMeetings(filter?: {
  range?: 'today'|'week'|'all';
  status?: MeetingStatus[];
  assistidoId?: string;
}): Promise<MeetingSummary[]>;

export async function createMeeting(input: CreateMeetingInput): Promise<MeetingSummary>;
export async function updateMeeting(id: string, patch: Partial<UpdateMeetingInput>): Promise<MeetingSummary>;
export async function setMeetingStatus(id: string, status: MeetingStatus): Promise<MeetingSummary>;
```

## Files / paths

```
src/app/(app)/agenda/page.tsx
src/app/(app)/assistidos/[id]/agendar-reuniao/page.tsx
src/components/domain/agenda/agenda-item.tsx
src/components/domain/agenda/meeting-type-picker.tsx
src/components/domain/agenda/agenda-group-by-day.tsx
src/server/meeting.actions.ts
src/db/schema/meetings.ts
src/lib/validators/meeting.ts
src/tests/factories/meeting.factory.ts
```

## Testes (Faker)

```ts
export const meetingFactory = (tenantId, createdBy, overrides = {}) => ({
  tenantId, criadoPor: createdBy,
  titulo: `Visita · ${faker.person.firstName()}`,
  tipo: faker.helpers.arrayElement(['presencial','online','ligacao']),
  inicioEm: faker.date.soon({ days: 7 }),
  duracaoMin: faker.helpers.arrayElement([30, 45, 60, 90]),
  notificarWhatsapp: true,
  ...overrides,
});
```

- **Unit:** validações + ordenação por `inicioEm`
- **Integration:** create meeting + timeline event no assistido
- **Tenancy:** meetings só visíveis no tenant
- **Performance:** listMeetings({range:'week'}) p95 < 80ms com 500 reuniões

## Events Published

- `meeting.created` (consumido por job de notificação WhatsApp)
- `meeting.status_changed`

## Events Consumed

- `assistido.deleted` → marca meetings como cancelados? **Não**, mantém histórico (assistidoId vira null via FK set null).

## Riscos

- **Timezone:** sempre persistir com tz; UI exibe em `America/Manaus` (ou tz do tenant — v2).
- **Reuniões recorrentes** ficam para v2.

## Definition of Done

- [ ] Lista filtrável + agrupamento por dia
- [ ] Form de agendar com 3 tipos
- [ ] Notificação WhatsApp enfileirada
- [ ] Testes Faker + tenancy passando

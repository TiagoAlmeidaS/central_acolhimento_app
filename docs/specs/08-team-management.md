---
name: 08-team-management
title: Gestão de Equipe (líder)
kind: Spec
owner: team-agent
status: pending
size: S
depends_on: ["00-foundations","01-auth","03-tenant-setup","02-cuidador-signup","04-invitations"]
parallel_safe_with: ["05-assistidos","06-agenda","07-mensagens-ia","09-dashboard-lider","11-settings","10-billing-stripe"]
owns:
  - src/app/(app)/equipe/page.tsx
  - src/app/(app)/equipe/[id]/**
  - src/server/membership.actions.ts (regiões `manage`, `approve`, `remove`)
  - src/components/domain/team/**
may-read:
  - src/server/invite.actions.ts
  - src/lib/tenancy/**
  - src/components/ui/**
updated: 2026-05-25
---

# 08 · Team Management

## Problema

Líder precisa ver, aprovar, recusar e remover membros da equipe. Spec entrega a tela `EquipeScreen` com duas abas: **Ativos** e **Pendentes**.

## User Stories

- Como **líder**, vejo equipe ativa com status online, casos atribuídos, antiguidade.
- Como **líder**, aprovo / recuso cuidadores pendentes em 1 toque.
- Como **líder**, removo um membro (com confirmação).
- Como **líder**, atribuo papel "Líder" a outro membro.

## Tela (`EquipeScreen` em `app/screens-team.jsx`)

- Header com `<-` + título "Equipe" + botão `+` (vai para [04-invitations/convidar])
- TenantChip
- Segmented tabs: `Ativos` (n) · `Pendentes` (n)

### Aba Ativos
- Lista de `CuidadorRow`:
  - Avatar com badge online
  - Nome + tag "Líder" se aplicável
  - "{casos} casos ativos · desde {mes/ano}"
  - Botão `...` (menu: trocar papel, remover)
- CTA `Convidar novo cuidador` (vai pra [04])

### Aba Pendentes
- Lista de `PendenteRow`:
  - Avatar + nome + cidade + "há X dias"
  - Bio
  - 2 botões: `Aprovar` (verde) / `Recusar` (cinza)
- Empty state: "Nenhuma solicitação pendente ✓"

## Critérios de Aceite

```gherkin
Cenário: Aprovar pendente
  Dado um Membership pendente no meu tenant
  Quando clico em "Aprovar"
  Então Membership.status='ativo', ativadoEm=now
  E o User aprovado é notificado por WhatsApp
  E na lista a linha some

Cenário: Recusar pendente
  Quando clico "Recusar"
  Então Membership.status='recusado'
  E o User é notificado

Cenário: Remover membro ativo
  Quando confirmo remoção
  Então Membership.status='removido', removidoEm=now
  E o usuário perde acesso ao tenant imediatamente (próximo refresh redireciona)

Cenário: Trocar papel para Líder
  Quando promovo um cuidador
  Então Membership.papel='lider'
  E o membro ganha acesso ao Dashboard + Billing (se for o dono da assinatura, não muda)

Cenário: Visão cuidador
  Dado eu sou cuidador (não líder)
  Quando tento acessar /equipe
  Então sou redirecionado para /home com toast "ação restrita ao líder"
```

## Contratos

```ts
// server/membership.actions.ts (parte desta spec)
export async function listTeamMembers(): Promise<TeamMember[]>;
export async function listPendingMemberships(): Promise<PendingMembership[]>;
export async function approveMembership(id: string): Promise<void>;
export async function declineMembership(id: string, motivo?: string): Promise<void>;
export async function removeMembership(id: string): Promise<void>;
export async function changeMembershipRole(id: string, papel: 'lider'|'cuidador'): Promise<void>;
```

`TeamMember` adiciona:
- `online: boolean` (derivado de `last_seen`)
- `casosAtivos: number` (count de Assistido com `cuidadorId=user.id` e status não-concluido)
- `desde: string` (ativadoEm formatado)

## Files / paths

```
src/app/(app)/equipe/page.tsx
src/components/domain/team/cuidador-row.tsx
src/components/domain/team/pendente-row.tsx
src/components/domain/team/team-segmented-tabs.tsx
src/server/membership.actions.ts                    # regiões manage/approve/remove
src/tests/factories/membership.factory.ts           # se já não criado em [02]
```

## Testes (Faker)

- **Unit:** validação de transições de status
- **Integration:** aprovar pendente dispara notificação + muda status
- **Authz:** cuidador não pode aprovar; só líder
- **Tenancy:** Líder do tenant A não vê pendentes do tenant B
- **e2e:** aprovar + sumir da lista em mobile

## Events Published

- `membership.approved` (consumido por [02-cuidador-signup] para liberar acesso)
- `membership.declined`
- `membership.removed`
- `membership.role_changed`

## Events Consumed

- `membership.requested` (de [02]) → bumper de contagem na aba pendentes
- `invite.accepted` (de [04]) → bumper de contagem na aba ativos

## Riscos

- **Líder remove a si mesmo:** bloquear se for o único líder ativo.
- **Líder rebaixa o dono da assinatura:** bloquear.

## Definition of Done

- [ ] 2 abas funcionando com contagens
- [ ] Aprovar/recusar/remover/trocar papel
- [ ] Notificações disparadas
- [ ] Authz blindada (cuidador não acessa)
- [ ] Testes tenancy + authz passando

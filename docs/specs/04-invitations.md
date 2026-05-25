---
name: 04-invitations
title: Convites (líder → cuidador) por WhatsApp
kind: Spec
owner: invite-agent
status: pending
size: M
depends_on: ["00-foundations","01-auth","03-tenant-setup"]
parallel_safe_with: ["10-billing-stripe","11-settings","05-assistidos","06-agenda","07-mensagens-ia","09-dashboard-lider"]
blocks: []
owns:
  - src/app/(onboarding)/convite/[token]/**
  - src/app/(app)/equipe/convidar/**
  - src/server/invite.actions.ts
  - src/db/schema/invites.ts
  - src/lib/whatsapp/send-invite.ts
  - src/components/domain/invite/**
may-read:
  - src/server/membership.actions.ts
  - src/lib/auth/**
  - src/components/ui/**
updated: 2026-05-25
---

# 04 · Invitations

## Problema

O fluxo de convite é o caminho **dominante** para preencher uma equipe (mais rápido que cuidador self-signup + análise). O líder convida pelo WhatsApp; a pessoa convidada entra direto sem fila.

## User Stories

- Como **líder**, eu quero enviar um convite com 1 toque pelo WhatsApp.
- Como **líder**, eu quero copiar o link do convite para repassar manualmente.
- Como **pessoa convidada**, eu quero ver quem me convidou e em qual localidade vou entrar.
- Como **pessoa convidada**, eu quero entrar sem passar por fila de análise.

## Telas

### Líder envia
- `ConvidarScreen` — formulário (nome + telefone + papel `Cuidador|Líder`) → CTA `Enviar convite pelo WhatsApp`
- `ConviteEnviadoScreen` — confirmação com link copiável, "como ela recebe" (botão demo), "Concluído"

### Pessoa convidada recebe
- `ConviteRecebidoScreen` — banner com cor da localidade + inviter + 3 benefícios + `Aceitar` / `Recusar`
- `ConviteConfirmarScreen` — formulário pré-preenchido (nome, tel) + bio opcional → `Confirmar e entrar`
- `BemVindaScreen` — splash com heart + CTA `Começar a acolher`

## Critérios de Aceite

```gherkin
Cenário: Líder envia convite
  Dado eu sou líder ativo do Tenant T
  Quando envio convite para "+55 92 99100 5577" com papel "cuidador"
  Então um Invite é criado (status='pendente', expiraEm=now+7d)
  E um WhatsApp template "convite_cuidador" é disparado com a URL
  E o link `acolhe.app/c/<token>` resolve para a tela de convite recebido

Cenário: Aceitar convite
  Dado um Invite válido para tenant T, papel "cuidador"
  Quando a pessoa abre o link, confirma dados, e submete
  Então:
    - Se o telefone do convite já tem User → reaproveita
    - Senão → cria User
    - Cria Membership (tenantId=T, papel='cuidador', status='ativo', convidadoPor=lider)
    - Invite.status='aceito'
  E a pessoa é levada para a tela "BemVindaScreen"
  E em seguida para o app

Cenário: Link expirado
  Dado um Invite expirou (8 dias)
  Quando o link é aberto
  Então mostra "Convite expirado. Peça outro à liderança." sem expor dados sensíveis

Cenário: Link já usado
  Dado Invite com status='aceito'
  Quando o link é reaberto
  Então redireciona para login (ou app se autenticado)

Cenário: Recusar
  Dado Invite válido
  Quando "Recusar"
  Então Invite.status='recusado' e a pessoa é levada para `/login`
```

## Contratos

### Schemas

```ts
export const InviteCreateSchema = z.object({
  nome: z.string().min(3),
  telefone: PhoneSchema,
  papel: z.enum(['cuidador','lider']),
});

export const InviteAcceptSchema = z.object({
  token: z.string(),
  bio: z.string().max(500).optional(),
});
```

### Server actions

```ts
'use server';
export async function createInvite(input: InviteCreateInput): Promise<{ inviteUrl: string; token: string }>;
export async function getInviteByToken(token: string): Promise<InvitePublic | null>; // returns inviter + tenant info but no sensitive PII
export async function acceptInvite(input: InviteAcceptInput): Promise<{ membershipId: string }>;
export async function declineInvite(token: string): Promise<void>;
```

### WhatsApp

```ts
// src/lib/whatsapp/send-invite.ts
export async function sendInviteMessage(params: {
  toTelefone: string;
  inviterNome: string;
  tenantNome: string;
  url: string;
}): Promise<void>;
```

Template Meta:
```
Olá! {inviterNome} convidou você para a equipe de cuidadores da Comunidade {tenantNome}. Toque para aceitar: {url}
```

## URL e token

- Path: `acolhe.app/c/<token>` (alias para `/convite/<token>`)
- Token: 16 chars opacos (`nanoid(16)`), único, indexado
- Não inclui PII na URL

## Estados

```
[invite criado] → pendente
      ↓ aceito → aceito (Membership criado)
      ↓ recusado → recusado
      ↓ 7 dias → expirado (job de limpeza diário)
```

## Files / paths

```
src/app/(onboarding)/convite/[token]/page.tsx          # tela recebido
src/app/(onboarding)/convite/[token]/confirmar/page.tsx
src/app/(onboarding)/convite/[token]/bem-vinda/page.tsx
src/app/(app)/equipe/convidar/page.tsx
src/app/(app)/equipe/convidar/enviado/page.tsx
src/components/domain/invite/*
src/server/invite.actions.ts
src/db/schema/invites.ts
src/lib/whatsapp/send-invite.ts
src/lib/whatsapp/templates.ts
src/tests/factories/invite.factory.ts
```

## Testes (Faker)

- **Unit:** geração de token único; expiração 7 dias
- **Integration:** `createInvite` chama WhatsApp e grava DB atômico
- **Integration:** `acceptInvite` reaproveita User existente ou cria
- **Integration:** tentativa de aceitar invite expirado retorna erro
- **Tenancy:** convite só visível no tenant que criou
- **e2e:** fluxo completo enviar → receber → aceitar (em viewport mobile)

```ts
export const inviteFactory = (tenantId: string, criadoPor: string, overrides = {}) => ({
  tenantId, criadoPor,
  nome: faker.person.fullName(),
  telefone: '+55' + faker.string.numeric(11),
  papel: 'cuidador',
  token: faker.string.nanoid(16),
  expiraEm: faker.date.future({ days: 7 }),
  ...overrides,
});
```

## Events Published

- `invite.sent` → notificação push/analytics
- `invite.accepted` → consumido por [08-team-management] para refresh da equipe

## Events Consumed

- Nenhum

## Riscos

- **Phishing:** link real precisa ser HTTPS + domínio reservado.
- **Token reuso:** rejeitar imediatamente se já aceito/recusado.
- **Telefone com User existente em outro tenant:** OK, mesmo User vira membro de mais um tenant.

## Definition of Done

- [ ] Fluxo completo do líder em 2 telas
- [ ] Fluxo completo do convidado em 3 telas
- [ ] WhatsApp template aprovado / stub em dev
- [ ] Link expirado e link reusado tratados
- [ ] Testes de Faker passando
- [ ] Job diário de expiração rodando

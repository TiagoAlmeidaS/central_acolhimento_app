---
title: Modelo de Domínio · Acolhe
kind: DomainModel
owner: produto-acolhe
status: stable
updated: 2026-05-25
---

# Modelo de Domínio

Este documento é a fonte da verdade conceitual. O schema técnico (Drizzle/Postgres) em [`../architecture/data-model.md`](../architecture/data-model.md) deve refletir essas entidades.

---

## 1. Diagrama de alto nível

```
┌──────────────┐   1 N   ┌──────────────┐
│   Tenant     │────────►│  Membership  │  ◄──────┐
│ (Localidade) │         │ (User×Tenant)│         │  N
└──────────────┘         └──────────────┘         │
       │                       │                   │
       │ 1                     │ N                 │ 1
       │                       ▼                   │
       │                  ┌──────────┐         ┌────────┐
       │ N                │   User   │         │ Invite │
       ▼                  └──────────┘         └────────┘
┌──────────────┐                                   ▲
│   Subscription│                                  │ created by líder
│  (Stripe)     │                                  │
└──────────────┘                                   │
       ▲                                           │
       │ 1                                         │
       └────────── pertence ao líder ──────────────┘

┌──────────────┐  N    1  ┌──────────────┐ 1   N ┌──────────────┐
│  Assistido   │◄────────│   Tenant     │──────►│   Meeting    │
└──────┬───────┘          └──────────────┘       └──────────────┘
       │ 1                                              │ 0..1
       ▼                                                ▼
┌──────────────┐                                  ┌──────────────┐
│  Timeline    │                                  │   Assistido  │
│   Event      │                                  └──────────────┘
└──────────────┘

┌──────────────┐ 1   N  ┌──────────────┐
│   Tenant     │───────►│ ChatMessage  │
└──────────────┘        │  (IA agent)  │
                        └──────────────┘
```

---

## 2. Entidades

### 2.1 `Tenant` (Localidade)

A unidade de isolamento. Tudo orbita ela.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `nome` | string | Ex.: "Adrianópolis" |
| `cidade` | string | "Manaus" |
| `uf` | string(2) | "AM" |
| `denominacao` | string? | "Batista" (opcional) |
| `sigla` | string(1..3) | "AD" — exibida no avatar |
| `cor` | string(hex) | "#2D7FF9" — identidade visual |
| `criadoPor` | FK→User | Líder fundador |
| `criadoEm` | timestamp | |
| `assinaturaId` | FK→Subscription? | Aponta para o plano ativo |

**Regras:**
- `(nome, cidade, uf)` deve ser único globalmente.
- Tenant **inativa** (assinatura cancelada) preserva dados por 90 dias, depois purga.
- `cor` deve estar em `TENANT_COLORS` (lista fixa de 8 cores — ver `screens-tenant-setup.jsx`).

---

### 2.2 `User`

Pessoa física. **Apenas líderes e cuidadores logam.** Assistidos *não*.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `nome` | string | Nome completo |
| `telefone` | string E.164 | Único no sistema. Canal de OTP + notificações |
| `fotoUrl` | string? | URL de avatar |
| `criadoEm` | timestamp | |

Um `User` é membro de N `Tenant`s via `Membership`.

---

### 2.3 `Membership` (User × Tenant)

Associação que define **papel** dentro de uma localidade.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `userId` | FK→User | |
| `tenantId` | FK→Tenant | |
| `papel` | enum `'lider' \| 'cuidador'` | |
| `status` | enum `'pendente' \| 'ativo' \| 'recusado' \| 'removido'` | |
| `bio` | string? | Mini-biografia preenchida no cadastro |
| `criadoEm` | timestamp | |
| `ativadoEm` | timestamp? | |
| `removidoEm` | timestamp? | |
| `convidadoPor` | FK→User? | Se entrou via convite |

**Regras:**
- Apenas `Membership.papel='lider'` pode aprovar pendentes da mesma localidade.
- Apenas o líder **fundador** (`Tenant.criadoPor`) é dono da assinatura.
- `(userId, tenantId)` único.

---

### 2.4 `Invite`

Convite gerado pelo líder.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `tenantId` | FK→Tenant | |
| `criadoPor` | FK→User | Líder que convidou |
| `nome` | string | Pré-preenchido |
| `telefone` | string E.164 | Pré-preenchido |
| `papel` | enum `'cuidador' \| 'lider'` | |
| `token` | string opaque | Identificador da URL `acolhe.app/c/<token>` |
| `expiraEm` | timestamp | 7 dias a partir da criação |
| `status` | enum `'pendente' \| 'aceito' \| 'recusado' \| 'expirado'` | |

**Regras:**
- Aceitar gera `Membership` com `status='ativo'` (pula análise).
- Token de uso único.
- Link enviado por WhatsApp pelo líder (deep-link).

---

### 2.5 `Assistido`

Pessoa cuidada. **Nunca loga.** Dados sensíveis.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `tenantId` | FK→Tenant | Escopo fechado |
| `nome` | string | |
| `telefone` | string E.164? | Para WhatsApp direto |
| `cidade` | string | |
| `fotoUrl` | string? | Sem foto → iniciais |
| `status` | enum `'urgente' \| 'aguardando' \| 'acompanhamento' \| 'concluido'` | |
| `cuidadorId` | FK→User? | null = sem cuidador atribuído ("aguardando") |
| `resumo` | text | Resumo curto (1-2 frases), pode ser gerado pela IA |
| `contextoPastoral` | text? | Família, situação, observações |
| `criadoEm` | timestamp | |
| `ultimoContatoEm` | timestamp? | Atualizado por evento de timeline |

**Regras:**
- Mudança de status sempre gera `TimelineEvent`.
- Status `'concluido'` mantém o registro mas remove da Home padrão.
- LGPD: soft-delete (`deletedAt`), purga após 90 dias.

---

### 2.6 `TimelineEvent`

Evento na linha do tempo do assistido.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `assistidoId` | FK→Assistido | |
| `tenantId` | FK→Tenant | Redundante para query (RLS) |
| `kind` | enum `'nota' \| 'ai' \| 'sistema'` | |
| `autorId` | FK→User? | null para `sistema` ou `ai` |
| `texto` | text | |
| `criadoEm` | timestamp | |
| `meta` | jsonb? | Ex.: `{ statusAnterior, statusNovo }`, `{ meetingId }` |

**Regras:**
- Imutável uma vez criado (audit-trail).
- Eventos `'ai'` sempre identificam que vieram do agente.
- Eventos `'sistema'` são gerados por mudanças automáticas (status changed, meeting created, etc).

---

### 2.7 `Meeting` (Reunião / Visita / Ligação)

Agendamento na agenda da localidade.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `tenantId` | FK→Tenant | |
| `criadoPor` | FK→User | Cuidador autor |
| `assistidoId` | FK→Assistido? | null = reunião interna da equipe |
| `titulo` | string | |
| `tipo` | enum `'presencial' \| 'online' \| 'ligacao'` | |
| `inicioEm` | timestamp with tz | |
| `duracaoMin` | int | 15, 30, 45, 60, 90, 120 |
| `local` | string? | Endereço, link ou tel |
| `notas` | text? | |
| `notificarWhatsapp` | bool | Default `true` |
| `status` | enum `'agendada' \| 'realizada' \| 'cancelada'` | |
| `urgente` | bool | flag visual |

**Regras:**
- Criar uma reunião emite `TimelineEvent kind='sistema'`.
- Notificação WhatsApp dispara webhook ao salvar (se `notificarWhatsapp=true`).

---

### 2.8 `Subscription` (Stripe)

Assinatura do plano. **Por tenant**.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `tenantId` | FK→Tenant unique | 1:1 com tenant |
| `donoId` | FK→User | Líder fundador |
| `plano` | enum `'essencial' \| 'pro'` | |
| `status` | enum `'trial' \| 'ativa' \| 'vencida' \| 'cancelada'` | |
| `stripeCustomerId` | string | |
| `stripeSubscriptionId` | string | |
| `proximaCobranca` | date | |
| `trialFim` | date? | 14 dias |
| `criadoEm` | timestamp | |
| `canceladoEm` | timestamp? | |

**Regras:**
- Tenant sem `Subscription.status IN ('trial','ativa')` entra em **modo somente-leitura** após 7 dias de tolerância.
- Mudança de plano cria `Invoice` proporcional via Stripe.

---

### 2.9 `Invoice` (espelho leve da Stripe)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `assinaturaId` | FK→Subscription | |
| `valorCentavos` | int | |
| `data` | date | |
| `status` | enum `'pago' \| 'pendente' \| 'falha'` | |
| `stripeInvoiceId` | string | |
| `pdfUrl` | string? | Hospedado na Stripe |

---

### 2.10 `ChatMessage` (IA)

Conversas com o agente de IA. **Por usuário, dentro de um tenant.**

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | PK |
| `tenantId` | FK→Tenant | |
| `userId` | FK→User | |
| `from` | enum `'user' \| 'ai'` | |
| `text` | text | |
| `linkAssistidoId` | FK→Assistido? | Quando IA detectou referência |
| `criadoEm` | timestamp | |

**Regras:**
- Histórico **não** é compartilhado entre cuidadores.
- Limites de uso (200/mês no Essencial) contabilizados por mês civil + tenant.

---

## 3. Invariantes globais

1. **Tenant-isolation:** toda query DEVE filtrar por `tenantId` do usuário ativo. Sem exceção.
2. **Membership-check:** acesso a recurso de tenant exige `Membership.status='ativo'`.
3. **Billing-gate:** mutação (criar/editar/deletar) bloqueada quando `Subscription` está fora de `trial|ativa`.
4. **Audit:** mudanças de estado em `Assistido` e `Meeting` sempre geram `TimelineEvent`.
5. **WhatsApp first:** todo `User.telefone` validado por OTP antes do primeiro login.

---

## 4. Estados — máquinas

### 4.1 `Assistido.status`

```
[criado] → aguardando ──┐
                        │
urgente ◄───────────────┤
                        │
acompanhamento ◄────────┤
                        │
                        ▼
                    concluido (final, mas reversível)
```

Transições livres entre os 4, exceto que **passar para `concluido`** desabilita avisos de WhatsApp automáticos.

### 4.2 `Membership.status` (self-signup)

```
[cadastro submetido] → pendente → ativo
                                ↘ recusado
ativo → removido (revogação)
```

### 4.3 `Membership.status` (convite)

```
[convite aceito] → ativo direto
```

### 4.4 `Subscription.status`

```
[checkout sucesso] → trial (14 dias)
                       │
                       ▼
                    ativa ⇄ cancelada
                       │
                       ▼ (cobrança falhou)
                    vencida → cancelada (após 7d)
```

---

## 5. Eventos de domínio

São publicados internamente para hooks/webhooks:

| Evento | Quando |
|---|---|
| `tenant.created` | Líder finaliza onboarding |
| `subscription.activated` | Pagamento ok / trial iniciado |
| `subscription.cancelled` | Usuário cancela ou cobrança falha 7d |
| `membership.requested` | Cuidador se autocadastrou |
| `membership.approved` | Líder aprova fila |
| `invite.sent` | Líder envia convite |
| `invite.accepted` | Pessoa aceita convite |
| `assistido.status_changed` | Mudança de status |
| `meeting.created` | Reunião agendada |
| `meeting.completed` | Cuidador marca como realizada |
| `whatsapp.notification_required` | Trigger de notificação externa |

---

*Leitura complementar:* [`user-flows.md`](./user-flows.md) · [`../architecture/data-model.md`](../architecture/data-model.md) · [`../architecture/multi-tenancy.md`](../architecture/multi-tenancy.md)

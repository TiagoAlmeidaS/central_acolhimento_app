---
name: 10-billing-stripe
title: Billing · Stripe (Planos, Checkout, Gestão)
kind: Spec
owner: billing-agent
status: pending
size: L
depends_on: ["00-foundations","01-auth","03-tenant-setup"]
parallel_safe_with: ["04-invitations","05-assistidos","06-agenda","07-mensagens-ia","08-team-management","09-dashboard-lider","11-settings"]
owns:
  - src/app/(app)/assinatura/**
  - src/app/api/webhooks/stripe/**
  - src/server/billing.actions.ts
  - src/lib/stripe/**
  - src/db/schema/subscriptions.ts
  - src/db/schema/invoices.ts
  - src/components/domain/billing/**
may-read:
  - src/server/tenant.actions.ts
  - src/lib/tenancy/**
  - src/components/ui/**
updated: 2026-05-25
---

# 10 · Billing (Stripe)

## Problema

Líder paga R$ 19,90 (Essencial) ou R$ 29,90 (Pró) por mês via Stripe, com 14 dias grátis. Spec entrega:
- Telas de planos, checkout, sucesso
- Tela de gestão de assinatura (status, próxima cobrança, faturas, cancelar)
- Webhooks Stripe (subscription/invoice events)
- Integração com [03-tenant-setup] (chamada inicial pós-criação)

## User Stories

- Como **líder no onboarding**, eu escolho um plano e completo o checkout em < 90 s.
- Como **líder em uso**, eu vejo plano ativo, próxima cobrança e cartão.
- Como **líder**, eu mudo plano (upgrade/downgrade) com pro-rata Stripe.
- Como **líder**, eu cancelo (oferecendo downgrade no caminho).
- Como **dev de [03]**, eu chamo `createCheckoutSession(tenantId, plano)` e levo a pessoa para Stripe-hosted.

## Telas (referência `app/screens-billing.jsx`)

### `PlanosScreen`
- Badge verde "14 dias grátis"
- Título "Mantenha sua localidade acolhendo bem."
- 2 PlanCards (Essencial / Pró com destaque)
- Card de confiança (Stripe + cancelamento)
- CTA: `Continuar com {plano} · R$ X/mês`

### `CheckoutScreen`
- Sumário do pedido (plano, próxima cobrança)
- Picker `Cartão` / `PIX`
- Form de cartão com brand detection (Visa/Mastercard/Amex) — entrega no Stripe Elements, **não** processa client-side
- QR code se PIX
- CTA: `Iniciar 14 dias grátis`
- Footer Stripe + LGPD

### `SucessoAssinaturaScreen`
- Check verde grande
- "Assinatura ativada! A Comunidade {X} agora está no plano {Y}."
- Card "Recibo enviado por WhatsApp e e-mail"
- CTA: `Voltar ao app`

### `AssinaturaAtivaScreen` (gestão)
- Card "Ativa · {Tenant}" com plano + R$ + /mês
- Section "Próxima cobrança" (data + cartão last4)
- Section "Plano" → Mudar plano · Histórico de faturas
- Botão danger ghost: `Cancelar assinatura`

### `FaturasScreen`
- Lista de invoices com check verde, valor, data, "PDF" download

### `CancelarScreen`
- Hourglass + "Tem certeza?"
- Card "Você vai perder…" (4 itens)
- Card "Quer experimentar o Essencial?" (oferta de downgrade)
- CTA primary `Continuar com Pró` + link danger `Sim, cancelar mesmo assim`

## Critérios de Aceite

```gherkin
Cenário: Onboarding — checkout sucesso
  Dado o passo final de [03-tenant-setup]
  Quando o usuário escolhe Pró e completa checkout
  Então cria Subscription(status='trial', stripeSubscriptionId)
  E cria Tenant + Membership atomicamente (via webhook subscription.created)
  E redireciona para SucessoAssinaturaScreen

Cenário: Trial → ativa
  Dado Subscription status='trial' criada em D-13
  Quando o webhook `invoice.payment_succeeded` chega em D-14
  Então Subscription.status='ativa', proximaCobranca atualizada

Cenário: Cobrança falha
  Dado Subscription ativa
  Quando webhook `invoice.payment_failed` chega
  Então Subscription.status='vencida'
  E após 7 dias sem regularização → 'cancelada' + tenant entra em readonly

Cenário: Mudar plano
  Dado plano Essencial
  Quando o líder muda para Pró
  Então Stripe gera proration e webhook atualiza Subscription.plano='pro'

Cenário: Cancelar com confirmação
  Quando o líder confirma cancelamento
  Então Stripe `cancel_at_period_end=true`
  E acesso continua até proximaCobranca
  E após o vencimento, tenant entra em readonly

Cenário: Cuidador NÃO vê billing
  Dado eu sou cuidador
  Quando tento /assinatura
  Então redireciona para /home com toast
```

## Contratos

```ts
export const Plano = z.enum(['essencial','pro']);
export const PlanoPreco = { essencial: 1990, pro: 2990 }; // centavos

// server/billing.actions.ts
'use server';
export async function listPlanos(): Promise<PlanoInfo[]>;
export async function createCheckoutSession(input: {
  tenantId: string;     // o caller já é dono
  plano: 'essencial'|'pro';
  returnUrl: string;
}): Promise<{ url: string }>;

export async function loadSubscription(): Promise<SubscriptionView | null>;
export async function changePlan(plano: 'essencial'|'pro'): Promise<void>;
export async function listInvoices(): Promise<InvoiceView[]>;
export async function cancelSubscription(): Promise<void>;
export async function openCustomerPortal(): Promise<{ url: string }>;
```

## Stripe — produtos e prices

| Plano | Preço | Stripe Price ID |
|---|---|---|
| Essencial | R$ 19,90/mês | `price_essencial_brl_monthly` |
| Pró | R$ 29,90/mês | `price_pro_brl_monthly` |

Trial: `trial_period_days: 14`.

## Webhooks

`POST /api/webhooks/stripe` (Node runtime, valida assinatura):

| Evento | Ação |
|---|---|
| `customer.subscription.created` | Cria Subscription local; conecta tenant |
| `customer.subscription.updated` | Atualiza plano/status/proximaCobranca |
| `customer.subscription.deleted` | Status='cancelada' |
| `invoice.payment_succeeded` | Cria Invoice local; status='ativa' |
| `invoice.payment_failed` | Status='vencida' + dispara job grace period |

## Files / paths

```
src/app/(app)/assinatura/page.tsx                    # AssinaturaAtivaScreen
src/app/(app)/assinatura/planos/page.tsx
src/app/(app)/assinatura/checkout/page.tsx
src/app/(app)/assinatura/sucesso/page.tsx
src/app/(app)/assinatura/faturas/page.tsx
src/app/(app)/assinatura/cancelar/page.tsx
src/app/api/webhooks/stripe/route.ts
src/server/billing.actions.ts
src/lib/stripe/client.ts
src/lib/stripe/prices.ts
src/lib/stripe/webhook-handlers.ts
src/db/schema/subscriptions.ts
src/db/schema/invoices.ts
src/components/domain/billing/plan-card.tsx
src/components/domain/billing/brand-dot.tsx
src/components/domain/billing/check-row.tsx
src/tests/factories/subscription.factory.ts
```

## Testes (Faker)

- **Unit:** `formatBRL`, `detectBrand`
- **Integration (Stripe mock):** create checkout, recebe webhook, persiste
- **Integration:** mudança de plano updateia local
- **Tenancy:** invoices só visíveis ao dono
- **Authz:** cuidador não passa pelos endpoints

```ts
import Stripe from 'stripe';
import { faker } from '@faker-js/faker/locale/pt_BR';

export const subscriptionFactory = (tenantId: string, donoId: string, overrides = {}) => ({
  tenantId, donoId,
  plano: faker.helpers.arrayElement(['essencial','pro']),
  status: 'ativa',
  stripeCustomerId: 'cus_' + faker.string.alphanumeric(14),
  stripeSubscriptionId: 'sub_' + faker.string.alphanumeric(14),
  proximaCobranca: faker.date.soon({ days: 30 }),
  ...overrides,
});
```

## Events Published

- `subscription.activated` (consumido por [03-tenant-setup] para `provisionTenant`)
- `subscription.cancelled`
- `invoice.paid`
- `invoice.failed`

## Events Consumed

- `tenant.created` (de [03]) → criar Stripe Customer

## Riscos

- **Webhook re-entry / duplicação:** idempotência via `stripeEventId` em tabela `webhook_events`.
- **Race condition trial → ativa:** sempre confiar no Stripe como fonte da verdade; DB segue webhook.
- **PIX no plano recorrente:** Stripe Brasil suporta para 1ª cobrança; recorrência continua em cartão (documentar UX).

## Definition of Done

- [ ] Telas de planos/checkout/sucesso/gestão/faturas/cancelar
- [ ] Webhooks Stripe assinados e idempotentes
- [ ] Trial 14 dias funcionando
- [ ] Mudança de plano com pro-rata
- [ ] Cancelar com período-graça
- [ ] Authz cuidador bloqueado
- [ ] Testes integração com Stripe mock

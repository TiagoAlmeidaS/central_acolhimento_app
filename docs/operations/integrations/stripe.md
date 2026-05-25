# Stripe · Assinaturas

## Por que usamos

Cobrança recorrente por **localidade (tenant)**. Modelo:

- Plano **Essencial** — mensal/anual
- Plano **Pro** — mensal/anual
- Trial de 14 dias automático
- Cobrança em BRL com cartão (e futuramente Pix via Stripe)

Stripe vence aqui por:

- Subscriptions, trial, proration, dunning, faturas — tudo pronto.
- Customer Portal hospedado (sem precisar construir UI de billing).
- Webhooks confiáveis com retry exponencial.
- Suporte forte a BRL e Pix (em rampagem).

## Setup

### 1. Conta Stripe Brasil

1. [dashboard.stripe.com/register](https://dashboard.stripe.com/register) → escolha **Brasil** como país.
2. Ative **Modo de teste** (toggle no topo). Toda chave começa com `_test_`.
3. Para produção, ative **conta business** preenchendo dados fiscais (CNPJ, endereço, conta bancária).

### 2. Criar produtos e preços

Em **Products → Add product**:

| Produto              | ID lookup     | Preço (BRL/mês) | Preço (BRL/ano) |
| -------------------- | ------------- | --------------- | --------------- |
| Acolhe · Essencial   | `essencial`   | a definir       | a definir       |
| Acolhe · Pro         | `pro`         | a definir       | a definir       |

Após criar, anote os IDs no formato `price_xxx`. São esses que vão para `STRIPE_PRICE_ESSENCIAL` e `STRIPE_PRICE_PRO`.

> Mantenha **um price ID por ambiente** (test/live). Mistura-los causa Subscription com price inválido.

### 3. Webhook endpoint

1. **Developers → Webhooks → Add endpoint**.
2. URL:
   - Test: `https://<preview>.vercel.app/api/webhooks/stripe`
   - Live: `https://acolhe.app/api/webhooks/stripe`
3. Eventos relevantes (mínimo):
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Signing secret** (`whsec_…`) → `STRIPE_WEBHOOK_SECRET`.

### 4. Customer Portal

**Settings → Customer Portal → Activate**. Já vem com cancelamento, troca de plano, atualização de cartão. Configure URL de retorno: `https://acolhe.app/billing`.

## Envs

| Variável                  | Test                | Live              |
| ------------------------- | ------------------- | ----------------- |
| `STRIPE_SECRET_KEY`       | `sk_test_…`         | `sk_live_…`       |
| `STRIPE_WEBHOOK_SECRET`   | `whsec_test_…`      | `whsec_live_…`    |
| `STRIPE_PRICE_ESSENCIAL`  | `price_…` (test)    | `price_…` (live)  |
| `STRIPE_PRICE_PRO`        | `price_…` (test)    | `price_…` (live)  |

> Use o scope **Preview = test** e **Production = live** no Vercel para nunca cobrar usuário real numa PR.

## Dev mode / stub

```bash
# .env.local — vazio funciona, mas com test keys você consegue testar checkout real
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ESSENCIAL=price_test_essencial
STRIPE_PRICE_PRO=price_test_pro
```

Sem chaves, o fluxo de checkout deve ser **stubado** (Wave 2 vai cobrir isso na spec `04-billing`).

Para receber webhooks no localhost:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copie o whsec_... mostrado para STRIPE_WEBHOOK_SECRET
```

Para disparar eventos de teste:

```bash
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
```

## Produção · checklist

- [ ] Conta Stripe **ativada** (modo Live)
- [ ] Produtos com `price_id` Live anotados
- [ ] Webhook Live registrado com URL de produção
- [ ] `STRIPE_WEBHOOK_SECRET` Live no Vercel Production scope
- [ ] Customer Portal ativo
- [ ] **Idempotência** validada — handler de webhook deve tolerar entregas duplicadas
- [ ] **Assinatura do webhook** verificada (HMAC SHA-256) em **todos** os requests

## Custos & limites

- **Stripe Brasil**: 3.99% + R$0.39 por transação aprovada com cartão.
- **Sem mensalidade**.
- **Pix**: 0.99% (em rampagem, sob aprovação).
- **Customer Portal**: gratuito.

## Troubleshooting

| Sintoma                                              | Causa                                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------------------- |
| `No signatures found matching the expected signature`| `STRIPE_WEBHOOK_SECRET` errado ou body parseado antes da verificação   |
| `No such price: 'price_xxx'`                         | Misturou price ID test/live com chave do outro modo                    |
| Assinatura ativa mas tenant não vê acesso            | Webhook chegou antes do `customer.subscription.created`; idempotência  |
| Pagamento aprovado e estornado em ~1 dia             | Risco automático (Radar); revisar logs em `Payments → Disputes`        |

# Environments

Inventário canônico de variáveis e onde cada uma é configurada.

## Ambientes

| Ambiente      | Branch    | URL                          | Banco        | Stripe   | WhatsApp                 |
| ------------- | --------- | ---------------------------- | ------------ | -------- | ------------------------ |
| `development` | local     | `http://localhost:3000`      | docker/local | test     | dev mode (console)       |
| `preview`     | qualquer  | `*.vercel.app`               | Neon branch  | test     | dev mode (até validar)   |
| `production`  | `main`    | `acolhe.app` (custom)        | Neon prod    | live     | Meta Cloud API real      |

## Tabela mestra de envs

| Variável                    | Validação Zod                     | dev (`.env.local`)                          | preview              | production           |
| --------------------------- | --------------------------------- | ------------------------------------------- | -------------------- | -------------------- |
| `NODE_ENV`                  | enum dev/test/prod                | `development`                               | (auto)               | (auto)               |
| `NEXT_PUBLIC_APP_URL`       | url                               | `http://localhost:3000`                     | `$VERCEL_URL`        | URL real             |
| `DATABASE_URL`              | url opcional                      | local pg                                    | Neon branch          | Neon prod            |
| `AUTH_SECRET`               | string ≥16                        | dev secret                                  | random 32 chars      | random 32 chars      |
| `AUTH_TRUST_HOST`           | string                            | `true`                                      | `true`               | `true`               |
| `WHATSAPP_TOKEN`            | string opcional                   | vazio                                       | vazio                | Meta token           |
| `WHATSAPP_PHONE_NUMBER_ID`  | string opcional                   | vazio                                       | vazio                | número Meta          |
| `WHATSAPP_VERIFY_TOKEN`     | string opcional                   | random                                      | random               | random               |
| `WHATSAPP_DEV_MODE`         | "true"/"false" (default `true`)   | `true`                                      | `true`               | `false`              |
| `STRIPE_SECRET_KEY`         | string opcional                   | `sk_test_…` (opcional)                      | `sk_test_…`          | `sk_live_…`          |
| `STRIPE_WEBHOOK_SECRET`     | string opcional                   | `whsec_…` (via `stripe listen`)             | `whsec_test_…`       | `whsec_live_…`       |
| `STRIPE_PRICE_ESSENCIAL`    | string opcional                   | `price_…` (test)                            | `price_…` (test)     | `price_…` (live)     |
| `STRIPE_PRICE_PRO`          | string opcional                   | `price_…` (test)                            | `price_…` (test)     | `price_…` (live)     |
| `ANTHROPIC_API_KEY`         | string opcional                   | `sk-ant-…` (opcional)                       | `sk-ant-…`           | `sk-ant-…`           |
| `UPSTASH_REDIS_REST_URL`    | url opcional                      | dev DB Upstash                              | preview DB Upstash   | prod DB Upstash      |
| `UPSTASH_REDIS_REST_TOKEN`  | string opcional                   | dev token                                   | preview token        | prod token           |

## Onde cada coisa vive

| Tipo de credencial            | Local                                                    |
| ----------------------------- | -------------------------------------------------------- |
| Dev pessoal                   | `.env.local` (gitignored)                                |
| Vercel Preview/Production     | **Vercel → Settings → Environment Variables**            |
| CI segredos (se necessário)   | **GitHub → Settings → Secrets and variables → Actions**  |

> O CI **não carrega nenhuma env** — todas as variáveis de `src/lib/env.ts` são `.optional()` ou têm default, então build/test passam limpos. Segredos reais ficam só na Vercel.

## Como rotacionar uma credencial

1. Gere a nova credencial no provedor.
2. Atualize no painel da Vercel (Preview e Production).
3. **Redeploy** o último deploy (Deployments → ⋯ → Redeploy → "Use existing Build Cache: NO").
4. Quando confirmar funcionamento, **revogue** a antiga no provedor.
5. Atualize seu `.env.local` (e do time, se for credencial compartilhada).

## Como adicionar uma nova env

1. Adicione o campo em [`src/lib/env.ts`](../../src/lib/env.ts) com validação Zod.
   - Prefira `.optional()` ou `.default(...)` para manter o CI sem credenciais.
2. Adicione a linha em [`.env.example`](../../.env.example).
3. Atualize esta tabela.
4. Configure na Vercel nos escopos relevantes (Production/Preview) antes do merge.
5. **Se** a env for obrigatória em testes do CI (ex.: e2e contra DB real), adicione em **GitHub → Secrets** e referencie no workflow via `${{ secrets.NOME }}`.

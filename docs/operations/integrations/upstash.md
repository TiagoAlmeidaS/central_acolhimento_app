# Upstash Redis

## Por que usamos

Rate-limit distribuído essencial para:

- **OTP requests** — máximo 1 por minuto, 5 por hora por telefone (anti-flood SMS Meta).
- **Login attempts** — anti-bruteforce.
- **Webhook deduplication** — futuro, para idempotência multi-pod.

Por que Upstash:

- **REST API** funciona em **Edge Runtime** (Vercel Edge Functions). Redis tradicional não.
- **Pay-per-request** — $0 até 10k requests/dia.
- **`@upstash/ratelimit`** já implementa sliding window, fixed window, token bucket.
- Integra direto com Vercel via marketplace.

Alternativas avaliadas: Redis no Render/Railway (precisa de connection TCP, não roda em Edge), in-memory (não distribuído, perde tudo entre deploys), Cloudflare KV (latência maior para writes).

## Setup

### 1. Criar database

1. [console.upstash.com](https://console.upstash.com) → Sign up com GitHub.
2. **Create Database**:
   - Tipo: **Regional** (latência menor que Global pro nosso caso).
   - Region: `sa-east-1` (São Paulo) — se ausente, `us-east-1`.
   - TLS: ON.
   - **Eviction**: `allkeys-lru` (rate-limit é cache, pode evicar).
3. Anote da seção **REST API**:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 2. Databases por ambiente

Recomendado: **um DB por ambiente** para isolar:

- `acolhe-dev` (compartilhado entre devs ou um por pessoa)
- `acolhe-preview` (cada PR pode usar o mesmo DB — keys têm TTL curto)
- `acolhe-prod`

### 3. Integração via Vercel Marketplace (opcional)

Em **Vercel → Storage → Browse Marketplace → Upstash**. Conecta e injeta as envs automaticamente. Mais simples que copiar manualmente.

## Envs

| Variável                    | Valor                          |
| --------------------------- | ------------------------------ |
| `UPSTASH_REDIS_REST_URL`    | `https://xxxx.upstash.io`      |
| `UPSTASH_REDIS_REST_TOKEN`  | token longo do painel          |

## Dev mode / stub

Sem credenciais, [`src/lib/auth/rate-limit.ts`](../../../src/lib/auth/rate-limit.ts) cai em **fallback in-memory** (Map global). Isso é OK para dev pessoal (1 processo) mas inviável para produção (cada lambda da Vercel tem memória própria).

```bash
# .env.local
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
# fallback in-memory ativo
```

## Produção · checklist

- [ ] DB Upstash Regional criado em `sa-east-1`
- [ ] Eviction policy `allkeys-lru`
- [ ] Variáveis no Vercel **Production** scope
- [ ] Métricas habilitadas (console mostra QPS, hit rate)
- [ ] Alerta de uso > 80% do free tier (Console → Settings → Notifications)

## Padrões de rate-limit usados

| Ação                  | Estratégia          | Janela    | Limite       |
| --------------------- | ------------------- | --------- | ------------ |
| `requestOtp`          | Sliding window      | 60s       | 1 / telefone |
| `requestOtp`          | Sliding window      | 1h        | 5 / telefone |
| `verifyOtp`           | Fixed window        | 10min     | 5 / telefone |
| Login form submit     | Sliding window      | 60s       | 10 / IP      |

Implementado em [`src/lib/auth/rate-limit.ts`](../../../src/lib/auth/rate-limit.ts).

## Custos & limites

- **Free tier**: 10.000 commands/dia, 256MB memória, sem custo até 500k req/mês.
- **Pay-as-you-go**: $0.20 / 100k requests acima do free.
- Estimativa: para 1000 OTPs/dia precisamos de ~5000 commands → folga muito grande.

## Troubleshooting

| Sintoma                                | Causa                                                          |
| -------------------------------------- | -------------------------------------------------------------- |
| `WRONGPASS invalid token`              | Token expirado ou de outro DB                                  |
| `UPSTASH_REDIS_REST_URL must be valid` | Esqueceu `https://` ou colou a URL TCP em vez da REST          |
| Rate-limit nunca dispara em prod       | Em dev você pode estar batendo o fallback in-memory; checar env|
| `Too Many Requests` legítimos          | Não é bug — usuário precisa esperar a janela passar            |

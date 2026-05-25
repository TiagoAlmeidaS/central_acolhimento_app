# Integrações externas

Toda dependência externa deste produto tem doc próprio aqui:

| Serviço               | Função                                  | Doc                                                |
| --------------------- | --------------------------------------- | -------------------------------------------------- |
| Neon                  | Postgres serverless                     | [`neon.md`](./neon.md)                             |
| Meta WhatsApp Cloud   | OTP + notificações                      | [`whatsapp-cloud-api.md`](./whatsapp-cloud-api.md) |
| Stripe                | Assinaturas / billing                   | [`stripe.md`](./stripe.md)                         |
| Anthropic Claude      | Agente conversacional                   | [`anthropic.md`](./anthropic.md)                   |
| Upstash Redis         | Rate-limit / cache leve                 | [`upstash.md`](./upstash.md)                       |
| Vercel                | Hospedagem / CI / DNS                   | [`../vercel.md`](../vercel.md)                     |

## Padrão de doc

Cada arquivo segue:

1. **Por que usamos** — motivação e alternativas consideradas.
2. **Setup** — passo a passo para criar conta e credenciais.
3. **Envs** — quais variáveis configurar e onde.
4. **Dev mode / stub** — como rodar sem credencial real.
5. **Produção** — checklist antes de ligar.
6. **Custos & limites** — free tier + quando começa a custar.
7. **Troubleshooting** — erros comuns.

## Stub-first por padrão

Toda integração tem um modo offline:

- **WhatsApp**: `WHATSAPP_DEV_MODE=true` → loga OTP no console.
- **Stripe**: chaves `sk_test_…` + webhook via `stripe listen`.
- **Anthropic**: ausência da key → respostas mockadas.
- **Upstash**: ausência da URL → in-memory rate-limit (não distribuído).
- **Neon**: pode rodar contra Postgres local via Docker.

Isso garante que dev novo consegue subir o app sem ter conta em nenhum desses serviços.

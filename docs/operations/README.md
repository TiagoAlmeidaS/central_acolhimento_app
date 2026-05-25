# Operação

Documentação de tudo o que mantém a aplicação no ar:

| Documento                                                | Resumo                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------- |
| [`ci-cd.md`](./ci-cd.md)                                 | Pipeline GitHub Actions, branch protection, regras de release |
| [`vercel.md`](./vercel.md)                               | Setup Vercel, preview deployments, envs por ambiente          |
| [`environments.md`](./environments.md)                   | Inventário de envs e onde cada valor mora                     |
| [`runbooks/`](./runbooks/)                               | Procedimentos operacionais (a popular conforme aparecerem)    |
| [`integrations/`](./integrations/README.md)              | Setup detalhado de cada serviço externo                       |

## Princípios

1. **Segredo nunca vai pro git.** Use `.env.local` (gitignored), Vercel Env Vars ou GitHub Secrets.
2. **Dev é offline-friendly.** Toda integração externa tem **modo dev/stub** (ex.: `WHATSAPP_DEV_MODE=true`).
3. **CI é o portão.** Sem `lint + typecheck + test + build` verde, não merge em `main`.
4. **Documentar sempre.** Qualquer nova env, integração ou runbook ganha um doc aqui.

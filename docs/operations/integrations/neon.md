# Neon · Postgres serverless

## Por que usamos

- **Serverless real**: escala a zero quando ocioso, ideal para SaaS multi-tenant em estágio inicial.
- **Branching**: cada PR pode ter seu próprio DB branch (cópia barata via copy-on-write), perfeito para preview deploys.
- **Compatível com Drizzle ORM** e com pgBouncer transparente (resolvendo o gargalo de conexões da Vercel).
- **Free tier generoso**: 0.5 GB storage, 191.9 compute hours, branch ilimitado.

Alternativas avaliadas: Supabase (acumula features que não usamos), Vercel Postgres (vendor lock-in maior, preço pior em escala), RDS/Cloud SQL (overkill no estágio atual).

## Setup

### 1. Criar conta e projeto

1. [neon.tech](https://neon.tech) → Sign up com GitHub.
2. **New Project**:
   - Nome: `central-acolhimento`
   - Postgres version: 16
   - Region: `aws-sa-east-1` (São Paulo) se disponível, senão `aws-us-east-2`
3. Anote a **connection string** apresentada — formato:
   ```
   postgresql://USER:PASS@HOST/DB?sslmode=require
   ```

### 2. Branches por ambiente

- **`main`** (default) → produção (read/write).
- **`preview`** → criado automaticamente pela integração com Vercel ao abrir PR.
- **`dev`** → branch pessoal por dev (opcional).

Para ativar branching automático nas PRs:

1. Em Neon → **Integrations** → **Vercel** → autorizar.
2. Selecione o projeto da Vercel.
3. Marque **"Create a branch for each preview deployment"**.

A partir daí, toda PR aberta tem um banco isolado. Sem mais "ah, quebrei o dev de alguém" durante revisão.

### 3. Connection pooling

Para serverless (Vercel) é **obrigatório** usar o endpoint pooled:

```
postgresql://USER:PASS@HOST-pooler.AWS.neon.tech/DB?sslmode=require
```

Sem isso, a Vercel estoura o limite de conexões em poucos requests concorrentes.

## Envs

| Variável        | Valor                                          |
| --------------- | ---------------------------------------------- |
| `DATABASE_URL`  | connection string **pooled** (com `-pooler`)   |

Configurar separadamente em **Production** e **Preview** dentro da Vercel:

- **Production** → branch `main` do Neon.
- **Preview** → endpoint dinâmico criado pela integração (Neon injeta automaticamente se a integração estiver ativa; ou aponte manualmente para um branch `preview`).

## Dev mode / local

### Opção A: usar branch do Neon

```bash
# .env.local
DATABASE_URL=postgresql://...neon.tech/db?sslmode=require
```

### Opção B: Postgres em Docker

```yaml
# docker-compose.yml (não incluído ainda — criar quando precisar)
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: acolhe
      POSTGRES_PASSWORD: acolhe
      POSTGRES_DB: acolhe
    ports: ["5432:5432"]
```

```bash
# .env.local
DATABASE_URL=postgresql://acolhe:acolhe@localhost:5432/acolhe
```

## Migrations (Drizzle)

```bash
# gerar SQL a partir do schema
npx drizzle-kit generate

# aplicar contra o DATABASE_URL atual
npx drizzle-kit push      # dev (sem migration file)
npx drizzle-kit migrate   # prod (a partir de migrations/)
```

Para produção, automatizar via job `migrate` no CI/CD (próximo passo, ver [`../ci-cd.md`](../ci-cd.md#próximos-passos-wave-2)).

## Produção · checklist

- [ ] Connection string usa **endpoint pooled** (com `-pooler`)
- [ ] `sslmode=require` no final
- [ ] DB tem **autosuspend** ligado (default Neon) para custo baixo
- [ ] **Backups automáticos** habilitados (incluso no free tier — 7 dias)
- [ ] RLS configurado para isolamento multi-tenant (ver [`../../architecture/multi-tenancy.md`](../../architecture/multi-tenancy.md))

## Custos & limites

- **Free tier**: 0.5 GB storage, ~191h compute/mês, 10 branches simultâneos.
- **Pro ($19/mês)**: 10 GB, autoscale, point-in-time recovery 30 dias.
- Esperado: free tier cobre dezenas de tenants em fase de validação.

## Troubleshooting

| Sintoma                              | Causa provável                                                 |
| ------------------------------------ | -------------------------------------------------------------- |
| `connection limit exceeded`          | Usando endpoint não-pooled. Troque para `-pooler`              |
| `password authentication failed`     | Connection string desatualizada após rotação                   |
| `database does not exist`            | DB branch foi deletado (PR fechada antiga); recriar pelo Neon  |
| Build da Vercel trava em Drizzle     | DATABASE_URL ausente; conferir env scope (Preview vs Prod)     |

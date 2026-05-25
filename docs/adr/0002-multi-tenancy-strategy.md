---
title: 0002 · Estratégia de Multi-tenancy
kind: ADR
status: accepted
date: 2026-05-25
deciders: tech-acolhe
---

# ADR 0002 · Multi-tenancy: shared DB com `tenant_id` + RLS

## Contexto

O produto vende por *localidade* (igreja/comunidade). Cada localidade é fechada — sem cross-tenant ever. Esperamos:

- centenas de tenants no primeiro ano, cada um com até 200 assistidos e ~30 cuidadores
- mesma codebase para todos
- usuário (líder) pode pertencer a múltiplas localidades

Opções:

| Modelo | Custo infra | Isolamento | Migrations | Operacional |
|---|---|---|---|---|
| Database-per-tenant | Alto | Excelente | N migrações em paralelo | Alta complexidade |
| Schema-per-tenant | Médio | Bom | Médio | Drizzle não tem suporte ergonômico |
| **Shared schema, `tenant_id` em toda tabela + Postgres RLS** | **Baixo** | **Bom** (defesa em camadas) | **Simples** | **Já dominamos** |

## Decisão

**Shared DB, shared schema, `tenant_id NOT NULL` em todas tabelas de domínio + RLS habilitado em cada uma**, com `current_setting('app.tenant_id')` injetado por sessão.

Camadas de defesa:

1. Server Action exige sessão com `tenantId`
2. Drizzle client injeta filtro em runtime
3. Postgres RLS bloqueia mesmo bypass
4. Auditoria detecta query sem `tenant_id`

Detalhes em [`../architecture/multi-tenancy.md`](../architecture/multi-tenancy.md).

## Consequências

✔ Custo de infraestrutura mínimo (single Postgres).
✔ Mesma migration funciona pra todos.
✔ Easy backup / restore.
✔ Defense in depth real.
✘ Risco de bug em código que esqueça filtro → RLS evita vazamento mas ainda pode quebrar UX (resultados vazios "misteriosos").
✘ Mitigação: factories de teste sempre criam **2 tenants** e validam isolamento em CI.

## Saída de emergência

Se um tenant grande precisar de isolamento físico (raríssimo no plano Pró), conseguimos *plomar* esse tenant em DB separado mantendo o mesmo schema — código nem precisa mudar, só a connection string por tenant. Decisão **reversível para casos pontuais**.

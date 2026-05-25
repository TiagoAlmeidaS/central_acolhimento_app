---
title: Multi-tenancy
kind: ArchitectureNote
owner: tech-acolhe
status: stable
updated: 2026-05-25
---

# Multi-tenancy

> O isolamento entre localidades é **invariante crítica** do produto. Vazar dado de uma comunidade para outra é falha que justifica rollback imediato. Este documento descreve como garantimos o isolamento.

---

## 1. Modelo escolhido: **Shared DB + Shared Schema + `tenant_id` column + RLS**

| Modelo | Custo infra | Isolamento | Migrations | Escolha |
|---|---|---|---|---|
| DB por tenant | Alto | Excelente | Pesado (N migrações) | ❌ |
| Schema por tenant | Médio | Bom | Médio | ❌ |
| **Shared schema + `tenant_id`** | **Baixo** | **Bom** (com RLS) | **Simples** | ✅ |

Decisão registrada em [`../adr/0002-multi-tenancy-strategy.md`](../adr/0002-multi-tenancy-strategy.md).

---

## 2. Regras invariantes

1. **Toda tabela de domínio** (exceto `users` e `tenants`) tem coluna `tenant_id NOT NULL`.
2. **Toda query** filtra por `tenant_id = current_setting('app.tenant_id')`.
3. **Toda Row-Level Security policy** filtra automaticamente — defesa em profundidade.
4. **A application** nunca passa `tenantId` recebido do cliente: pega da sessão server-side.
5. **Migrations** que criam tabela de domínio **devem** habilitar RLS no mesmo arquivo (lint check).

---

## 3. Como o `tenantId` é resolvido

```
Request → middleware → session → tenant ativo
                                       │
                                       ▼
                                Drizzle client
                              ├─ SET LOCAL app.tenant_id
                              ├─ SET LOCAL app.user_id
                              └─ executar queries
```

- `session.activeTenantId` salvo em cookie httpOnly assinado.
- Troca de tenant (em `[11-settings]`) altera cookie + revalida.
- Usuário sem `Membership.status='ativo'` no tenant ativo → redirect `/escolha-localidade`.

---

## 4. Camadas de defesa

```
┌────────────────────────────────────────────┐
│ 1. Server Action (`'use server'`)           │
│    requireTenant() — falha se sessão vazia  │
├────────────────────────────────────────────┤
│ 2. Drizzle middleware                       │
│    addTenantFilter() — injeta WHERE        │
├────────────────────────────────────────────┤
│ 3. Postgres RLS                             │
│    USING (tenant_id = current_setting…)     │
├────────────────────────────────────────────┤
│ 4. Audit pós-fato                           │
│    log toda query sem tenantId presente     │
└────────────────────────────────────────────┘
```

---

## 5. Setup RLS por tabela (template)

```sql
ALTER TABLE assistidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_select ON assistidos
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY tenant_isolation_modify ON assistidos
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);
```

Aplicar para: `memberships`, `invites`, `assistidos`, `timeline_events`, `meetings`, `subscriptions`, `invoices`, `chat_messages`.

> `users` e `tenants` ficam **sem RLS** — `users` é cross-tenant (mesmo telefone), `tenants` é metadata.

---

## 6. Casos especiais

### 6.1 Usuário pertence a múltiplas localidades

`User` (uma linha) tem N `Membership`s. O **tenant ativo** é sempre 1 — escolhido na sessão.

### 6.2 Convite cross-tenant

`Invite` é vinculado ao tenant que criou. Aceitar gera Membership do mesmo tenant.

### 6.3 Líder com múltiplas localidades (plano Pró)

A UI mostra um **switcher** (já existe em `TenantSwitcher`). Cada switch troca o cookie de tenant ativo.

### 6.4 Webhooks Stripe

Não têm tenant na request — usar `stripe_customer_id` para resolver `tenantId` na fila.

### 6.5 Webhooks WhatsApp (mensagens recebidas)

Resolver tenant pelo `User.telefone` + último tenant ativo. Documentado em [`07-mensagens-ia`].

---

## 7. Testes obrigatórios para qualquer feature

Toda spec que faz mutação em tabela de domínio DEVE ter ao menos:

- ✅ "Cuidador do tenant A não enxerga assistidos do tenant B" (negative case)
- ✅ "Mutation sem tenant na sessão é rejeitada com 401"
- ✅ "RLS bloqueia query bypass mesmo se code falhar"

Factories com Faker geram **2 tenants** + recursos cruzados para testar isolamento.

---

## 8. Anti-patterns proibidos

❌ `db.query.assistidos.findMany()` sem filtro tenant
❌ Passar `tenantId` como parâmetro da Server Action a partir do client
❌ Query global em índices (busca global, "recent across tenants")
❌ Cache compartilhado sem chave `tenantId:`
❌ Log estruturado sem `tenantId` no contexto

---

*Leitura complementar:* [`overview.md`](./overview.md) · [`data-model.md`](./data-model.md)

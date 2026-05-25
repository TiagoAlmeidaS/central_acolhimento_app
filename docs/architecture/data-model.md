---
title: Data Model (Drizzle schema)
kind: ArchitectureNote
owner: tech-acolhe
status: stable
updated: 2026-05-25
---

# Data Model (Drizzle ORM)

> Reflete as entidades de [`../product/domain-model.md`](../product/domain-model.md) em SQL/Postgres com Drizzle.
> **Aplicar RLS por tabela** conforme [`multi-tenancy.md`](./multi-tenancy.md) §5.

---

## 1. Convenções

- Nomes de tabela em **snake_case plural** (`assistidos`, `meetings`).
- Toda PK: `id uuid default gen_random_uuid()`.
- Toda tabela com `created_at`, `updated_at` (timestamptz). Soft-delete onde aplicável: `deleted_at`.
- FKs sempre com `ON DELETE` explícito (`cascade` para filhos, `restrict` para metadados).
- Index obrigatório em toda coluna `tenant_id`.

---

## 2. Tabelas (resumo Drizzle TS)

### `users`

```ts
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: text('nome').notNull(),
  telefone: text('telefone').notNull().unique(), // E.164
  fotoUrl: text('foto_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### `tenants`

```ts
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: text('nome').notNull(),
  cidade: text('cidade').notNull(),
  uf: varchar('uf', { length: 2 }).notNull(),
  denominacao: text('denominacao'),
  sigla: varchar('sigla', { length: 3 }).notNull(),
  cor: varchar('cor', { length: 7 }).notNull(),
  criadoPor: uuid('criado_por').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqLocal: uniqueIndex('uniq_local').on(t.nome, t.cidade, t.uf),
}));
```

### `memberships`

```ts
export const papelEnum = pgEnum('papel', ['lider', 'cuidador']);
export const membershipStatusEnum = pgEnum('membership_status',
  ['pendente', 'ativo', 'recusado', 'removido']);

export const memberships = pgTable('memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  papel: papelEnum('papel').notNull(),
  status: membershipStatusEnum('status').notNull().default('pendente'),
  bio: text('bio'),
  convidadoPor: uuid('convidado_por').references(() => users.id),
  ativadoEm: timestamp('ativado_em', { withTimezone: true }),
  removidoEm: timestamp('removido_em', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniqUserTenant: uniqueIndex('uniq_user_tenant').on(t.userId, t.tenantId),
  idxTenant: index('idx_memberships_tenant').on(t.tenantId),
}));
```

### `invites`

```ts
export const inviteStatusEnum = pgEnum('invite_status',
  ['pendente', 'aceito', 'recusado', 'expirado']);

export const invites = pgTable('invites', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  criadoPor: uuid('criado_por').notNull().references(() => users.id),
  nome: text('nome').notNull(),
  telefone: text('telefone').notNull(),
  papel: papelEnum('papel').notNull(),
  token: text('token').notNull().unique(),
  expiraEm: timestamp('expira_em', { withTimezone: true }).notNull(),
  status: inviteStatusEnum('status').notNull().default('pendente'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxTenant: index('idx_invites_tenant').on(t.tenantId),
}));
```

### `assistidos`

```ts
export const assistidoStatusEnum = pgEnum('assistido_status',
  ['urgente', 'aguardando', 'acompanhamento', 'concluido']);

export const assistidos = pgTable('assistidos', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  telefone: text('telefone'),
  cidade: text('cidade').notNull(),
  fotoUrl: text('foto_url'),
  status: assistidoStatusEnum('status').notNull().default('aguardando'),
  cuidadorId: uuid('cuidador_id').references(() => users.id),
  resumo: text('resumo'),
  contextoPastoral: jsonb('contexto_pastoral').$type<{
    familia?: string; contexto?: string; observacoes?: string;
  }>(),
  ultimoContatoEm: timestamp('ultimo_contato_em', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxTenant: index('idx_assistidos_tenant').on(t.tenantId),
  idxStatus: index('idx_assistidos_status').on(t.tenantId, t.status),
  idxCuidador: index('idx_assistidos_cuidador').on(t.tenantId, t.cuidadorId),
}));
```

### `timeline_events`

```ts
export const timelineKindEnum = pgEnum('timeline_kind', ['nota', 'ai', 'sistema']);

export const timelineEvents = pgTable('timeline_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  assistidoId: uuid('assistido_id').notNull().references(() => assistidos.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  kind: timelineKindEnum('kind').notNull(),
  autorId: uuid('autor_id').references(() => users.id),
  texto: text('texto').notNull(),
  meta: jsonb('meta'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxAssistido: index('idx_timeline_assistido').on(t.assistidoId, t.createdAt),
  idxTenant: index('idx_timeline_tenant').on(t.tenantId),
}));
```

### `meetings`

```ts
export const meetingTypeEnum = pgEnum('meeting_type', ['presencial', 'online', 'ligacao']);
export const meetingStatusEnum = pgEnum('meeting_status', ['agendada', 'realizada', 'cancelada']);

export const meetings = pgTable('meetings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  criadoPor: uuid('criado_por').notNull().references(() => users.id),
  assistidoId: uuid('assistido_id').references(() => assistidos.id, { onDelete: 'set null' }),
  titulo: text('titulo').notNull(),
  tipo: meetingTypeEnum('tipo').notNull(),
  inicioEm: timestamp('inicio_em', { withTimezone: true }).notNull(),
  duracaoMin: integer('duracao_min').notNull(),
  local: text('local'),
  notas: text('notas'),
  notificarWhatsapp: boolean('notificar_whatsapp').notNull().default(true),
  urgente: boolean('urgente').notNull().default(false),
  status: meetingStatusEnum('status').notNull().default('agendada'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxTenantStart: index('idx_meetings_tenant_inicio').on(t.tenantId, t.inicioEm),
  idxAssistido: index('idx_meetings_assistido').on(t.assistidoId),
}));
```

### `subscriptions`

```ts
export const planoEnum = pgEnum('plano', ['essencial', 'pro']);
export const subscriptionStatusEnum = pgEnum('subscription_status',
  ['trial', 'ativa', 'vencida', 'cancelada']);

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().unique().references(() => tenants.id, { onDelete: 'cascade' }),
  donoId: uuid('dono_id').notNull().references(() => users.id),
  plano: planoEnum('plano').notNull(),
  status: subscriptionStatusEnum('status').notNull().default('trial'),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  proximaCobranca: date('proxima_cobranca').notNull(),
  trialFim: date('trial_fim'),
  canceladoEm: timestamp('cancelado_em', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### `invoices`

```ts
export const invoiceStatusEnum = pgEnum('invoice_status', ['pago', 'pendente', 'falha']);

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  assinaturaId: uuid('assinatura_id').notNull().references(() => subscriptions.id, { onDelete: 'cascade' }),
  valorCentavos: integer('valor_centavos').notNull(),
  data: date('data').notNull(),
  status: invoiceStatusEnum('status').notNull(),
  stripeInvoiceId: text('stripe_invoice_id').notNull().unique(),
  pdfUrl: text('pdf_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxTenant: index('idx_invoices_tenant').on(t.tenantId, t.data),
}));
```

### `chat_messages`

```ts
export const chatFromEnum = pgEnum('chat_from', ['user', 'ai']);

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  from: chatFromEnum('from').notNull(),
  text: text('text').notNull(),
  linkAssistidoId: uuid('link_assistido_id').references(() => assistidos.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxThread: index('idx_chat_thread').on(t.tenantId, t.userId, t.createdAt),
}));
```

### `otp_codes` (suporte ao auth WhatsApp)

```ts
export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  telefone: text('telefone').notNull(),
  codigoHash: text('codigo_hash').notNull(),
  tentativas: integer('tentativas').notNull().default(0),
  expiraEm: timestamp('expira_em', { withTimezone: true }).notNull(),
  consumidoEm: timestamp('consumido_em', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  idxTelefone: index('idx_otp_telefone').on(t.telefone, t.createdAt),
}));
```

---

## 3. Seeds (Faker)

Toda factory de teste em `src/tests/factories/` deve usar `@faker-js/faker` com locale `pt_BR`.

```ts
import { faker } from '@faker-js/faker/locale/pt_BR';

export const tenantFactory = (overrides = {}) => ({
  nome: faker.company.name(),
  cidade: faker.location.city(),
  uf: faker.helpers.arrayElement(UFS),
  sigla: faker.string.alpha({ length: 2, casing: 'upper' }),
  cor: faker.helpers.arrayElement(TENANT_COLORS),
  ...overrides,
});

export const assistidoFactory = (tenantId: string, overrides = {}) => ({
  tenantId,
  nome: faker.person.fullName(),
  telefone: '+55' + faker.string.numeric(11),
  cidade: faker.location.city(),
  status: faker.helpers.arrayElement(['urgente','aguardando','acompanhamento','concluido']),
  resumo: faker.lorem.sentence(),
  ...overrides,
});
```

> Regra do projeto: **toda suíte de unit/integração usa Faker para dados sintéticos.** Não há fixtures hardcoded em código de teste.

---

## 4. Migrations

- Cada PR que altere schema entrega `drizzle-kit generate` no mesmo commit.
- Migrations são **forward-only**. Rollback = nova migration.
- CI roda migrations contra Postgres efêmero antes do build.

---

*Leitura complementar:* [`../product/domain-model.md`](../product/domain-model.md) · [`multi-tenancy.md`](./multi-tenancy.md)

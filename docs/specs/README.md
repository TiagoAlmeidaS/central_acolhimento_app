---
title: Specs · Mapa, Ownership e Plano de Paralelismo
kind: SpecIndex
owner: tech-acolhe
status: ready-to-implement
updated: 2026-05-25
---

# Specs — Plano de Implementação Paralela

> Este é o **mapa operacional** para abrir subagents sem conflito. Cada spec abaixo é projetada para ser tocada por **um único subagent**, com paths declarados e dependências explícitas.

---

## 1. Lista de specs

| # | Spec | Estado | Owner (subagent) | Tamanho |
|---|---|---|---|---|
| 00 | [Foundations · Design System](./00-foundations.md) | pending | `ds-agent` | M |
| 01 | [Auth · WhatsApp + OTP](./01-auth.md) | pending | `auth-agent` | M |
| 02 | [Cuidador signup + Análise](./02-cuidador-signup.md) | pending | `signup-agent` | S |
| 03 | [Tenant setup (líder fundador)](./03-tenant-setup.md) | pending | `tenant-agent` | L |
| 04 | [Convites (líder → cuidador)](./04-invitations.md) | pending | `invite-agent` | M |
| 05 | [Assistidos (CRUD + Timeline)](./05-assistidos.md) | pending | `assistidos-agent` | L |
| 06 | [Agenda (Meetings)](./06-agenda.md) | pending | `agenda-agent` | M |
| 07 | [Mensagens (Agente IA)](./07-mensagens-ia.md) | pending | `ia-agent` | M |
| 08 | [Team management (líder)](./08-team-management.md) | pending | `team-agent` | S |
| 09 | [Dashboard (líder)](./09-dashboard-lider.md) | pending | `dashboard-agent` | M |
| 10 | [Billing (Stripe)](./10-billing-stripe.md) | pending | `billing-agent` | L |
| 11 | [Settings + Tenant Switcher](./11-settings.md) | pending | `settings-agent` | S |
| 12 | [Landing page (marketing)](./12-landing.md) | pending | `landing-agent` | S |

Tamanhos: S (0.5d) · M (1–2d) · L (3–5d) com 1 subagent.

---

## 2. Grafo de dependências

```
                                ┌──────────────────────┐
                                │ 00-foundations (DS)  │ ◄── BLOQUEIA TUDO
                                └──────────┬───────────┘
                                           │
              ┌────────────────────────────┼──────────────────────────┐
              ▼                            ▼                          ▼
       ┌────────────┐             ┌────────────┐             ┌─────────────┐
       │  01-auth   │             │ 12-landing │             │ schema base │
       └─────┬──────┘             └────────────┘             │ (db/schema) │
             │                                                └─────┬───────┘
             ▼                                                      │
    ┌────────────────────┐                                          │
    │  02-cuidador       │                                          │
    │   signup + analise │                                          │
    └────────┬───────────┘                                          │
             │                                                      │
             ▼                                                      │
    ┌────────────────────┐    ┌─────────────────────┐               │
    │  03-tenant-setup   │───►│ 10-billing-stripe   │               │
    │  (líder fundador)  │    │ (checkout no setup) │               │
    └────────┬───────────┘    └────────┬────────────┘               │
             │                          │                            │
             ▼                          ▼                            │
    ┌────────────────────┐                                           │
    │  04-invitations    │                                           │
    └────────┬───────────┘                                           │
             │                                                       │
             ▼                                                       │
    ┌──────────────────────────────────────────────────────────────┐
    │     App autenticado (paralelos entre si após o gate):         │
    │                                                                │
    │  05-assistidos ◄────────────┐                                 │
    │  06-agenda     ◄──── usa 05 (assistidoId)                     │
    │  07-mensagens-ia ◄── usa 05 (link inline)                     │
    │  08-team-management ◄── lê 02 (pendentes) + 04 (convidar)     │
    │  09-dashboard-lider ◄── agrega 05/06/02                       │
    │  11-settings   ◄── inclui troca de tenant + role              │
    │                                                                │
    └──────────────────────────────────────────────────────────────┘
```

---

## 3. Matriz de ownership (paths)

Esta tabela é **a fonte da verdade** sobre quem pode mexer em o quê. Conflito = quebra de contrato.

| Spec | Paths exclusivos | Paths compartilhados (read-only) |
|---|---|---|
| **00-foundations** | `src/components/ui/*`, `src/components/layout/*`, `src/components/icons/*`, `src/styles/*`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/manifest.ts` | — |
| **01-auth** | `src/app/(auth)/login/*`, `src/app/(auth)/otp/*`, `src/lib/auth/*`, `src/lib/whatsapp/otp.ts`, `src/server/auth.actions.ts`, `src/db/schema/users.ts`, `src/db/schema/otp.ts` | `components/ui/*` |
| **02-cuidador-signup** | `src/app/(auth)/cadastro/*`, `src/app/(auth)/escolha-perfil/*`, `src/app/(onboarding)/analise/*`, `src/server/membership.actions.ts` (parte `signup`) | `lib/auth/*`, `components/ui/*` |
| **03-tenant-setup** | `src/app/(onboarding)/tenant-setup/**`, `src/server/tenant.actions.ts`, `src/db/schema/tenants.ts`, `src/lib/tenancy/*` | `lib/auth/*`, `server/billing.actions.ts` (chama checkout no passo final), `components/ui/*` |
| **04-invitations** | `src/app/(onboarding)/convite/[token]/*`, `src/app/(app)/equipe/convidar/*`, `src/server/invite.actions.ts`, `src/db/schema/invites.ts`, `src/lib/whatsapp/send-invite.ts` | `server/membership.actions.ts`, `components/ui/*` |
| **05-assistidos** | `src/app/(app)/home/*`, `src/app/(app)/assistidos/**`, `src/server/assistido.actions.ts`, `src/db/schema/assistidos.ts`, `src/db/schema/timeline.ts`, `src/components/domain/assistido/*` | `lib/tenancy/*`, `components/ui/*` |
| **06-agenda** | `src/app/(app)/agenda/*`, `src/app/(app)/assistidos/[id]/agendar-reuniao/*`, `src/server/meeting.actions.ts`, `src/db/schema/meetings.ts`, `src/components/domain/agenda/*` | `assistido.actions.ts` (read), `components/ui/*` |
| **07-mensagens-ia** | `src/app/(app)/mensagens/*`, `src/server/chat.actions.ts`, `src/lib/claude/*`, `src/db/schema/chat.ts`, `src/components/domain/ia/*` | `assistido.actions.ts` (read), `components/ui/*` |
| **08-team-management** | `src/app/(app)/equipe/*` (exceto `/convidar` que é de 04), `src/server/membership.actions.ts` (parte `manage`), `src/components/domain/team/*` | `invite.actions.ts` (read), `components/ui/*` |
| **09-dashboard-lider** | `src/app/(app)/dashboard/*`, `src/server/dashboard.actions.ts`, `src/components/domain/dashboard/*` | `assistido.actions.ts` (read), `meeting.actions.ts` (read), `membership.actions.ts` (read) |
| **10-billing-stripe** | `src/app/(app)/assinatura/**`, `src/server/billing.actions.ts`, `src/lib/stripe/*`, `src/db/schema/subscriptions.ts`, `src/db/schema/invoices.ts`, `src/app/api/webhooks/stripe/*`, `src/components/domain/billing/*` | `tenant.actions.ts` (read), `components/ui/*` |
| **11-settings** | `src/app/(app)/ajustes/*`, `src/server/settings.actions.ts`, `src/components/layout/tenant-switcher.tsx` | `tenant.actions.ts` (read), `membership.actions.ts` (read), `components/ui/*` |
| **12-landing** | `src/app/(marketing)/**` | `components/ui/*` (limited) |

**Regra:** dois subagents podem rodar simultaneamente **se e somente se** os paths exclusivos não se intersectam.

---

## 4. Plano de paralelismo recomendado (waves)

### 🟦 Wave 0 — Fundação (sequencial, ~3 dias)

| Spec | Comentário |
|---|---|
| 00-foundations | Tokens + componentes base, sem qual nada funciona |
| `db/schema/` core (`users`, `tenants`, `memberships`) | Pode ser feito junto da 00, em outro path |

**Critério de saída:** componentes UI exportáveis + migrations rodando + 2 tenants seedáveis com Faker.

---

### 🟩 Wave 1 — Entrada e estrutura (paralelizável a 4 subagents, ~4 dias)

Rodam em paralelo após Wave 0:

| Subagent | Spec |
|---|---|
| `auth-agent` | 01-auth |
| `landing-agent` | 12-landing |
| `signup-agent` | 02-cuidador-signup *(precisa de hooks de 01-auth — agent começa pelos forms enquanto 01 amadurece)* |
| `tenant-agent` | 03-tenant-setup *(começa pelo schema/setup, depois usa OTP de 01)* |

**Sincronização:** ao final, fazer **merge train** ordenado para evitar conflito em `lib/auth/*`.

---

### 🟨 Wave 2 — Multi-tenant + billing (3 subagents, ~5 dias)

Depende de Wave 1 (auth + tenant criado):

| Subagent | Spec |
|---|---|
| `billing-agent` | 10-billing-stripe |
| `invite-agent` | 04-invitations |
| `settings-agent` | 11-settings *(parcial: troca de tenant, role, theme — começa após Wave 0 mesmo se quiser)* |

Esses três **não compartilham nenhum path exclusivo** → rodam totalmente em paralelo.

---

### 🟧 Wave 3 — App principal (5 subagents, ~5 dias)

Depende de Wave 1 (auth) e parcialmente Wave 2 (tenant ativo):

| Subagent | Spec |
|---|---|
| `assistidos-agent` | 05-assistidos |
| `agenda-agent` | 06-agenda |
| `ia-agent` | 07-mensagens-ia |
| `team-agent` | 08-team-management |
| `dashboard-agent` | 09-dashboard-lider |

**Atenção:** 06, 07, 09 dependem das **leituras** de `assistido.actions.ts`. O `assistidos-agent` precisa expor o contrato (tipos + ações de leitura) **no dia 1** — em commit de PR "skeleton" que os outros possam consumir. Documentado dentro de [05-assistidos](./05-assistidos.md).

---

### Cronograma indicativo (com 1 subagent + revisor humano)

```
Dia 0 ─── 3 ─── 4 ─── 7 ─── 10 ─── 12 ─── 14
   ─Wave 0─    │             │           │
               ├─── Wave 1 (4 subagents em paralelo) ──┐
                                                       │
                              ├─── Wave 2 (3 subagents)┤
                                                       │
                                          ├─── Wave 3 (5 subagents) ──┤
                                                                       ▼
                                                                  Acolhe v0.1
```

---

## 5. Contratos compartilhados (anti-conflito)

Para os subagents não bloquearem uns aos outros, estes contratos são definidos no início e versionados:

### 5.1 Contratos de dados (Zod schemas)

Mantidos em `src/lib/validators/`:

```ts
// shared, lido por TODOS
export const TenantContext = z.object({ tenantId: z.string().uuid(), userId: z.string().uuid(), papel: z.enum(['lider','cuidador']) });
export const AssistidoSummary = z.object({ id: z.string(), nome: z.string(), status: AssistidoStatus, foto: z.string().nullable(), cuidador: z.string().nullable() });
export const MeetingSummary = z.object({ id: z.string(), titulo: z.string(), inicioEm: z.date(), assistidoId: z.string().nullable() });
```

Cada spec lista os schemas que **define** (escreve) e os que **consome** (lê).

### 5.2 Server actions assinaturas (interface pública)

Cada agente publica primeiro a *assinatura* (sem implementação) das ações que outros vão consumir. PR de "skeleton" no dia 1 da wave.

Ex.: `05-assistidos` publica em commit inicial:

```ts
// server/assistido.actions.ts
export async function listAssistidos(filter?: AssistidoFilter): Promise<AssistidoSummary[]>;
export async function getAssistido(id: string): Promise<AssistidoFull | null>;
export async function createAssistido(input: CreateAssistidoInput): Promise<AssistidoFull>;
// ...
```

A implementação interna pode evoluir, **a assinatura não muda** sem sinalizar.

### 5.3 Eventos (lista oficial)

Definidos em [`../product/domain-model.md`](../product/domain-model.md) §5. Toda spec que **publica** evento declara na seção "Events Published". Toda spec que **consome** declara em "Events Consumed".

---

## 6. Como abrir um subagent (template)

Para abrir um subagent isolado em uma spec, use este template de prompt:

```
Trabalho na spec docs/specs/05-assistidos.md.

Restrições inegociáveis:
- Pode tocar APENAS os paths listados em "owns:" do frontmatter.
- Pode ler de "may-read:" mas não modificar.
- Não deve criar dependências fora dos contratos publicados em docs/specs/README.md §5.
- Sempre adicione testes com Faker em src/tests/factories e src/tests/unit ou /integration.
- Antes de finalizar: atualize o status da spec para 'in_progress' → 'done'.
- Toda mudança não trivial atualiza a doc.

Entregue:
1. Skeleton das server actions (assinaturas + tipos) — PR 1
2. Telas + estado funcional com dados Faker — PR 2
3. Integração com schema real + RLS + testes — PR 3
```

---

## 7. Checklist anti-conflito (revisor humano)

Antes de mergear PR de subagent:

- [ ] PR só altera paths em `owns:` da spec
- [ ] Frontmatter da spec atualizado (`status`, `updated`)
- [ ] Migrations geradas com `drizzle-kit generate`
- [ ] Testes unit/integration com Faker passando
- [ ] Tenant-isolation test específico passando (`tenant A ≠ tenant B`)
- [ ] Nenhuma dependência nova fora dos contratos
- [ ] Eventos publicados/consumidos declarados na seção da spec

---

## 8. Glossário de status da spec

| Status | Significado |
|---|---|
| `pending` | Spec escrita, aguardando subagent |
| `in_progress` | Subagent ativo |
| `review` | PR aberto, aguardando revisão |
| `done` | Mergeado em main, feature ativa |
| `blocked` | Aguardando dependência (link no campo `blocked_by:`) |
| `deprecated` | Não vai mais ser feita (motivo no body) |

---

*Próximo passo:* leia a primeira spec — [`00-foundations.md`](./00-foundations.md).

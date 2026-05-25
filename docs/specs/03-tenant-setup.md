---
name: 03-tenant-setup
title: Tenant Setup (líder fundador cria localidade)
kind: Spec
owner: tenant-agent
status: done
size: L
depends_on: ["00-foundations","01-auth"]
parallel_safe_with: ["02-cuidador-signup","04-invitations","12-landing"]
blocks: ["04-invitations","10-billing-stripe","11-settings"]
owns:
  - src/app/(onboarding)/tenant-setup/**
  - src/server/tenant.actions.ts
  - src/db/schema/tenants.ts
  - src/lib/tenancy/**
  - src/components/domain/tenant/**
may-read:
  - src/lib/auth/**
  - src/server/billing.actions.ts (apenas chamar checkout no passo final)
  - src/components/ui/**
updated: 2026-05-25
---

# 03 · Tenant Setup (Líder Fundador)

## Problema

O líder que decide criar uma nova localidade passa por **8 telas** orquestradas. Esta é a primeira persona crítica do produto — se ela for ruim, ninguém adota. Spec entrega o orquestrador completo + persistência do tenant + ponte com billing.

## User Stories

- Como **líder novo**, eu quero criar minha localidade em até 5 minutos.
- Como **líder**, eu quero ver progresso visual a cada passo.
- Como **líder**, eu quero voltar para corrigir um campo sem perder o que já preenchi.
- Como **líder responsável**, eu quero saber claramente que **eu pago** a partir do plano Pró/Essencial.

## Telas (referência: `app/screens-tenant-setup.jsx`)

1. **TenantIdentidadeScreen** — passo 1/5: nome + telefone do líder *(telefone já autenticado, vem da sessão)*
2. **TenantOtpScreen** — passo 2/5: OTP WhatsApp (reusar componente de [01-auth])
3. **TenantLocalidadeScreen** — passo 3/5: nome da localidade · denominação · cidade · UF
4. **TenantPersonalizaScreen** — passo 4/5: sigla (até 3 letras) + cor (paleta fixa de 8)
5. **TenantRevisaoScreen** — passo 5/5: revisão final → CTA "Escolher o plano"
6. **PlanosScreen** — handoff para [10-billing-stripe]
7. **CheckoutScreen** — handoff para [10-billing-stripe]
8. **SucessoAssinaturaScreen** — handoff para [10-billing-stripe]
9. **TenantBemVindoScreen** — pós-pagamento: convidar primeiro cuidador OU "ir para o app"

## Critérios de Aceite

```gherkin
Cenário: Criação feliz path
  Dado um User logado sem Tenants
  Quando completo os 5 passos com dados válidos
  E concluo o checkout Stripe
  Então um Tenant é criado com (nome, cidade, uf, sigla, cor)
  E um Membership(papel='lider', status='ativo', criadoPor=eu) é criado
  E uma Subscription em status='trial' é criada
  E sou redirecionado para a tela "TenantBemVindo"
  E ao clicar "Ir para o app" entro no dashboard como líder

Cenário: Voltar sem perder dados
  Dado preenchi passos 1-3
  Quando volto ao passo 1 e clico continuar
  Então os dados anteriores estão preservados

Cenário: Sigla auto-gerada
  Dado nome da localidade "Vila Mariana"
  Quando chego no passo 4
  Então sigla preview = "VM"
  E posso editar para até 3 letras

Cenário: Tenant duplicado
  Dado já existe Tenant (nome='Adrianópolis', cidade='Manaus', uf='AM')
  Quando outro líder tenta criar com os mesmos 3
  Então retorna erro "essa localidade já existe — peça um convite ao líder responsável"

Cenário: Checkout falha
  Dado o passo de checkout retorna erro
  Quando volto para Planos
  Então o Tenant ainda NÃO foi persistido (transação só compromete ao sucesso)
```

## Estado e persistência

O estado dos 5 passos vive em **client state** (Zustand ou React state hierárquico). Só **persiste no DB** quando:
- OTP do passo 2 valida → marca `User.telefoneVerificado=true` (se já não estiver)
- Passo 5 → checkout sucesso → cria Tenant + Membership + Subscription atomicamente (transação Drizzle)

Se o usuário fechar o navegador antes do checkout, o progresso é mantido em `localStorage` chaveado por `userId`.

## Contratos

### Schemas

```ts
export const TenantSetupSchema = z.object({
  lider: z.object({ nome: z.string().min(3), telefone: PhoneSchema }),
  localidade: z.object({
    nome: z.string().min(3),
    denominacao: z.string().optional(),
    cidade: z.string().min(2),
    uf: UfEnum,
  }),
  personaliza: z.object({
    sigla: z.string().min(1).max(3),
    cor: z.enum(TENANT_COLORS),
  }),
});
```

### Server actions

```ts
'use server';
export async function checkTenantAvailable(input: { nome: string; cidade: string; uf: string }): Promise<{ available: boolean }>;
export async function provisionTenant(input: TenantSetupInput & { stripeSubscriptionId: string }): Promise<{ tenantId: string }>;
```

`provisionTenant` é chamado pelo webhook Stripe (subscription.created) **ou** pela ação de billing após confirmar checkout.

### Lib (`src/lib/tenancy`)

```ts
export async function getCurrentTenant(): Promise<TenantWithRole>;
export async function setActiveTenant(tenantId: string): Promise<void>;
export async function listMyTenants(): Promise<TenantWithRole[]>;
export async function requireRole(role: 'lider' | 'cuidador'): Promise<void>;
```

## Files / paths

```
src/app/(onboarding)/tenant-setup/layout.tsx          # progress + state
src/app/(onboarding)/tenant-setup/identidade/page.tsx
src/app/(onboarding)/tenant-setup/otp/page.tsx
src/app/(onboarding)/tenant-setup/localidade/page.tsx
src/app/(onboarding)/tenant-setup/personaliza/page.tsx
src/app/(onboarding)/tenant-setup/revisao/page.tsx
src/app/(onboarding)/tenant-setup/bem-vindo/page.tsx
src/components/domain/tenant/tenant-setup-state.ts    # Zustand
src/components/domain/tenant/sigle-from.ts            # util do protótipo
src/components/domain/tenant/tenant-color-picker.tsx
src/components/domain/tenant/tenant-preview-card.tsx
src/server/tenant.actions.ts
src/lib/tenancy/index.ts
src/lib/tenancy/current.ts
src/db/schema/tenants.ts
src/tests/factories/tenant.factory.ts
```

## Testes (Faker)

```ts
import { faker } from '@faker-js/faker/locale/pt_BR';
export const tenantFactory = (overrides = {}) => ({
  nome: faker.company.name().split(' ')[0],
  cidade: faker.location.city(),
  uf: faker.helpers.arrayElement(UFS),
  sigla: faker.string.alpha({ length: 2, casing: 'upper' }),
  cor: faker.helpers.arrayElement(TENANT_COLORS),
  denominacao: faker.helpers.arrayElement([null,'Batista','Católica','Presbiteriana']),
  ...overrides,
});
```

- **Unit:** `sigleFrom("Vila Mariana") === "VM"`, `sigleFrom("Adrianópolis") === "AD"`
- **Unit:** validação Zod completa
- **Integration:** `provisionTenant` cria 3 tabelas atomicamente; rollback se uma falhar
- **Integration:** `checkTenantAvailable` retorna `false` para duplicata
- **Tenancy:** 2 tenants concorrentes — não há vazamento
- **e2e:** fluxo completo 5 passos com mock de Stripe e WhatsApp

## Events Published

- `tenant.created` (consumido por: notificação WhatsApp de boas-vindas, analytics)

## Events Consumed

- `subscription.activated` (de [10-billing]) → dispara `provisionTenant`

## Riscos

- **Atomicidade** entre Stripe + DB: usar pattern *outbox* — primeiro grava intent local, webhook confirma.
- **Sigla curta + cor** pode colidir entre localidades; aceitamos pois identidade é por nome+cidade.

## Definition of Done

- [ ] 5 passos navegáveis com progresso visual
- [ ] Estado preservado em localStorage entre refreshes
- [ ] Provision transacional
- [ ] Lib `tenancy/` exporta `getCurrentTenant`, `setActiveTenant`
- [ ] Testes integração + tenant isolation passando

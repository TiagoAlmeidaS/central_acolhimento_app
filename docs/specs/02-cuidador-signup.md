---
name: 02-cuidador-signup
title: Cuidador signup (self) + tela de Análise
kind: Spec
owner: signup-agent
status: done
size: S
depends_on: ["00-foundations","01-auth"]
parallel_safe_with: ["03-tenant-setup","04-invitations","12-landing"]
blocks: ["08-team-management"]
owns:
  - src/app/(auth)/escolha-perfil/**
  - src/app/(auth)/cadastro/**
  - src/app/(onboarding)/analise/**
  - src/server/membership.actions.ts (regiões `signup` + `approval` skeleton)
  - src/db/schema/memberships.ts
  - src/lib/validators/membership.ts
  - src/components/domain/membership/**
  - src/tests/factories/membership.ts
  - src/tests/unit/signup-*.test.ts
may-read:
  - src/lib/auth/**
  - src/components/ui/**
updated: 2026-05-25
---

# 02 · Cuidador self-signup

## Problema

Cuidadores podem se autocadastrar — mas precisam ser **aprovados pelo líder** da localidade-alvo. Esta spec entrega o formulário, a tela de espera (status "em análise") e o esqueleto da fila de aprovações (UI consumida em [08-team-management]).

## User Stories

- Como **cuidador novo**, eu quero me cadastrar informando minha igreja, cidade e bio, para entrar na fila de análise.
- Como **cuidador em análise**, eu quero ver o passo em que estou e tentar atualizar status com um botão.
- Como **líder** (consumido por [08]), eu quero ver os cadastros pendentes e aprovar/recusar.

## Telas

- `EscolhaPerfilScreen` — depois de login, escolher líder/cuidador
- `CadastroScreen` — formulário do cuidador
- `AnaliseScreen` — espera de aprovação

### Tela 1 · Escolha do perfil

- Header com `<-` (volta pra login)
- 2 cards (featured = líder):
  - **Sou líder de uma localidade** → fluxo [03-tenant-setup]
  - **Sou cuidador** → esta spec

### Tela 2 · Cadastro de Cuidador

- Hero image (Unsplash placeholder com overlay)
- Form: nome completo · telefone (auto-preenchido da sessão) · UF · cidade · igreja · bio (textarea)
- CTA sticky: `Solicitar Acesso` (disabled até required preenchido)

### Tela 3 · Em Análise

- Ilustração geométrica (lupa + documento)
- StatusStepper: `Enviado → Análise → Acesso`
- InfoBanner "Geralmente até 24h"
- Botões: `Verificar Status` · `Sair / Logout`
- Card "Precisa de ajuda? Falar com Suporte"

## Critérios de Aceite

```gherkin
Cenário: Cadastro de cuidador novo
  Dado que sou um User logado sem nenhum Membership
  Quando preencho o formulário e submeto
  Então cria Membership(status='pendente', papel='cuidador', tenantId=<igreja selecionada>)
  E sou redirecionado para "/analise"

Cenário: Análise polling
  Dado meu Membership está pendente
  Quando clico em "Verificar Status"
  E o líder ainda não aprovou
  Então a tela mostra o mesmo estado com toast "ainda em análise"

Cenário: Aprovação chega
  Dado meu Membership foi aprovado pelo líder
  Quando clico em "Verificar Status"
  Então sou redirecionado para "/" (app principal) como cuidador

Cenário: Cuidador já tem Membership ativo
  Dado que já fui aprovado anteriormente em algum tenant
  Quando faço login
  Então pulo "escolha-perfil" e vou direto para "/"
```

## Contratos

### Schemas

```ts
export const SignupSchema = z.object({
  nome: z.string().min(3),
  telefone: PhoneSchema,
  uf: UfEnum,
  cidade: z.string().min(2),
  igreja: z.string().min(2),    // string livre que o líder valida ao aprovar
  bio: z.string().max(500).optional(),
});
```

### Server actions (parte desta spec)

```ts
// server/membership.actions.ts (esta spec cuida do skeleton + signup)
export async function submitCuidadorSignup(input: SignupInput): Promise<{ membershipId: string }>;
export async function getMyMembershipStatus(): Promise<{
  status: 'sem-membership' | 'pendente' | 'ativo' | 'recusado';
  tenantId?: string;
}>;
// declaradas aqui mas implementadas em [08-team-management]:
export async function listPendingMemberships(): Promise<PendingMembership[]>;
export async function approveMembership(id: string): Promise<void>;
export async function declineMembership(id: string, motivo?: string): Promise<void>;
```

Estados internos:
- Ao submeter: cria `Membership` com `tenantId` inferido pelo `(cidade,igreja)` → matching com `Tenants` cadastradas; se nenhuma bater, `tenantId=null` e o registro vai para "pré-pendente" (fila do suporte). MVP: matching exact; v2: fuzzy match.

## Files / paths

```
src/app/(auth)/escolha-perfil/page.tsx
src/app/(auth)/cadastro/page.tsx
src/app/(onboarding)/analise/page.tsx
src/components/domain/membership/escolha-perfil-card.tsx
src/server/membership.actions.ts                 # skeleton compartilhado
src/db/schema/memberships.ts
src/lib/validators/membership.ts
src/tests/factories/membership.factory.ts
```

## Testes (Faker)

- **Unit:** validações Zod do formulário
- **Integration:** signup gera Membership pendente + tenant matching
- **Integration:** verifica que cuidador pendente é bloqueado em tela autenticada
- **e2e:** fluxo completo login → escolha → cadastro → análise

## Events Published

- `membership.requested` (consumido por [08-team-management] para mostrar na fila)

## Events Consumed

- `membership.approved` (origina em [08]) → tela de análise faz polling/refresh e libera

## Riscos

- **Matching cidade↔igreja↔tenant** pode falhar em MVP. Mitigar com "Não encontrou? Pedir convite ao líder".
- Cuidador podia "burlar" approval cadastrando em outra cidade? Não: tenantId é validado server-side contra a lista de tenants existentes.

## Definition of Done

- [x] Telas mobile responsivas
- [x] Polling correto e UX clara em análise (botão `Verificar Status` chama `getMyMembershipStatus` e roteia conforme retorno)
- [x] Schema `memberships` definido com FK para `users`/`tenants` e índices `(tenantId, status)` — RLS específica de Postgres fica para o pacote de migrations da spec [03] (multi-tenancy.md §5)
- [x] Testes Faker passando (`src/tests/unit/signup-actions.test.ts` + `signup-tenancy.test.ts`)
- [x] Server action `submitCuidadorSignup` com validação Zod compartilhada cliente ⇄ servidor

### Notas de implementação

- **Status pré-pendente:** quando nenhum tenant casa por `(cidade, uf)`, `Membership.tenantId = null` e a UI continua na tela de análise — a fila do suporte materializa o tenant e re-anexa o membership. Matching atual é `lower(cidade) = lower(input)` + `uf =`; fuzzy matching e cruzamento com `igreja` ficam como evolução conjunta com [03].
- **Auth gate:** todas as rotas (`/escolha-perfil`, `/cadastro`, `/analise`) chamam `requireUser()`; sem sessão → redirect `/login`. `/escolha-perfil` e `/cadastro` adicionalmente verificam `getMyMembershipStatus()` e pulam para `/analise` (pendente) ou `/` (ativo) para evitar loops.
- **Telefone:** o form pré-preenche o telefone vindo da sessão; alterar o número exige novo OTP — fluxo do `auth-agent` em [01]. Aqui não atualizamos `users.telefone`.
- **Skeletons (08):** `listPendingMemberships` retorna `[]` (stub), `approveMembership` / `declineMembership` lançam erro instrutivo com referência a `08-team-management`.

---
name: 01-auth
title: Auth · WhatsApp OTP
kind: Spec
owner: auth-agent
status: done
size: M
depends_on: ["00-foundations"]
parallel_safe_with: ["12-landing"]
blocks: ["02-cuidador-signup","03-tenant-setup","04-invitations"]
owns:
  - src/app/(auth)/login/**
  - src/app/(auth)/otp/**
  - src/lib/auth/**
  - src/lib/whatsapp/**
  - src/server/auth.actions.ts
  - src/db/schema/users.ts
  - src/db/schema/otp.ts
may-read:
  - src/components/ui/**
updated: 2026-05-25
---

# 01 · Auth (Login & OTP por WhatsApp)

## Problema

WhatsApp é o canal universal do produto — auth segue a mesma lógica. **Sem senha**, sem email, sem social login. O usuário entra com número, recebe código de 6 dígitos por WhatsApp, valida, sessão criada.

## User Stories

- Como **qualquer usuário**, eu quero entrar usando apenas meu número de WhatsApp.
- Como **usuário sem cadastro**, eu quero seguir para o fluxo de cadastro com 1 toque (`Cadastre-se aqui`).
- Como **dev de outras specs**, eu quero `requireUser()` e `requireTenant()` prontos para usar em qualquer Server Action.

## Telas (referência do protótipo)

- `LoginScreen` em `app/screens-onboarding.jsx`
- `TenantOtpScreen` em `app/screens-tenant-setup.jsx` (componente OTP de 6 dígitos é o mesmo)

### Tela 1 · Login

- BrandMark + título "Central de Acolhimento"
- CTA principal: `Entrar com WhatsApp` (variant `whatsapp`)
- Link secundário: `Cadastre-se aqui`
- Disclaimer de Termos + Privacidade

### Tela 2 · Entrar telefone (sub-step)

- Input `tel` com máscara `(00) 00000-0000`
- Validação E.164 (mínimo 10 dígitos brasileiros)
- CTA: `Enviar código`

### Tela 3 · OTP

- 6 inputs de 1 dígito cada, auto-focus, auto-advance, backspace volta
- Contador 45s de reenvio
- Telefone ofuscado: `(92) ••••`
- CTA: `Verificar e continuar` (disabled enquanto não completo)

## Critérios de Aceite

```gherkin
Cenário: Login com OTP válido
  Dado um usuário com telefone "+55 92 99988 7766" cadastrado
  Quando ele entra o número e clica em "Enviar código"
  E recebe via WhatsApp o código "123456"
  E digita 1-2-3-4-5-6
  Então a sessão é criada
  E ele é redirecionado para "/" (ou tenant ativo)

Cenário: OTP inválido
  Dado um OTP enviado para "+55 92 99988 7766"
  Quando o usuário digita um código errado 3 vezes
  Então o OTP é invalidado e ele precisa solicitar um novo

Cenário: OTP expirado
  Dado um OTP enviado há mais de 5 minutos
  Quando o usuário tenta verificar
  Então retorna erro "código expirado"

Cenário: Telefone novo
  Dado um telefone que nunca logou
  Quando OTP é validado
  Então User é criado automaticamente (linha em `users`)
  E redireciona para "/escolha-perfil"

Cenário: Rate-limit
  Dado um IP que pediu 5 OTPs em 10 minutos
  Quando pede o 6º
  Então retorna 429 com mensagem clara
```

## Contratos

### Schemas (Zod)

```ts
export const PhoneSchema = z.string().regex(/^\+55\d{10,11}$/, 'Use formato +55…');
export const OtpCodeSchema = z.string().regex(/^\d{6}$/);
export const SessionSchema = z.object({
  userId: z.string().uuid(),
  activeTenantId: z.string().uuid().optional(),
});
```

### Server actions (`src/server/auth.actions.ts`)

```ts
'use server';
export async function sendOtp(input: { telefone: string }): Promise<{ ok: true; expiresAt: Date } | { ok: false; error: string }>;
export async function verifyOtp(input: { telefone: string; code: string }): Promise<{ ok: true; userId: string; isNew: boolean } | { ok: false; error: string }>;
export async function signOut(): Promise<void>;
```

### Lib (`src/lib/auth`)

```ts
export async function requireUser(): Promise<{ userId: string }>;
export async function requireTenant(): Promise<{ userId: string; tenantId: string; papel: 'lider'|'cuidador' }>;
export async function setActiveTenant(tenantId: string): Promise<void>;
```

### WhatsApp OTP (`src/lib/whatsapp/otp.ts`)

```ts
export async function sendOtpViaWhatsApp(telefone: string, code: string): Promise<void>;
// implementação: Meta Cloud API ou provider, template "otp_login"
```

## Estados / Fluxo

```
[ /login (tel) ] ── send ──► [ /otp (6 dígitos) ] ── verify ──►
       ├── error (rate-limit) → toast + bloqueio 10min
       └── error (telefone inválido) → inline
                                                        │
                              ┌─────────────────────────┘
                              ▼
                   ┌─────────────────────┐
                   │ User existente?     │
                   └──┬───────────┬──────┘
                  Sim │           │ Não
                      ▼           ▼
                  /app or       /escolha-perfil [02]
                  tenant escolhido
```

## Persistência

- Cookie httpOnly assinado com payload `{ userId, activeTenantId? }`, 30 dias.
- Refresh implícito ao acessar página autenticada (estende sessão).
- OTP armazenado em `otp_codes`: telefone + hash do código (bcrypt), 5 min de expiração, max 3 tentativas.
- Rate-limit Upstash: 5 send/IP/10min, 10 verify/telefone/10min.

## Files / paths

```
src/app/(auth)/login/page.tsx                  # tela 1+2 (telefone)
src/app/(auth)/otp/page.tsx                    # tela 3
src/lib/auth/index.ts                          # requireUser, requireTenant
src/lib/auth/session.ts                        # cookie helpers
src/lib/auth/rate-limit.ts
src/lib/whatsapp/otp.ts                        # send template
src/lib/whatsapp/client.ts                     # Meta Cloud API wrapper
src/server/auth.actions.ts
src/db/schema/users.ts                         # tabela users (compartilhada)
src/db/schema/otp.ts                           # tabela otp_codes
src/tests/factories/user.factory.ts            # com Faker
```

## Testes (Faker)

- **Unit:** `sendOtp` gera código 6 dígitos hashed, expira em 5min
- **Unit:** `verifyOtp` valida hash, decrementa tentativas, marca consumido
- **Integration:** fluxo completo telefone novo → cria user
- **Integration:** rate-limit dispara após N requests
- **e2e (Playwright mobile preset):** login completo com OTP mock em ambiente de teste

```ts
// factory exemplo
import { faker } from '@faker-js/faker/locale/pt_BR';
export const fakeTelefone = () =>
  '+55' + faker.string.numeric(2) + faker.string.numeric(9);
```

## Events Published

- `auth.user_created` quando `verifyOtp` cria User novo (consumido por [02-cuidador-signup] para hidratar formulário)

## Events Consumed

- Nenhum

## Riscos

- **Custo de WhatsApp Cloud API**: template OTP é cobrado por conversa. Mitigação: pricing tier 1 cobre teste; produção exige acordo Meta Business.
- **Spam de OTP**: rate-limit + captcha invisível em send.
- **Suspensão de número Meta**: fallback SMS (Twilio) configurado por env var.

## Definition of Done

- [x] Telas login + OTP responsivas mobile-first
- [x] `requireUser`, `requireTenant` funcionais e tipados
- [x] OTP via WhatsApp Cloud API ou stub local (env-toggle)
- [x] Rate-limit funcionando contra Upstash (com fallback in-memory em dev)
- [x] Testes Faker passando (Playwright fica para wave de QA)
- [x] Cookie sessão httpOnly + SameSite=Lax

## Notas de implementação (auth-agent, 2026-05-25)

- **Sessão**: JWT HS256 via `jose`, cookie `acolhe_session`, 30 dias. Sem
  tabela `sessions` em DB — revogação por troca de `AUTH_SECRET` é
  aceitável no MVP. Quando precisarmos de forced-logout server-side
  (banimento, troca de senha massiva), criar `sessions` com `jti`.
- **`requireTenant()`** retorna `papel: 'cuidador'` como default conservador.
  Vai ser amarrado ao `Membership.status='ativo'` quando o schema
  `memberships` do `signup-agent` mergear (TODO documentado em
  `src/lib/auth/index.ts`).
- **WhatsApp dev-mode** (`WHATSAPP_DEV_MODE=true`): log do código em formato
  amigável no terminal (caixa ASCII). Quem fizer QA manual lê o código
  direto do `console.log` sem precisar de número Meta aprovado.
- **Helpers de telefone** (`src/lib/auth/phone.ts`) ficam fora da action
  `"use server"` porque essa diretiva proíbe exports não-async; o módulo
  separado deixa o client importar `normalizeBrPhone`, `maskBrPhone` etc.
- **Rate-limit** usa `globalThis` cache para sobreviver ao HMR no dev e
  expõe `__testing.createInMemoryLimiter` para os testes.
- **Schema `users`** seguiu exatamente `data-model.md §2.1` (E.164 único,
  sem RLS por ser cross-tenant). `otp_codes` segue §2.10 com índice
  `(telefone, createdAt)` para a query `verifyOtp`.

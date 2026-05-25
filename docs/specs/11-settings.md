---
name: 11-settings
title: Ajustes + Tenant Switcher
kind: Spec
owner: settings-agent
status: pending
size: S
depends_on: ["00-foundations","01-auth","03-tenant-setup"]
parallel_safe_with: ["04-invitations","05-assistidos","06-agenda","07-mensagens-ia","08-team-management","09-dashboard-lider","10-billing-stripe"]
owns:
  - src/app/(app)/ajustes/**
  - src/server/settings.actions.ts
  - src/components/layout/tenant-switcher.tsx
  - src/components/domain/settings/**
may-read:
  - src/server/tenant.actions.ts
  - src/server/membership.actions.ts
  - src/lib/auth/**
  - src/components/ui/**
updated: 2026-05-25
---

# 11 · Settings (Ajustes)

## Problema

Tela de Ajustes é o canivete suíço do usuário: perfil, localidade ativa, troca de tenant, notificações, tema, atalhos para Equipe e Assinatura (líder). Replica `AjustesScreen` + `TenantSwitcher`.

## User Stories

- Como **usuário**, edito meu perfil (nome, foto).
- Como **usuário**, troco de localidade em 2 toques.
- Como **usuário**, alterno dark mode.
- Como **usuário**, gerencio notificações WhatsApp.
- Como **líder**, vejo atalhos para Equipe + Assinatura.
- Como **usuário**, faço logout.

## Tela (`AjustesScreen`)

- ScreenHeader "Ajustes"
- Card perfil (avatar + nome + papel + tel) → tap leva a Editar perfil (v2)
- Section "Localidade ativa": card com sigla/cor + Trocar de localidade
- Section "Liderança" (só líder): Equipe + Assinatura
- Section "Visão do protótipo": toggle cuidador/líder *(QA-only, atrás de feature flag)*
- Section "Notificações": Avisos WhatsApp (toggle) + Casos urgentes ("Sempre")
- Section "Aparência": Modo escuro (toggle)
- Botão `Sair da conta`
- Versão app footer

### TenantSwitcher (modal sheet)
- Lista de Tenants do User com card cada
- Tap → `setActiveTenant` + close
- Botão "Criar nova localidade" → [03-tenant-setup]

## Critérios de Aceite

```gherkin
Cenário: Trocar localidade
  Dado eu pertenço a 3 Tenants
  Quando seleciono outra no switcher
  Então `setActiveTenant` é chamado
  E navegação refresca para "/" do novo tenant
  E todas as queries seguintes filtram pelo novo tenantId

Cenário: Toggle dark
  Dado tema atual = light
  Quando ativo "Modo escuro"
  Então a classe `dark` é aplicada no <html>
  E preferência é persistida em localStorage

Cenário: Logout
  Quando clico "Sair da conta"
  Então cookie é destruído
  E redireciono para /login

Cenário: Cuidador não vê seção Liderança
  Dado eu sou cuidador
  Então a section "Liderança" NÃO aparece
```

## Contratos

```ts
// server/settings.actions.ts
'use server';
export async function updateMyProfile(input: { nome?: string; fotoUrl?: string }): Promise<void>;
export async function setNotificationPreferences(prefs: { whatsapp: boolean }): Promise<void>;
export async function logout(): Promise<void>;
// setActiveTenant fica em lib/tenancy (de [03])
```

## Files / paths

```
src/app/(app)/ajustes/page.tsx
src/app/(app)/ajustes/perfil/page.tsx                 # v2 stub
src/components/layout/tenant-switcher.tsx
src/components/domain/settings/settings-row.tsx
src/components/domain/settings/settings-section.tsx
src/components/domain/settings/theme-toggle.tsx
src/server/settings.actions.ts
```

## Testes (Faker)

- **Unit:** dark toggle persiste localStorage
- **Integration:** `setActiveTenant` muda cookie e invalida cache
- **Tenancy:** dados depois do switch estão escopados
- **e2e:** trocar tenant e ver lista de assistidos mudar

## Events Published

- `tenant.switched`

## Events Consumed

- Nenhum

## Riscos

- **Cache invalidation no switch:** chamar `revalidatePath('/')` no server action.
- **Tema FOUC:** aplicar classe no `<html>` via script inline antes de hidratar.

## Definition of Done

- [ ] Tela completa com toggles funcionais
- [ ] Tenant switcher modal sheet
- [ ] Dark mode persistido + sem FOUC
- [ ] Logout limpa cookie
- [ ] Testes tenancy passando

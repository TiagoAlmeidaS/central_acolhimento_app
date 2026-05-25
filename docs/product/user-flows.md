---
title: User Flows · Acolhe
kind: UserFlows
owner: produto-acolhe
status: stable
updated: 2026-05-25
---

# Jornadas Ponta a Ponta

Mapa visual de todos os fluxos do app. Cada fluxo aponta para a(s) spec(s) que implementa(m) suas telas.

> Cada caixa retangular = uma tela. Setas = transição direta. As referências `[NN-XX]` apontam para [`../specs/`](../specs/).

---

## 1. Fluxo de entrada (entry point)

```
                ┌─────────────────────┐
                │       Landing        │  [12-landing]
                │   (Acolhe.app)       │
                └──────────┬──────────┘
                           │ "Abrir app"
                           ▼
                ┌─────────────────────┐
                │       Login          │  [01-auth]
                │  (Entrar com WPP)    │
                └──────┬──────┬───────┘
       "Entrar"        │      │ "Cadastre-se aqui"
                       ▼      ▼
                ┌────────────┐  ┌─────────────────────┐
                │ App princ. │  │ Escolha do Perfil   │  [02-cuidador-signup]
                └────────────┘  └────┬───────────┬────┘
                                     │           │
                              "Líder"│           │ "Cuidador"
                                     ▼           ▼
                               (fluxo 2)    (fluxo 3 ou 4)
```

---

## 2. Líder fundador cria uma localidade

```
[Escolha do Perfil] ─── "Sou líder" ───►
        ▼
┌─────────────────────────┐
│ 1 · Identidade do líder │  [03-tenant-setup]
│   nome + telefone       │
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ 2 · OTP WhatsApp        │  [01-auth] (componente OTP)
│   código de 6 dígitos   │
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ 3 · Localidade          │  [03-tenant-setup]
│   nome, denominação,    │
│   cidade, UF            │
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ 4 · Personalização      │  [03-tenant-setup]
│   sigla + cor           │
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ 5 · Revisão             │  [03-tenant-setup]
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ Planos                  │  [10-billing-stripe]
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ Checkout (cartão / PIX) │  [10-billing-stripe]
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ Sucesso                 │  [10-billing-stripe]
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ Bem-vindo, líder        │  [03-tenant-setup]
│  ↳ "Convidar primeiro"  │──┐
│  ↳ "Vou depois"         │  │
└──────────┬──────────────┘  │
           ▼                 ▼
       App (Home)       [04-invitations]
       como líder
```

**Tempo-alvo:** < 5 minutos do início ao "app aberto como líder".

---

## 3. Cuidador self-signup (fila de análise)

```
[Escolha do Perfil] ─── "Sou cuidador" ───►
        ▼
┌─────────────────────────┐
│ Cadastro de Cuidador    │  [02-cuidador-signup]
│  nome, tel, UF, cidade, │
│  igreja, bio            │
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ Em análise              │  [02-cuidador-signup]
│  - polling de status    │
│  - reenvio para suporte │
└──────────┬──────────────┘
           ▼ (líder aprova)
       App (Home)
```

**Aprovação:** o líder vê a fila em [08-team-management] na aba "Pendentes" e aprova/recusa.

---

## 4. Cuidador convidado (caminho rápido)

```
WhatsApp do convidado ─── tap no link ───►
        ▼
┌─────────────────────────┐
│ Convite Recebido        │  [04-invitations]
│  - banner com a marca   │
│  - inviter + tenant     │
│  - "Aceitar" / "Recusar"│
└──────────┬──────────────┘
           ▼ (aceitar)
┌─────────────────────────┐
│ Confirmar dados         │  [04-invitations]
│  pré-preenchidos        │
└──────────┬──────────────┘
           ▼
┌─────────────────────────┐
│ Bem-vinda               │  [04-invitations]
│  splash com heart       │
└──────────┬──────────────┘
           ▼
       App (Home) como cuidador
```

**Diferencial:** sem fila de análise. Acesso liberado direto.

---

## 5. Cuidador no dia-a-dia

```
       ┌────────────────────────────────────────────────┐
       │           App Shell (BottomNav 4 abas)         │
       └────┬────────────────┬─────────────┬───────────┘
            │                │             │           │
            ▼                ▼             ▼           ▼
         Início          Agenda       Mensagens    Ajustes
        [05-asst.]     [06-agenda]    [07-ia]    [11-settings]

Início (lista de assistidos):
  - tap em card  → Detalhes [05-assistidos]
  - tap em FAB+  → Novo irmão [05-assistidos]
  - busca + filtro de status

Detalhes:
  - WhatsApp direto (deep link wa.me)
  - "Marcar contato", "Liguei agora", "Oração"
  - Mudar status (dropdown)
  - Editar perfil (form completo) [05-assistidos]
  - Agendar reunião [06-agenda]
  - Adicionar nota à timeline

Agenda:
  - próximas reuniões da equipe
  - tap → Detalhes do assistido vinculado

Mensagens:
  - chat com agente IA (Claude) [07-mensagens-ia]
  - sugestões iniciais
  - bubbles com link inline pro Detalhes
```

---

## 6. Líder no dia-a-dia

```
       ┌────────────────────────────────────────────────┐
       │   App Shell — Líder vê DASHBOARD na Home       │
       └────┬────────────────┬─────────────┬───────────┘
            │                │             │           │
            ▼                ▼             ▼           ▼
        Dashboard         Agenda      Mensagens    Ajustes
       [09-dashboard]   [06-agenda]   [07-ia]    [11-settings]

Dashboard:
  - KPIs (ativos, urgentes, novos, tempo médio)
  - Funil por status
  - Gráfico 7 dias de visitas
  - Equipe online + capacidade
  - "Ver todos assistidos" → lista [05-assistidos com showBack]
  - "Equipe" → [08-team-management]

Ajustes (líder vê seções extras):
  - "Equipe de cuidadores" → [08-team-management]
  - "Assinatura" → [10-billing-stripe]
```

---

## 7. Líder convida alguém

```
[Ajustes/Equipe] ─── "+" Convidar ───►
        ▼
┌─────────────────────────┐
│ Convidar Cuidador       │  [04-invitations]
│  nome, tel, papel       │
└──────────┬──────────────┘
           ▼ "Enviar convite pelo WhatsApp"
┌─────────────────────────┐
│ Convite Enviado         │  [04-invitations]
│  - link copiável        │
│  - "como ela recebe"    │── DEMO ──► entra em [convite-recebido]
└──────────┬──────────────┘
           ▼
   Volta para [08-team-management]
```

---

## 8. IA cadastra um irmão novo

```
[Mensagens] "Cadastra a Cláudia Ferreira que pediu visita ontem"
        ▼
   IA confirma (e cita as ações que tomará)
        ▼
   IA grava Assistido (status=aguardando, sem cuidador)
   IA grava TimelineEvent kind='ai'
        ▼
   Resposta na conversa com link "→ Cláudia"
        ▼
   tap no link → [Detalhes] do novo Assistido
```

**Restrição:** IA **sempre** descreve a ação antes/depois — nunca silenciosa.

---

## 9. Status flip → urgente

```
WhatsApp do assistido com palavras-de-risco
        ▼ (webhook chega)
   IA classifica como urgente
        ▼
   TimelineEvent kind='ai' criado
   Assistido.status → 'urgente'
        ▼
   Notificação WhatsApp para cuidador atribuído E líder
        ▼
   Cuidador abre Detalhes → registra "Liguei agora"
```

*(Esse fluxo é parcial nos protótipos — está coberto na spec [07-mensagens-ia] como evolução.)*

---

## 10. Líder gerencia assinatura

```
[Ajustes] "Assinatura"
        ▼
┌─────────────────────────┐
│ Assinatura Ativa        │  [10-billing-stripe]
│  - plano atual          │
│  - próxima cobrança     │
│  - cartão               │
└──┬──────────────┬───────┘
   │              │
   │"Mudar plano" │ "Histórico"   "Cancelar"
   ▼              ▼               ▼
[Planos] → [Checkout] → [Sucesso]   [Faturas]      [Cancelar]
                                                      │
                                                      ▼
                                          confirma → cancela
                                          oferece downgrade Essencial
```

---

## 11. Troca de localidade (multi-tenant)

```
[Ajustes] "Trocar de localidade"
        ▼
   Modal sheet: lista de tenants do usuário
        ▼ (pick)
   App recarrega contexto com novo tenantId
        ▼
   Home, agenda, IA → todos isolados ao novo tenant
```

Spec: [11-settings]

---

## 12. Mapa rápido tela ↔ spec

| Tela (protótipo) | Spec destino |
|---|---|
| `LoginScreen`, `OtpScreen` | [01-auth] |
| `EscolhaPerfilScreen`, `CadastroScreen`, `AnaliseScreen` | [02-cuidador-signup] |
| `TenantIdentidadeScreen`, `TenantLocalidadeScreen`, `TenantPersonalizaScreen`, `TenantRevisaoScreen`, `TenantBemVindoScreen` | [03-tenant-setup] |
| `ConvidarScreen`, `ConviteEnviadoScreen`, `ConviteRecebidoScreen`, `ConviteConfirmarScreen`, `BemVindaScreen` | [04-invitations] |
| `HomeScreen`, `DetalhesScreen`, `EditarAssistidoScreen`, `NovoIrmaoScreen` | [05-assistidos] |
| `AgendaScreen`, `AgendarReuniaoScreen` | [06-agenda] |
| `MensagensScreen` | [07-mensagens-ia] |
| `EquipeScreen` (lista + pendentes) | [08-team-management] |
| `DashboardScreen` | [09-dashboard-lider] |
| `PlanosScreen`, `CheckoutScreen`, `SucessoAssinaturaScreen`, `AssinaturaAtivaScreen`, `FaturasScreen`, `CancelarScreen` | [10-billing-stripe] |
| `AjustesScreen`, `TenantSwitcher` | [11-settings] |
| `LandingPage` | [12-landing] |
| `BottomNav`, `StatusBar`, `Button`, `Input`, `Avatar`, ícones, tokens | [00-foundations] |

---

*Leitura complementar:* [`overview.md`](./overview.md) · [`../specs/README.md`](../specs/README.md)

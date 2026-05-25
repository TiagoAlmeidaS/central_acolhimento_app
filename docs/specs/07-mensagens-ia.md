---
name: 07-mensagens-ia
title: Mensagens · Agente de IA (Claude)
kind: Spec
owner: ia-agent
status: pending
size: M
depends_on: ["00-foundations","01-auth","03-tenant-setup","05-assistidos"]
parallel_safe_with: ["06-agenda","08-team-management","09-dashboard-lider","11-settings","04-invitations","10-billing-stripe"]
blocks: []
owns:
  - src/app/(app)/mensagens/**
  - src/server/chat.actions.ts
  - src/lib/claude/**
  - src/db/schema/chat.ts
  - src/components/domain/ia/**
may-read:
  - src/server/assistido.actions.ts
  - src/server/meeting.actions.ts
  - src/lib/tenancy/**
  - src/components/ui/**
updated: 2026-05-25
---

# 07 · Mensagens · Agente de IA

## Problema

A interface conversacional é a **superpower** do produto: cuidadores cadastram, mudam status e buscam por linguagem natural — sem clicar em forms. Replica o que `app/screens-main.jsx` (`MensagensScreen`) faz, mas com Claude oficial e ações reais.

## User Stories

- Como **cuidador**, escrevo "Quem está aguardando hoje?" e recebo lista direta.
- Como **cuidador**, escrevo "Cadastra a Cláudia Ferreira que pediu visita ontem" e a IA confirma + cria assistido.
- Como **cuidador**, recebo respostas com link inline para o perfil do assistido referenciado.
- Como **cuidador**, vejo histórico do meu chat (não compartilhado com outros).

## Tela

`MensagensScreen` em `app/screens-main.jsx`:
- ScreenHeader "Mensagens" com badge sparkle
- Scroll com `ChatBubble`s (user à direita, ai à esquerda)
- Indicador de loading com 3 dots animados
- Sugestões iniciais (1ª mensagem do dia) — clicar dispara
- Input bottom com:
  - text input
  - botão mic (placeholder por enquanto)
  - botão send (acende quando há texto)

## Critérios de Aceite

```gherkin
Cenário: Pergunta de leitura
  Quando envio "Quem está aguardando?"
  Então a resposta cita os Assistidos com status='aguardando' do meu tenant
  E aparece um ChatBubble com link "→ Roberto Mendes" inline

Cenário: Comando de mudança
  Quando envio "Marcar Carlos como em acompanhamento"
  Então a IA confirma a intenção antes de executar
  E quando confirmo, Assistido.status muda + TimelineEvent kind='ai' criado
  E a resposta cita "Mudei o Carlos para Em Acompanhamento."

Cenário: Cadastro via IA
  Quando envio "Cadastra Cláudia Ferreira de Manaus, ela pediu visita ontem"
  Então a IA confirma os campos parsed (nome, cidade)
  E ao confirmar cria Assistido + TimelineEvent kind='ai'
  E retorna link "→ Cláudia Ferreira"

Cenário: Isolamento de tenant
  Dado eu estou no tenant A
  Quando pergunto "Quem está aguardando?"
  Então a resposta NUNCA cita pessoas do tenant B

Cenário: Limite plano Essencial
  Dado o tenant está no plano Essencial e fez 200 interações no mês
  Quando envio a 201ª mensagem
  Então recebo erro "Limite mensal atingido — atualize para Pró"
```

## Arquitetura do agente

```
[user message] ──► Server Action `chat.send`
                          │
                          ▼
                  build context (tenant, role, casos)
                          │
                          ▼
                  invoke Claude (claude-3.5-sonnet ou claude-4)
                          │
                          ▼
                   tool-use loop:
                     - tool listAssistidos(filter)
                     - tool getAssistido(id)
                     - tool setStatus(id, status)
                     - tool createAssistido(input)
                     - tool createMeeting(input)
                          │
                          ▼
                   resposta final + linkAssistido?
                          │
                          ▼
                  persiste ChatMessage(s) + retorna
```

Sempre **confirmar antes de mutar**: o primeiro turno descreve a ação ("Vou cadastrar a Cláudia em Aguardando — confirmar?"). Só na confirmação ("sim", "pode") executa.

## Contratos

```ts
export const ChatMessageSchema = z.object({
  id: z.string(),
  from: z.enum(['user','ai']),
  text: z.string(),
  linkAssistidoId: z.string().nullable(),
  createdAt: z.date(),
});

// server/chat.actions.ts
'use server';
export async function loadChatThread(): Promise<ChatMessageSummary[]>;
export async function sendMessage(input: { text: string }): Promise<{ message: ChatMessageSummary; pending?: 'confirm-action' }>;
export async function confirmPendingAction(actionId: string): Promise<{ message: ChatMessageSummary }>;
```

## Tools disponíveis ao agente

Os tools são wrappers thin sobre as actions de [05] e [06] — sempre rodam com a sessão do usuário (tenant escopado):

| Tool name | Wraps |
|---|---|
| `list_assistidos` | `assistido.listAssistidos` |
| `get_assistido` | `assistido.getAssistido` |
| `create_assistido` | `assistido.createAssistido` |
| `set_status` | `assistido.setStatus` |
| `create_meeting` | `meeting.createMeeting` |
| `summarize_locality` | derivado |

## Prompt do agente (resumo)

```
Você é o Agente da Central de Acolhimento, atuando dentro da localidade "{tenant.nome}" ({tenant.cidade}).
Persona: pastoral, acolhedora, breve (no máx. 3 frases curtas), PT-BR.
Cuidador conectado: {user.nome} (papel: {papel}).
Casos atuais nesta localidade: {casos resumidos}.

REGRAS:
- Sempre confirme antes de executar qualquer ação que muda dado (create, set_status, create_meeting).
- Não invente nomes — use sempre dados reais via tools.
- Quando citar um assistido, retorne o link inline com id e nome curto.
- Se a pergunta cruzar tenant, recuse educadamente.
```

## Files / paths

```
src/app/(app)/mensagens/page.tsx
src/components/domain/ia/chat-bubble.tsx
src/components/domain/ia/chat-input.tsx
src/components/domain/ia/suggestion-chip.tsx
src/server/chat.actions.ts
src/lib/claude/client.ts                   # @anthropic-ai/sdk
src/lib/claude/prompts.ts
src/lib/claude/tools.ts                    # bridge para outras actions
src/lib/claude/usage-meter.ts              # contagem mensal por tenant
src/db/schema/chat.ts
src/tests/factories/chat.factory.ts
```

## Testes (Faker)

- **Unit:** prompt builder injeta corretamente contexto
- **Integration:** tool calls criam dados reais com tenantId correto
- **Integration:** isolamento — assistido de outro tenant nunca aparece na resposta
- **Limite mensal:** rate-limiter Essencial=200/mês, Pró=ilimitado
- **e2e (com mock de Claude):** cadastrar via chat → assistido aparece na Home

## Events Published

- `chat.message_sent`
- `chat.usage_recorded` (mensal, consumido por [09-dashboard]?)

## Events Consumed

- Nenhum

## Riscos

- **Custo Claude:** monitorar tokens por tenant; cobrar overflow no plano Essencial.
- **PII em logs:** nunca logar texto bruto de chat em Sentry — só hashes/counts.
- **Loop infinito de tools:** limite máximo 5 tool calls por turno.
- **Confiar na IA para mutação direta:** sempre exigir confirmação explícita do usuário (UI mostra "Confirmar?").

## Definition of Done

- [ ] Chat funcional com Claude oficial
- [ ] Tools rodando com tenant-isolation
- [ ] Sugestões iniciais com PT-BR
- [ ] Histórico persistido por usuário
- [ ] Quota mensal aplicada
- [ ] Testes de tenancy e limit passando

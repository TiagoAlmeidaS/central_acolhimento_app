# Anthropic Claude

## Por que usamos

Agente conversacional auxilia líderes e cuidadores em:

- **Triagem de assistidos** — sugere perguntas baseadas no histórico.
- **Resumo de reuniões** — gera ata estruturada após sessão.
- **Geração de mensagens** — escreve lembretes/follow-ups respeitando tom da localidade.

Claude vence aqui por:

- **Janela de contexto grande** (200k tokens) — cabe um histórico inteiro de assistido.
- **Tom adequado** para conversa sensível (vs. GPT, que tende a ser mais "robótico").
- **SDK oficial em Node** com streaming e tool-use.
- **Preço competitivo** no modelo Haiku para tarefas leves.

## Setup

### 1. Conta e API key

1. [console.anthropic.com](https://console.anthropic.com) → Sign up.
2. **Settings → API Keys → Create Key**.
3. Anote — não é recuperável.

Recomendação: crie chaves separadas por ambiente:

- `central-acolhimento-dev`
- `central-acolhimento-preview`
- `central-acolhimento-prod`

### 2. Modelos sugeridos

| Caso de uso                      | Modelo                              |
| -------------------------------- | ----------------------------------- |
| Agente conversacional (default)  | `claude-3-5-sonnet-20241022`        |
| Resumos rápidos                  | `claude-3-5-haiku-20241022`         |
| Triagem complexa / análise longa | `claude-3-5-sonnet-20241022`        |

> Modelos evoluem rapidamente. Centralize a constante em `src/lib/ai/models.ts` (a criar na Wave 2) e nunca espalhe strings de modelo pelo código.

## Envs

| Variável            | Valor                |
| ------------------- | -------------------- |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-…`     |

## Dev mode / stub

Sem `ANTHROPIC_API_KEY` no `.env.local`, o agente deve **mockar respostas** (Wave 2 implementa na spec `08-agente-ia`):

```ts
// src/lib/ai/client.ts (esboço)
export const ai = env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  : mockedAnthropic;
```

Vantagem: PRs sem credencial não quebram build.

## Produção · checklist

- [ ] Chave separada da de dev (não reusar)
- [ ] Limite mensal configurado em **Console → Settings → Spend limits** (ex.: $100/mês)
- [ ] Logs de prompts/respostas com **PII removida** (nome do assistido, telefone)
- [ ] Timeout no SDK (`maxRetries: 1`, `timeout: 30s`)
- [ ] Streaming usado quando UX permite (perceived latency menor)

## Custos & limites

Preços por **1M tokens** (oscila, conferir [anthropic.com/pricing](https://www.anthropic.com/pricing)):

| Modelo             | Input  | Output |
| ------------------ | ------ | ------ |
| Claude 3.5 Sonnet  | ~$3    | ~$15   |
| Claude 3.5 Haiku   | ~$0.80 | ~$4    |

Estimativa: 1 acolhimento médio (~5k tokens) ~= $0.05–$0.10 em Sonnet.

Rate limit padrão da conta nova: 50 requests/min, 40k tokens/min. Conta Build (após $5 gastos) destrava limits maiores.

## Troubleshooting

| Sintoma                       | Causa                                                                     |
| ----------------------------- | ------------------------------------------------------------------------- |
| `401 invalid x-api-key`       | Key revogada ou de outro ambiente                                         |
| `429 rate_limit_exceeded`     | Tier inicial; bater Console → Plans para upgrade                          |
| Resposta truncada             | `max_tokens` baixo no request                                             |
| Resposta vazia em streaming   | Provider às vezes envia eventos vazios; tratar `event.type === 'message_stop'` |

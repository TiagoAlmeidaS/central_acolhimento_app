# WhatsApp Cloud API (Meta)

## Por que usamos

OTP via WhatsApp é o canal de autenticação primário do produto. Cuidadores e líderes não precisam decorar senha — usam o app já instalado no celular.

A **WhatsApp Business Platform / Cloud API** (Meta) é o canal oficial e suporta:

- **Authentication templates** com botão "Copiar código" (UX nativa).
- **Webhooks** para confirmar entrega/leitura.
- **Sandbox** gratuito para 5 números de teste antes da verificação.

Alternativas (Twilio, MessageBird, Z-API) foram descartadas — todas terceirizam a Cloud API, então adicionam 1 hop de latência e custo de markup.

## Setup

### 1. Criar conta Meta for Developers

1. Acesse [developers.facebook.com](https://developers.facebook.com).
2. **My Apps** → **Create App** → tipo **Business**.
3. Em **Add Products**, adicione **WhatsApp**.

### 2. Configurar WhatsApp Business Account (WABA)

1. Em **WhatsApp → API Setup**:
   - Anote o **Phone number ID** (não confundir com o telefone visível).
   - Use o número de teste fornecido pela Meta para validar o fluxo.
2. **Permanent token**:
   - Acesse **Business Settings → System Users** → criar System User com role Admin.
   - **Generate Token** → escopos: `whatsapp_business_messaging` e `whatsapp_business_management`.
   - Anote o token (não é recuperável depois).

### 3. Templates de mensagem

OTP **não pode** ser enviado como texto livre — exige template `authentication` aprovado.

1. **WhatsApp Manager → Message Templates → Create**.
2. Categoria: **Authentication**.
3. Nome: `central_acolhimento_otp`.
4. Idioma: pt_BR.
5. Body: usar template padrão da Meta (texto bloqueado para OTP).
6. Submeter para aprovação — em geral < 1h.

Mesmo processo para template de boas-vindas, lembrete de reunião etc.

### 4. Webhook

1. Em **WhatsApp → Configuration → Webhook**:
   - **Callback URL**: `https://acolhe.app/api/webhooks/whatsapp` (criar a route quando implementarmos notificações).
   - **Verify token**: o valor de `WHATSAPP_VERIFY_TOKEN` (random gerado por você).
2. Subscribe aos campos: `messages` (entrega, leitura, falhas).

## Envs

| Variável                   | Valor                                          |
| -------------------------- | ---------------------------------------------- |
| `WHATSAPP_TOKEN`           | System User permanent token                    |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone number ID (não o telefone em si)         |
| `WHATSAPP_VERIFY_TOKEN`    | Token random pra Meta validar o webhook        |
| `WHATSAPP_DEV_MODE`        | `true` em dev/preview, `false` em produção     |

## Dev mode / stub

```bash
# .env.local
WHATSAPP_DEV_MODE=true
```

Com isso, [`src/lib/whatsapp/otp.ts`](../../../src/lib/whatsapp/otp.ts) **não chama a API Meta** — em vez disso, loga o código no console:

```
[whatsapp dev] OTP para +5511999999999 → 123456
```

Em ambiente preview, mantenha `true` até validar templates.

## Produção · checklist

- [ ] **Business verificada** no Meta Business Manager (precisa CNPJ + comprovante)
- [ ] **Phone number verificado** (recebimento de SMS/ligação no número da empresa)
- [ ] Template `central_acolhimento_otp` **aprovado** na categoria `authentication`
- [ ] Webhook responde HTTP 200 ao `GET` com `hub.mode=subscribe` (handshake)
- [ ] System User token salvo em **Vercel Production** scope, marcado `Sensitive`
- [ ] Rate-limit aplicado em `requestOtp` (Upstash) — ver [`upstash.md`](./upstash.md)
- [ ] `WHATSAPP_DEV_MODE=false` em produção

## Custos & limites

- **1000 conversas mensais gratuitas** (qualquer categoria) por WABA.
- **Authentication conversations** (Brasil): ~$0.0315 USD cada após o tier free (preços oscilam).
- Webhooks são gratuitos.
- Templates: ilimitados, sem custo por aprovação.

> Conversa = janela de 24h iniciada por mensagem template. Re-OTPs do mesmo usuário em <24h são na mesma conversa.

## Troubleshooting

| Sintoma                                              | Causa                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| `(#100) Param phone_number_id`                       | Está enviando o telefone em vez do **Phone number ID** numérico    |
| `(#131026) Receiver is not a valid WhatsApp user`    | Número não tem WhatsApp ativo                                      |
| `(#131056) Pair rate limit hit`                      | Muitas mensagens pro mesmo destinatário — aplicar Upstash          |
| Template rejeitado                                   | Texto custom em template authentication é proibido — usar default  |
| OTP não chega                                        | Confirmar `WHATSAPP_DEV_MODE=false` e template aprovado            |

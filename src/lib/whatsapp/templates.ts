/**
 * Catálogo de templates WhatsApp aprovados na Meta Business.
 *
 * Cada template precisa estar pre-aprovado no painel da Meta antes de ser
 * disparado em produção. Em dev-mode (`WHATSAPP_DEV_MODE=true`) o cliente
 * apenas loga a chamada — o `name` segue sendo a fonte de verdade.
 *
 * Schema: nome do template + namespace + idioma + ordem dos parâmetros.
 * Sempre que adicionar um template novo: cadastre na Meta + adicione aqui.
 */

export interface WhatsAppTemplate<TParams extends readonly string[]> {
  /** Nome registrado no Business Manager. */
  name: string;
  /** Idioma do template (BCP-47 simplificado, ex.: `pt_BR`). */
  language: string;
  /**
   * Ordem dos parâmetros do `body` — usada para validar e renderizar a
   * mensagem no `client.ts` em dev-mode.
   */
  bodyParams: TParams;
}

/**
 * Template `otp_login` — código de 6 dígitos para verificação.
 *
 * Body cadastrado na Meta:
 *   "Seu código Acolhe é {{1}}. Expira em 5 minutos. Nunca compartilhe."
 */
export const otpLoginTemplate = {
  name: "otp_login",
  language: "pt_BR",
  bodyParams: ["code"] as const,
} satisfies WhatsAppTemplate<readonly ["code"]>;

export const WHATSAPP_TEMPLATES = {
  otpLogin: otpLoginTemplate,
} as const;

export type WhatsAppTemplateName = keyof typeof WHATSAPP_TEMPLATES;

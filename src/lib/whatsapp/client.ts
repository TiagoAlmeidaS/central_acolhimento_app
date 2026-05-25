import { env } from "@/lib/env";
import {
  otpLoginTemplate,
  type WhatsAppTemplate,
} from "./templates";

/**
 * Cliente Meta WhatsApp Cloud API — versão `v20.0`.
 *
 * **Modo dev** (`WHATSAPP_DEV_MODE=true`): nenhuma requisição HTTP. O
 * payload é logado no console em formato amigável para QA manual.
 *
 * Erros de produção viram `WhatsAppError` para o caller decidir se reverte
 * a operação (ex.: deletar OTP recém-criado se o envio falhar).
 */

const GRAPH_API_VERSION = "v20.0";

export class WhatsAppError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "WhatsAppError";
  }
}

interface SendTemplateInput<TParams extends readonly string[]> {
  template: WhatsAppTemplate<TParams>;
  to: string;
  /** Mapa nome-do-param → valor; deve cobrir 100% dos `bodyParams`. */
  params: Record<TParams[number], string>;
}

/** Sanitiza um número E.164 para o formato exigido pela Meta (sem `+`). */
export function normalizeForMeta(telefone: string): string {
  return telefone.replace(/[^\d]/g, "");
}

/**
 * Envia um template aprovado. Os parâmetros são posicionais na Meta API
 * mas tipados nominalmente aqui para evitar erros silenciosos.
 */
export async function sendTemplate<TParams extends readonly string[]>(
  input: SendTemplateInput<TParams>,
): Promise<void> {
  const { template, to, params } = input;
  const orderedParams = template.bodyParams.map((key) => params[key as TParams[number]]);

  if (env.WHATSAPP_DEV_MODE) {
    const masked = `${to.slice(0, 5)}…${to.slice(-2)}`;
    console.log(
      `[whatsapp:dev] template=${template.name} to=${masked} params=${JSON.stringify(orderedParams)}`,
    );
    return;
  }

  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    throw new WhatsAppError(
      "WHATSAPP_TOKEN/WHATSAPP_PHONE_NUMBER_ID ausentes — desabilite dev-mode somente em produção configurada.",
    );
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: normalizeForMeta(to),
    type: "template",
    template: {
      name: template.name,
      language: { code: template.language },
      components: [
        {
          type: "body",
          parameters: orderedParams.map((v) => ({ type: "text", text: v })),
        },
      ],
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new WhatsAppError(
      `Falha ao enviar template ${template.name} (status ${res.status})`,
      res.status,
      payload,
    );
  }
}

/** Re-export para callers de teste que estão na pasta `whatsapp/`. */
export { otpLoginTemplate };

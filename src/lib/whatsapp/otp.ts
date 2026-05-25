import { sendTemplate } from "./client";
import { otpLoginTemplate } from "./templates";

/**
 * Dispara o template `otp_login` para o `telefone` informado.
 *
 * Em dev-mode (`WHATSAPP_DEV_MODE=true`) o `client` apenas loga; mas para
 * facilitar testes manuais e QA, também emitimos o código em destaque
 * aqui — fica fácil copiar do terminal.
 *
 * @param telefone E.164 (ex.: `+5592999887766`)
 * @param code     6 dígitos plain (já gerado pelo caller)
 */
export async function sendOtpViaWhatsApp(
  telefone: string,
  code: string,
): Promise<void> {
  if (process.env.WHATSAPP_DEV_MODE !== "false") {
    // eslint-disable-next-line no-console
    console.log(
      `\n┌─ OTP (dev) ─────────────────────────────\n│ telefone: ${telefone}\n│ código:   ${code}\n│ válido por 5 minutos\n└─────────────────────────────────────────\n`,
    );
  }
  await sendTemplate({
    template: otpLoginTemplate,
    to: telefone,
    params: { code },
  });
}

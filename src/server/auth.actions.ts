"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/db";
import { otpCodes, OTP_EXPIRATION_MS, OTP_MAX_ATTEMPTS, users } from "@/db/schema";
import {
  createSession,
  destroySession,
  sendOtpLimiter,
  verifyOtpLimiter,
} from "@/lib/auth";
import { generateOtpCode, normalizeBrPhone } from "@/lib/auth/phone";
import { sendOtpViaWhatsApp } from "@/lib/whatsapp/otp";

/**
 * Server actions para o fluxo de autenticação por WhatsApp OTP.
 *
 * - `sendOtp({ telefone })` — valida, rate-limita, gera código, salva hash,
 *   dispara o template.
 * - `verifyOtp({ telefone, code })` — checa expiração, decrementa
 *   tentativas (máx 3), cria sessão e (se necessário) o `User`.
 * - `signOut()` — destrói cookie.
 *
 * Todas retornam discriminated union `{ ok: true; ... } | { ok: false; error }`
 * em vez de lançar, para que o caller no client possa tratar UX-friendly.
 */

// ─── Schemas (mantém em sincronia com 01-auth §Contratos) ────────────────

/**
 * Formato E.164 brasileiro: `+55` + DDD(2) + número(8 ou 9).
 * O front aplica máscara `(00) 00000-0000`; o backend normaliza antes.
 *
 * Definidos como const internas porque `"use server"` proíbe export de
 * valores não-async; a versão pública mora em `@/lib/auth/phone.ts`.
 */
const PhoneSchema = z
  .string()
  .regex(/^\+55\d{10,11}$/, "Use formato +55 + DDD + número.");

const OtpCodeSchema = z.string().regex(/^\d{6}$/, "Código de 6 dígitos.");

const SendInput = z.object({ telefone: PhoneSchema });
const VerifyInput = z.object({
  telefone: PhoneSchema,
  code: OtpCodeSchema,
});

async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "anonymous";
}

// ─── sendOtp ─────────────────────────────────────────────────────────────

export type SendOtpResult =
  | { ok: true; expiresAt: Date }
  | { ok: false; error: string };

export async function sendOtp(input: {
  telefone: string;
}): Promise<SendOtpResult> {
  const normalized = normalizeBrPhone(input.telefone);
  const parsed = SendInput.safeParse({ telefone: normalized });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Número inválido. Use DDD + número (ex.: 92 99988-7766).",
    };
  }
  const telefone = parsed.data.telefone;

  const ip = await getClientIp();
  const limited = await sendOtpLimiter.limit(`${ip}:${telefone}`);
  if (!limited.success) {
    return {
      ok: false,
      error:
        "Muitas tentativas. Aguarde 10 minutos antes de pedir um novo código.",
    };
  }

  const code = generateOtpCode();
  const codigoHash = await bcrypt.hash(code, 10);
  const expiraEm = new Date(Date.now() + OTP_EXPIRATION_MS);

  try {
    await db.insert(otpCodes).values({
      telefone,
      codigoHash,
      expiraEm,
    });
  } catch (err) {
    console.error("[sendOtp] falha ao persistir OTP:", err);
    return { ok: false, error: "Erro temporário. Tente novamente." };
  }

  try {
    await sendOtpViaWhatsApp(telefone, code);
  } catch (err) {
    console.error("[sendOtp] falha no envio WhatsApp:", err);
    return {
      ok: false,
      error: "Não conseguimos enviar o código. Verifique o número.",
    };
  }

  return { ok: true, expiresAt: expiraEm };
}

// ─── verifyOtp ───────────────────────────────────────────────────────────

export type VerifyOtpResult =
  | { ok: true; userId: string; isNew: boolean }
  | { ok: false; error: string };

export async function verifyOtp(input: {
  telefone: string;
  code: string;
}): Promise<VerifyOtpResult> {
  const normalized = normalizeBrPhone(input.telefone);
  const parsed = VerifyInput.safeParse({
    telefone: normalized,
    code: input.code,
  });
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos." };
  }
  const { telefone, code } = parsed.data;

  const limited = await verifyOtpLimiter.limit(telefone);
  if (!limited.success) {
    return {
      ok: false,
      error: "Muitas tentativas. Solicite um novo código mais tarde.",
    };
  }

  // Busca o OTP mais recente não consumido para esse telefone.
  const rows = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.telefone, telefone), isNull(otpCodes.consumidoEm)))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);
  const otp = rows[0];

  if (!otp) {
    return { ok: false, error: "Código não encontrado. Solicite um novo." };
  }
  if (otp.expiraEm.getTime() < Date.now()) {
    await db
      .update(otpCodes)
      .set({ consumidoEm: new Date() })
      .where(eq(otpCodes.id, otp.id));
    return { ok: false, error: "Código expirado. Solicite um novo." };
  }

  const matches = await bcrypt.compare(code, otp.codigoHash);
  if (!matches) {
    const tentativas = otp.tentativas + 1;
    const esgotou = tentativas >= OTP_MAX_ATTEMPTS;
    await db
      .update(otpCodes)
      .set({
        tentativas,
        consumidoEm: esgotou ? new Date() : null,
      })
      .where(eq(otpCodes.id, otp.id));
    if (esgotou) {
      return {
        ok: false,
        error: "Limite de tentativas atingido. Solicite um novo código.",
      };
    }
    const restantes = OTP_MAX_ATTEMPTS - tentativas;
    return {
      ok: false,
      error: `Código incorreto. Você tem mais ${restantes} tentativa${restantes === 1 ? "" : "s"}.`,
    };
  }

  // Consome o OTP em definitivo
  await db
    .update(otpCodes)
    .set({ consumidoEm: new Date() })
    .where(eq(otpCodes.id, otp.id));

  // Cria ou recupera o usuário
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.telefone, telefone))
    .limit(1);
  let userId: string;
  let isNew = false;
  if (existing[0]) {
    userId = existing[0].id;
    await db
      .update(users)
      .set({ updatedAt: new Date() })
      .where(eq(users.id, userId));
  } else {
    const inserted = await db
      .insert(users)
      .values({
        nome: telefone,
        telefone,
      })
      .returning({ id: users.id });
    userId = inserted[0]!.id;
    isNew = true;
  }

  await createSession({ userId });
  return { ok: true, userId, isNew };
}

// ─── signOut ─────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await destroySession();
}

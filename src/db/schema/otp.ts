import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Tabela `otp_codes` — códigos OTP enviados por WhatsApp.
 *
 * - `codigoHash` é bcrypt do código de 6 dígitos (nunca armazenamos plain).
 * - `tentativas` é incrementado a cada `verifyOtp` falho; máx 3 antes de
 *   invalidar (linha marcada como consumida).
 * - `expiraEm` define janela de 5 minutos.
 * - `consumidoEm` marca o uso definitivo (ok ou tentativas esgotadas).
 * - Índice `(telefone, createdAt)` acelera a busca pelo último OTP válido.
 *
 * Owner: `auth-agent` (spec `01-auth`).
 */
export const otpCodes = pgTable(
  "otp_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    telefone: text("telefone").notNull(),
    codigoHash: text("codigo_hash").notNull(),
    tentativas: integer("tentativas").notNull().default(0),
    expiraEm: timestamp("expira_em", { withTimezone: true }).notNull(),
    consumidoEm: timestamp("consumido_em", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    idxTelefone: index("idx_otp_telefone").on(t.telefone, t.createdAt),
  }),
);

export type OtpCode = typeof otpCodes.$inferSelect;
export type NewOtpCode = typeof otpCodes.$inferInsert;

/** Janela de validade do código OTP em milissegundos (5 minutos). */
export const OTP_EXPIRATION_MS = 5 * 60 * 1000;

/** Máximo de tentativas de verificação antes de invalidar a linha. */
export const OTP_MAX_ATTEMPTS = 3;

/** Tamanho do código (sempre 6 dígitos numéricos). */
export const OTP_CODE_LENGTH = 6;

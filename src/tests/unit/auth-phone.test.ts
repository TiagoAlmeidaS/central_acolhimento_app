import { describe, expect, it } from "vitest";
import {
  generateOtpCode,
  isValidBrPhone,
  maskBrPhone,
  maskTelefoneForOtp,
  normalizeBrPhone,
} from "@/lib/auth/phone";
import {
  makeFakeE164Phone,
  makeFakeMaskedPhone,
} from "@/tests/factories/user";

describe("normalizeBrPhone", () => {
  it("adiciona +55 quando ausente", () => {
    expect(normalizeBrPhone("92999887766")).toBe("+5592999887766");
    expect(normalizeBrPhone("9299887766")).toBe("+559299887766");
  });

  it("preserva E.164 já formado", () => {
    expect(normalizeBrPhone("+5592999887766")).toBe("+5592999887766");
  });

  it("remove máscaras antes de normalizar", () => {
    expect(normalizeBrPhone("(92) 99988-7766")).toBe("+5592999887766");
    expect(normalizeBrPhone("92 9 9988-7766")).toBe("+5592999887766");
  });

  it("faz roundtrip com Faker", () => {
    for (let i = 0; i < 20; i++) {
      const masked = makeFakeMaskedPhone();
      expect(normalizeBrPhone(masked)).toMatch(/^\+55\d{10,11}$/);
    }
  });
});

describe("isValidBrPhone", () => {
  it("aceita 10 e 11 dígitos", () => {
    expect(isValidBrPhone("(92) 99988-7766")).toBe(true);
    expect(isValidBrPhone("(11) 2345-6789")).toBe(true);
  });

  it("rejeita curto", () => {
    expect(isValidBrPhone("123")).toBe(false);
    expect(isValidBrPhone("")).toBe(false);
  });
});

describe("maskBrPhone", () => {
  it("formata progressivamente conforme digitação", () => {
    expect(maskBrPhone("9")).toBe("(9");
    expect(maskBrPhone("92")).toBe("(92");
    expect(maskBrPhone("929")).toBe("(92) 9");
    expect(maskBrPhone("9299887")).toBe("(92) 99887");
    expect(maskBrPhone("92999887766")).toBe("(92) 99988-7766");
  });

  it("trunca em 11 dígitos", () => {
    expect(maskBrPhone("929998877669999")).toBe("(92) 99988-7766");
  });
});

describe("maskTelefoneForOtp", () => {
  it("ofusca o miolo e mantém DDD + final", () => {
    expect(maskTelefoneForOtp("+5592999887766")).toBe("(92) ••••-7766");
  });

  it("aceita E.164 sem mascarar quando muito curto", () => {
    expect(maskTelefoneForOtp("+55")).toBe("+55");
  });
});

describe("generateOtpCode", () => {
  it("gera código de 6 dígitos com padding zero à esquerda", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateOtpCode();
      expect(code).toMatch(/^\d{6}$/);
      expect(code).toHaveLength(6);
    }
  });

  it("E.164 do Faker entra/sai pela normalização sem perder dígitos", () => {
    for (let i = 0; i < 10; i++) {
      const e164 = makeFakeE164Phone();
      const masked = e164.replace("+55", "").replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
      expect(normalizeBrPhone(masked)).toBe(e164);
    }
  });
});

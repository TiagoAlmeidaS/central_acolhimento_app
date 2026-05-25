import { describe, expect, it } from "vitest";
import { fakerPT_BR as faker } from "@faker-js/faker";
import { sigleFrom } from "@/components/domain/tenant/sigle-from";

describe("sigleFrom", () => {
  it("retorna '?' para entrada vazia ou nula", () => {
    expect(sigleFrom("")).toBe("?");
    expect(sigleFrom("   ")).toBe("?");
    expect(sigleFrom(undefined)).toBe("?");
    expect(sigleFrom(null)).toBe("?");
  });

  it("usa as primeiras 2 letras quando há uma única palavra", () => {
    expect(sigleFrom("Adrianópolis")).toBe("AD");
    expect(sigleFrom("centro")).toBe("CE");
  });

  it("usa primeira+última para nomes compostos", () => {
    expect(sigleFrom("Vila Mariana")).toBe("VM");
    expect(sigleFrom("Centro Salvador BA")).toBe("CB");
  });

  it("respeita o limite de 3 caracteres mesmo em casos de borda", () => {
    expect(sigleFrom("a b c d e f").length).toBeLessThanOrEqual(3);
  });

  it("colapsa espaços extras entre palavras", () => {
    expect(sigleFrom("  Vila    Mariana  ")).toBe("VM");
  });

  it("é estável contra dados gerados por Faker (apenas tipo)", () => {
    for (let i = 0; i < 30; i++) {
      const cidade = faker.location.city();
      const result = sigleFrom(cidade);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.length).toBeLessThanOrEqual(3);
      expect(result).toBe(result.toLocaleUpperCase("pt-BR"));
    }
  });
});

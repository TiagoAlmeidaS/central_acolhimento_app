import { describe, it, expect } from "vitest";
import { initials } from "@/lib/utils/initials";
import { faker } from "@/tests/factories";

describe("initials()", () => {
  it("extrai duas iniciais de nome composto", () => {
    expect(initials("Carlos Silva")).toBe("CS");
    expect(initials("Maria das Graças")).toBe("MD");
  });

  it("retorna placeholder para vazio", () => {
    expect(initials("")).toBe("?");
    expect(initials(undefined)).toBe("?");
    expect(initials(null)).toBe("?");
  });

  it("sempre devolve até 2 letras para nomes Faker", () => {
    for (let i = 0; i < 20; i++) {
      const nome = faker.person.fullName();
      const result = initials(nome);
      expect(result.length).toBeLessThanOrEqual(2);
      expect(result).toMatch(/^[A-ZÀ-Ý]{1,2}$/u);
    }
  });
});

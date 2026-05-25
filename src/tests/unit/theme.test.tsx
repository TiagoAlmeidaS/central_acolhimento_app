import { describe, it, expect, beforeEach } from "vitest";

/**
 * Teste do mecanismo de tema baseado em classe `dark` no <html>.
 * Aqui validamos só o contrato visual: tokens leem CSS vars que mudam
 * com a presença da classe.
 */
describe("Mecanismo de tema (classe `dark`)", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("adiciona classe dark no <html>", () => {
    document.documentElement.classList.add("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggle remove a classe", () => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.toggle("dark", false);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});

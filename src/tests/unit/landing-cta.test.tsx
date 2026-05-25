import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingHeader } from "@/components/domain/landing/header";
import { LandingHero } from "@/components/domain/landing/hero";
import { FinalCTA } from "@/components/domain/landing/cta-final";
import { PricingSection } from "@/components/domain/landing/pricing-section";

/**
 * Garante que os CTAs principais da landing apontam para `/login`
 * (que recebe líder/cuidador → fluxos de OTP & criação de localidade).
 * Esses testes são contratos com a spec 01-auth: se o destino do CTA
 * mudar (ex.: `/escolha-perfil`), atualize aqui em conjunto.
 */
describe("Landing · CTAs", () => {
  it("header tem botão 'Criar localidade' que leva para /login", () => {
    render(<LandingHeader />);
    const cta = screen.getByRole("link", { name: /criar minha localidade/i });
    expect(cta).toHaveAttribute("href", "/login");
  });

  it("hero tem CTA primário apontando para /login", () => {
    render(<LandingHero />);
    const cta = screen.getByRole("link", { name: /criar minha localidade/i });
    expect(cta).toHaveAttribute("href", "/login");
  });

  it("cta final aponta para /login", () => {
    render(<FinalCTA />);
    const cta = screen.getByRole("link", { name: /criar minha localidade/i });
    expect(cta).toHaveAttribute("href", "/login");
  });

  it("pricing tem dois CTAs e ambos vão para /login", () => {
    render(<PricingSection />);
    const ctaTrial = screen.getByRole("link", {
      name: /começar 14 dias grátis/i,
    });
    const ctaEssencial = screen.getByRole("link", {
      name: /escolher plano/i,
    });
    expect(ctaTrial).toHaveAttribute("href", "/login");
    expect(ctaEssencial).toHaveAttribute("href", "/login");
  });
});

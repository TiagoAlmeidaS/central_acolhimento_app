import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LandingHero } from "@/components/domain/landing/hero";
import { FeaturesGrid } from "@/components/domain/landing/features-grid";
import { PricingSection } from "@/components/domain/landing/pricing-section";
import { SocialProof } from "@/components/domain/landing/social-proof";
import { TenantSection } from "@/components/domain/landing/tenant-section";
import { LandingFooter } from "@/components/domain/landing/footer";
import { faker } from "@/tests/factories";

/**
 * Sanity check da landing — garante que cada seção principal renderiza
 * o conteúdo descrito na spec (`docs/specs/12-landing.md`).
 * Mantém os valores monetários verificados via lookup pra resistir a
 * mudanças de copy. Os campos textuais "fakes" servem só para construir
 * heurísticas estáveis e exercitar o builder Faker (regra do projeto).
 */
describe("Landing · render", () => {
  it("hero exibe headline, sub e CTA principal", () => {
    render(<LandingHero />);
    expect(
      screen.getByRole("heading", { level: 1, name: /cuide do seu rebanho/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/central de cuidado pastoral para comunidades/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /criar minha localidade/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ver demonstração/i }),
    ).toBeInTheDocument();
  });

  it("features-grid renderiza as 6 features oficiais", () => {
    render(<FeaturesGrid />);
    const titles = [
      "Localidade fechada",
      "Agente IA pastoral",
      "Conexão por WhatsApp",
      "Agenda compartilhada",
      "Aprovação por liderança",
      "Histórico que dura",
    ];
    for (const t of titles) {
      expect(
        screen.getByRole("heading", { level: 3, name: t }),
      ).toBeInTheDocument();
    }
  });

  it("pricing-section mostra Essencial R$ 19,90 e Pró R$ 29,90", () => {
    render(<PricingSection />);
    const region = screen.getByRole("region", {
      name: /um líder paga\./i,
    });
    expect(within(region).getByText(/Essencial/i)).toBeInTheDocument();
    expect(within(region).getByText(/Pró/i)).toBeInTheDocument();
    expect(within(region).getByText("R$ 19,90")).toBeInTheDocument();
    expect(within(region).getByText("R$ 29,90")).toBeInTheDocument();
    expect(
      within(region).getByText(/14 dias grátis em ambos os planos/i),
    ).toBeInTheDocument();
  });

  it("social-proof lista comunidades em pílulas", () => {
    render(<SocialProof />);
    expect(
      screen.getByText(/comunidades em todo o brasil já confiam/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/adrianópolis · am/i)).toBeInTheDocument();
    expect(screen.getByText(/aldeota · ce/i)).toBeInTheDocument();
  });

  it("tenant-section mostra três localidades lacradas", () => {
    render(<TenantSection />);
    expect(
      screen.getByRole("heading", { level: 2, name: /sua comunidade/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Lacrada/i).length).toBe(3);
  });

  it("footer lista colunas Produto, Empresa e Legal e mostra ano corrente", () => {
    render(<LandingFooter />);
    expect(screen.getByText("Produto")).toBeInTheDocument();
    expect(screen.getByText("Empresa")).toBeInTheDocument();
    expect(screen.getByText("Legal")).toBeInTheDocument();
    const year = new Date().getFullYear().toString();
    expect(
      screen.getByText(new RegExp(`© ${year} Acolhe`)),
    ).toBeInTheDocument();
  });

  it("Faker continua disponível pros geradores de fixture", () => {
    // smoke test do Faker pt-BR — necessário para outras specs que
    // dependem deste setup (regra do projeto).
    const nome = faker.person.fullName();
    expect(nome.length).toBeGreaterThan(0);
  });
});

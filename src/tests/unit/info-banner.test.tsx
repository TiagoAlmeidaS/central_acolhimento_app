import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InfoBanner } from "@/components/ui/info-banner";

describe("<InfoBanner>", () => {
  it("renderiza children como nota a11y", () => {
    render(<InfoBanner>Mensagem de ajuda</InfoBanner>);
    const note = screen.getByRole("note");
    expect(note).toHaveTextContent("Mensagem de ajuda");
  });

  it("aplica tom urgente", () => {
    render(<InfoBanner tone="urgente">Sensível</InfoBanner>);
    expect(screen.getByRole("note").className).toMatch(/status-urgente/);
  });
});

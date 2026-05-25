import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScreenHeader } from "@/components/layout/screen-header";
import { TENANTS_MOCK } from "@/lib/data/tenants";

describe("<ScreenHeader>", () => {
  it("renderiza título como h1", () => {
    render(<ScreenHeader title="Início" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Início" }),
    ).toBeInTheDocument();
  });

  it("mostra tenant chip quando recebe tenantId", () => {
    const t = TENANTS_MOCK[0]!;
    render(<ScreenHeader title="Agenda" tenantId={t.id} />);
    expect(screen.getByText(t.nome)).toBeInTheDocument();
  });

  it("expõe botão voltar quando back é true", () => {
    const onBack = vi.fn();
    render(<ScreenHeader title="Detalhes" back onBack={onBack} />);
    fireEvent.click(screen.getByLabelText("Voltar"));
    expect(onBack).toHaveBeenCalledOnce();
  });
});

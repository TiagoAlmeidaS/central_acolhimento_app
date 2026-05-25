import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TenantChip } from "@/components/domain/tenant/tenant-chip";
import { TENANTS_MOCK } from "@/lib/data/tenants";

describe("<TenantChip>", () => {
  it("mostra sigla e nome do tenant", () => {
    const t = TENANTS_MOCK[0]!;
    render(<TenantChip tenantId={t.id} />);
    expect(screen.getByText(t.sigla)).toBeInTheDocument();
    expect(screen.getByText(t.nome)).toBeInTheDocument();
  });

  it("expõe aria-label com cidade", () => {
    const t = TENANTS_MOCK[1]!;
    render(<TenantChip tenantId={t.id} />);
    expect(
      screen.getByLabelText(`Localidade: ${t.nome}, ${t.cidade}`),
    ).toBeInTheDocument();
  });

  it("é clicável quando recebe onClick", () => {
    const onClick = vi.fn();
    const t = TENANTS_MOCK[0]!;
    render(<TenantChip tenantId={t.id} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

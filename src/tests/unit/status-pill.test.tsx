import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  StatusPill,
  StatusDot,
} from "@/components/domain/assistido/status-pill";
import { STATUS } from "@/lib/data/status";
import { makeAssistido } from "@/tests/factories";

describe("<StatusPill>", () => {
  it("renderiza label de urgente com cores oficiais", () => {
    render(<StatusPill status="urgente" />);
    const pill = screen.getByText("Urgente");
    expect(pill).toHaveStyle({
      background: STATUS.urgente.bg,
      color: STATUS.urgente.fg,
    });
  });

  it("usa shortLabel para acompanhamento", () => {
    render(<StatusPill status="acompanhamento" />);
    expect(screen.getByText("Acompanhando")).toBeInTheDocument();
  });

  it("renderiza qualquer status válido vindo do faker", () => {
    const a = makeAssistido();
    render(<StatusPill status={a.status} />);
    expect(
      screen.getByLabelText(`Status: ${STATUS[a.status].label}`),
    ).toBeInTheDocument();
  });
});

describe("<StatusDot>", () => {
  it("expõe label do status", () => {
    render(<StatusDot status="concluido" />);
    expect(
      screen.getByLabelText("Status: Concluído"),
    ).toBeInTheDocument();
  });
});

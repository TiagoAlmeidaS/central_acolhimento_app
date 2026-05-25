import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusStepper } from "@/components/ui/status-stepper";
import { IconCheck, IconHourglass, IconLock } from "@/components/icons";

describe("<StatusStepper>", () => {
  const steps = [
    { label: "Cadastro", icon: <IconCheck /> },
    { label: "Análise", icon: <IconHourglass /> },
    { label: "Liberado", icon: <IconLock /> },
  ];

  it("renderiza todos os labels em uppercase", () => {
    render(<StatusStepper steps={steps} current={1} />);
    expect(screen.getByText("Cadastro")).toBeInTheDocument();
    expect(screen.getByText("Análise")).toBeInTheDocument();
    expect(screen.getByText("Liberado")).toBeInTheDocument();
  });

  it("marca passo atual com aria-current step", () => {
    render(<StatusStepper steps={steps} current={1} />);
    const current = screen.getByLabelText("Progresso").querySelector(
      '[aria-current="step"]',
    );
    expect(current).not.toBeNull();
  });
});

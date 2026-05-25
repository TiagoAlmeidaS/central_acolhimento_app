import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StepBar } from "@/components/ui/step-bar";

describe("<StepBar>", () => {
  it("mostra contador 'N/M'", () => {
    render(<StepBar current={2} total={5} />);
    expect(screen.getByText("2/5")).toBeInTheDocument();
  });

  it("clamp current para 1..total", () => {
    render(<StepBar current={99} total={3} />);
    expect(screen.getByText("3/3")).toBeInTheDocument();
  });

  it("dispara onBack e onSkip", () => {
    const onBack = vi.fn();
    const onSkip = vi.fn();
    render(
      <StepBar current={2} total={4} onBack={onBack} onSkip={onSkip} />,
    );
    fireEvent.click(screen.getByLabelText("Voltar"));
    fireEvent.click(screen.getByText("Pular"));
    expect(onBack).toHaveBeenCalledOnce();
    expect(onSkip).toHaveBeenCalledOnce();
  });
});

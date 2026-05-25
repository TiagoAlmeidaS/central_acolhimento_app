import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Card } from "@/components/ui/card";

describe("<Card>", () => {
  it("renderiza children", () => {
    render(<Card>Conteúdo</Card>);
    expect(screen.getByText("Conteúdo")).toBeInTheDocument();
  });

  it("não vira button sem onClick", () => {
    const { container } = render(<Card>Estático</Card>);
    expect(container.firstChild).not.toHaveAttribute("role", "button");
  });

  it("vira button quando recebe onClick", () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Clicável</Card>);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  it("aceita Enter via teclado quando clicável", () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Acessível</Card>);
    const btn = screen.getByRole("button");
    btn.focus();
    fireEvent.keyDown(btn, { key: "Enter" });
    expect(onClick).toHaveBeenCalled();
  });
});

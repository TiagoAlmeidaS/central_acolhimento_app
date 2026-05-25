import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@/components/icons";
import { faker } from "@/tests/factories";

describe("<Button>", () => {
  it("renderiza children e dispara onClick", () => {
    const label = faker.lorem.words(2);
    const onClick = vi.fn();
    render(<Button onClick={onClick}>{label}</Button>);
    const btn = screen.getByRole("button", { name: label });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("aplica variant primary por default", () => {
    render(<Button>OK</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/bg-accent/);
  });

  it("aceita variant whatsapp com cor verde", () => {
    render(<Button variant="whatsapp">Convidar</Button>);
    expect(screen.getByRole("button").className).toMatch(/bg-whatsapp/);
  });

  it("não dispara onClick quando disabled", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Off
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("mostra estado loading com aria-busy", () => {
    render(<Button loading>Enviando</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toBeDisabled();
  });

  it("renderiza ícone direito quando não está em loading", () => {
    render(
      <Button iconRight={<IconArrowRight data-testid="right" />}>
        Continuar
      </Button>,
    );
    expect(screen.getByTestId("right")).toBeInTheDocument();
  });
});

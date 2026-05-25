import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IconButton } from "@/components/ui/icon-button";
import { IconBell } from "@/components/icons";

describe("<IconButton>", () => {
  it("expõe aria-label obrigatório", () => {
    render(<IconButton aria-label="Notificações" icon={<IconBell />} />);
    expect(
      screen.getByRole("button", { name: "Notificações" }),
    ).toBeInTheDocument();
  });

  it("aplica variant tinted", () => {
    render(
      <IconButton
        aria-label="Adicionar"
        icon={<IconBell />}
        variant="tinted"
      />,
    );
    expect(screen.getByRole("button").className).toMatch(/bg-accent-bg/);
  });
});

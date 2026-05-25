import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/ui/avatar";
import { makeUser } from "@/tests/factories";

describe("<Avatar>", () => {
  it("renderiza iniciais como fallback", () => {
    const user = makeUser({ nome: "Carlos Silva" });
    render(<Avatar name={user.nome} />);
    expect(screen.getByText("CS")).toBeInTheDocument();
  });

  it("expõe nome para leitores de tela", () => {
    const user = makeUser();
    render(<Avatar name={user.nome} />);
    expect(screen.getByText(user.nome)).toBeInTheDocument();
  });

  it("mostra dot online quando ativo", () => {
    const user = makeUser();
    render(<Avatar name={user.nome} online />);
    expect(screen.getByLabelText("online")).toBeInTheDocument();
  });
});

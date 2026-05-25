import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "@/components/ui/input";
import { faker } from "@/tests/factories";

describe("<Input>", () => {
  it("associa label ao input via htmlFor/id", () => {
    const label = "Telefone";
    render(<Input label={label} />);
    const input = screen.getByLabelText(label);
    expect(input.tagName).toBe("INPUT");
  });

  it("dispara onChange com valor digitado", () => {
    const onChange = vi.fn();
    render(<Input label="Nome" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: faker.person.firstName() },
    });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("exibe mensagem de erro com aria-invalid", () => {
    const erro = "E-mail inválido";
    render(<Input label="E-mail" error={erro} />);
    const input = screen.getByLabelText("E-mail");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(erro)).toBeInTheDocument();
  });

  it("hint aparece quando não há erro", () => {
    const hint = faker.lorem.sentence();
    render(<Input label="Telefone" hint={hint} />);
    expect(screen.getByText(hint)).toBeInTheDocument();
  });
});

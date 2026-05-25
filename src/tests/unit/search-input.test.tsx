import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "@/components/ui/search-input";
import { faker } from "@/tests/factories";

describe("<SearchInput>", () => {
  it("usa label acessível mesmo quando não visível", () => {
    render(<SearchInput placeholder="Buscar nomes" />);
    expect(screen.getByLabelText("Buscar")).toBeInTheDocument();
  });

  it("dispara onChange ao digitar", () => {
    const onChange = vi.fn();
    render(<SearchInput onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Buscar"), {
      target: { value: faker.person.firstName() },
    });
    expect(onChange).toHaveBeenCalled();
  });

  it("aceita srLabel customizado", () => {
    render(<SearchInput srLabel="Procurar irmãos" />);
    expect(screen.getByLabelText("Procurar irmãos")).toBeInTheDocument();
  });
});

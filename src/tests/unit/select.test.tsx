import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select } from "@/components/ui/select";
import { UFS } from "@/lib/data/tenants";

describe("<Select>", () => {
  it("renderiza placeholder + opções", () => {
    render(
      <Select
        label="UF"
        placeholder="Selecione"
        options={UFS.map((u) => ({ value: u, label: u }))}
      />,
    );
    expect(screen.getByLabelText("UF")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Selecione" })).toBeDisabled();
    expect(screen.getByRole("option", { name: "AM" })).toBeInTheDocument();
  });

  it("aceita opções tipo string", () => {
    render(<Select label="UF" options={["AM", "SP", "RJ"]} />);
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("dispara onChange ao selecionar", () => {
    const onChange = vi.fn();
    render(
      <Select
        label="UF"
        defaultValue="AM"
        onChange={onChange}
        options={["AM", "SP"]}
      />,
    );
    fireEvent.change(screen.getByLabelText("UF"), {
      target: { value: "SP" },
    });
    expect(onChange).toHaveBeenCalledOnce();
  });
});

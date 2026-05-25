import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Textarea } from "@/components/ui/textarea";
import { faker } from "@/tests/factories";

describe("<Textarea>", () => {
  it("associa label ao textarea", () => {
    render(<Textarea label="Resumo" />);
    expect(screen.getByLabelText("Resumo").tagName).toBe("TEXTAREA");
  });

  it("renderiza placeholder e default value", () => {
    const def = faker.lorem.sentence();
    render(<Textarea label="Notas" defaultValue={def} />);
    expect(screen.getByLabelText("Notas")).toHaveValue(def);
  });

  it("erro aplica aria-invalid", () => {
    render(<Textarea label="Notas" error="Obrigatório" />);
    expect(screen.getByLabelText("Notas")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});

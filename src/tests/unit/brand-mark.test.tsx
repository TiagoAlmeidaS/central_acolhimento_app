import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrandMark } from "@/components/ui/brand-mark";

describe("<BrandMark>", () => {
  it("renderiza como image com aria-label Acolhe", () => {
    render(<BrandMark />);
    expect(screen.getByRole("img", { name: "Acolhe" })).toBeInTheDocument();
  });

  it("aceita size customizado", () => {
    render(<BrandMark size={48} />);
    const mark = screen.getByRole("img", { name: "Acolhe" });
    expect(mark).toHaveStyle({ width: "48px", height: "48px" });
  });
});

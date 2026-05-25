import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils/cn";

describe("cn()", () => {
  it("junta classes simples", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("dedupa classes Tailwind conflitantes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", "text-base")).toBe("text-base");
  });

  it("aceita arrays, objetos e falsy values do clsx", () => {
    expect(
      cn(["a", "b"], { c: true, d: false }, null, undefined, "e"),
    ).toBe("a b c e");
  });
});

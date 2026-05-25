import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BottomNav } from "@/components/layout/bottom-nav";

describe("<BottomNav>", () => {
  it("cuidador vê aba 'Início'", () => {
    render(<BottomNav tab="home" onTab={() => {}} role="cuidador" />);
    expect(screen.getByRole("tab", { name: "Início" })).toBeInTheDocument();
  });

  it("líder vê aba 'Painel'", () => {
    render(<BottomNav tab="home" onTab={() => {}} role="lider" />);
    expect(screen.getByRole("tab", { name: "Painel" })).toBeInTheDocument();
  });

  it("dispara onTab ao clicar", () => {
    const onTab = vi.fn();
    render(<BottomNav tab="home" onTab={onTab} />);
    fireEvent.click(screen.getByRole("tab", { name: "Agenda" }));
    expect(onTab).toHaveBeenCalledWith("agenda");
  });

  it("mostra badge urgente quando > 0", () => {
    render(<BottomNav tab="home" onTab={() => {}} urgentBadge={3} />);
    expect(screen.getByLabelText("3 novos")).toBeInTheDocument();
  });
});

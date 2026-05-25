"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { StatusBar } from "./status-bar";

export interface PhoneFrameProps {
  children: ReactNode;
  /** Tema visual do mockup (afeta cor do notch). */
  theme?: "light" | "dark";
  className?: string;
}

/**
 * Moldura de iPhone usada apenas no playground/QA em desktop.
 * **Não** renderize em produção mobile — em produção o app ocupa
 * a viewport real. Em telas pequenas a moldura se torna apenas
 * um container vertical.
 *
 * Visibilidade: o frame só aparece em viewport ≥ md (768px); abaixo
 * disso, devolve um wrapper full-bleed para manter a experiência
 * mobile-first em dispositivos reais.
 */
export function PhoneFrame({
  children,
  theme = "light",
  className,
}: PhoneFrameProps) {
  return (
    <>
      {/* mobile real: sem moldura, ocupa tudo. */}
      <div className="md:hidden min-h-dvh bg-bg">{children}</div>
      {/* desktop: moldura 380x800 centralizada. */}
      <div
        className={cn(
          "hidden md:flex min-h-dvh items-center justify-center p-8 bg-[#ECEEF2] dark:bg-[#0A0E18]",
          className,
        )}
      >
        <div
          className={cn(
            "relative flex flex-col w-[380px] h-[800px] overflow-hidden",
            "rounded-[44px] border border-black/10 shadow-2xl",
            theme === "dark" ? "bg-[#131A2A]" : "bg-[#F5F5F7]",
          )}
        >
          <StatusBar dark={theme === "dark"} />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
}

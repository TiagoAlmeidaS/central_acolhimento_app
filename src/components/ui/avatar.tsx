"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/initials";

export interface AvatarProps {
  src?: string | null;
  name: string;
  /** Tamanho em px (diâmetro do círculo). */
  size?: number;
  /** Mostra ponto verde de presença no canto inferior direito. */
  online?: boolean;
  /** Aro azul (acento) ao redor — usado para indicar usuário ativo. */
  ring?: boolean;
  className?: string;
}

/**
 * Avatar circular com fallback de iniciais. A imagem é carregada por
 * cima das iniciais, então o usuário nunca vê um espaço cinza enquanto
 * a foto baixa.
 *
 * `alt=""` é intencional: o nome já é renderizado em forma de iniciais
 * e tipicamente acompanha o avatar (lista de pessoas), evitando dupla
 * leitura por leitores de tela.
 */
export function Avatar({
  src,
  name,
  size = 60,
  online = false,
  ring = false,
  className,
}: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const showImage = Boolean(src) && !errored;
  const dotSize = Math.max(10, Math.round(size * 0.24));
  const fontSize = Math.max(11, Math.round(size * 0.34));
  return (
    <div
      className={cn("relative flex-shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full overflow-hidden bg-[#E2E8F0] text-[#64748B] flex items-center justify-center font-semibold tracking-tight2"
        style={{
          fontSize,
          boxShadow: ring
            ? "0 0 0 3px var(--surface), 0 0 0 4.5px var(--accent)"
            : "0 0 0 1px rgba(15,23,42,0.04)",
        }}
      >
        <span aria-hidden="true">{initials(name)}</span>
        {showImage && src && (
          <Image
            src={src}
            alt=""
            fill
            sizes={`${size}px`}
            className="object-cover"
            loading="lazy"
            onError={() => setErrored(true)}
          />
        )}
      </div>
      {online && (
        <div
          className="absolute right-0 bottom-[2px] rounded-full bg-[#22C55E] border-[2.5px] border-surface"
          style={{ width: dotSize, height: dotSize }}
          aria-label="online"
        />
      )}
      <span className="sr-only">{name}</span>
    </div>
  );
}

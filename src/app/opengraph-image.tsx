import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Acolhe · Central de acolhimento pastoral";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * OG image dinâmica gerada com `next/og`. Mantém fundo gradiente
 * marca + título grande + linha de subtítulo, alinhado com o tom
 * visual da landing. Fonte é a padrão do `ImageResponse` (sans),
 * já que carregar Plus Jakarta no edge agrega latência e ponto de
 * falha — visualmente fica bem com weight 800 e tracking apertado.
 */
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #2D7FF9 0%, #7C3AED 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.10)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.08)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: "#ffffff",
              color: "#2D7FF9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            ♡
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            Acolhe
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", zIndex: 1 }}>
          <div
            style={{
              fontSize: 82,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: "-0.045em",
              maxWidth: 1000,
            }}
          >
            Cuide do seu rebanho{" "}
            <span style={{ color: "rgba(255,255,255,0.78)" }}>
              como nunca antes.
            </span>
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: "rgba(255,255,255,0.85)",
              maxWidth: 880,
            }}
          >
            Central de cuidado pastoral · Localidade fechada · Agente IA
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              background: "rgba(255,255,255,0.16)",
              borderRadius: 999,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.005em",
            }}
          >
            ✨ Agente IA pastoral · Beta aberta
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              opacity: 0.8,
              letterSpacing: "-0.005em",
            }}
          >
            acolhe.app
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

import type { MetadataRoute } from "next";

/**
 * Web App Manifest — versão mínima de Wave 0.
 * Ícones 192/512 são placeholders; reemplazar quando a marca final
 * for definida. `standalone` permite instalar como app no iOS/Android.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Acolhe · Central de Acolhimento",
    short_name: "Acolhe",
    description:
      "Cuidado pastoral compartilhado — comunidade fechada por localidade.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F5F5F7",
    theme_color: "#2D7FF9",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["lifestyle", "productivity", "social"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/**
 * Sitemap mínimo — atualmente apenas a landing `/`. À medida que
 * novas páginas marketing forem criadas (`/sobre`, `/precos` dedicado,
 * artigos do blog, etc.), incluir aqui com `lastModified` derivado
 * do controle de versão.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const updatedAt = new Date();
  return [
    {
      url: `${base}/`,
      lastModified: updatedAt,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/login`,
      lastModified: updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}

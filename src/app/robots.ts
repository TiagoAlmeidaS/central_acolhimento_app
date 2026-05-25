import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/**
 * `robots.txt` permissivo — indexação aberta em produção, fechado
 * para tudo que esteja em `/dev/*` (playground do design system) e
 * para rotas autenticadas (`/login` é permitido como deep-link). Em
 * ambientes de preview/desenvolvimento, bloqueamos tudo para evitar
 * vazamento.
 */
export default function robots(): MetadataRoute.Robots {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const allowIndex = env.NODE_ENV === "production";

  if (!allowIndex) {
    return {
      rules: { userAgent: "*", disallow: "/" },
      host: base,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dev/", "/api/", "/_next/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

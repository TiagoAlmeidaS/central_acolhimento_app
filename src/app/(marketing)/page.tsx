import type { Metadata } from "next";
import {
  LandingHero,
  SocialProof,
  FeaturesGrid,
  TenantSection,
  AISection,
  PricingSection,
  FinalCTA,
} from "@/components/domain/landing";

export const metadata: Metadata = {
  title: "Acolhe · Central de acolhimento pastoral",
  description:
    "Central de cuidado pastoral para comunidades de fé. Localidade fechada, agente IA e equipe de cuidadores em um só lugar.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Acolhe · Central de acolhimento pastoral",
    description:
      "Localidade fechada, agente IA e equipe de cuidadores em um só lugar. Cuide do seu rebanho como nunca antes.",
    url: "/",
    siteName: "Acolhe",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Acolhe · Central de acolhimento pastoral",
    description:
      "Localidade fechada, agente IA e equipe de cuidadores em um só lugar.",
  },
  keywords: [
    "cuidado pastoral",
    "igreja",
    "acolhimento",
    "localidade",
    "células",
    "ministério",
    "agente IA",
    "WhatsApp pastoral",
  ],
};

/**
 * Página raiz da Acolhe. RSC pura — toda a interação é via `<a href>`
 * (smooth scroll para âncoras é do navegador, sem JS extra).
 */
export default function LandingPage() {
  return (
    <>
      <LandingHero />
      <SocialProof />
      <FeaturesGrid />
      <TenantSection />
      <AISection />
      <PricingSection />
      <FinalCTA />
    </>
  );
}

import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "@/lib/utils/cn";
import "../styles/globals.css";

/**
 * Fonte principal — `display: 'swap'` evita FOIT no mobile,
 * `variable` exporta `--font-plus-jakarta` consumido por `--font-sans`
 * em `globals.css`.
 */
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "Acolhe · Central de Acolhimento",
    template: "%s · Acolhe",
  },
  description:
    "Central de cuidado pastoral para comunidades de fé. Localidade fechada, agente de IA e equipe de cuidadores em um só lugar.",
  applicationName: "Acolhe",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Acolhe",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2D7FF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1220" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={sans.variable}>
      <body className={cn("font-sans antialiased bg-bg text-text min-h-dvh")}>
        {children}
      </body>
    </html>
  );
}

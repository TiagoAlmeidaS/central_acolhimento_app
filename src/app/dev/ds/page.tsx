import type { Metadata } from "next";
import { DesignSystemPlayground } from "./playground";

export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return <DesignSystemPlayground />;
}

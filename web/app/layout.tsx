import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Predictiv. | Find a Practitioner or Name Your Problem",
    template: "%s | Predictiv.",
  },
  description:
    "Find a trusted physiotherapist, biokineticist or health practitioner near you, or describe your problem and get directed to the right specialist. Directional guidance only, not medical advice.",
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}

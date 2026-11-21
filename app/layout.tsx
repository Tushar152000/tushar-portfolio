import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter_Tight({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-inter-tight", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "Tushar Chauhan — Software Engineer II",
  description:
    "Full-stack & backend engineer with 2+ years shipping AI-powered SaaS and cloud infrastructure. Next.js, Node.js, TypeScript, GCP, AWS. Open to SDE II, Full-Stack, Backend and AI Engineer roles.",
  openGraph: {
    title: "Tushar Chauhan — Software Engineer II",
    description: "I ship AI products that scale. Full-stack engineer building GPT-4o features used by 2,000+ students every month.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0806",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        <noscript>
          <style>{`.loader{display:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}

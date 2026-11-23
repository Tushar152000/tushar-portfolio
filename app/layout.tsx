import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter_Tight({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-inter-tight", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });

const SITE = "https://tusharchauhan-dev.vercel.app";
const TITLE = "Tushar Chauhan | Software Engineer II, Full-Stack & AI Engineer";
const DESCRIPTION =
  "Tushar Chauhan is a Software Engineer II at Bosscoder Academy: a full-stack and backend engineer with 2+ years shipping AI-powered SaaS on Next.js, Node.js, TypeScript, GCP and AWS. Open to SDE II, Full-Stack, Backend and AI Engineer roles.";
const SHARE = "I ship AI products that scale. Full-stack engineer behind GPT-4o features used by 2,000+ students a month and a zero-downtime Next.js platform migration.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: "%s · Tushar Chauhan" },
  description: DESCRIPTION,
  applicationName: "Tushar Chauhan Portfolio",
  authors: [{ name: "Tushar Chauhan", url: SITE }],
  creator: "Tushar Chauhan",
  keywords: [
    "Tushar Chauhan", "Software Engineer II", "Full-Stack Developer", "Backend Engineer", "AI Engineer",
    "Next.js", "React", "Node.js", "TypeScript", "GPT-4o", "LLM", "GCP", "AWS", "Portfolio", "Delhi NCR",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: "Tushar Chauhan",
    title: TITLE,
    description: SHARE,
    locale: "en_IN",
    firstName: "Tushar",
    lastName: "Chauhan",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: SHARE },
  robots: { index: true, follow: true },
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

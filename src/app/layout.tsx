import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Release Hub — Patch notes IA depuis vos commits",
    template: "%s · Release Hub",
  },
  description:
    "Transformez vos commits en changelog Markdown et post réseaux. Essai gratuit, import GitHub optionnel, abonnement Pro pour les équipes.",
  keywords: [
    "patch notes",
    "changelog",
    "commits",
    "IA",
    "release notes",
    "marketing dev",
  ],
  authors: [{ name: "Release Hub" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Release Hub",
    title: "Release Hub — Patch notes IA depuis vos commits",
    description:
      "Changelog Markdown + post LinkedIn/X/Discord en quelques secondes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Release Hub — Patch notes IA",
    description:
      "De vos commits au patch note, sans prise de tête.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-foreground">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="glow-orb -top-32 left-1/2 size-[550px] -translate-x-1/2 bg-[oklch(0.88_0.06_72)]" />
          <div className="glow-orb top-1/4 -right-24 size-[380px] bg-[oklch(0.91_0.05_58)]" />
          <div className="glow-orb -bottom-16 -left-16 size-[320px] bg-[oklch(0.93_0.04_82)]" />
        </div>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

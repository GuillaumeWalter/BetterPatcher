import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";

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

export const metadata: Metadata = {
  title: "Release Hub — Patch notes & assets marketing",
  description:
    "Collez vos commits, choisissez une tonalité et générez un patch note plus un post réseaux en quelques secondes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${plusJakarta.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-foreground">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="glow-orb -top-32 left-1/2 size-[600px] -translate-x-1/2 bg-[oklch(0.55_0.16_50)]" />
          <div className="glow-orb top-1/3 -right-32 size-[400px] bg-[oklch(0.5_0.14_25)]" />
          <div className="glow-orb -bottom-20 -left-20 size-[350px] bg-[oklch(0.45_0.12_65)]" />
        </div>
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

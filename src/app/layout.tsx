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
  title: "Easy Patch | Patch notes & marketing assets",
  description:
    "Paste your commits, pick a tone, and get a patch note plus a social post in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-foreground">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="glow-orb -top-32 left-1/2 size-[550px] -translate-x-1/2 bg-[oklch(0.88_0.06_72)]" />
          <div className="glow-orb top-1/4 -right-24 size-[380px] bg-[oklch(0.91_0.05_58)]" />
          <div className="glow-orb -bottom-16 -left-16 size-[320px] bg-[oklch(0.93_0.04_82)]" />
        </div>
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}

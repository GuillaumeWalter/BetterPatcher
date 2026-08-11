import type { MetadataRoute } from "next";

function getBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  const lastModified = new Date();

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${base}/legal/cgu`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/legal/confidentialite`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}

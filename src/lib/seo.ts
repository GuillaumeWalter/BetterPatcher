import type { Metadata } from "next";

import { getAppBaseUrl } from "@/lib/stripe";

export const SITE_NAME = "Easy Patch";
export const SITE_DESCRIPTION =
  "Easy Patch turns GitHub, GitLab, or pasted commits into a Markdown patch note and platform-ready social drafts.";

export function siteUrl(path = ""): string {
  const base = getAppBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata(input: {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const title = input.title
    ? `${input.title} | ${SITE_NAME}`
    : `${SITE_NAME} | Patch notes & marketing assets`;
  const description = input.description ?? SITE_DESCRIPTION;
  const url = siteUrl(input.path ?? "/");

  return {
    title,
    description,
    metadataBase: new URL(getAppBaseUrl()),
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
    ...(input.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

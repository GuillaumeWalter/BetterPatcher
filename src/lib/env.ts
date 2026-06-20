function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function getAuthSecret(): string | undefined {
  return readEnv("AUTH_SECRET", "NEXTAUTH_SECRET");
}

export function getGitHubClientId(): string | undefined {
  return readEnv("AUTH_GITHUB_ID", "GITHUB_ID");
}

export function getGitHubClientSecret(): string | undefined {
  return readEnv("AUTH_GITHUB_SECRET", "GITHUB_SECRET");
}

export function getStripeSecretKey(): string | undefined {
  return readEnv("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret(): string | undefined {
  return readEnv("STRIPE_WEBHOOK_SECRET");
}

export function getStripeProPriceId(): string | undefined {
  return readEnv("STRIPE_PRO_PRICE_ID");
}

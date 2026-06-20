import Stripe from "stripe";

import { getStripeSecretKey } from "@/lib/env";
import {
  getUserProfile,
  setStripeCustomerId,
} from "@/lib/supabase/users";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const secretKey = getStripeSecretKey();
  if (!secretKey) return null;

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function getAppBaseUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export async function getOrCreateStripeCustomer(input: {
  userId: string;
  email: string | null;
}) {
  const stripe = getStripe();
  if (!stripe) return null;

  const profile = await getUserProfile(input.userId);

  if (profile?.stripeCustomerId) {
    return profile.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: input.email ?? undefined,
    metadata: {
      userId: input.userId,
    },
  });

  await setStripeCustomerId(input.userId, customer.id);
  return customer.id;
}

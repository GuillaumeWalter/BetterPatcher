import Stripe from "stripe";

import {
  BILLING,
  type PaidPlanTier,
} from "@/lib/billing/constants";
import {
  getStripeWebhookSecret,
  listConfiguredStripePriceIds,
} from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import {
  getUserIdByStripeCustomerId,
  getUserProfile,
  markPaymentMethodVerified,
  updateSubscriptionState,
} from "@/lib/supabase/users";
import {
  sendPaymentFailedEmail,
  sendSubscriptionCanceledEmail,
  sendSubscriptionConfirmedEmail,
  sendTrialActivatedEmail,
} from "@/lib/email";

function mapSubscriptionStatus(
  status: Stripe.Subscription.Status,
): "active" | "past_due" | "canceled" | "none" {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (status === "canceled" || status === "incomplete_expired") return "canceled";
  return "none";
}

function getBillingPeriodStart(subscription: Stripe.Subscription): Date {
  const itemStart = subscription.items?.data?.[0]?.current_period_start;
  if (itemStart) {
    return new Date(itemStart * 1000);
  }

  return new Date(subscription.billing_cycle_anchor * 1000);
}

async function emailContextForUser(userId: string) {
  const profile = await getUserProfile(userId);
  if (!profile?.email) return null;
  return {
    userId,
    email: profile.email,
    name: null as string | null,
  };
}

function resolvePlanTier(
  subscription: Stripe.Subscription,
  metadataPlan?: string | null,
): PaidPlanTier {
  if (metadataPlan === "solo" || metadataPlan === "pro") {
    return metadataPlan;
  }

  const priceId = subscription.items?.data?.[0]?.price?.id;
  if (!priceId) return "pro";

  const { solo, pro } = listConfiguredStripePriceIds();
  if (solo.includes(priceId)) return "solo";
  if (pro.includes(priceId)) return "pro";

  return "pro";
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return Response.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe/webhook] signature", error);
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId =
          typeof session.customer === "string" ? session.customer : null;

        if (session.mode === "setup" && userId) {
          const { newlyVerified } = await markPaymentMethodVerified(userId);
          if (newlyVerified) {
            const ctx = await emailContextForUser(userId);
            if (ctx) await sendTrialActivatedEmail(ctx);
          }
        }

        if (session.mode === "subscription" && session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;

          const subscription = (await stripe.subscriptions.retrieve(
            subscriptionId,
          )) as Stripe.Subscription;
          const resolvedUserId =
            userId ??
            (customerId ? await getUserIdByStripeCustomerId(customerId) : null);

          if (resolvedUserId) {
            const planTier = resolvePlanTier(
              subscription,
              session.metadata?.planTier,
            );
            await updateSubscriptionState({
              userId: resolvedUserId,
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: mapSubscriptionStatus(subscription.status),
              planTier,
              billingPeriodStart: getBillingPeriodStart(subscription),
              resetPeriodUsage: true,
            });
            const ctx = await emailContextForUser(resolvedUserId);
            if (ctx && (planTier === "solo" || planTier === "pro")) {
              await sendSubscriptionConfirmedEmail(ctx, planTier);
            }
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const status =
          event.type === "customer.subscription.deleted"
            ? "canceled"
            : mapSubscriptionStatus(subscription.status);

        const userId = await getUserIdByStripeCustomerId(customerId);

        await updateSubscriptionState({
          stripeCustomerId: customerId,
          stripeSubscriptionId:
            status === "canceled" ? null : subscription.id,
          subscriptionStatus: status,
          planTier:
            status === "active" ? resolvePlanTier(subscription) : "none",
          billingPeriodStart: getBillingPeriodStart(subscription),
          resetPeriodUsage:
            event.type === "customer.subscription.updated" && status === "active",
        });

        if (userId) {
          const ctx = await emailContextForUser(userId);
          if (ctx) {
            if (event.type === "customer.subscription.deleted") {
              await sendSubscriptionCanceledEmail(ctx);
            } else if (status === "past_due") {
              await sendPaymentFailedEmail(ctx);
            }
          }
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.customer) break;

        const subscriptionRef =
          invoice.parent?.subscription_details?.subscription;
        if (!subscriptionRef) break;

        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer.id;

        const subscriptionId =
          typeof subscriptionRef === "string"
            ? subscriptionRef
            : subscriptionRef.id;

        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId,
        )) as Stripe.Subscription;

        await updateSubscriptionState({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: "active",
          planTier: resolvePlanTier(subscription),
          billingPeriodStart: getBillingPeriodStart(subscription),
          resetPeriodUsage: invoice.billing_reason === "subscription_cycle",
        });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("[stripe/webhook]", event.type, error);
    return Response.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return Response.json({ received: true, limits: BILLING });
}

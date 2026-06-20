import Stripe from "stripe";

import { BILLING } from "@/lib/billing/constants";
import { getStripeWebhookSecret } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import {
  getUserIdByStripeCustomerId,
  markPaymentMethodVerified,
  updateSubscriptionState,
} from "@/lib/supabase/users";

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

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return Response.json({ error: "Stripe webhook non configuré." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Signature manquante." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe/webhook] signature", error);
    return Response.json({ error: "Signature invalide." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId =
          typeof session.customer === "string" ? session.customer : null;

        if (session.mode === "setup" && userId) {
          await markPaymentMethodVerified(userId);
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
            await updateSubscriptionState({
              userId: resolvedUserId,
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: mapSubscriptionStatus(subscription.status),
              billingPeriodStart: getBillingPeriodStart(subscription),
              resetPeriodUsage: true,
            });
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

        await updateSubscriptionState({
          stripeCustomerId: customerId,
          stripeSubscriptionId:
            status === "canceled" ? null : subscription.id,
          subscriptionStatus: status,
          billingPeriodStart: getBillingPeriodStart(subscription),
          resetPeriodUsage: event.type === "customer.subscription.updated" && status === "active",
        });
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

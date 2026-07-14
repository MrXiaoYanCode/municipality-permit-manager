import Stripe from "stripe";
import type { SubscriptionTier } from "@/types";
import { SUBSCRIPTION_TIERS } from "@/types";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return stripeInstance;
}

export const TIER_PRICE_IDS: Record<Exclude<SubscriptionTier, "free">, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};

export function getTierFromPriceId(priceId: string): SubscriptionTier {
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_PROFESSIONAL) return "professional";
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) return "enterprise";
  return "free";
}

export function getQuotaForTier(tier: SubscriptionTier): number {
  return SUBSCRIPTION_TIERS[tier].quota;
}

/** Report usage to Stripe meter when user exceeds included document quota */
export async function reportDocumentUsage(stripeCustomerId: string): Promise<void> {
  if (!process.env.STRIPE_METER_ID) return;

  const stripe = getStripe();
  await stripe.billing.meterEvents.create({
    event_name: "document_processed",
    payload: {
      stripe_customer_id: stripeCustomerId,
      value: "1",
    },
  });
}

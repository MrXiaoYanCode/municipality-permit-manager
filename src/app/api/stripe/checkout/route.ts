import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, TIER_PRICE_IDS } from "@/lib/stripe";
import type { SubscriptionTier } from "@/types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tier } = await request.json() as { tier: Exclude<SubscriptionTier, "free"> };
    const priceId = TIER_PRICE_IDS[tier];

    if (!priceId) {
      return NextResponse.json({ error: "Invalid tier or price not configured" }, { status: 400 });
    }

    const stripe = getStripe();

    const { data: profile } = await supabase.from("profiles").select("stripe_customer_id, email").eq("id", user.id).single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email ?? user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
      metadata: { user_id: user.id, tier },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}

/**
 * Provisions Stripe products, prices, and usage meter for PermitFlow.
 * Run: node scripts/stripe-provision.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const envPath = existsSync(resolve(root, ".env"))
    ? resolve(root, ".env")
    : resolve(root, ".env.local");
  const content = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return { env, envPath };
}

const PLANS = [
  {
    key: "STRIPE_PRICE_STARTER",
    name: "PermitFlow Starter",
    description: "50 AI documents/mo, 3 business locations, AI extraction",
    amount: 1900,
    quota: 50,
  },
  {
    key: "STRIPE_PRICE_PROFESSIONAL",
    name: "PermitFlow Professional",
    description: "200 AI documents/mo, unlimited locations, AI compliance chat",
    amount: 4900,
    quota: 200,
  },
  {
    key: "STRIPE_PRICE_ENTERPRISE",
    name: "PermitFlow Enterprise",
    description: "Unlimited AI documents, priority support, API access",
    amount: 9900,
    quota: -1,
  },
];

async function main() {
  const { env, envPath } = loadEnv();
  const secretKey = env.STRIPE_SECRET_KEY;

  if (!secretKey || secretKey.includes("sk_test_...") || secretKey.length < 20) {
    console.error("❌ STRIPE_SECRET_KEY missing or invalid in .env");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2025-02-24.acacia" });

  console.log("🔧 Provisioning Stripe resources for Municipality Permit Manager...\n");

  const updates = {};

  for (const plan of PLANS) {
    const existing = env[plan.key];
    if (existing && !existing.includes("price_...")) {
      console.log(`✓ ${plan.name}: already configured (${existing})`);
      updates[plan.key] = existing;
      continue;
    }

    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { tier: plan.key.replace("STRIPE_PRICE_", "").toLowerCase(), quota: String(plan.quota) },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.amount,
      currency: "usd",
      recurring: { interval: "month" },
      metadata: { tier: plan.key.replace("STRIPE_PRICE_", "").toLowerCase() },
    });

    console.log(`✓ Created ${plan.name}: ${price.id} ($${plan.amount / 100}/mo)`);
    updates[plan.key] = price.id;
  }

  // Usage-based meter for extra documents ($0.01 each)
  let meterId = env.STRIPE_METER_ID;
  if (!meterId || meterId.includes("...")) {
    try {
      const meter = await stripe.billing.meters.create({
        display_name: "AI Documents Processed",
        event_name: "document_processed",
        default_aggregation: { formula: "sum" },
        customer_mapping: {
          type: "by_id",
          event_payload_key: "stripe_customer_id",
        },
        value_settings: { event_payload_key: "value" },
      });
      meterId = meter.id;
      console.log(`✓ Created usage meter: ${meterId}`);
      updates.STRIPE_METER_ID = meterId;
    } catch (e) {
      console.log("⚠ Usage meter creation skipped (may already exist or API version):", e.message);
    }
  }

  // Update .env and .env.local
  let content = readFileSync(envPath, "utf8");
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
  }
  writeFileSync(envPath, content);

  const localPath = resolve(root, ".env.local");
  if (existsSync(localPath) && localPath !== envPath) {
    let local = readFileSync(localPath, "utf8");
    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(local)) {
        local = local.replace(regex, `${key}=${value}`);
      } else {
        local += `\n${key}=${value}`;
      }
    }
    writeFileSync(localPath, local);
  } else if (!existsSync(localPath)) {
    writeFileSync(localPath, content);
  }

  console.log("\n✅ Stripe provisioning complete!");
  console.log("\nPrice IDs saved to .env and .env.local:");
  for (const [key, value] of Object.entries(updates)) {
    console.log(`  ${key}=${value}`);
  }

  console.log("\n📋 Next steps:");
  console.log("  1. Run webhook listener:");
  console.log('     stripe listen --forward-to localhost:3000/api/webhooks/stripe');
  console.log("  2. Copy the whsec_... secret to STRIPE_WEBHOOK_SECRET in .env");
  console.log("  3. npm run dev");
}

main().catch((err) => {
  console.error("❌ Provisioning failed:", err.message);
  process.exit(1);
});

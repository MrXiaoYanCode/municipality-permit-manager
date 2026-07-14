"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular?: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({ plans, title, description }: PricingProps) {
  const [isYearly, setIsYearly] = useState(false);

  const handleToggle = () => {
    setIsYearly(!isYearly);
    if (!isYearly) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {title && (
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
            {description && (
              <p className="mx-auto max-w-2xl text-muted-foreground whitespace-pre-line">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="mb-10 flex items-center justify-center gap-3">
          <span className={cn("text-sm", !isYearly && "font-semibold")}>Monthly</span>
          <button
            onClick={handleToggle}
            className={cn(
              "relative h-7 w-14 rounded-full transition-colors",
              isYearly ? "bg-primary" : "bg-muted"
            )}
            aria-label="Toggle yearly pricing"
          >
            <motion.div
              className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow"
              animate={{ x: isYearly ? 30 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={cn("text-sm", isYearly && "font-semibold")}>
            Yearly <span className="text-primary">(Save 20%)</span>
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className={cn(
                "relative rounded-2xl glass-card p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1",
                plan.isPopular && "ring-2 ring-primary/30 shadow-md shadow-primary/10"
              )}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </span>
              )}
              <h3 className="mb-2 text-lg font-semibold">{plan.name}</h3>
              <p className="mb-6 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  $<NumberFlow value={parseInt(isYearly ? plan.yearlyPrice : plan.price)} />
                </span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.isPopular ? "default" : "outline"}
                asChild
              >
                <a href={plan.href}>{plan.buttonText}</a>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

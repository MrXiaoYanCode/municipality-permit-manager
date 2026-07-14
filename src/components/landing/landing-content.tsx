"use client";

import Link from "next/link";
import {
  Calendar,
  FileText,
  Shield,
  Sparkles,
  Building2,
  Utensils,
  Scissors,
  Coffee,
  PartyPopper,
  Signpost,
  Truck,
} from "lucide-react";
import { Typewriter } from "@/components/blocks/typewriter";
import { IndustryCarousel } from "@/components/blocks/industry-carousel";
import { InteractiveHoverButton } from "@/components/blocks/interactive-hover-button";
import { DisplayCards } from "@/components/blocks/display-cards";
import { Pricing, type PricingPlan } from "@/components/blocks/pricing";

const features = [
  {
    icon: Calendar,
    title: "Deadline Tracking",
    description: "Never miss a permit renewal with smart deadline alerts at 7, 30, and 90-day intervals.",
  },
  {
    icon: FileText,
    title: "AI Document Parsing",
    description: "Upload permit PDFs and let AI extract dates, requirements, and compliance details automatically.",
  },
  {
    icon: Shield,
    title: "Compliance Checklists",
    description: "Industry-specific checklists for restaurants, salons, cafes, events, signage, and food trucks.",
  },
  {
    icon: Sparkles,
    title: "AI Compliance Chat",
    description: "Ask questions about your permits and get instant answers powered by your document data.",
  },
  {
    icon: Building2,
    title: "Inspection Scheduler",
    description: "Schedule and track municipal inspections with automated reminders.",
  },
  {
    icon: FileText,
    title: "Renewal Documents",
    description: "Centralize all renewal documents in one secure, searchable vault.",
  },
];

const industries = [
  { icon: Utensils, name: "Restaurants", color: "from-orange-500/20 to-red-500/20" },
  { icon: Scissors, name: "Beauty Salons", color: "from-pink-500/20 to-purple-500/20" },
  { icon: Coffee, name: "Cafes", color: "from-amber-500/20 to-yellow-500/20" },
  { icon: PartyPopper, name: "Events", color: "from-violet-500/20 to-indigo-500/20" },
  { icon: Signpost, name: "Signage", color: "from-blue-500/20 to-cyan-500/20" },
  { icon: Truck, name: "Food Trucks", color: "from-green-500/20 to-emerald-500/20" },
];

const pricingPlans: PricingPlan[] = [
  {
    name: "FREE",
    price: "0",
    yearlyPrice: "0",
    period: "per month",
    features: ["Up to 5 AI documents/mo", "1 business location", "Basic permit tracking", "Compliance checklists"],
    description: "Perfect for solo business owners getting started",
    buttonText: "Start Free",
    href: "/auth/signup",
    isPopular: false,
  },
  {
    name: "STARTER",
    price: "19",
    yearlyPrice: "15",
    period: "per month",
    features: [
      "50 AI documents/mo",
      "3 business locations",
      "AI document extraction",
      "Deadline email alerts",
      "Inspection scheduling",
    ],
    description: "Ideal for growing businesses with multiple permits",
    buttonText: "Get Started",
    href: "/auth/signup?plan=starter",
    isPopular: true,
  },
  {
    name: "PROFESSIONAL",
    price: "49",
    yearlyPrice: "39",
    period: "per month",
    features: [
      "200 AI documents/mo",
      "Unlimited locations",
      "AI compliance chat",
      "Priority support",
      "Export compliance reports",
      "$0.01/additional document",
    ],
    description: "For businesses that need full compliance automation",
    buttonText: "Go Professional",
    href: "/auth/signup?plan=professional",
    isPopular: false,
  },
];

export function LandingContent() {
  return (
    <>
      <section className="relative overflow-hidden py-16 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-transparent dark:from-primary/12" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="glass-card mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-Powered Municipal Compliance
          </div>

          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block sm:inline">Never Miss a</span>{" "}
            <span className="mt-2 block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent sm:mt-0 sm:inline">
              <Typewriter
                words={["Permit Deadline", "Renewal Date", "Inspection", "Compliance Check"]}
              />
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            Track municipal permits, renewal documents, inspection schedules, and compliance
            checklists — all in one beautiful dashboard.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/signup">
              <InteractiveHoverButton>Start Free — No Credit Card</InteractiveHoverButton>
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              See how it works →
            </Link>
          </div>

          <div className="mt-14">
            <p className="mb-3 text-sm text-muted-foreground">Built for</p>
            <IndustryCarousel
              items={["Restaurants", "Salons", "Cafes", "Events", "Signage", "Food Trucks"]}
            />
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-border/60 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Everything You Need to Stay Compliant</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              From permit tracking to AI-powered document parsing, PermitFlow handles the complexity
              so you can focus on your business.
            </p>
          </div>
          <DisplayCards cards={features} />
        </div>
      </section>

      <section id="industries" className="border-t border-border/60 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Built for Your Industry</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Pre-built compliance templates tailored to your business type.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((ind) => (
              <div
                key={ind.name}
                className={`glass-card flex items-center gap-4 rounded-2xl bg-gradient-to-br p-6 transition-all hover:scale-[1.02] hover:shadow-lg ${ind.color}`}
              >
                <div className="rounded-xl bg-background/80 p-3 dark:bg-white/10">
                  <ind.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-lg font-semibold">{ind.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-border/60">
        <Pricing
          plans={pricingPlans}
          title="Simple, Transparent Pricing"
          description="Start free. Upgrade when you need more AI power.\nAll plans include permit tracking and compliance checklists."
        />
      </section>

      <section className="border-t border-border/60 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="glass-card mx-auto max-w-2xl rounded-3xl p-10">
            <h2 className="mb-4 text-3xl font-bold">Ready to Simplify Compliance?</h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
              Join businesses that trust PermitFlow to keep their permits current and their doors open.
            </p>
            <Link href="/auth/signup">
              <InteractiveHoverButton>Get Started Free</InteractiveHoverButton>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

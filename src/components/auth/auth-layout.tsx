"use client";

import Link from "next/link";
import { ArrowLeft, FileCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { CircularTestimonials } from "@/components/blocks/circular-testimonials";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote:
      "PermitFlow saved my restaurant from a $5,000 fine. I got an alert 30 days before my health permit expired.",
    name: "Maria Santos",
    designation: "Restaurant Owner, Austin TX",
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
  },
  {
    quote:
      "Managing permits across 3 salon locations was chaos. Now everything is in one dashboard with AI extraction.",
    name: "James Chen",
    designation: "Salon Chain Operator",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
  },
  {
    quote:
      "The compliance checklist alone is worth it. I knew exactly what my food truck needed before inspection day.",
    name: "Aisha Patel",
    designation: "Food Truck Owner",
    src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
  },
];

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Visual panel */}
      <div className="relative hidden lg:flex lg:w-[52%] lg:flex-col">
        <AuthVisualPanel />
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-white drop-shadow-md">
              <FileCheck className="h-6 w-6" />
              PermitFlow
            </Link>
            <ThemeToggle />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="rounded-2xl border border-white/10 bg-black/30 p-8 backdrop-blur-md"
          >
            <h2 className="mb-2 text-3xl font-bold text-white drop-shadow-sm">
              Compliance made simple
            </h2>
            <p className="mb-8 max-w-md text-base text-slate-200">
              Join thousands of businesses tracking permits, renewals, and inspections effortlessly.
            </p>
            <CircularTestimonials testimonials={TESTIMONIALS} />
          </motion.div>

          <p className="text-sm text-slate-400">
            Trusted by restaurants, salons, cafes, and food trucks nationwide
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-1 flex-col bg-pattern">
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 lg:border-none lg:px-10 lg:pt-8">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full glass-card transition-all group-hover:border-primary group-hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </span>
            Back to home
          </Link>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>

        <div className="relative h-36 overflow-hidden lg:hidden">
          <AuthVisualPanel />
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-white drop-shadow-lg">
              <FileCheck className="h-5 w-5" />
              PermitFlow
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="glass-card mb-8 rounded-2xl p-8">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              <p className="mt-2 text-muted-foreground">{subtitle}</p>
              <div className="mt-6">{children}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

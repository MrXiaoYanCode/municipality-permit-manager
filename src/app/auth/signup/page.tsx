"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InteractiveHoverButton } from "@/components/blocks/interactive-hover-button";
import { Mail, Lock, User, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Auto-confirm is enabled in DB — session is usually returned immediately
      if (data.session) {
        window.location.href = "/dashboard";
        return;
      }

      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(
        message.includes("Failed to fetch")
          ? "Cannot reach the auth service. Check that Supabase is configured and your connection is online."
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Check your inbox" subtitle="One more step to activate your account.">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl border border-border/60 bg-card/50 p-8 text-center backdrop-blur-sm"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <p className="mb-2 font-medium">Confirmation email sent</p>
          <p className="mb-6 text-sm text-muted-foreground">
            We sent a link to <span className="font-medium text-foreground">{email}</span>.
            Click it to activate your account.
          </p>
          <Button className="rounded-xl" asChild>
            <Link href="/auth/login">Back to Sign In</Link>
          </Button>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking permits for free — no credit card required."
    >
      <form onSubmit={handleSignup} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            Full Name
          </Label>
          <Input
            id="name"
            placeholder="Jane Smith"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11 rounded-xl border-border/60 bg-card/50 backdrop-blur-sm focus-visible:ring-primary"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl border-border/60 bg-card/50 backdrop-blur-sm focus-visible:ring-primary"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-xl border-border/60 bg-card/50 backdrop-blur-sm focus-visible:ring-primary"
            required
          />
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <InteractiveHoverButton
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl text-base"
        >
          {loading ? "Creating account..." : "Create Account — Free"}
        </InteractiveHoverButton>

        <p className="text-center text-xs text-muted-foreground">
          By signing up you agree to our terms. Free plan includes 5 AI documents/month.
        </p>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground">Already have an account?</span>
        </div>
      </div>

      <Button variant="outline" className="h-11 w-full rounded-xl" asChild>
        <Link href="/auth/login" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Sign in instead
        </Link>
      </Button>
    </AuthLayout>
  );
}

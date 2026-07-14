"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InteractiveHoverButton } from "@/components/blocks/interactive-hover-button";
import { Mail, Lock, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your permits and compliance.">
      <form onSubmit={handleLogin} className="space-y-5">
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
            placeholder="••••••••"
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
          {loading ? "Signing in..." : "Sign In"}
        </InteractiveHoverButton>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground">New here?</span>
        </div>
      </div>

      <Button variant="outline" className="h-11 w-full rounded-xl" asChild>
        <Link href="/auth/signup" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Create a free account
        </Link>
      </Button>
    </AuthLayout>
  );
}

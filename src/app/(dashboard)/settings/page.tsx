"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/types";
import { SUBSCRIPTION_TIERS } from "@/types";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setFullName(data.full_name ?? "");
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", profile.id);
    setSaving(false);
  };

  const handleUpgrade = async (tier: string) => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const handlePortal = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and subscription.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email ?? ""} disabled />
          </div>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Current plan: <span className="font-semibold capitalize">{profile?.subscription_tier ?? "free"}</span>
            {" "}— {profile?.documents_used ?? 0} / {profile?.document_quota === -1 ? "∞" : profile?.document_quota ?? 5} documents used
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(["starter", "professional", "enterprise"] as const).map((tier) => (
            <div key={tier} className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium">{SUBSCRIPTION_TIERS[tier].name}</p>
                <p className="text-sm text-muted-foreground">${SUBSCRIPTION_TIERS[tier].price}/mo</p>
              </div>
              <Button
                variant={profile?.subscription_tier === tier ? "secondary" : "default"}
                size="sm"
                disabled={profile?.subscription_tier === tier}
                onClick={() => handleUpgrade(tier)}
              >
                {profile?.subscription_tier === tier ? "Current" : "Upgrade"}
              </Button>
            </div>
          ))}
          {profile?.stripe_customer_id && (
            <Button variant="outline" className="w-full" onClick={handlePortal}>
              Manage Billing
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

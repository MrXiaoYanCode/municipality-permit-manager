"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FileText } from "lucide-react";
import { formatDate, getPermitStatus } from "@/lib/utils";
import type { Permit } from "@/types";

export default function PermitsPage() {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    permit_number: "",
    municipality: "",
    expiry_date: "",
    notes: "",
  });

  const supabase = createClient();

  const loadPermits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("permits")
      .select("*")
      .eq("user_id", user.id)
      .order("expiry_date", { ascending: true });

    setPermits(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadPermits(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: businesses } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    let businessId = businesses?.[0]?.id;

    if (!businessId) {
      const { data: newBiz } = await supabase
        .from("businesses")
        .insert({ user_id: user.id, name: "My Business", business_type: "restaurant" })
        .select("id")
        .single();
      businessId = newBiz?.id;
    }

    if (!businessId) return;

    const status = getPermitStatus(form.expiry_date || null);

    await supabase.from("permits").insert({
      user_id: user.id,
      business_id: businessId,
      name: form.name,
      permit_number: form.permit_number || null,
      municipality: form.municipality || null,
      expiry_date: form.expiry_date || null,
      notes: form.notes || null,
      status,
    });

    setForm({ name: "", permit_number: "", municipality: "", expiry_date: "", notes: "" });
    setShowForm(false);
    loadPermits();
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-500/10 text-green-600",
    expiring: "bg-amber-500/10 text-amber-600",
    expired: "bg-red-500/10 text-red-600",
    pending: "bg-blue-500/10 text-blue-600",
    renewed: "bg-emerald-500/10 text-emerald-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Permits</h1>
          <p className="text-muted-foreground">Track and manage all your municipal permits.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" /> Add Permit
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Permit</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Permit Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Permit Number</Label>
                <Input value={form.permit_number} onChange={(e) => setForm({ ...form, permit_number: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Municipality</Label>
                <Input value={form.municipality} onChange={(e) => setForm({ ...form, municipality: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Save Permit</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading permits...</p>
      ) : permits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">No permits yet</h3>
            <p className="mb-4 text-muted-foreground">Add your first permit or upload a document for AI extraction.</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Permit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {permits.map((permit) => (
            <Card key={permit.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{permit.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {permit.municipality} {permit.permit_number && `• #${permit.permit_number}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Expires {formatDate(permit.expiry_date)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[permit.status]}`}>
                    {permit.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

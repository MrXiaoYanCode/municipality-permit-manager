"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Inspection } from "@/types";

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", scheduled_date: "", inspector_name: "", notes: "" });
  const supabase = createClient();

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("inspections").select("*").eq("user_id", user.id).order("scheduled_date");
    setInspections(data ?? []);
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: businesses } = await supabase.from("businesses").select("id").eq("user_id", user.id).limit(1);
    let businessId = businesses?.[0]?.id;
    if (!businessId) {
      const { data: newBiz } = await supabase.from("businesses").insert({ user_id: user.id, name: "My Business", business_type: "restaurant" }).select("id").single();
      businessId = newBiz?.id;
    }
    if (!businessId) return;

    await supabase.from("inspections").insert({
      user_id: user.id,
      business_id: businessId,
      title: form.title,
      scheduled_date: form.scheduled_date,
      inspector_name: form.inspector_name || null,
      notes: form.notes || null,
    });

    setForm({ title: "", scheduled_date: "", inspector_name: "", notes: "" });
    setShowForm(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inspections</h1>
          <p className="text-muted-foreground">Schedule and track municipal inspections.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" /> Schedule Inspection
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Inspection</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Date & Time</Label><Input type="datetime-local" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Inspector</Label><Input value={form.inspector_name} onChange={(e) => setForm({ ...form, inspector_name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="sm:col-span-2"><Button type="submit">Schedule</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      {inspections.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" /><p className="text-muted-foreground">No inspections scheduled.</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {inspections.map((insp) => (
            <Card key={insp.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-semibold">{insp.title}</h3>
                  <p className="text-sm text-muted-foreground">{insp.inspector_name ?? "Inspector TBD"}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatDate(insp.scheduled_date)}</p>
                  <span className="text-xs capitalize text-muted-foreground">{insp.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

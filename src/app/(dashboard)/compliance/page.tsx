"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ClipboardCheck } from "lucide-react";
import { createChecklistForType, calculateCompletion } from "@/lib/checklists/templates";
import type { BusinessType, ChecklistItem, ComplianceChecklist } from "@/types";
import { BUSINESS_TYPE_LABELS } from "@/types";

export default function CompliancePage() {
  const [checklist, setChecklist] = useState<ComplianceChecklist | null>(null);
  const [businessType, setBusinessType] = useState<BusinessType>("restaurant");
  const supabase = createClient();

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: businesses } = await supabase.from("businesses").select("*").eq("user_id", user.id).limit(1);
    const biz = businesses?.[0];
    if (biz) setBusinessType(biz.business_type);

    const { data } = await supabase
      .from("compliance_checklists")
      .select("*")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (data) {
      setChecklist(data);
    }
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initChecklist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: businesses } = await supabase.from("businesses").select("id, business_type").eq("user_id", user.id).limit(1);
    let businessId = businesses?.[0]?.id;
    const type = businesses?.[0]?.business_type ?? businessType;

    if (!businessId) {
      const { data: newBiz } = await supabase.from("businesses").insert({ user_id: user.id, name: "My Business", business_type: type }).select("id, business_type").single();
      businessId = newBiz?.id;
    }
    if (!businessId) return;

    const items = createChecklistForType(type as BusinessType);
    const { data } = await supabase.from("compliance_checklists").insert({
      user_id: user.id,
      business_id: businessId,
      business_type: type,
      items,
      completion_percentage: 0,
    }).select().single();

    if (data) setChecklist(data);
  };

  const toggleItem = async (itemId: string) => {
    if (!checklist) return;
    const items = (checklist.items as ChecklistItem[]).map((item) =>
      item.id === itemId
        ? { ...item, completed: !item.completed, completed_at: !item.completed ? new Date().toISOString() : undefined }
        : item
    );
    const completion = calculateCompletion(items);

    await supabase.from("compliance_checklists").update({ items, completion_percentage: completion }).eq("id", checklist.id);
    setChecklist({ ...checklist, items, completion_percentage: completion });
  };

  const items = (checklist?.items as ChecklistItem[]) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance Checklist</h1>
        <p className="text-muted-foreground">
          {BUSINESS_TYPE_LABELS[businessType]} compliance requirements.
        </p>
      </div>

      {!checklist ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">No checklist yet</h3>
            <p className="mb-4 text-muted-foreground">Generate an industry-specific compliance checklist.</p>
            <Button onClick={initChecklist}>Generate Checklist</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Progress</span>
                <span className="text-2xl font-bold text-primary">{checklist.completion_percentage}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-3 rounded-full bg-muted">
                <div className="h-3 rounded-full bg-primary transition-all" style={{ width: `${checklist.completion_percentage}%` }} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {items.map((item) => (
              <Card key={item.id} className="cursor-pointer transition-shadow hover:shadow-sm" onClick={() => toggleItem(item.id)}>
                <CardContent className="flex items-center gap-4 p-4">
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${item.completed ? "line-through text-muted-foreground" : ""}`}>{item.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.category} {item.required && "• Required"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

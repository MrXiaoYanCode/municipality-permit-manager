import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle, CheckCircle2, Calendar, TrendingUp } from "lucide-react";
import { formatDate, daysUntil } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: permits } = await supabase
    .from("permits")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .order("expiry_date", { ascending: true });

  const { data: inspections } = await supabase
    .from("inspections")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .eq("status", "scheduled")
    .order("scheduled_date", { ascending: true })
    .limit(5);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id ?? "")
    .single();

  const activePermits = permits?.filter((p) => p.status === "active").length ?? 0;
  const expiringSoon = permits?.filter((p) => {
    if (!p.expiry_date) return false;
    const days = daysUntil(p.expiry_date);
    return days >= 0 && days <= 30;
  }).length ?? 0;
  const expired = permits?.filter((p) => p.status === "expired").length ?? 0;

  const stats = [
    { title: "Active Permits", value: activePermits, icon: FileText, color: "text-blue-500" },
    { title: "Expiring Soon", value: expiringSoon, icon: AlertTriangle, color: "text-amber-500" },
    { title: "Expired", value: expired, icon: AlertTriangle, color: "text-red-500" },
    { title: "Upcoming Inspections", value: inspections?.length ?? 0, icon: Calendar, color: "text-green-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}. Here&apos;s your compliance overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {profile && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">AI Document Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="mb-2 flex justify-between text-sm">
                  <span>{profile.documents_used} / {profile.document_quota === -1 ? "∞" : profile.document_quota} documents</span>
                  <span className="capitalize text-muted-foreground">{profile.subscription_tier} plan</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{
                      width: profile.document_quota === -1
                        ? "10%"
                        : `${Math.min((profile.documents_used / profile.document_quota) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Deadlines</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/permits">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {permits && permits.length > 0 ? (
              <div className="space-y-3">
                {permits.slice(0, 5).map((permit) => (
                  <div key={permit.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium">{permit.name}</p>
                      <p className="text-sm text-muted-foreground">{permit.municipality}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDate(permit.expiry_date)}</p>
                      {permit.expiry_date && (
                        <p className={`text-xs ${daysUntil(permit.expiry_date) <= 30 ? "text-amber-500" : "text-muted-foreground"}`}>
                          {daysUntil(permit.expiry_date)} days left
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No permits yet.</p>
                <Button className="mt-4" size="sm" asChild>
                  <Link href="/permits">Add Your First Permit</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Scheduled Inspections</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/inspections">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {inspections && inspections.length > 0 ? (
              <div className="space-y-3">
                {inspections.map((inspection) => (
                  <div key={inspection.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium">{inspection.title}</p>
                      {inspection.inspector_name && (
                        <p className="text-sm text-muted-foreground">{inspection.inspector_name}</p>
                      )}
                    </div>
                    <p className="text-sm font-medium">{formatDate(inspection.scheduled_date)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No upcoming inspections.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

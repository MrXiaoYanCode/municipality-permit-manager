import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "permitflow",
    version: "1.0.0",
  };

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
      });
      checks.status = res.ok ? "healthy" : "degraded";
    } catch {
      checks.status = "degraded";
    }
  }

  return NextResponse.json(checks);
}

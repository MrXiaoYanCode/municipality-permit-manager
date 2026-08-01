import { createBrowserClient } from "@supabase/ssr";

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("your-project") &&
      !url.includes("placeholder") &&
      !key.includes("your-anon") &&
      !key.includes("placeholder") &&
      url.startsWith("https://")
  );
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Auth is not configured yet. Add your Supabase URL and anon key to the environment, then redeploy."
    );
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

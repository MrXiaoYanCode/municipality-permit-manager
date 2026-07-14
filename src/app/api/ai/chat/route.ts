import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { generateChatResponse } from "@/lib/ai/pipeline";
import { generateEmbeddingVector } from "@/lib/ai/providers";
import { toAIErrorResponse } from "@/lib/ai/errors";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message, history } = await request.json();
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    const admin = createServiceClient();

    let context = "";
    try {
      const queryEmbedding = await generateEmbeddingVector(message);
      if (queryEmbedding) {
        const { data: matches } = await admin.rpc("match_documents", {
          query_embedding: queryEmbedding,
          match_user_id: user.id,
          match_threshold: 0.7,
          match_count: 5,
        });

        const docContext = matches?.map((m: { content_chunk: string }) => m.content_chunk).join("\n\n") ?? "";

        const { data: permits } = await admin
          .from("permits")
          .select("name, status, expiry_date, municipality")
          .eq("user_id", user.id)
          .order("expiry_date", { ascending: true })
          .limit(10);

        const permitContext = permits?.map((p) =>
          `${p.name} (${p.status}) - expires ${p.expiry_date ?? "N/A"} - ${p.municipality ?? "Unknown"}`
        ).join("\n") ?? "";

        context = `RELEVANT DOCUMENTS:\n${docContext}\n\nACTIVE PERMITS:\n${permitContext}`;
      } else {
        throw new Error("Embeddings unavailable");
      }
    } catch {
      const { data: permits } = await admin
        .from("permits")
        .select("name, status, expiry_date, municipality")
        .eq("user_id", user.id)
        .limit(10);
      context = permits?.length
        ? `ACTIVE PERMITS:\n${permits.map((p) => `${p.name} - ${p.status}`).join("\n")}`
        : "No document context available yet.";
    }

    const response = await generateChatResponse(message, context, history ?? []);

    await admin.from("chat_messages").insert([
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content: response },
    ]);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    return toAIErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { extractPermitData, generateEmbeddings, chunkText, summarizeDocument } from "@/lib/ai/pipeline";
import { toAIErrorResponse } from "@/lib/ai/errors";
import { reportDocumentUsage } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createServiceClient();
    const { data: profile } = await admin.from("profiles").select("*").eq("id", user.id).single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    if (profile.document_quota !== -1 && profile.documents_used >= profile.document_quota) {
      if (profile.stripe_customer_id && profile.subscription_tier !== "free") {
        await reportDocumentUsage(profile.stripe_customer_id);
      } else {
        return NextResponse.json({ error: "Document quota exceeded. Upgrade your plan." }, { status: 429 });
      }
    }

    const body = await request.json();
    const { text, documentId, businessId } = body;

    if (!text) return NextResponse.json({ error: "Text content required" }, { status: 400 });

    await admin.from("documents").update({ processing_status: "processing" }).eq("id", documentId);

    const extracted = await extractPermitData(text);
    const summary = await summarizeDocument(text);

    const chunks = chunkText(text);
    const embeddings = await generateEmbeddings(chunks);

    if (embeddings.length > 0) {
      const embeddingRows = chunks.slice(0, embeddings.length).map((chunk, i) => ({
        document_id: documentId,
        user_id: user.id,
        content_chunk: chunk,
        embedding: embeddings[i],
        metadata: { chunk_index: i },
      }));

      await admin.from("document_embeddings").insert(embeddingRows);
    }

    if (businessId) {
      await admin.from("permits").insert({
        user_id: user.id,
        business_id: businessId,
        name: extracted.permit_name ?? "Extracted Permit",
        permit_number: extracted.permit_number,
        municipality: extracted.municipality,
        issue_date: extracted.issue_date,
        expiry_date: extracted.expiry_date,
        renewal_date: extracted.renewal_date,
        status: extracted.expiry_date ? "active" : "pending",
        ai_extracted_data: extracted,
      });
    }

    await admin.from("documents").update({
      processing_status: "completed",
      ai_summary: summary,
    }).eq("id", documentId);

    await admin.from("profiles").update({
      documents_used: profile.documents_used + 1,
    }).eq("id", user.id);

    return NextResponse.json({ extracted, summary });
  } catch (error) {
    console.error("Extract error:", error);
    return toAIErrorResponse(error);
  }
}

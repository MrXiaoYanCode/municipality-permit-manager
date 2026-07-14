import type { ExtractedPermitData } from "@/types";
import { chatWithFallback, generateEmbeddingVector } from "./providers";

const EXTRACTION_PROMPT = `You are a municipal permit document parser.
Extract the following from this permit document:
- permit_name: Name/type of permit
- permit_number: Official permit number
- municipality: Issuing municipality name
- issue_date: Date issued (ISO 8601 YYYY-MM-DD)
- expiry_date: Expiration date (ISO 8601 YYYY-MM-DD)
- renewal_date: Next renewal date if specified (ISO 8601 YYYY-MM-DD)
- requirements: Array of compliance requirements
- conditions: Array of permit conditions
- fees: Any associated fees as string

Return valid JSON only. If a field is not found, use null.`;

const COMPLIANCE_SYSTEM_PROMPT = `You are PermitAI, a municipal compliance assistant for small businesses.

RULES:
1. Only answer questions about permits, compliance, and municipal regulations
2. Base answers on the provided context from the user's documents and permits
3. If unsure, say "I don't have enough information" and suggest contacting the municipality
4. Always mention specific permit names and expiry dates when relevant
5. Warn about upcoming deadlines proactively
6. Use plain language — users are business owners, not lawyers

CONTEXT:
{context}`;

export async function extractPermitData(text: string): Promise<ExtractedPermitData> {
  const content = await chatWithFallback({
    messages: [
      { role: "system", content: EXTRACTION_PROMPT },
      { role: "user", content: text.slice(0, 12000) },
    ],
    temperature: 0.1,
    maxTokens: 2000,
    jsonMode: true,
  });

  return JSON.parse(content) as ExtractedPermitData;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const embedding = await generateEmbeddingVector(text);
  if (embedding) return embedding;
  throw new Error("Embedding unavailable");
}

export async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const chunk of chunks) {
    const emb = await generateEmbeddingVector(chunk);
    if (emb) results.push(emb);
  }
  return results;
}

export function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks.length > 0 ? chunks : [text];
}

export async function generateChatResponse(
  message: string,
  context: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const systemPrompt = COMPLIANCE_SYSTEM_PROMPT.replace("{context}", context);

  return chatWithFallback({
    messages: [
      { role: "system", content: systemPrompt },
      ...history.slice(-10).map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
      { role: "user", content: message },
    ],
    temperature: 0.3,
    maxTokens: 1000,
  });
}

export async function summarizeDocument(text: string): Promise<string> {
  return chatWithFallback({
    messages: [
      {
        role: "system",
        content: "Summarize this municipal permit document in 2-3 sentences for a business owner.",
      },
      { role: "user", content: text.slice(0, 8000) },
    ],
    temperature: 0.2,
    maxTokens: 300,
  });
}

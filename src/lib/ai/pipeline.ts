import OpenAI from "openai";
import type { ExtractedPermitData } from "@/types";

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

function getAIClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.AI_PROVIDER_API_KEY,
    baseURL:
      process.env.AI_PROVIDER === "deepseek"
        ? "https://api.deepseek.com/v1"
        : undefined,
  });
}

export async function extractPermitData(text: string): Promise<ExtractedPermitData> {
  const client = getAIClient();
  const model = process.env.AI_PROVIDER === "deepseek" ? "deepseek-chat" : "gpt-4o-mini";

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: EXTRACTION_PROMPT },
      { role: "user", content: text.slice(0, 12000) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No extraction response");

  return JSON.parse(content) as ExtractedPermitData;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getAIClient();
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

export async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  const client = getAIClient();
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: chunks.map((c) => c.slice(0, 8000)),
  });
  return response.data.map((d) => d.embedding);
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
  const client = getAIClient();
  const model = process.env.AI_PROVIDER === "deepseek" ? "deepseek-chat" : "gpt-4o-mini";
  const systemPrompt = COMPLIANCE_SYSTEM_PROMPT.replace("{context}", context);

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...history.slice(-10),
      { role: "user", content: message },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content ?? "I couldn't generate a response. Please try again.";
}

export async function summarizeDocument(text: string): Promise<string> {
  const client = getAIClient();
  const model = process.env.AI_PROVIDER === "deepseek" ? "deepseek-chat" : "gpt-4o-mini";

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "Summarize this municipal permit document in 2-3 sentences for a business owner.",
      },
      { role: "user", content: text.slice(0, 8000) },
    ],
    temperature: 0.2,
    max_tokens: 300,
  });

  return response.choices[0]?.message?.content ?? "";
}

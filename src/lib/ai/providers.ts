import OpenAI from "openai";
import { AIServiceError, FRIENDLY_AI_MESSAGES } from "./errors";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

interface ProviderConfig {
  name: string;
  client: OpenAI;
  models: string[];
}

const RETRY_DELAYS = [500, 1200, 2500];
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return true;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("rate") ||
    msg.includes("quota") ||
    msg.includes("timeout") ||
    msg.includes("503") ||
    msg.includes("502") ||
    msg.includes("500") ||
    msg.includes("overloaded") ||
    msg.includes("fetch")
  );
}

function buildProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && !geminiKey.includes("...")) {
    providers.push({
      name: "gemini",
      client: new OpenAI({
        apiKey: geminiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      }),
      models: ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash"],
    });
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey && !openRouterKey.includes("...")) {
    providers.push({
      name: "openrouter",
      client: new OpenAI({
        apiKey: openRouterKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://permitflow.app",
          "X-Title": "PermitFlow",
        },
      }),
      models: [
        "meta-llama/llama-3.3-70b-instruct:free",
        "qwen/qwen3-next-80b-a3b-instruct:free",
        "deepseek/deepseek-r1:free",
        "openrouter/free",
      ],
    });
  }

  const openaiKey = process.env.OPENAI_API_KEY ?? process.env.AI_PROVIDER_API_KEY;
  if (openaiKey && openaiKey.startsWith("sk-") && !openaiKey.includes("...")) {
    providers.push({
      name: "openai",
      client: new OpenAI({ apiKey: openaiKey }),
      models: ["gpt-4o-mini"],
    });
  }

  return providers;
}

async function callProvider(
  provider: ProviderConfig,
  model: string,
  options: ChatOptions
): Promise<string> {
  const response = await provider.client.chat.completions.create({
    model,
    messages: options.messages,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 1000,
    ...(options.jsonMode ? { response_format: { type: "json_object" as const } } : {}),
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error(`Empty response from ${provider.name}/${model}`);
  return content;
}

export async function chatWithFallback(options: ChatOptions): Promise<string> {
  const providers = buildProviders();

  if (providers.length === 0) {
    throw new AIServiceError(
      "No AI providers configured",
      "CONFIG",
      FRIENDLY_AI_MESSAGES.config,
      false
    );
  }

  const errors: string[] = [];

  for (const provider of providers) {
    for (const model of provider.models) {
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          return await callProvider(provider, model, options);
        } catch (error) {
          const errMsg = `${provider.name}/${model} attempt ${attempt + 1}: ${error instanceof Error ? error.message : "unknown"}`;
          errors.push(errMsg);
          console.warn("[AI]", errMsg);

          if (!isRetryableError(error) || attempt === MAX_RETRIES - 1) break;
          await sleep(RETRY_DELAYS[attempt] ?? 2000);
        }
      }
    }
  }

  const allRateLimited = errors.some((e) => e.includes("429") || e.toLowerCase().includes("rate"));
  throw new AIServiceError(
    `All providers failed: ${errors.join("; ")}`,
    allRateLimited ? "RATE_LIMIT" : "ALL_FAILED",
    allRateLimited ? FRIENDLY_AI_MESSAGES.rateLimit : FRIENDLY_AI_MESSAGES.allFailed
  );
}

export async function generateEmbeddingVector(text: string): Promise<number[] | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text: text.slice(0, 8000) }] },
        }),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const values: number[] = data?.embedding?.values;
    if (!values?.length) return null;

    // Pad to 1536 for pgvector schema compatibility
    if (values.length < 1536) {
      return [...values, ...new Array(1536 - values.length).fill(0)];
    }
    return values.slice(0, 1536);
  } catch {
    return null;
  }
}

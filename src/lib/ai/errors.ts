export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "RATE_LIMIT" | "PROVIDER_DOWN" | "ALL_FAILED" | "CONFIG",
    public readonly userMessage: string,
    public readonly retryable: boolean = true
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

export const FRIENDLY_AI_MESSAGES = {
  rateLimit:
    "Our AI assistant is experiencing high demand right now. Please wait a moment and try again — your request matters to us.",
  providerDown:
    "We're having a brief connection issue with our AI service. Please try again in a few seconds.",
  allFailed:
    "We couldn't reach our AI providers at the moment. Please try again shortly — everything else in PermitFlow is working normally.",
  config:
    "AI features are being set up. Please check back soon or contact support if this persists.",
  generic:
    "Something unexpected happened. Please try again — we're here to help you stay compliant.",
} as const;

export function getFriendlyAIError(error: unknown): string {
  if (error instanceof AIServiceError) return error.userMessage;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("429") || msg.includes("rate") || msg.includes("quota")) {
      return FRIENDLY_AI_MESSAGES.rateLimit;
    }
    if (msg.includes("timeout") || msg.includes("network") || msg.includes("fetch")) {
      return FRIENDLY_AI_MESSAGES.providerDown;
    }
  }
  return FRIENDLY_AI_MESSAGES.generic;
}

export function toAIErrorResponse(error: unknown, status = 503) {
  const userMessage = getFriendlyAIError(error);
  const retryable = error instanceof AIServiceError ? error.retryable : true;
  return Response.json(
    { error: userMessage, retryable, code: error instanceof AIServiceError ? error.code : "UNKNOWN" },
    { status }
  );
}

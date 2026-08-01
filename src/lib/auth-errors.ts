export function getAuthErrorMessage(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";

  if (typeof error === "string") {
    const trimmed = error.trim();
    if (!trimmed || trimmed === "{}" || trimmed === "[object Object]") {
      return "Something went wrong. Please try again.";
    }
    if (trimmed.toLowerCase().includes("failed to fetch")) {
      return "Cannot reach the auth service. Check your connection and try again.";
    }
    return trimmed;
  }

  if (error instanceof Error) {
    return getAuthErrorMessage(error.message);
  }

  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    const candidate =
      record.message ?? record.msg ?? record.error_description ?? record.error;
    if (typeof candidate === "string" && candidate.trim()) {
      return getAuthErrorMessage(candidate);
    }
  }

  return "Something went wrong. Please try again.";
}

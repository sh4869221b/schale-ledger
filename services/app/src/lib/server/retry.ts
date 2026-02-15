const RETRYABLE_NODE_ERROR_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EPIPE",
  "ENETUNREACH",
  "EHOSTUNREACH"
]);

const RETRYABLE_PG_ERROR_CODES = new Set([
  "53300", // too_many_connections
  "57P01", // admin_shutdown
  "57P02", // crash_shutdown
  "57P03" // cannot_connect_now
]);

function readErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const direct = (error as { code?: unknown }).code;
  if (typeof direct === "string" && direct.length > 0) {
    return direct;
  }

  const cause = (error as { cause?: unknown }).cause;
  if (!cause || typeof cause !== "object") {
    return null;
  }

  const fromCause = (cause as { code?: unknown }).code;
  if (typeof fromCause === "string" && fromCause.length > 0) {
    return fromCause;
  }

  return null;
}

export function isRetryableDbError(error: unknown): boolean {
  const code = readErrorCode(error);
  if (!code) {
    return false;
  }

  if (RETRYABLE_NODE_ERROR_CODES.has(code) || RETRYABLE_PG_ERROR_CODES.has(code)) {
    return true;
  }

  // PostgreSQL connection exception class
  return code.startsWith("08");
}

export async function withDbRetry<T>(runner: () => Promise<T>, maxAttempts = 2): Promise<T> {
  let attempt = 0;

  while (true) {
    attempt += 1;
    try {
      return await runner();
    } catch (error) {
      if (!isRetryableDbError(error) || attempt >= maxAttempts) {
        throw error;
      }

      const code = readErrorCode(error);
      const message = error instanceof Error ? error.message : String(error);
      console.warn("retryable_db_error", {
        attempt,
        code,
        message
      });
    }
  }
}


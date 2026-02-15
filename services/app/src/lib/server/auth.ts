import type { ExternalIdentity } from "@schale-ledger/application";
import { AuthenticationRequiredError } from "@schale-ledger/application";

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64").toString("utf-8");
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;
    return payload;
  } catch {
    return null;
  }
}

function toStringOrNull(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  return value.trim() === "" ? null : value;
}

export function resolveExternalIdentity(headers: Headers): ExternalIdentity {
  const token = headers.get("cf-access-jwt-assertion");
  const payload = token ? decodeJwtPayload(token) : null;

  const subFromJwt = toStringOrNull(payload?.sub);
  const emailFromJwt = toStringOrNull(payload?.email);
  const subFromHeader = toStringOrNull(headers.get("x-user-sub"));
  const emailFromHeader = toStringOrNull(headers.get("x-user-email")) ?? toStringOrNull(headers.get("cf-access-authenticated-user-email"));

  const subject = subFromJwt ?? subFromHeader ?? (emailFromJwt ?? emailFromHeader ? `email:${emailFromJwt ?? emailFromHeader}` : null);
  const email = emailFromJwt ?? emailFromHeader;

  if (!subject) {
    throw new AuthenticationRequiredError("認証情報が見つかりません。Cloudflare Access でログインしてください。");
  }

  return {
    provider: "cloudflare_access",
    subject,
    email: email ?? null
  };
}

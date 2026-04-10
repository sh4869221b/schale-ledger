import { createDb, createUsersRepository, eq, sessions, users, type ExternalIdentity } from "@schale-ledger/db";
import type { Cookies } from "@sveltejs/kit";
import { verifyAccessJwt, type AccessConfig, type AccessIdentity } from "./access";

const SESSION_COOKIE_NAME = "session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const SESSION_REFRESH_WINDOW_MS = 1000 * 60 * 60;
const encoder = new TextEncoder();

type CookieStore = Pick<Cookies, "get" | "set" | "delete">;

type SessionDatabase = ReturnType<typeof createDb>;

export interface AuthSession {
  sessionId: string;
  expiresAt: string;
}

export interface AuthUser {
  userId: string;
  email: string | null;
}

export interface ResolveRequestUserInput {
  cookies: CookieStore;
  headers: Headers;
  db: SessionDatabase;
  accessConfig: AccessConfig;
  sessionSecret: string;
  now?: () => Date;
  createSessionId?: () => string;
  verifyAccess?: (token: string, config: AccessConfig) => Promise<AccessIdentity>;
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + padding);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function importSigningKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSessionCookieValue(sessionId: string, secret: string) {
  const key = await importSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(sessionId));

  return `${sessionId}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function verifySignedSessionCookie(rawValue: string, secret: string) {
  try {
    const [sessionId, signature] = rawValue.split(".");
    if (!sessionId || !signature) {
      return null;
    }

    const key = await importSigningKey(secret);
    const isValid = await crypto.subtle.verify("HMAC", key, base64UrlDecode(signature), encoder.encode(sessionId));

    return isValid ? sessionId : null;
  } catch {
    return null;
  }
}

export async function getSessionIdFromCookieValue(rawValue: string | undefined | null, secret: string) {
  if (!rawValue) {
    return null;
  }

  return verifySignedSessionCookie(rawValue, secret);
}

function cookieOptions(expiresAt?: string) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    ...(expiresAt ? { expires: new Date(expiresAt) } : {})
  };
}

function toExternalIdentity(identity: AccessIdentity): ExternalIdentity {
  return {
    provider: "cloudflare_access",
    subject: identity.sub,
    email: identity.email
  };
}

function shouldRefreshSession(expiresAt: string, now: Date) {
  return new Date(expiresAt).getTime() - now.getTime() <= SESSION_REFRESH_WINDOW_MS;
}

async function createSessionRecord(db: SessionDatabase, userId: string, now: Date, createSessionId: () => string) {
  const sessionId = createSessionId();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();

  await db.insert(sessions).values({
    sessionId,
    userId,
    expiresAt,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  });

  return { sessionId, expiresAt };
}

async function refreshSession(db: SessionDatabase, sessionId: string, now: Date) {
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();

  await db.update(sessions).set({
    expiresAt,
    updatedAt: now.toISOString()
  }).where(eq(sessions.sessionId, sessionId));

  return expiresAt;
}

export async function clearSession(input: { cookies: CookieStore; sessionId?: string | null; db: SessionDatabase }) {
  if (input.sessionId) {
    await input.db.delete(sessions).where(eq(sessions.sessionId, input.sessionId));
  }

  input.cookies.delete(SESSION_COOKIE_NAME, cookieOptions());
}

export async function clearSessionFromCookie(input: {
  cookies: CookieStore;
  rawCookieValue?: string | null;
  sessionSecret: string;
  db: SessionDatabase;
}) {
  const sessionId = await getSessionIdFromCookieValue(input.rawCookieValue, input.sessionSecret);
  await clearSession({
    cookies: input.cookies,
    sessionId,
    db: input.db
  });
}

export async function resolveRequestUser(input: ResolveRequestUserInput): Promise<{ user: AuthUser; session: AuthSession } | null> {
  const now = input.now?.() ?? new Date();
  const verifyAccess = input.verifyAccess ?? verifyAccessJwt;
  const createSessionId = input.createSessionId ?? (() => crypto.randomUUID());
  const token = input.headers.get("cf-access-jwt-assertion");
  const verifiedIdentity = token ? await verifyAccess(token, input.accessConfig) : null;

  const rawSessionCookie = input.cookies.get(SESSION_COOKIE_NAME);
  const existingSessionId = await getSessionIdFromCookieValue(rawSessionCookie, input.sessionSecret);

  if (rawSessionCookie && !existingSessionId) {
    input.cookies.delete(SESSION_COOKIE_NAME, cookieOptions());
  }

  if (existingSessionId) {
    let sessionCleared = false;
    const session = await input.db.query.sessions.findFirst({ where: eq(sessions.sessionId, existingSessionId) });
    if (session && new Date(session.expiresAt).getTime() > now.getTime()) {
      const user = await input.db.query.users.findFirst({ where: eq(users.id, session.userId) });

      if (user) {
        if (verifiedIdentity && user.id !== verifiedIdentity.sub) {
          await clearSession({ cookies: input.cookies, sessionId: existingSessionId, db: input.db });
          sessionCleared = true;
        } else {
          if (verifiedIdentity && user.email !== (verifiedIdentity.email ?? null)) {
            await input.db.update(users).set({
              email: verifiedIdentity.email ?? null,
              updatedAt: now.toISOString()
            }).where(eq(users.id, user.id));
          }

        let expiresAt = session.expiresAt;

          if (shouldRefreshSession(session.expiresAt, now)) {
            expiresAt = await refreshSession(input.db, session.sessionId, now);
            input.cookies.set(
              SESSION_COOKIE_NAME,
              await signSessionCookieValue(session.sessionId, input.sessionSecret),
              cookieOptions(expiresAt)
            );
          }

          return {
            user: {
              userId: user.id,
              email: verifiedIdentity?.email ?? user.email
            },
            session: {
              sessionId: session.sessionId,
              expiresAt
            }
          };
        }
      }
    }

    if (!sessionCleared) {
      await clearSession({ cookies: input.cookies, sessionId: existingSessionId, db: input.db });
    }
  }

  if (!verifiedIdentity) {
    return null;
  }

  const externalIdentity = toExternalIdentity(verifiedIdentity);
  const userRepository = createUsersRepository(input.db as never);

  let user = await userRepository.findByExternalIdentity(externalIdentity);
  if (!user) {
    user = await userRepository.create(externalIdentity);
  } else if (user.email !== (verifiedIdentity.email ?? null)) {
    await input.db.update(users).set({
      email: verifiedIdentity.email ?? null,
      updatedAt: now.toISOString()
    }).where(eq(users.id, user.id));

    user = {
      ...user,
      email: verifiedIdentity.email ?? null
    };
  }

  if (!user) {
    return null;
  }

  const session = await createSessionRecord(input.db, user.id, now, createSessionId);
  input.cookies.set(
    SESSION_COOKIE_NAME,
    await signSessionCookieValue(session.sessionId, input.sessionSecret),
    cookieOptions(session.expiresAt)
  );

  return {
    user: {
      userId: user.id,
      email: user.email
    },
    session
  };
}

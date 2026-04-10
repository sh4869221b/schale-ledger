import { expect, test } from "bun:test";
import { clearSession, clearSessionFromCookie, resolveRequestUser, signSessionCookieValue } from "./session";

function createCookies(initialSessionId?: string) {
  const setCalls: Array<Record<string, unknown>> = [];
  const deleteCalls: Array<Record<string, unknown>> = [];

  return {
    get(name: string) {
      return name === "session" ? initialSessionId : undefined;
    },
    set(name: string, value: string, options: Record<string, unknown>) {
      setCalls.push({ name, value, options });
    },
    delete(name: string, options: Record<string, unknown>) {
      deleteCalls.push({ name, options });
    },
    setCalls,
    deleteCalls
  };
}

test("resolveRequestUser reuses a valid session cookie before re-reading access headers", async () => {
  const cookies = createCookies(await signSessionCookieValue("sess_123", "test-secret"));
  let verifyCalls = 0;

  const result = await resolveRequestUser({
    cookies,
    headers: new Headers(),
    db: {
      query: {
        sessions: {
          findFirst: async () => ({
            sessionId: "sess_123",
            userId: "user_1",
            expiresAt: "2099-01-01T00:00:00.000Z"
          })
        },
        users: {
          findFirst: async () => ({
            id: "user_1",
            email: "test@example.com"
          })
        }
      }
    },
    accessConfig: {
      teamDomain: "example.cloudflareaccess.com",
      audience: "aud"
    },
    sessionSecret: "test-secret",
    verifyAccess: async () => {
      verifyCalls += 1;
      return { sub: "user_2", email: "other@example.com" };
    }
  } as never);

  expect(result?.session.sessionId).toBe("sess_123");
  expect(result?.user.userId).toBe("user_1");
  expect(verifyCalls).toBe(0);
});

test("resolveRequestUser refreshes a session that is close to expiry", async () => {
  const cookies = createCookies(await signSessionCookieValue("sess_123", "test-secret"));
  let updateCalls = 0;

  const result = await resolveRequestUser({
    cookies,
    headers: new Headers(),
    db: {
      query: {
        sessions: {
          findFirst: async () => ({
            sessionId: "sess_123",
            userId: "user_1",
            expiresAt: "2026-04-11T00:10:00.000Z"
          })
        },
        users: {
          findFirst: async () => ({
            id: "user_1",
            email: "test@example.com"
          })
        }
      },
      update: () => ({
        set: () => ({
          where: async () => {
            updateCalls += 1;
          }
        })
      })
    },
    accessConfig: {
      teamDomain: "example.cloudflareaccess.com",
      audience: "aud"
    },
    sessionSecret: "test-secret",
    now: () => new Date("2026-04-10T23:30:00.000Z")
  } as never);

  expect(result?.session.sessionId).toBe("sess_123");
  expect(updateCalls).toBe(1);
  expect(cookies.setCalls).toHaveLength(1);
});

test("resolveRequestUser falls back to Access JWT when the session is unusable", async () => {
  const cookies = createCookies(await signSessionCookieValue("sess_123", "test-secret"));
  let deleteCalls = 0;
  let insertCalls = 0;
  let userLookups = 0;

  const result = await resolveRequestUser({
    cookies,
    headers: new Headers([["cf-access-jwt-assertion", "header.payload.signature"]]),
    db: {
      query: {
        sessions: {
          findFirst: async () => null
        },
        users: {
          findFirst: async () => {
            userLookups += 1;
            return userLookups > 1
              ? { id: "user_1", email: "test@example.com" }
              : null;
          }
        }
      },
      insert: () => ({
        values: async () => {
          insertCalls += 1;
        }
      }),
      update: () => ({
        set: () => ({
          where: async () => undefined
        })
      }),
      delete: () => ({
        where: async () => {
          deleteCalls += 1;
        }
      })
    },
    accessConfig: {
      teamDomain: "example.cloudflareaccess.com",
      audience: "aud"
    },
    sessionSecret: "test-secret",
    createSessionId: () => "sess_new",
    verifyAccess: async () => ({
      sub: "user_1",
      email: "test@example.com"
    })
  } as never);

  expect(result?.user.userId).toBe("user_1");
  expect(deleteCalls).toBe(1);
  expect(insertCalls).toBe(2);
  expect(cookies.deleteCalls).toHaveLength(1);
  expect(cookies.setCalls).toHaveLength(1);
});

test("clearSession clears the session cookie", async () => {
  const cookies = createCookies("sess_123");
  let deleteCalls = 0;

  await clearSession({
    cookies,
    sessionId: "sess_123",
    db: {
      delete: () => ({
        where: async () => {
          deleteCalls += 1;
        }
      })
    }
  } as never);

  expect(deleteCalls).toBe(1);
  expect(cookies.deleteCalls).toHaveLength(1);
});

test("clearSessionFromCookie invalidates the stored session for a signed cookie", async () => {
  const signedCookie = await signSessionCookieValue("sess_123", "test-secret");
  const cookies = createCookies(signedCookie);
  let deleteCalls = 0;

  await clearSessionFromCookie({
    cookies,
    rawCookieValue: signedCookie,
    sessionSecret: "test-secret",
    db: {
      delete: () => ({
        where: async () => {
          deleteCalls += 1;
        }
      })
    }
  } as never);

  expect(deleteCalls).toBe(1);
  expect(cookies.deleteCalls).toHaveLength(1);
});

test("resolveRequestUser ignores malformed signed cookies instead of throwing", async () => {
  const cookies = createCookies("sess_123.bad***signature");

  const result = await resolveRequestUser({
    cookies,
    headers: new Headers(),
    db: {
      query: {
        sessions: {
          findFirst: async () => null
        },
        users: {
          findFirst: async () => null
        }
      },
      insert: () => ({
        values: async () => undefined
      }),
      update: () => ({
        set: () => ({
          where: async () => undefined
        })
      }),
      delete: () => ({
        where: async () => undefined
      })
    },
    accessConfig: {
      teamDomain: "example.cloudflareaccess.com",
      audience: "aud"
    },
    sessionSecret: "test-secret"
  } as never);

  expect(result).toBeNull();
  expect(cookies.deleteCalls).toHaveLength(1);
});

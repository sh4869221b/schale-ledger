import { error, redirect, type RequestHandler } from "@sveltejs/kit";
import { clearSessionFromCookie } from "$lib/server/auth/session";
import { getDb } from "$lib/server/db";

export const GET: RequestHandler = async (event) => {
  const sessionSecret = event.platform?.env.SESSION_COOKIE_SECRET;
  if (!sessionSecret) {
    throw error(500, "Session cookie secret is not configured");
  }

  await clearSessionFromCookie({
    cookies: event.cookies,
    rawCookieValue: event.cookies.get("session"),
    sessionSecret,
    db: getDb(event)
  });

  throw redirect(302, "/");
};

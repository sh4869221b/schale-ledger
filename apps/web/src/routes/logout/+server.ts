import { error, redirect, type RequestHandler } from "@sveltejs/kit";
import { clearSessionFromCookie } from "$lib/server/auth/session";
import { getDb } from "$lib/server/db";

export const GET: RequestHandler = async (event) => {
  const sessionSecret = event.platform?.env.SESSION_COOKIE_SECRET;
  const teamDomain = event.platform?.env.CF_ACCESS_TEAM_DOMAIN;
  if (!sessionSecret) {
    throw error(500, "Session cookie secret is not configured");
  }
  if (!teamDomain) {
    throw error(500, "Cloudflare Access team domain is not configured");
  }

  await clearSessionFromCookie({
    cookies: event.cookies,
    rawCookieValue: event.cookies.get("session"),
    sessionSecret,
    db: getDb(event)
  });

  throw redirect(302, `https://${teamDomain}/cdn-cgi/access/logout`);
};

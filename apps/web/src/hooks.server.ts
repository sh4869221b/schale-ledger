import type { Handle } from "@sveltejs/kit";
import { getDb } from "$lib/server/db";
import { resolveRequestUser } from "$lib/server/auth/session";

export const handle: Handle = async ({ event, resolve }) => {
  if (event.platform?.env?.DB) {
    const auth = await resolveRequestUser({
      cookies: event.cookies,
      headers: event.request.headers,
      db: getDb(event),
      accessConfig: {
        audience: event.platform.env.CF_ACCESS_AUD,
        teamDomain: event.platform.env.CF_ACCESS_TEAM_DOMAIN
      },
      sessionSecret: event.platform.env.SESSION_COOKIE_SECRET
    });

    if (auth) {
      event.locals.user = auth.user;
      event.locals.session = auth.session;
    }
  }

  return resolve(event);
};

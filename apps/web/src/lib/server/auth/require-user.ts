import { redirect } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

export function requireUser(event: Pick<RequestEvent, "locals">) {
  if (!event.locals.user) {
    throw redirect(302, "/");
  }

  return event.locals.user;
}

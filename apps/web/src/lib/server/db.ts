import { createDb } from "@schale-ledger/db";
import { error, type RequestEvent } from "@sveltejs/kit";

export function getDb(event: Pick<RequestEvent, "platform">) {
  const database = event.platform?.env.DB;

  if (!database) {
    throw error(500, "D1 binding is not configured");
  }

  return createDb(database);
}

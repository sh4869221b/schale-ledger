import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createRequestContext } from "$lib/server/context";
import { normalizeError } from "$lib/server/errors";
import { withDbRetry } from "$lib/server/retry";
import { parseStudentFilter } from "$lib/server/validation";

export const GET: RequestHandler = async (event) => {
  try {
    const students = await withDbRetry(async () => {
      const { service, userId } = await createRequestContext(event);
      const filter = parseStudentFilter(event.url);
      return service.listStudents(userId, filter);
    });
    return json({ students });
  } catch (error) {
    const normalized = normalizeError(error);
    return json(normalized.body, { status: normalized.status });
  }
};

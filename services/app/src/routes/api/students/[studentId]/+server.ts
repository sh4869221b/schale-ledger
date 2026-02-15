import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createRequestContext } from "$lib/server/context";
import { normalizeError } from "$lib/server/errors";

export const GET: RequestHandler = async (event) => {
  try {
    const { service, userId } = await createRequestContext(event);
    const detail = await service.getStudentDetail(userId, event.params.studentId);
    return json(detail);
  } catch (error) {
    const normalized = normalizeError(error);
    return json(normalized.body, { status: normalized.status });
  }
};

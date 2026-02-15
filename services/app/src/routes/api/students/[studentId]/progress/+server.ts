import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createRequestContext } from "$lib/server/context";
import { normalizeError } from "$lib/server/errors";
import { withDbRetry } from "$lib/server/retry";
import { progressPatchSchema } from "$lib/server/validation";
import { ValidationError } from "@schale-ledger/application";

export const PUT: RequestHandler = async (event) => {
  try {
    const payload = await event.request.json();
    const parsed = progressPatchSchema.safeParse(payload);
    if (!parsed.success) {
      throw new ValidationError("進捗更新リクエストが不正です", {
        issues: parsed.error.flatten()
      });
    }

    const detail = await withDbRetry(async () => {
      const { service, userId } = await createRequestContext(event);
      return service.upsertStudentProgress(userId, event.params.studentId, parsed.data);
    });
    return json(detail);
  } catch (error) {
    const normalized = normalizeError(error);
    return json(normalized.body, { status: normalized.status });
  }
};

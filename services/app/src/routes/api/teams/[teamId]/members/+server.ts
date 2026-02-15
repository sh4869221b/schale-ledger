import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createRequestContext } from "$lib/server/context";
import { normalizeError } from "$lib/server/errors";
import { teamMembersReplaceSchema } from "$lib/server/validation";
import { ValidationError } from "@schale-ledger/application";

export const PUT: RequestHandler = async (event) => {
  try {
    const payload = await event.request.json();
    const parsed = teamMembersReplaceSchema.safeParse(payload);
    if (!parsed.success) {
      throw new ValidationError("編成メンバー置換リクエストが不正です", {
        issues: parsed.error.flatten()
      });
    }

    const { service, userId } = await createRequestContext(event);
    const detail = await service.replaceTeamMembers(userId, event.params.teamId, parsed.data.members);
    return json(detail);
  } catch (error) {
    const normalized = normalizeError(error);
    return json(normalized.body, { status: normalized.status });
  }
};

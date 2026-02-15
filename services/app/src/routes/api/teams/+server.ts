import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { createRequestContext } from "$lib/server/context";
import { normalizeError } from "$lib/server/errors";
import { teamModeSchema } from "$lib/server/validation";
import { ValidationError } from "@schale-ledger/application";

export const GET: RequestHandler = async (event) => {
  try {
    const modeRaw = event.url.searchParams.get("mode");
    const mode = (() => {
      if (!modeRaw) {
        return undefined;
      }
      const parsed = teamModeSchema.safeParse(modeRaw);
      if (!parsed.success) {
        throw new ValidationError("mode は raid または jfd を指定してください", {
          mode: modeRaw
        });
      }
      return parsed.data;
    })();

    const { service, userId } = await createRequestContext(event);
    const teams = await service.listTeams(userId, mode);
    return json({ teams });
  } catch (error) {
    const normalized = normalizeError(error);
    return json(normalized.body, { status: normalized.status });
  }
};

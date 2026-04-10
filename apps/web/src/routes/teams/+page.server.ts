import { createTeamsRepository } from "@schale-ledger/db";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getDb } from "$lib/server/db";
import { getTeams } from "$lib/features/teams/get-teams";

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    return { model: null };
  }

  return {
    model: await getTeams(getDb(event), user.userId)
  };
};

export const actions: Actions = {
  default: async (event) => {
    const user = event.locals.user;
    if (!user) {
      throw redirect(302, "/logout");
    }

    const repository = createTeamsRepository(getDb(event));
    const teamId = crypto.randomUUID();
    await repository.createWithMembers(user.userId, {
      id: teamId,
      name: "Untitled Team",
      mode: "raid",
      memo: ""
    }, []);

    throw redirect(303, `/teams/${teamId}`);
  }
};

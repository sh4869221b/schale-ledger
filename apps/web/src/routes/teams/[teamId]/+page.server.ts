import { createStudentsRepository, createTeamsRepository } from "@schale-ledger/db";
import { error, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getDb } from "$lib/server/db";
import { getTeamDetail } from "$lib/features/teams/get-teams";
import { toTeamMutation } from "$lib/features/teams/save-team";

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    return { team: null };
  }

  return {
    team: await getTeamDetail(getDb(event), user.userId, event.params.teamId)
  };
};

export const actions: Actions = {
  default: async (event) => {
    const user = event.locals.user;
    const teamId = event.params.teamId;
    if (!user) {
      throw redirect(302, "/logout");
    }
    if (!teamId) {
      throw error(400, "Team id is required");
    }

    const formData = await event.request.formData();
    const slots = Array.from({ length: 6 }, (_, index) => String(formData.get(`slot${index}`) ?? ""));
    const mutation = toTeamMutation({
      name: String(formData.get("name") ?? ""),
      mode: String(formData.get("mode") ?? "raid"),
      memo: String(formData.get("memo") ?? ""),
      slots
    });

    const db = getDb(event);
    const studentsRepository = createStudentsRepository(db);
    const teamsRepository = createTeamsRepository(db);
    const existingStudents = await studentsRepository.getByIds(mutation.members.map((member) => member.studentId));
    if (existingStudents.length !== mutation.members.length) {
      throw error(400, "Unknown student id in team members");
    }

    const existingTeam = await teamsRepository.getById(user.userId, teamId);
    if (!existingTeam) {
      throw error(404, "Team not found");
    }

    await teamsRepository.updateWithMembers(teamId, {
      name: mutation.name,
      mode: mutation.mode,
      memo: mutation.memo
    }, mutation.members);

    throw redirect(303, `/teams/${teamId}`);
  }
};

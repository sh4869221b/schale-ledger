import { createStudentsRepository, createTeamsRepository, type createDb } from "@schale-ledger/db";
import { error } from "@sveltejs/kit";

type Database = ReturnType<typeof createDb>;

export async function getTeams(db: Database, userId: string) {
  const repository = createTeamsRepository(db);
  const teams = await repository.listByUser(userId);

  const items = await Promise.all(
    teams.map(async (team) => {
      const members = await repository.listMembers(team.id);

      return {
        teamId: team.id,
        name: team.name,
        mode: team.mode,
        memo: team.memo,
        memberCount: members.length,
        updatedAt: team.updatedAt
      };
    })
  );

  return { teams: items };
}

export async function getTeamDetail(db: Database, userId: string, teamId: string) {
  const teamsRepository = createTeamsRepository(db);
  const studentsRepository = createStudentsRepository(db);

  const team = await teamsRepository.getById(userId, teamId);
  if (!team) {
    throw error(404, "Team not found");
  }

  const members = await teamsRepository.listMembers(team.id);
  const slots = Array.from({ length: 6 }, () => "");
  for (const member of members) {
    if (member.positionIndex >= 0 && member.positionIndex < slots.length) {
      slots[member.positionIndex] = member.studentId;
    }
  }

  return {
    teamId: team.id,
    name: team.name,
    mode: team.mode,
    memo: team.memo,
    slots,
    roster: await studentsRepository.list()
  };
}

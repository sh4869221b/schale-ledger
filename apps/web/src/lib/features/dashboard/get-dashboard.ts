import { toDashboardCards } from "@schale-ledger/core";
import { createProgressRepository, createStudentsRepository, createTeamsRepository, type createDb } from "@schale-ledger/db";

type Database = ReturnType<typeof createDb>;

export interface DashboardSourceTeam {
  id: string;
  name: string;
  mode: string;
  memo: string;
  updatedAt: string;
}

export interface DashboardSource {
  studentCount: number;
  activeTeams: number;
  overdueProgress: number;
  recentTeams: DashboardSourceTeam[];
}

export function toDashboardModel(source: DashboardSource) {
  return {
    cards: toDashboardCards({
      studentCount: source.studentCount,
      teamCount: source.activeTeams,
      overdueCount: source.overdueProgress
    }).map((card, index) => ({
      ...card,
      description:
        index === 0
          ? "Tracked roster entries"
          : index === 1
            ? "Recently updated teams"
            : "Items needing progress updates"
    })),
    recentTeams: source.recentTeams.map((team) => ({
      teamId: team.id,
      name: team.name,
      mode: team.mode,
      memo: team.memo,
      updatedAt: team.updatedAt
    })),
    attentionItems:
      source.overdueProgress > 0
        ? [{ label: "Progress updates", value: `${source.overdueProgress} pending` }]
        : [{ label: "Progress updates", value: "All caught up" }]
  };
}

export async function getDashboard(db: Database, userId: string) {
  const studentRepository = createStudentsRepository(db);
  const progressRepository = createProgressRepository(db);
  const teamRepository = createTeamsRepository(db);

  const [students, progresses, teams] = await Promise.all([
    studentRepository.list(),
    progressRepository.listByUser(userId),
    teamRepository.listByUser(userId)
  ]);

  const progressedStudentIds = new Set(progresses.map((progress) => progress.studentId));

  return toDashboardModel({
    studentCount: students.length,
    activeTeams: teams.length,
    overdueProgress: Math.max(students.length - progressedStudentIds.size, 0),
    recentTeams: teams.slice(0, 3).map((team) => ({
      id: team.id,
      name: team.name,
      mode: team.mode,
      memo: team.memo,
      updatedAt: team.updatedAt
    }))
  });
}

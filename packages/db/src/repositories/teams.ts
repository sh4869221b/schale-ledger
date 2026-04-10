import type { createDb } from "../client";
import { asc, desc, eq } from "drizzle-orm";
import { teamMembers, teams } from "../schema";

type Database = ReturnType<typeof createDb>;

export function createTeamsRepository(db: Database) {
  return {
    listByUser: (userId: string) => db.select().from(teams).where(eq(teams.userId, userId)).orderBy(desc(teams.updatedAt)).all(),
    listMembers: (teamId: string) => db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId)).orderBy(asc(teamMembers.positionIndex)).all()
  };
}

import type { createDb } from "../client";
import { asc, desc, eq } from "drizzle-orm";
import { teamMembers, teams } from "../schema";

type Database = ReturnType<typeof createDb>;

export function createTeamsRepository(db: Database) {
  return {
    listByUser: (userId: string) => db.select().from(teams).where(eq(teams.userId, userId)).orderBy(desc(teams.updatedAt)).all(),
    getById: (userId: string, teamId: string) =>
      db.query.teams.findFirst({
        where: (table, { and, eq }) => and(eq(table.userId, userId), eq(table.id, teamId))
      }),
    listMembers: (teamId: string) => db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId)).orderBy(asc(teamMembers.positionIndex)).all(),
    create: async (userId: string, team: { id: string; name: string; mode: string; memo: string }) => {
      const now = new Date().toISOString();

      await db.insert(teams).values({
        id: team.id,
        userId,
        name: team.name,
        mode: team.mode,
        memo: team.memo,
        createdAt: now,
        updatedAt: now
      });

      return db.query.teams.findFirst({ where: eq(teams.id, team.id) });
    },
    createWithMembers: async (
      userId: string,
      team: { id: string; name: string; mode: string; memo: string },
      members: Array<{ position: number; studentId: string }>
    ) => {
      const now = new Date().toISOString();
      const insertTeam = db.insert(teams).values({
        id: team.id,
        userId,
        name: team.name,
        mode: team.mode,
        memo: team.memo,
        createdAt: now,
        updatedAt: now
      });

      if (members.length > 0) {
        const insertMembers = db.insert(teamMembers).values(
          members.map((member) => ({
            teamId: team.id,
            positionIndex: member.position,
            studentId: member.studentId,
            isSupport: false,
            createdAt: now,
            updatedAt: now
          }))
        );

        await db.batch([insertTeam, insertMembers]);
      } else {
        await db.batch([insertTeam]);
      }

      return db.query.teams.findFirst({ where: eq(teams.id, team.id) });
    },
    update: (teamId: string, patch: { name: string; mode: string; memo: string }) =>
      db
        .update(teams)
        .set({
          ...patch,
          updatedAt: new Date().toISOString()
        })
        .where(eq(teams.id, teamId)),
    updateWithMembers: async (
      teamId: string,
      patch: { name: string; mode: string; memo: string },
      members: Array<{ position: number; studentId: string }>
    ) => {
      const now = new Date().toISOString();
      const updateTeam = db
        .update(teams)
        .set({
          ...patch,
          updatedAt: now
        })
        .where(eq(teams.id, teamId));
      const deleteMembers = db.delete(teamMembers).where(eq(teamMembers.teamId, teamId));

      if (members.length > 0) {
        const insertMembers = db.insert(teamMembers).values(
          members.map((member) => ({
            teamId,
            positionIndex: member.position,
            studentId: member.studentId,
            isSupport: false,
            createdAt: now,
            updatedAt: now
          }))
        );

        return db.batch([updateTeam, deleteMembers, insertMembers]);
      }

      return db.batch([updateTeam, deleteMembers]);
    },
    replaceMembers: async (teamId: string, members: Array<{ position: number; studentId: string }>) => {
      await db.delete(teamMembers).where(eq(teamMembers.teamId, teamId));

      if (members.length === 0) {
        return;
      }

      await db.insert(teamMembers).values(
        members.map((member) => ({
          teamId,
          positionIndex: member.position,
          studentId: member.studentId,
          isSupport: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      );
    }
  };
}

import type { createDb } from "../client";
import { and, eq } from "drizzle-orm";
import { studentProgress } from "../schema";

type Database = ReturnType<typeof createDb>;

export function createProgressRepository(db: Database) {
  return {
    listByUser: (userId: string) =>
      db.select().from(studentProgress).where(eq(studentProgress.userId, userId)).all(),
    get: (userId: string, studentId: string) =>
      db.query.studentProgress.findFirst({
        where: and(eq(studentProgress.userId, userId), eq(studentProgress.studentId, studentId))
      })
  };
}

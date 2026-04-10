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
      }),
    save: (userId: string, studentId: string, progress: Omit<typeof studentProgress.$inferInsert, "userId" | "studentId" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();

      return db
        .insert(studentProgress)
        .values({
          userId,
          studentId,
          ...progress,
          createdAt: now,
          updatedAt: now
        })
        .onConflictDoUpdate({
          target: [studentProgress.userId, studentProgress.studentId],
          set: {
            ...progress,
            updatedAt: now
          }
        });
    }
  };
}

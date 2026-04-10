import type { createDb } from "../client";
import { asc, eq, inArray } from "drizzle-orm";
import { students } from "../schema";

type Database = ReturnType<typeof createDb>;

export function createStudentsRepository(db: Database) {
  return {
    list: () => db.select().from(students).orderBy(asc(students.studentId)).all(),
    get: (studentId: string) => db.query.students.findFirst({ where: eq(students.studentId, studentId) }),
    getByIds: (studentIds: string[]) => {
      if (studentIds.length === 0) {
        return Promise.resolve([]);
      }

      return db.select().from(students).where(inArray(students.studentId, studentIds)).all();
    }
  };
}

import type { createDb } from "../client";
import { asc, eq } from "drizzle-orm";
import { students } from "../schema";

type Database = ReturnType<typeof createDb>;

export function createStudentsRepository(db: Database) {
  return {
    list: () => db.select().from(students).orderBy(asc(students.studentId)).all(),
    get: (studentId: string) => db.query.students.findFirst({ where: eq(students.studentId, studentId) })
  };
}

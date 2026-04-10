import { createProgressRepository, createStudentsRepository } from "@schale-ledger/db";
import { error, redirect, type RequestHandler } from "@sveltejs/kit";
import { parseProgressMutation } from "$lib/features/progress/save-progress";
import { getDb } from "$lib/server/db";

function toDetailPath(studentId: string, params?: URLSearchParams) {
  const suffix = params && [...params.keys()].length > 0 ? `?${params.toString()}` : "";
  return `/students/${studentId}${suffix}`;
}

export const POST: RequestHandler = async (event) => {
  const user = event.locals.user;
  const studentId = event.params.studentId;

  if (!user) {
    throw redirect(302, "/logout");
  }
  if (!studentId) {
    throw error(400, "Student id is required");
  }

  const formData = await event.request.formData();
  const parsed = parseProgressMutation(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const params = new URLSearchParams({
      errors: JSON.stringify(parsed.errors),
      values: JSON.stringify(parsed.values)
    });
    throw redirect(303, toDetailPath(studentId, params));
  }

  const db = getDb(event);
  const studentsRepository = createStudentsRepository(db);
  const student = await studentsRepository.get(studentId);
  if (!student) {
    throw error(404, "Student not found");
  }

  const repository = createProgressRepository(db);
  await repository.save(user.userId, studentId, parsed.values);

  throw redirect(303, toDetailPath(studentId, new URLSearchParams({ saved: "1" })));
};

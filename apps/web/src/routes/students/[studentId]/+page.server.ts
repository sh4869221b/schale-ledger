import type { PageServerLoad } from "./$types";
import { getStudentDetail } from "$lib/features/students/get-student-detail";
import { getDb } from "$lib/server/db";

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    return {
      student: null
    };
  }

  return {
    student: await getStudentDetail(getDb(event), user.userId, event.params.studentId)
  };
};

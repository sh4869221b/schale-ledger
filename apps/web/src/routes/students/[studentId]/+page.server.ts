import type { PageServerLoad } from "./$types";
import { getStudentDetail } from "$lib/features/students/get-student-detail";
import { parseSerializedProgressFormState } from "$lib/features/progress/save-progress";
import { getDb } from "$lib/server/db";

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    return {
      student: null
    };
  }

  return {
    student: await getStudentDetail(getDb(event), user.userId, event.params.studentId),
    formState: {
      success: event.url.searchParams.get("saved") === "1",
      errors: parseSerializedProgressFormState(event.url.searchParams.get("errors")) as Record<string, string[]> | null,
      values: parseSerializedProgressFormState(event.url.searchParams.get("values"))
    }
  };
};

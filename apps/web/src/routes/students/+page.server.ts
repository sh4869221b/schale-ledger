import type { PageServerLoad } from "./$types";
import { getStudents } from "$lib/features/students/get-students";
import { getDb } from "$lib/server/db";

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    return {
      model: null
    };
  }

  const query = {
    q: event.url.searchParams.get("q") ?? undefined,
    school: event.url.searchParams.get("school") ?? undefined,
    role: event.url.searchParams.get("role") ?? undefined,
    position: event.url.searchParams.get("position") ?? undefined,
    page: Number(event.url.searchParams.get("page") ?? "1")
  };

  return {
    model: await getStudents(getDb(event), user.userId, query)
  };
};

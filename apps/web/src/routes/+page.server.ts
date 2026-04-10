import type { PageServerLoad } from "./$types";
import { getDb } from "$lib/server/db";
import { getDashboard } from "$lib/features/dashboard/get-dashboard";

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    return {
      dashboard: null
    };
  }

  return {
    dashboard: await getDashboard(getDb(event), user.userId)
  };
};

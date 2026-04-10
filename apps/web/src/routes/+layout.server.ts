import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

const navigation = [
  { href: "/", label: "Dashboard", enabled: true },
  { href: "/students", label: "Students", enabled: true },
  { href: "/teams", label: "Teams", enabled: false }
];

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.user) {
    throw redirect(302, `/logout?next=${encodeURIComponent(url.pathname)}`);
  }

  return {
    navigation,
    user: locals.user,
    pathname: url.pathname
  };
};

import { expect, test } from "bun:test";
import { tableNames } from "./schema";

test("schema exposes MVP tables including sessions", () => {
  expect(tableNames).toEqual([
    "users",
    "sessions",
    "students",
    "student_progress",
    "teams",
    "team_members",
    "team_mode_rules",
    "progress_caps"
  ]);
});

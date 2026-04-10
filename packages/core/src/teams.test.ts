import { expect, test } from "bun:test";
import { normalizeTeamMembers } from "./index";

test("normalizeTeamMembers removes empty slots and keeps order", () => {
  expect(normalizeTeamMembers(["a", "", "b"]))
    .toEqual([{ position: 0, studentId: "a" }, { position: 2, studentId: "b" }]);
});

test("normalizeTeamMembers rejects whitespace-only slots", () => {
  expect(normalizeTeamMembers(["a", "   ", "b"]))
    .toEqual([{ position: 0, studentId: "a" }, { position: 2, studentId: "b" }]);
});

import { expect, test } from "bun:test";
import { getTeamDetail } from "./get-teams";
import { toTeamMutation } from "./save-team";

test("toTeamMutation preserves slot order", () => {
  const mutation = toTeamMutation({ slots: ["s1", "", "s2"] });
  expect(mutation.members.map((member) => member.position)).toEqual([0, 2]);
});

test("toTeamMutation removes duplicate student ids after the first occurrence", () => {
  const mutation = toTeamMutation({ slots: ["s1", "s2", "s1", "s3"] });
  expect(mutation.members).toEqual([
    { position: 0, studentId: "s1" },
    { position: 1, studentId: "s2" },
    { position: 3, studentId: "s3" }
  ]);
});

test("getTeamDetail throws 404 when the team does not exist", async () => {
  await expect(
    getTeamDetail(
      {
        query: {
          teams: { findFirst: async () => null }
        }
      } as never,
      "user_1",
      "missing"
    )
  ).rejects.toMatchObject({ status: 404 });
});

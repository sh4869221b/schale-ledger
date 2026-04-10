import { expect, test } from "bun:test";
import { progressInputSchema, teamMembersSchema } from "./index";

test("progressInputSchema rejects negative shard counts", () => {
  const result = progressInputSchema.safeParse({ shardsOwned: -1 });

  expect(result.success).toBe(false);
});

test("progressInputSchema rejects unknown keys", () => {
  const result = progressInputSchema.safeParse({ level: 1, unexpected: true });

  expect(result.success).toBe(false);
});

test("teamMembersSchema rejects whitespace-only student ids", () => {
  const result = teamMembersSchema.safeParse([{ position: 0, studentId: "   " }]);

  expect(result.success).toBe(false);
});

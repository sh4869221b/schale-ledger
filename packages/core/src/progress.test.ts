import { expect, test } from "bun:test";
import { clampProgressInput } from "./index";

test("clampProgressInput clamps level and memo", () => {
  const result = clampProgressInput({ level: 999, memo: undefined });

  expect(result.level).toBeLessThanOrEqual(100);
  expect(result.memo).toBe("");
});

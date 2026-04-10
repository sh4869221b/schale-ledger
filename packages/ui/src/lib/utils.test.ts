import { expect, test } from "bun:test";
import { cn } from "./utils";

test("cn merges falsy and duplicate classes", () => {
  expect(cn("px-2", false && "hidden", "px-2", "py-1")).toBe("px-2 py-1");
});

test("cn resolves conflicting tailwind utilities", () => {
  expect(cn("px-2", "px-4", "py-1")).toBe("px-4 py-1");
});

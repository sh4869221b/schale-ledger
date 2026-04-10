import { expect, test } from "bun:test";
import * as ui from "@schale-ledger/ui";

test("apps/web can import the shared ui workspace package", () => {
  expect(ui.Button).toBeDefined();
  expect(ui.StatCard).toBeDefined();
  expect(ui.cn("px-2", "px-4")).toBe("px-4");
});

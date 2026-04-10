import { expect, test } from "bun:test";
import { toDashboardCards } from "./index";

test("toDashboardCards creates stable summary labels", () => {
  expect(toDashboardCards({ studentCount: 10, teamCount: 2, overdueCount: 1 })[0].label).toBe("Students");
});

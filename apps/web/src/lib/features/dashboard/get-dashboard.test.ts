import { expect, test } from "bun:test";
import { toDashboardModel } from "./get-dashboard";

test("toDashboardModel creates summary cards and recent team sections", () => {
  const model = toDashboardModel({
    studentCount: 3,
    activeTeams: 2,
    overdueProgress: 1,
    recentTeams: [
      {
        id: "team-1",
        name: "Raid Team",
        mode: "raid",
        memo: "",
        updatedAt: "2026-04-10T10:00:00.000Z"
      }
    ]
  });

  expect(model.cards).toHaveLength(3);
  expect(model.cards[0].label).toBe("Students");
  expect(model.recentTeams[0].teamId).toBe("team-1");
});

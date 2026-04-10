export interface DashboardCounts {
  studentCount: number;
  teamCount: number;
  overdueCount: number;
}

export function toDashboardCards(counts: DashboardCounts) {
  return [
    { label: "Students", value: String(counts.studentCount) },
    { label: "Teams", value: String(counts.teamCount) },
    { label: "Needs attention", value: String(counts.overdueCount) }
  ];
}

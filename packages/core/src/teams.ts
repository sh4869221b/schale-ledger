export interface TeamMemberSlot {
  position: number;
  studentId: string;
}

export function normalizeTeamMembers(slots: string[]): TeamMemberSlot[] {
  return slots.flatMap((studentId, position) => {
    const normalized = studentId.trim();

    if (!normalized) {
      return [];
    }

    return [{ position, studentId: normalized }];
  });
}

export function dedupeTeamMembers(members: TeamMemberSlot[]) {
  const seen = new Set<string>();

  return members.filter((member) => {
    if (seen.has(member.studentId)) {
      return false;
    }

    seen.add(member.studentId);
    return true;
  });
}

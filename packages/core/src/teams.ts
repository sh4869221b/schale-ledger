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

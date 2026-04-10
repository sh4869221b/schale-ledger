import { dedupeTeamMembers, normalizeTeamMembers } from "@schale-ledger/core";

export function toTeamMutation(input: {
  name?: string;
  mode?: string;
  memo?: string;
  slots: string[];
}) {
  const members = dedupeTeamMembers(normalizeTeamMembers(input.slots));

  return {
    name: (input.name ?? "Untitled Team").trim() || "Untitled Team",
    mode: input.mode === "jfd" ? "jfd" : "raid",
    memo: (input.memo ?? "").trim(),
    members
  };
}

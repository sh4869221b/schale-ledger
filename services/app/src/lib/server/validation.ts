import type { ProgressPatch, StudentFilter, TeamMemberInput } from "@schale-ledger/contracts";
import { ValidationError } from "@schale-ledger/application";
import { z } from "zod";

const booleanString = z.union([z.literal("true"), z.literal("false")]);

export const teamModeSchema = z.union([z.literal("raid"), z.literal("jfd")]);

export const progressPatchSchema: z.ZodType<ProgressPatch> = z
  .object({
    level: z.number().int().optional(),
    rarity: z.number().int().optional(),
    bondLevel: z.number().int().optional(),
    exSkillLevel: z.number().int().optional(),
    normalSkillLevel: z.number().int().optional(),
    passiveSkillLevel: z.number().int().optional(),
    subSkillLevel: z.number().int().optional(),
    equipment1Tier: z.number().int().optional(),
    equipment2Tier: z.number().int().optional(),
    equipment3Tier: z.number().int().optional(),
    uniqueWeaponRank: z.number().int().optional(),
    uniqueWeaponLevel: z.number().int().optional(),
    shardsOwned: z.number().int().optional(),
    shardsUsed: z.number().int().optional(),
    favoriteGifts: z.number().int().optional(),
    memo: z.string().optional()
  })
  .strict();

const memberSchema: z.ZodType<TeamMemberInput> = z
  .object({
    studentId: z.string().min(1),
    positionIndex: z.number().int(),
    isSupport: z.boolean().optional()
  })
  .strict();

export const teamMembersReplaceSchema = z
  .object({
    members: z.array(memberSchema)
  })
  .strict();

export function parseStudentFilter(url: URL): StudentFilter {
  const isLimitedRaw = url.searchParams.get("isLimited");
  if (isLimitedRaw !== null) {
    const parsed = booleanString.safeParse(isLimitedRaw);
    if (!parsed.success) {
      throw new ValidationError("isLimited は true または false を指定してください");
    }
  }

  return {
    q: url.searchParams.get("q") ?? undefined,
    school: url.searchParams.get("school") ?? undefined,
    role: url.searchParams.get("role") ?? undefined,
    position: url.searchParams.get("position") ?? undefined,
    attackType: url.searchParams.get("attackType") ?? undefined,
    defenseType: url.searchParams.get("defenseType") ?? undefined,
    isLimited: isLimitedRaw === null ? undefined : isLimitedRaw === "true"
  };
}

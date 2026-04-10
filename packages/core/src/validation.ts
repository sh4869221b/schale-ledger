import { z } from "zod";

export const studentFilterSchema = z.object({
  q: z.string().trim().optional(),
  school: z.string().trim().optional(),
  role: z.string().trim().optional(),
  position: z.string().trim().optional(),
  attackType: z.string().trim().optional(),
  defenseType: z.string().trim().optional(),
  isLimited: z.boolean().optional()
}).strict();

export const progressInputSchema = z.object({
  level: z.number().int().min(1).max(100).optional(),
  rarity: z.number().int().min(1).max(8).optional(),
  bondLevel: z.number().int().min(1).max(100).optional(),
  exSkillLevel: z.number().int().min(1).max(10).optional(),
  normalSkillLevel: z.number().int().min(1).max(10).optional(),
  passiveSkillLevel: z.number().int().min(1).max(10).optional(),
  subSkillLevel: z.number().int().min(1).max(10).optional(),
  equipment1Tier: z.number().int().min(0).max(10).optional(),
  equipment2Tier: z.number().int().min(0).max(10).optional(),
  equipment3Tier: z.number().int().min(0).max(10).optional(),
  uniqueWeaponRank: z.number().int().min(0).max(5).optional(),
  uniqueWeaponLevel: z.number().int().min(0).max(100).optional(),
  shardsOwned: z.number().int().min(0).max(9999).optional(),
  shardsUsed: z.number().int().min(0).max(9999).optional(),
  favoriteGifts: z.number().int().min(0).max(999).optional(),
  memo: z.string().max(1000).optional()
}).strict();

export const teamMembersSchema = z.array(
  z.object({
    position: z.number().int().min(0),
    studentId: z.string().trim().min(1)
  }).strict()
);

export function ensureNonEmptyString(value: string | undefined | null) {
  return typeof value === "string" && value.trim().length > 0;
}

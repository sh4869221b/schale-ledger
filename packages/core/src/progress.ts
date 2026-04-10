export interface ProgressInput {
  level?: number;
  rarity?: number;
  bondLevel?: number;
  exSkillLevel?: number;
  normalSkillLevel?: number;
  passiveSkillLevel?: number;
  subSkillLevel?: number;
  equipment1Tier?: number;
  equipment2Tier?: number;
  equipment3Tier?: number;
  uniqueWeaponRank?: number;
  uniqueWeaponLevel?: number;
  shardsOwned?: number;
  shardsUsed?: number;
  favoriteGifts?: number;
  memo?: string;
}

const DEFAULT_PROGRESS = {
  level: 1,
  rarity: 1,
  bondLevel: 1,
  exSkillLevel: 1,
  normalSkillLevel: 1,
  passiveSkillLevel: 1,
  subSkillLevel: 1,
  equipment1Tier: 0,
  equipment2Tier: 0,
  equipment3Tier: 0,
  uniqueWeaponRank: 0,
  uniqueWeaponLevel: 0,
  shardsOwned: 0,
  shardsUsed: 0,
  favoriteGifts: 0,
  memo: ""
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function clampProgressInput(input: ProgressInput) {
  return {
    level: clamp(input.level ?? DEFAULT_PROGRESS.level, 1, 100),
    rarity: clamp(input.rarity ?? DEFAULT_PROGRESS.rarity, 1, 8),
    bondLevel: clamp(input.bondLevel ?? DEFAULT_PROGRESS.bondLevel, 1, 100),
    exSkillLevel: clamp(input.exSkillLevel ?? DEFAULT_PROGRESS.exSkillLevel, 1, 10),
    normalSkillLevel: clamp(input.normalSkillLevel ?? DEFAULT_PROGRESS.normalSkillLevel, 1, 10),
    passiveSkillLevel: clamp(input.passiveSkillLevel ?? DEFAULT_PROGRESS.passiveSkillLevel, 1, 10),
    subSkillLevel: clamp(input.subSkillLevel ?? DEFAULT_PROGRESS.subSkillLevel, 1, 10),
    equipment1Tier: clamp(input.equipment1Tier ?? DEFAULT_PROGRESS.equipment1Tier, 0, 10),
    equipment2Tier: clamp(input.equipment2Tier ?? DEFAULT_PROGRESS.equipment2Tier, 0, 10),
    equipment3Tier: clamp(input.equipment3Tier ?? DEFAULT_PROGRESS.equipment3Tier, 0, 10),
    uniqueWeaponRank: clamp(input.uniqueWeaponRank ?? DEFAULT_PROGRESS.uniqueWeaponRank, 0, 5),
    uniqueWeaponLevel: clamp(input.uniqueWeaponLevel ?? DEFAULT_PROGRESS.uniqueWeaponLevel, 0, 100),
    shardsOwned: clamp(input.shardsOwned ?? DEFAULT_PROGRESS.shardsOwned, 0, 9999),
    shardsUsed: clamp(input.shardsUsed ?? DEFAULT_PROGRESS.shardsUsed, 0, 9999),
    favoriteGifts: clamp(input.favoriteGifts ?? DEFAULT_PROGRESS.favoriteGifts, 0, 999),
    memo: (input.memo ?? "").slice(0, 1000)
  };
}

export const TEAM_MODES = ["raid", "jfd"] as const;
export type TeamMode = (typeof TEAM_MODES)[number];

export interface User {
  userId: string;
  externalProvider: string;
  externalSubject: string;
  externalEmail: string | null;
}

export interface Student {
  studentId: string;
  name: string;
  school: string;
  role: string;
  position: string;
  attackType: string;
  defenseType: string;
  rarityBase: number;
  isLimited: boolean;
}

export interface UserStudentProgress {
  userId: string;
  studentId: string;
  level: number;
  rarity: number;
  bondLevel: number;
  exSkillLevel: number;
  normalSkillLevel: number;
  passiveSkillLevel: number;
  subSkillLevel: number;
  equipment1Tier: number;
  equipment2Tier: number;
  equipment3Tier: number;
  uniqueWeaponRank: number;
  uniqueWeaponLevel: number;
  shardsOwned: number;
  shardsUsed: number;
  favoriteGifts: number;
  memo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  teamId: string;
  userId: string;
  name: string;
  mode: TeamMode;
  memo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  teamId: string;
  positionIndex: number;
  studentId: string;
  isSupport: boolean;
}

export interface TeamModeRule {
  mode: TeamMode;
  slotCount: number;
}

export interface ProgressCap {
  key: string;
  minValue: number;
  maxValue: number;
}

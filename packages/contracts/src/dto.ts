export type TeamMode = "raid" | "jfd";

export interface StudentFilter {
  q?: string;
  school?: string;
  role?: string;
  position?: string;
  attackType?: string;
  defenseType?: string;
  isLimited?: boolean;
}

export interface ProgressSummary {
  level: number;
  rarity: number;
  uniqueWeaponRank: number;
}

export interface StudentSummary {
  studentId: string;
  name: string;
  role: string;
  position: string;
  attackType: string;
  defenseType: string;
  rarityBase: number;
  isLimited: boolean;
  progress: ProgressSummary | null;
}

export interface ProgressDetail {
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
}

export interface ProgressPatch {
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

export interface StudentDetail {
  studentId: string;
  name: string;
  school: string;
  role: string;
  position: string;
  attackType: string;
  defenseType: string;
  rarityBase: number;
  isLimited: boolean;
  progress: ProgressDetail | null;
}

export interface TeamSummary {
  teamId: string;
  name: string;
  mode: TeamMode;
  memo: string;
  memberCount: number;
  updatedAt: string;
}

export interface TeamMemberInput {
  studentId: string;
  positionIndex: number;
  isSupport?: boolean;
}

export interface TeamMemberDetail {
  studentId: string;
  positionIndex: number;
  isSupport: boolean;
  studentName: string;
  progress: ProgressSummary | null;
}

export interface TeamDetail {
  teamId: string;
  name: string;
  mode: TeamMode;
  memo: string;
  createdAt: string;
  updatedAt: string;
  members: TeamMemberDetail[];
}

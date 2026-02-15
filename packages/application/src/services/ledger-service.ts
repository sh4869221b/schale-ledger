import type {
  ProgressDetail,
  ProgressPatch,
  ProgressSummary,
  StudentDetail,
  StudentFilter,
  StudentSummary,
  TeamDetail,
  TeamMemberDetail,
  TeamMemberInput,
  TeamSummary
} from "@schale-ledger/contracts";
import type { TeamMode, UserStudentProgress } from "@schale-ledger/domain";
import { ConflictError, InternalError, NotFoundError, ValidationError } from "../errors";
import type { LedgerDependencies } from "../ports";

const DEFAULT_PROGRESS: ProgressDetail = {
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

const EQUIPMENT_KEYS: Array<keyof ProgressDetail> = ["equipment1Tier", "equipment2Tier", "equipment3Tier"];
const SKILL_KEYS: Array<keyof ProgressDetail> = ["exSkillLevel", "normalSkillLevel", "passiveSkillLevel", "subSkillLevel"];

function toProgressSummary(progress: UserStudentProgress): ProgressSummary {
  return {
    level: progress.level,
    rarity: progress.rarity,
    uniqueWeaponRank: progress.uniqueWeaponRank
  };
}

function toProgressDetail(progress: UserStudentProgress): ProgressDetail {
  return {
    level: progress.level,
    rarity: progress.rarity,
    bondLevel: progress.bondLevel,
    exSkillLevel: progress.exSkillLevel,
    normalSkillLevel: progress.normalSkillLevel,
    passiveSkillLevel: progress.passiveSkillLevel,
    subSkillLevel: progress.subSkillLevel,
    equipment1Tier: progress.equipment1Tier,
    equipment2Tier: progress.equipment2Tier,
    equipment3Tier: progress.equipment3Tier,
    uniqueWeaponRank: progress.uniqueWeaponRank,
    uniqueWeaponLevel: progress.uniqueWeaponLevel,
    shardsOwned: progress.shardsOwned,
    shardsUsed: progress.shardsUsed,
    favoriteGifts: progress.favoriteGifts,
    memo: progress.memo
  };
}

export class LedgerService {
  constructor(private readonly deps: LedgerDependencies) {}

  async listStudents(userId: string, filter?: StudentFilter): Promise<StudentSummary[]> {
    const students = await this.deps.studentRepository.list(filter);
    const progresses = await this.deps.progressRepository.listByUserAndStudentIds(
      userId,
      students.map((student) => student.studentId)
    );
    const progressByStudentId = new Map(progresses.map((progress) => [progress.studentId, progress]));

    return students.map((student) => {
      const progress = progressByStudentId.get(student.studentId);
      return {
        studentId: student.studentId,
        name: student.name,
        role: student.role,
        position: student.position,
        attackType: student.attackType,
        defenseType: student.defenseType,
        rarityBase: student.rarityBase,
        isLimited: student.isLimited,
        progress: progress ? toProgressSummary(progress) : null
      };
    });
  }

  async getStudentDetail(userId: string, studentId: string): Promise<StudentDetail> {
    const student = await this.deps.studentRepository.get(studentId);
    if (!student) {
      throw new NotFoundError("対象の生徒が見つかりません", { studentId });
    }

    const progress = await this.deps.progressRepository.get(userId, studentId);

    return {
      studentId: student.studentId,
      name: student.name,
      school: student.school,
      role: student.role,
      position: student.position,
      attackType: student.attackType,
      defenseType: student.defenseType,
      rarityBase: student.rarityBase,
      isLimited: student.isLimited,
      progress: progress ? toProgressDetail(progress) : null
    };
  }

  async upsertStudentProgress(userId: string, studentId: string, patch: ProgressPatch): Promise<StudentDetail> {
    const student = await this.deps.studentRepository.get(studentId);
    if (!student) {
      throw new NotFoundError("対象の生徒が見つかりません", { studentId });
    }

    const current = await this.deps.progressRepository.get(userId, studentId);
    const merged = this.mergeProgress(current ? toProgressDetail(current) : DEFAULT_PROGRESS, patch);
    await this.validateProgress(merged);
    await this.deps.progressRepository.save(userId, studentId, merged);

    return this.getStudentDetail(userId, studentId);
  }

  async listTeams(userId: string, mode?: TeamMode): Promise<TeamSummary[]> {
    const teams = await this.deps.teamRepository.list(userId, mode);
    return teams.map((team) => ({
      teamId: team.teamId,
      name: team.name,
      mode: team.mode,
      memo: team.memo,
      memberCount: team.memberCount,
      updatedAt: team.updatedAt.toISOString()
    }));
  }

  async getTeam(userId: string, teamId: string): Promise<TeamDetail> {
    const team = await this.deps.teamRepository.get(userId, teamId);
    if (!team) {
      throw new NotFoundError("対象の編成が見つかりません", { teamId });
    }

    const members = await this.deps.teamMemberRepository.list(team.teamId);
    const studentIds = members.map((member) => member.studentId);
    const students = await this.deps.studentRepository.getByIds(studentIds);
    const studentMap = new Map(students.map((student) => [student.studentId, student]));
    const progresses = await this.deps.progressRepository.listByUserAndStudentIds(userId, studentIds);
    const progressMap = new Map(progresses.map((progress) => [progress.studentId, progress]));

    const memberDetails: TeamMemberDetail[] = members
      .slice()
      .sort((a, b) => a.positionIndex - b.positionIndex)
      .map((member) => {
        const student = studentMap.get(member.studentId);
        if (!student) {
          throw new InternalError("編成メンバーが存在しない生徒を参照しています", {
            teamId,
            studentId: member.studentId
          });
        }

        return {
          studentId: member.studentId,
          positionIndex: member.positionIndex,
          isSupport: member.isSupport,
          studentName: student.name,
          progress: progressMap.has(member.studentId)
            ? toProgressSummary(progressMap.get(member.studentId) as UserStudentProgress)
            : null
        };
      });

    return {
      teamId: team.teamId,
      name: team.name,
      mode: team.mode,
      memo: team.memo,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
      members: memberDetails
    };
  }

  async replaceTeamMembers(userId: string, teamId: string, members: TeamMemberInput[]): Promise<TeamDetail> {
    const team = await this.deps.teamRepository.get(userId, teamId);
    if (!team) {
      throw new NotFoundError("対象の編成が見つかりません", { teamId });
    }

    const modeRule = await this.deps.teamModeRuleRepository.get(team.mode);
    if (!modeRule) {
      throw new InternalError("編成モード定義が見つかりません", { mode: team.mode });
    }

    this.validateTeamMembers(members, modeRule.slotCount);

    const uniqueStudentIds = Array.from(new Set(members.map((member) => member.studentId)));
    const students = await this.deps.studentRepository.getByIds(uniqueStudentIds);
    if (students.length !== uniqueStudentIds.length) {
      const found = new Set(students.map((student) => student.studentId));
      const missing = uniqueStudentIds.filter((studentId) => !found.has(studentId));
      throw new ValidationError("存在しない生徒IDが含まれています", { missingStudentIds: missing });
    }

    await this.deps.teamMemberRepository.replaceAll(
      team.teamId,
      members.map((member) => ({
        studentId: member.studentId,
        positionIndex: member.positionIndex,
        isSupport: member.isSupport ?? false
      }))
    );

    return this.getTeam(userId, teamId);
  }

  private mergeProgress(base: ProgressDetail, patch: ProgressPatch): ProgressDetail {
    return {
      ...base,
      ...patch,
      memo: patch.memo ?? base.memo
    };
  }

  private async validateProgress(progress: ProgressDetail): Promise<void> {
    const caps = await this.deps.progressCapRepository.listAll();
    const capMap = new Map(caps.map((cap) => [cap.key, cap]));

    this.validateRangeWithCap("level", progress.level, capMap);
    this.validateRangeWithCap("rarity", progress.rarity, capMap);
    this.validateRangeWithCap("bondLevel", progress.bondLevel, capMap);
    this.validateRangeWithCap("uniqueWeaponRank", progress.uniqueWeaponRank, capMap);
    this.validateRangeWithCap("uniqueWeaponLevel", progress.uniqueWeaponLevel, capMap);
    this.validateRangeWithCap("shards", progress.shardsOwned, capMap);
    this.validateRangeWithCap("shards", progress.shardsUsed, capMap);
    this.validateRangeWithCap("favoriteGifts", progress.favoriteGifts, capMap);

    for (const key of SKILL_KEYS) {
      this.validateRangeWithCap(key, progress[key] as number, capMap);
    }

    for (const key of EQUIPMENT_KEYS) {
      this.validateRangeWithCap("equipmentTier", progress[key] as number, capMap);
    }

    if (progress.shardsUsed > progress.shardsOwned) {
      throw new ValidationError("使用済み神名文字数は所持数を超えられません", {
        shardsOwned: progress.shardsOwned,
        shardsUsed: progress.shardsUsed
      });
    }

    if (progress.memo.length > 1000) {
      throw new ValidationError("メモは1000文字以内で入力してください", {
        maxLength: 1000
      });
    }
  }

  private validateRangeWithCap(
    key: string,
    value: number,
    caps: Map<string, { minValue: number; maxValue: number }>
  ): void {
    if (!Number.isInteger(value)) {
      throw new ValidationError("数値項目は整数で指定してください", {
        key,
        value
      });
    }

    const cap = caps.get(key);
    if (!cap) {
      throw new InternalError("進捗上限定義が不足しています", { key });
    }

    if (value < cap.minValue || value > cap.maxValue) {
      throw new ValidationError("入力値が許容範囲外です", {
        key,
        min: cap.minValue,
        max: cap.maxValue,
        value
      });
    }
  }

  private validateTeamMembers(members: TeamMemberInput[], slotCount: number): void {
    if (members.length > slotCount) {
      throw new ValidationError("編成メンバー数がスロット上限を超えています", {
        slotCount,
        count: members.length
      });
    }

    const positionSet = new Set<number>();
    const studentSet = new Set<string>();

    for (const member of members) {
      if (!Number.isInteger(member.positionIndex)) {
        throw new ValidationError("positionIndex は整数で指定してください", {
          positionIndex: member.positionIndex
        });
      }

      if (member.positionIndex < 0 || member.positionIndex >= slotCount) {
        throw new ValidationError("positionIndex が許容範囲外です", {
          positionIndex: member.positionIndex,
          slotCount
        });
      }

      if (positionSet.has(member.positionIndex)) {
        throw new ConflictError("positionIndex が重複しています", {
          positionIndex: member.positionIndex
        });
      }
      positionSet.add(member.positionIndex);

      if (studentSet.has(member.studentId)) {
        throw new ConflictError("同一生徒を複数スロットに配置できません", {
          studentId: member.studentId
        });
      }
      studentSet.add(member.studentId);
    }
  }
}

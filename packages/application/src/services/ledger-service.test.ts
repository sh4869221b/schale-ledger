import { describe, expect, it } from "bun:test";
import { ConflictError, ValidationError } from "../errors";
import { LedgerService } from "./ledger-service";
import type { LedgerDependencies } from "../ports";

function createDependencies(): LedgerDependencies {
  const students = [
    {
      studentId: "S0001",
      name: "アリス",
      school: "ミレニアム",
      role: "Dealer",
      position: "Back",
      attackType: "Mystic",
      defenseType: "Light",
      rarityBase: 3,
      isLimited: false
    }
  ];

  return {
    userRepository: {
      findByExternalIdentity: async () => null,
      create: async () => {
        throw new Error("not used");
      }
    },
    studentRepository: {
      list: async () => students,
      get: async (studentId) => students.find((student) => student.studentId === studentId) ?? null,
      getByIds: async (studentIds) => students.filter((student) => studentIds.includes(student.studentId))
    },
    progressRepository: {
      get: async () => null,
      listByUserAndStudentIds: async () => [],
      save: async (_userId, studentId, data) => ({
        userId: "U1",
        studentId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    },
    teamRepository: {
      list: async () => [],
      get: async () => ({
        teamId: "T1",
        userId: "U1",
        name: "テスト",
        mode: "raid",
        memo: "",
        createdAt: new Date(),
        updatedAt: new Date()
      })
    },
    teamMemberRepository: {
      list: async () => [],
      replaceAll: async (_teamId, members) =>
        members.map((member) => ({
          teamId: "T1",
          positionIndex: member.positionIndex,
          studentId: member.studentId,
          isSupport: member.isSupport ?? false
        }))
    },
    teamModeRuleRepository: {
      get: async () => ({
        mode: "raid",
        slotCount: 6
      })
    },
    progressCapRepository: {
      listAll: async () => [
        { key: "level", minValue: 1, maxValue: 100 },
        { key: "rarity", minValue: 1, maxValue: 8 },
        { key: "bondLevel", minValue: 1, maxValue: 100 },
        { key: "exSkillLevel", minValue: 1, maxValue: 10 },
        { key: "normalSkillLevel", minValue: 1, maxValue: 10 },
        { key: "passiveSkillLevel", minValue: 1, maxValue: 10 },
        { key: "subSkillLevel", minValue: 1, maxValue: 10 },
        { key: "equipmentTier", minValue: 0, maxValue: 10 },
        { key: "uniqueWeaponRank", minValue: 0, maxValue: 5 },
        { key: "uniqueWeaponLevel", minValue: 0, maxValue: 100 },
        { key: "shards", minValue: 0, maxValue: 9999 },
        { key: "favoriteGifts", minValue: 0, maxValue: 999 }
      ]
    }
  };
}

describe("LedgerService", () => {
  it("replaceTeamMembers は positionIndex 重複時に ConflictError", async () => {
    const service = new LedgerService(createDependencies());

    await expect(
      service.replaceTeamMembers("U1", "T1", [
        { studentId: "S0001", positionIndex: 0 },
        { studentId: "S0001", positionIndex: 0 }
      ])
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("upsertStudentProgress は範囲外 level を拒否", async () => {
    const service = new LedgerService(createDependencies());

    await expect(
      service.upsertStudentProgress("U1", "S0001", {
        level: 999
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

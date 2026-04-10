import { createProgressRepository, createStudentsRepository, type createDb } from "@schale-ledger/db";
import { error } from "@sveltejs/kit";

type Database = ReturnType<typeof createDb>;

export async function getStudentDetail(db: Database, userId: string, studentId: string) {
  const studentRepository = createStudentsRepository(db);
  const progressRepository = createProgressRepository(db);

  const [student, progress] = await Promise.all([
    studentRepository.get(studentId),
    progressRepository.get(userId, studentId)
  ]);

  if (!student) {
    throw error(404, "Student not found");
  }

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
    progress: progress
      ? {
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
        }
      : null
  };
}

import { sortStudentsByName } from "@schale-ledger/core";
import { createProgressRepository, createStudentsRepository, type createDb } from "@schale-ledger/db";

type Database = ReturnType<typeof createDb>;

export interface StudentListQuery {
  q?: string;
  school?: string;
  role?: string;
  position?: string;
  page?: number;
}

interface StudentListInput {
  query: StudentListQuery;
  total: number;
  students: Array<{
    studentId: string;
    name: string;
    school: string;
    role: string;
    position: string;
    attackType: string;
    defenseType: string;
    rarityBase: number;
    isLimited: boolean;
    progress?: { level: number; rarity: number; uniqueWeaponRank: number } | null;
  }>;
}

const PAGE_SIZE = 24;

function normalizePage(value: number | undefined) {
  if (!Number.isFinite(value) || !value || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

export function buildStudentPagination(page: number, pageCount: number) {
  return {
    previousPage: page > 1 ? page - 1 : null,
    nextPage: page < pageCount ? page + 1 : null
  };
}

export function toStudentListModel(input: StudentListInput) {
  const total = input.total;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(normalizePage(input.query.page), pageCount);
  const paginationLinks = buildStudentPagination(page, pageCount);

  return {
    query: {
      q: input.query.q ?? "",
      school: input.query.school ?? "",
      role: input.query.role ?? "",
      position: input.query.position ?? "",
      page
    },
    filters: {
      school: input.query.school ?? "",
      role: input.query.role ?? "",
      position: input.query.position ?? ""
    },
    pagination: {
      page,
      pageCount,
      total,
      previousPage: paginationLinks.previousPage,
      nextPage: paginationLinks.nextPage
    },
    students: input.students
  };
}

function includesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export async function getStudents(db: Database, userId: string, query: StudentListQuery) {
  const studentRepository = createStudentsRepository(db);
  const progressRepository = createProgressRepository(db);

  const [students, progresses] = await Promise.all([studentRepository.list(), progressRepository.listByUser(userId)]);
  const progressMap = new Map(progresses.map((progress) => [progress.studentId, progress]));

  const filtered = sortStudentsByName(students)
    .filter((student) => (query.q ? includesQuery(student.name, query.q) : true))
    .filter((student) => (query.school ? student.school === query.school : true))
    .filter((student) => (query.role ? student.role === query.role : true))
    .filter((student) => (query.position ? student.position === query.position : true))
    .map((student) => {
      const progress = progressMap.get(student.studentId);

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
              uniqueWeaponRank: progress.uniqueWeaponRank
            }
          : null
      };
    });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(normalizePage(query.page), pageCount);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return toStudentListModel({
    query: { ...query, page },
    total: filtered.length,
    students: pageItems
  });
}

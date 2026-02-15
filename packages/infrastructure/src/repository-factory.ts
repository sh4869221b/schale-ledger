import type {
  ExternalIdentity,
  ProgressCapRepository,
  StudentRepository,
  TeamMemberRepository,
  TeamModeRuleRepository,
  TeamRepository,
  UserRepository,
  UserStudentProgressRepository
} from "@schale-ledger/application";
import type { ProgressDetail, StudentFilter, TeamMemberInput } from "@schale-ledger/contracts";
import type { ProgressCap, Student, Team, TeamMember, TeamMode, TeamModeRule, User, UserStudentProgress } from "@schale-ledger/domain";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  progressCaps,
  students,
  teamMembers,
  teamModeRules,
  teams,
  users,
  userStudentProgress
} from "../../../db/schema";

export interface InfrastructureOptions {
  connectionString: string;
}

type Database = NodePgDatabase<typeof schema>;

const poolCache = new Map<string, Pool>();

function getPool(connectionString: string): Pool {
  const cached = poolCache.get(connectionString);
  if (cached) {
    return cached;
  }

  const pool = new Pool({ connectionString });
  poolCache.set(connectionString, pool);
  return pool;
}

function getDb(connectionString: string): Database {
  const pool = getPool(connectionString);
  return drizzle(pool, { schema });
}

function mapStudent(row: typeof students.$inferSelect): Student {
  return {
    studentId: row.studentId,
    name: row.name,
    school: row.school,
    role: row.role,
    position: row.position,
    attackType: row.attackType,
    defenseType: row.defenseType,
    rarityBase: row.rarityBase,
    isLimited: row.isLimited
  };
}

function mapProgress(row: typeof userStudentProgress.$inferSelect): UserStudentProgress {
  return {
    userId: row.userId,
    studentId: row.studentId,
    level: row.level,
    rarity: row.rarity,
    bondLevel: row.bondLevel,
    exSkillLevel: row.exSkillLevel,
    normalSkillLevel: row.normalSkillLevel,
    passiveSkillLevel: row.passiveSkillLevel,
    subSkillLevel: row.subSkillLevel,
    equipment1Tier: row.equipment1Tier,
    equipment2Tier: row.equipment2Tier,
    equipment3Tier: row.equipment3Tier,
    uniqueWeaponRank: row.uniqueWeaponRank,
    uniqueWeaponLevel: row.uniqueWeaponLevel,
    shardsOwned: row.shardsOwned,
    shardsUsed: row.shardsUsed,
    favoriteGifts: row.favoriteGifts,
    memo: row.memo,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function mapTeam(row: typeof teams.$inferSelect): Team {
  return {
    teamId: row.id,
    userId: row.userId,
    name: row.name,
    mode: row.mode as TeamMode,
    memo: row.memo,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function mapTeamMember(row: typeof teamMembers.$inferSelect): TeamMember {
  return {
    teamId: row.teamId,
    positionIndex: row.positionIndex,
    studentId: row.studentId,
    isSupport: row.isSupport
  };
}

class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findByExternalIdentity(identity: ExternalIdentity): Promise<User | null> {
    const row = await this.db.query.users.findFirst({
      where: and(
        eq(users.externalProvider, identity.provider),
        eq(users.externalSubject, identity.subject)
      )
    });

    if (!row) {
      return null;
    }

    return {
      userId: row.id,
      externalProvider: row.externalProvider,
      externalSubject: row.externalSubject,
      externalEmail: row.externalEmail
    };
  }

  async create(identity: ExternalIdentity): Promise<User> {
    const [row] = await this.db
      .insert(users)
      .values({
        externalProvider: identity.provider,
        externalSubject: identity.subject,
        externalEmail: identity.email,
        updatedAt: new Date()
      })
      .returning();

    return {
      userId: row.id,
      externalProvider: row.externalProvider,
      externalSubject: row.externalSubject,
      externalEmail: row.externalEmail
    };
  }
}

class DrizzleStudentRepository implements StudentRepository {
  constructor(private readonly db: Database) {}

  async list(filter?: StudentFilter): Promise<Student[]> {
    const conditions = [];

    if (filter?.q) {
      conditions.push(or(ilike(students.name, `%${filter.q}%`), ilike(students.studentId, `%${filter.q}%`)));
    }
    if (filter?.school) {
      conditions.push(eq(students.school, filter.school));
    }
    if (filter?.role) {
      conditions.push(eq(students.role, filter.role));
    }
    if (filter?.position) {
      conditions.push(eq(students.position, filter.position));
    }
    if (filter?.attackType) {
      conditions.push(eq(students.attackType, filter.attackType));
    }
    if (filter?.defenseType) {
      conditions.push(eq(students.defenseType, filter.defenseType));
    }
    if (typeof filter?.isLimited === "boolean") {
      conditions.push(eq(students.isLimited, filter.isLimited));
    }

    const rows = await this.db
      .select()
      .from(students)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(students.studentId);

    return rows.map(mapStudent);
  }

  async get(studentId: string): Promise<Student | null> {
    const row = await this.db.query.students.findFirst({
      where: eq(students.studentId, studentId)
    });

    return row ? mapStudent(row) : null;
  }

  async getByIds(studentIds: string[]): Promise<Student[]> {
    if (studentIds.length === 0) {
      return [];
    }

    const rows = await this.db
      .select()
      .from(students)
      .where(inArray(students.studentId, studentIds));

    return rows.map(mapStudent);
  }
}

class DrizzleProgressRepository implements UserStudentProgressRepository {
  constructor(private readonly db: Database) {}

  async get(userId: string, studentId: string): Promise<UserStudentProgress | null> {
    const row = await this.db.query.userStudentProgress.findFirst({
      where: and(eq(userStudentProgress.userId, userId), eq(userStudentProgress.studentId, studentId))
    });

    return row ? mapProgress(row) : null;
  }

  async listByUserAndStudentIds(userId: string, studentIds: string[]): Promise<UserStudentProgress[]> {
    if (studentIds.length === 0) {
      return [];
    }

    const rows = await this.db
      .select()
      .from(userStudentProgress)
      .where(and(eq(userStudentProgress.userId, userId), inArray(userStudentProgress.studentId, studentIds)));

    return rows.map(mapProgress);
  }

  async save(userId: string, studentId: string, data: ProgressDetail): Promise<UserStudentProgress> {
    const now = new Date();

    const [row] = await this.db
      .insert(userStudentProgress)
      .values({
        userId,
        studentId,
        level: data.level,
        rarity: data.rarity,
        bondLevel: data.bondLevel,
        exSkillLevel: data.exSkillLevel,
        normalSkillLevel: data.normalSkillLevel,
        passiveSkillLevel: data.passiveSkillLevel,
        subSkillLevel: data.subSkillLevel,
        equipment1Tier: data.equipment1Tier,
        equipment2Tier: data.equipment2Tier,
        equipment3Tier: data.equipment3Tier,
        uniqueWeaponRank: data.uniqueWeaponRank,
        uniqueWeaponLevel: data.uniqueWeaponLevel,
        shardsOwned: data.shardsOwned,
        shardsUsed: data.shardsUsed,
        favoriteGifts: data.favoriteGifts,
        memo: data.memo,
        updatedAt: now
      })
      .onConflictDoUpdate({
        target: [userStudentProgress.userId, userStudentProgress.studentId],
        set: {
          level: data.level,
          rarity: data.rarity,
          bondLevel: data.bondLevel,
          exSkillLevel: data.exSkillLevel,
          normalSkillLevel: data.normalSkillLevel,
          passiveSkillLevel: data.passiveSkillLevel,
          subSkillLevel: data.subSkillLevel,
          equipment1Tier: data.equipment1Tier,
          equipment2Tier: data.equipment2Tier,
          equipment3Tier: data.equipment3Tier,
          uniqueWeaponRank: data.uniqueWeaponRank,
          uniqueWeaponLevel: data.uniqueWeaponLevel,
          shardsOwned: data.shardsOwned,
          shardsUsed: data.shardsUsed,
          favoriteGifts: data.favoriteGifts,
          memo: data.memo,
          updatedAt: now
        }
      })
      .returning();

    return mapProgress(row);
  }
}

class DrizzleTeamRepository implements TeamRepository {
  constructor(private readonly db: Database) {}

  async list(userId: string, mode?: TeamMode): Promise<Array<Team & { memberCount: number }>> {
    const rows = await this.db
      .select({
        id: teams.id,
        userId: teams.userId,
        name: teams.name,
        mode: teams.mode,
        memo: teams.memo,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
        memberCount: sql<number>`count(${teamMembers.teamId})`
      })
      .from(teams)
      .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
      .where(mode ? and(eq(teams.userId, userId), eq(teams.mode, mode)) : eq(teams.userId, userId))
      .groupBy(teams.id)
      .orderBy(desc(teams.updatedAt));

    return rows.map((row) => ({
      teamId: row.id,
      userId: row.userId,
      name: row.name,
      mode: row.mode as TeamMode,
      memo: row.memo,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      memberCount: Number(row.memberCount)
    }));
  }

  async get(userId: string, teamId: string): Promise<Team | null> {
    const row = await this.db.query.teams.findFirst({
      where: and(eq(teams.id, teamId), eq(teams.userId, userId))
    });

    return row ? mapTeam(row) : null;
  }
}

class DrizzleTeamMemberRepository implements TeamMemberRepository {
  constructor(private readonly db: Database) {}

  async list(teamId: string): Promise<TeamMember[]> {
    const rows = await this.db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.teamId, teamId))
      .orderBy(teamMembers.positionIndex);

    return rows.map(mapTeamMember);
  }

  async replaceAll(teamId: string, members: TeamMemberInput[]): Promise<TeamMember[]> {
    return this.db.transaction(async (tx) => {
      await tx.delete(teamMembers).where(eq(teamMembers.teamId, teamId));

      if (members.length === 0) {
        return [];
      }

      const inserted = await tx
        .insert(teamMembers)
        .values(
          members.map((member) => ({
            teamId,
            positionIndex: member.positionIndex,
            studentId: member.studentId,
            isSupport: member.isSupport ?? false,
            updatedAt: new Date()
          }))
        )
        .returning();

      return inserted.map(mapTeamMember);
    });
  }
}

class DrizzleTeamModeRuleRepository implements TeamModeRuleRepository {
  constructor(private readonly db: Database) {}

  async get(mode: TeamMode): Promise<TeamModeRule | null> {
    const row = await this.db.query.teamModeRules.findFirst({
      where: eq(teamModeRules.mode, mode)
    });

    if (!row) {
      return null;
    }

    return {
      mode: row.mode as TeamMode,
      slotCount: row.slotCount
    };
  }
}

class DrizzleProgressCapRepository implements ProgressCapRepository {
  constructor(private readonly db: Database) {}

  async listAll(): Promise<ProgressCap[]> {
    const rows = await this.db.select().from(progressCaps);
    return rows.map((row) => ({
      key: row.key,
      minValue: row.minValue,
      maxValue: row.maxValue
    }));
  }
}

export interface Infrastructure {
  userRepository: UserRepository;
  studentRepository: StudentRepository;
  progressRepository: UserStudentProgressRepository;
  teamRepository: TeamRepository;
  teamMemberRepository: TeamMemberRepository;
  teamModeRuleRepository: TeamModeRuleRepository;
  progressCapRepository: ProgressCapRepository;
}

export function createInfrastructure(options: InfrastructureOptions): Infrastructure {
  const db = getDb(options.connectionString);

  return {
    userRepository: new DrizzleUserRepository(db),
    studentRepository: new DrizzleStudentRepository(db),
    progressRepository: new DrizzleProgressRepository(db),
    teamRepository: new DrizzleTeamRepository(db),
    teamMemberRepository: new DrizzleTeamMemberRepository(db),
    teamModeRuleRepository: new DrizzleTeamModeRuleRepository(db),
    progressCapRepository: new DrizzleProgressCapRepository(db)
  };
}

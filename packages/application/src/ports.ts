import type {
  ProgressCap,
  Student,
  Team,
  TeamMember,
  TeamMode,
  TeamModeRule,
  User,
  UserStudentProgress
} from "@schale-ledger/domain";
import type { ProgressDetail, ProgressPatch, StudentFilter, TeamMemberInput } from "@schale-ledger/contracts";

export interface ExternalIdentity {
  provider: string;
  subject: string;
  email: string | null;
}

export interface UserRepository {
  findByExternalIdentity(identity: ExternalIdentity): Promise<User | null>;
  create(identity: ExternalIdentity): Promise<User>;
}

export interface StudentRepository {
  list(filter?: StudentFilter): Promise<Student[]>;
  get(studentId: string): Promise<Student | null>;
  getByIds(studentIds: string[]): Promise<Student[]>;
}

export interface UserStudentProgressRepository {
  get(userId: string, studentId: string): Promise<UserStudentProgress | null>;
  listByUserAndStudentIds(userId: string, studentIds: string[]): Promise<UserStudentProgress[]>;
  save(userId: string, studentId: string, data: ProgressDetail): Promise<UserStudentProgress>;
}

export interface TeamRepository {
  list(userId: string, mode?: TeamMode): Promise<Array<Team & { memberCount: number }>>;
  get(userId: string, teamId: string): Promise<Team | null>;
}

export interface TeamMemberRepository {
  list(teamId: string): Promise<TeamMember[]>;
  replaceAll(teamId: string, members: TeamMemberInput[]): Promise<TeamMember[]>;
}

export interface TeamModeRuleRepository {
  get(mode: TeamMode): Promise<TeamModeRule | null>;
}

export interface ProgressCapRepository {
  listAll(): Promise<ProgressCap[]>;
}

export interface LedgerDependencies {
  userRepository: UserRepository;
  studentRepository: StudentRepository;
  progressRepository: UserStudentProgressRepository;
  teamRepository: TeamRepository;
  teamMemberRepository: TeamMemberRepository;
  teamModeRuleRepository: TeamModeRuleRepository;
  progressCapRepository: ProgressCapRepository;
}

export interface UpsertStudentProgressInput {
  userId: string;
  studentId: string;
  patch: ProgressPatch;
}

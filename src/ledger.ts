import {
  conflict, invalid, missing, object, progressFields, progressKeys, progressPatch, revisionId,
  studentFilters, studentId, teamFilters, teamId, teamMembers, teamMetadata,
} from './rules';
import type { Member, Mode, ProgressValues } from './rules';

export interface Student {
  id: string;
  name: string;
  reading: string;
  school: string;
  role: string | null;
  position: string | null;
  attackType: string | null;
  defenseType: string | null;
  baseRarity: number | null;
  isLimited: boolean | null;
}

type StudentRow = Omit<Student, 'isLimited'> & { isLimited: number | null };
type SummaryRow = StudentRow & { updatedAt: string | null; level: number | null; rarity: number | null };
export type StudentSummary = Student & { progress: Pick<ProgressValues, 'level' | 'rarity'> | null };
export type StudentDetail = Student & { progress: (ProgressValues & { updatedAt: string }) | null };

interface TeamInfo {
  id: string;
  name: string;
  mode: Mode;
  memo: string | null;
  revision: string;
  createdAt: string;
  updatedAt: string;
}
export type TeamSummary = TeamInfo & { memberCount: number };
export type TeamDetail = TeamInfo & { members: (Member & { name: string; school: string })[] };
type TeamRow = TeamInfo & {
  positionIndex: number | null;
  studentId: string | null;
  studentName: string | null;
  studentSchool: string | null;
  isSupport: number | null;
};

const studentColumns = `s.id, s.name, s.reading, s.school, s.role, s.position, s.attack_type AS attackType,
  s.defense_type AS defenseType, s.base_rarity AS baseRarity, s.is_limited AS isLimited`;
const progressColumns = progressKeys.map(key => `p.${progressFields[key].column} AS "${key}"`).join(', ');
const teamColumns = `t.id, t.name, t.mode, t.memo, t.revision, t.created_at AS createdAt, t.updated_at AS updatedAt`;
const teamDetailSql = `SELECT ${teamColumns}, m.position_index AS positionIndex, m.student_id AS studentId,
  m.is_support AS isSupport, s.name AS studentName, s.school AS studentSchool
  FROM teams t LEFT JOIN team_slots m ON m.team_id=t.id LEFT JOIN students s ON s.id=m.student_id
  WHERE t.account_id=? AND t.id=? ORDER BY m.position_index`;

function studentOf(row: StudentRow): Student {
  return { id: row.id, name: row.name, reading: row.reading, school: row.school, role: row.role, position: row.position,
    attackType: row.attackType, defenseType: row.defenseType, baseRarity: row.baseRarity,
    isLimited: row.isLimited === null ? null : row.isLimited === 1 };
}

type DetailRow = StudentRow & ProgressValues & { updatedAt: string | null };
function studentDetailOf(row?: DetailRow): StudentDetail {
  if (!row) throw missing();
  if (row.updatedAt === null) return { ...studentOf(row), progress: null };
  const numbers = Object.fromEntries(progressKeys.map(key => [key, row[key]])) as Pick<ProgressValues, typeof progressKeys[number]>;
  return { ...studentOf(row), progress: { ...numbers, memo: row.memo, updatedAt: row.updatedAt } };
}

function teamOf(rows: TeamRow[]): TeamDetail {
  const first = rows[0];
  if (!first) throw missing();
  const { id, name, mode, memo, revision, createdAt, updatedAt } = first;
  const members = rows.flatMap(row => row.positionIndex === null || row.studentId === null ||
    row.studentName === null || row.studentSchool === null ? [] : [{
      positionIndex: row.positionIndex, studentId: row.studentId, name: row.studentName,
      school: row.studentSchool, isSupport: row.isSupport === 1,
    }]);
  return { id, name, mode, memo, revision, createdAt, updatedAt, members };
}

function searchable(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g, character =>
    String.fromCharCode(character.charCodeAt(0) - 0x60)).replace(/\s+/g, '');
}

export class Ledger {
  constructor(private readonly db: D1Database, private readonly accountId: string) {}

  async stats() {
    return await this.db.prepare(`SELECT (SELECT count(*) FROM students) AS students,
      (SELECT count(*) FROM progress WHERE account_id=?) AS recorded,
      (SELECT count(*) FROM teams WHERE account_id=?) AS teams`).bind(this.accountId, this.accountId)
      .first<{ students: number; recorded: number; teams: number }>();
  }

  async schools() {
    const { results } = await this.db.prepare('SELECT DISTINCT school FROM students ORDER BY school').all<{ school: string }>();
    return results.map(row => row.school);
  }

  async listStudents(input: unknown): Promise<StudentSummary[]> {
    const filters = studentFilters(input);
    const clauses: string[] = [];
    const args: (string | number)[] = [this.accountId];
    const columns = { school: 'school', role: 'role', position: 'position', attackType: 'attack_type', defenseType: 'defense_type' } as const;
    for (const key of Object.keys(columns) as (keyof typeof columns)[]) {
      if (filters[key] !== undefined) {
        clauses.push(`s.${columns[key]}=?`);
        args.push(filters[key]);
      }
    }
    if (filters.isLimited) {
      clauses.push('s.is_limited=?');
      args.push(filters.isLimited === 'yes' ? 1 : 0);
    }
    if (filters.state) clauses.push(filters.state === 'recorded' ? 'p.student_id IS NOT NULL' : 'p.student_id IS NULL');
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { results } = await this.db.prepare(`SELECT ${studentColumns}, p.level, p.rarity, p.updated_at AS updatedAt
      FROM students s LEFT JOIN progress p ON p.student_id=s.id AND p.account_id=?
      ${where} ORDER BY s.reading, s.id`).bind(...args).all<SummaryRow>();
    const query = searchable(filters.q ?? '');
    return results.filter(row => !query || [row.name, row.reading, row.id].some(value => searchable(value).includes(query)))
      .map(row => ({ ...studentOf(row), progress: row.updatedAt === null ? null : { level: row.level, rarity: row.rarity } }));
  }

  private studentQuery(id: string) {
    return this.db.prepare(`SELECT ${studentColumns}, ${progressColumns}, p.memo, p.updated_at AS updatedAt
      FROM students s LEFT JOIN progress p ON p.student_id=s.id AND p.account_id=? WHERE s.id=?`).bind(this.accountId, id);
  }

  async getStudent(value: unknown): Promise<StudentDetail> {
    return studentDetailOf(await this.studentQuery(studentId(value)).first<DetailRow>() ?? undefined);
  }

  private ensureAccount() {
    return this.db.prepare('INSERT INTO accounts(id) VALUES(?) ON CONFLICT(id) DO NOTHING').bind(this.accountId);
  }

  async saveProgress(value: unknown, input: unknown): Promise<StudentDetail> {
    const id = studentId(value);
    const patch = progressPatch(input);
    const fields = progressKeys.filter(key => Object.hasOwn(patch, key));
    const columns: string[] = fields.map(key => progressFields[key].column);
    const values: (number | string | null | undefined)[] = fields.map(key => patch[key]);
    if (Object.hasOwn(patch, 'memo')) {
      columns.push('memo');
      values.push(patch.memo);
    }
    const assignments = columns.map(column => `${column}=excluded.${column}`).join(', ');
    const changed = columns.map(column => `progress.${column} IS NOT excluded.${column}`).join(' OR ');
    const write = this.db.prepare(`INSERT INTO progress(account_id, student_id, updated_at, ${columns.join(', ')})
      SELECT ?, s.id, ?, ${columns.map(() => '?').join(', ')} FROM students s WHERE s.id=?
      ON CONFLICT(account_id, student_id) DO UPDATE SET updated_at=excluded.updated_at, ${assignments}
      WHERE ${changed}`).bind(this.accountId, new Date().toISOString(), ...values, id);
    const [, , detail] = await this.db.batch<DetailRow>([this.ensureAccount(), write, this.studentQuery(id)]);
    return studentDetailOf(detail.results[0]);
  }

  async listTeams(input: unknown, limit = -1): Promise<TeamSummary[]> {
    const mode = teamFilters(input);
    const args = mode ? [this.accountId, mode, limit] : [this.accountId, limit];
    const { results } = await this.db.prepare(`SELECT ${teamColumns},
      (SELECT count(*) FROM team_slots WHERE team_id=t.id) AS memberCount
      FROM teams t WHERE t.account_id=? ${mode ? 'AND t.mode=?' : ''}
      ORDER BY t.updated_at DESC,t.id LIMIT ?`).bind(...args).all<TeamSummary>();
    return results;
  }

  async getTeam(value: unknown): Promise<TeamDetail> {
    const id = teamId(value);
    const { results } = await this.db.prepare(teamDetailSql).bind(this.accountId, id).all<TeamRow>();
    return teamOf(results);
  }

  async createTeam(input: unknown): Promise<TeamDetail> {
    const values = teamMetadata(input);
    const id = crypto.randomUUID();
    const revision = crypto.randomUUID();
    const now = new Date().toISOString();
    await this.db.batch([this.ensureAccount(),
      this.db.prepare(`INSERT INTO teams(id, account_id, name, mode, memo, revision, created_at, updated_at)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, this.accountId, values.name, values.mode, values.memo, revision, now, now)]);
    return { id, ...values, revision, createdAt: now, updatedAt: now, members: [] };
  }

  async saveTeam(value: unknown, input: unknown): Promise<TeamDetail> {
    const data = object(input, ['name', 'mode', 'memo', 'revision', 'members']);
    const revision = revisionId(data.revision);
    const members = teamMembers(data.members);
    const existing = await this.getTeam(value);
    const values = teamMetadata({ name: data.name, mode: data.mode, memo: data.memo ?? null });
    const sameMembers = existing.members.length === members.length && existing.members.every((member, index) =>
      member.positionIndex === members[index].positionIndex && member.studentId === members[index].studentId &&
      member.isSupport === members[index].isSupport);
    if (sameMembers && existing.name === values.name && existing.mode === values.mode && existing.memo === values.memo) return existing;
    if (existing.revision !== revision) throw conflict();
    if (members.length) {
      const ids = [...new Set(members.map(member => member.studentId))];
      const { results } = await this.db.prepare(`SELECT id FROM students WHERE id IN (${ids.map(() => '?').join(', ')})`)
        .bind(...ids).all<{ id: string }>();
      if (results.length !== ids.length) throw invalid('編成に収録されていない生徒が指定されています。', 'members');
    }

    const id = existing.id;
    const next = crypto.randomUUID();
    const owner = [id, this.accountId, next];
    const update = this.db.prepare(`UPDATE teams SET name=?, mode=?, memo=?, revision=?, updated_at=?
      WHERE id=? AND account_id=? AND revision=?`)
      .bind(values.name, values.mode, values.memo, next, new Date().toISOString(), id, this.accountId, revision);
    const remove = this.db.prepare(`DELETE FROM team_slots WHERE team_id=(SELECT id FROM teams
      WHERE id=? AND account_id=? AND revision=?)`).bind(...owner);
    const inserts = members.map(member => this.db.prepare(`INSERT INTO team_slots(team_id, position_index, student_id, is_support)
      SELECT id, ?, ?, ? FROM teams WHERE id=? AND account_id=? AND revision=?`)
      .bind(member.positionIndex, member.studentId, Number(member.isSupport), ...owner));
    const results = await this.db.batch<TeamRow>([update, remove, ...inserts,
      this.db.prepare(teamDetailSql).bind(this.accountId, id)]);
    if (!results[0].meta.changes) {
      if (!results.at(-1)?.results.length) throw missing();
      throw conflict();
    }
    return teamOf(results.at(-1)?.results ?? []);
  }
}

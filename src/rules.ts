export class LedgerError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, string>,
  ) {
    super(message);
  }
}

export const invalid = (message: string, field?: string) =>
  new LedgerError(400, 'VALIDATION_ERROR', message, field ? { field } : undefined);
export const missing = () => new LedgerError(404, 'NOT_FOUND', '指定された項目が見つかりません。');
export const conflict = () => new LedgerError(409, 'CONFLICT', '別の画面で編成が更新されました。最新の編成を確認してください。');
export const unauthenticated = () => new LedgerError(401, 'AUTHENTICATION_REQUIRED', 'Cloudflare Access でログインしてください。');

export const modes = { raid: '総力戦', jfd: '合同火力演習' };
export const roles = { dealer: 'アタッカー', tank: 'タンク', support: 'サポーター', heal: 'ヒーラー', tactical: 'T.S.' };
export const positions = { front: '前衛', middle: '中衛', back: '後衛' };
export const attacks = { explosive: '爆発', piercing: '貫通', mystic: '神秘', sonic: '振動' };
export const defenses = { light: '軽装備', heavy: '重装甲', special: '特殊装甲', elastic: '弾力装甲' };
export const limitedValues = { yes: '限定募集', no: '限定募集以外' };
export const progressStates = { recorded: '登録済み', unrecorded: '未登録' };

export const progressFields = {
  level: { column: 'level', label: 'レベル', min: 1, max: 150 },
  rarity: { column: 'rarity', label: '星', min: 1, max: 5 },
  bondLevel: { column: 'bond_level', label: '絆ランク', min: 1, max: 100 },
  exSkillLevel: { column: 'ex_skill_level', label: 'EXスキル', min: 1, max: 5 },
  normalSkillLevel: { column: 'normal_skill_level', label: 'ノーマルスキル', min: 1, max: 10 },
  passiveSkillLevel: { column: 'passive_skill_level', label: 'パッシブスキル', min: 1, max: 10 },
  subSkillLevel: { column: 'sub_skill_level', label: 'サブスキル', min: 1, max: 10 },
  equipment1Tier: { column: 'equipment_1_tier', label: '装備 1', min: 0, max: 15 },
  equipment2Tier: { column: 'equipment_2_tier', label: '装備 2', min: 0, max: 15 },
  equipment3Tier: { column: 'equipment_3_tier', label: '装備 3', min: 0, max: 15 },
  uniqueWeaponRank: { column: 'unique_weapon_rank', label: '固有武器の星', min: 0, max: 5 },
  uniqueWeaponLevel: { column: 'unique_weapon_level', label: '固有武器のLv', min: 0, max: 100 },
  shardsOwned: { column: 'shards_owned', label: '所持神名文字', min: 0, max: 99999 },
  shardsUsed: { column: 'shards_used', label: '使用済み神名文字', min: 0, max: 99999 },
  favoriteGifts: { column: 'favorite_gifts', label: '贈り物', min: 0, max: 99999 },
} as const;

export type ProgressField = keyof typeof progressFields;
export const progressKeys = Object.keys(progressFields) as ProgressField[];
export type ProgressValues = Record<ProgressField, number | null> & { memo: string | null };
export type ProgressPatch = Partial<ProgressValues>;
export type Mode = keyof typeof modes;

export function object(value: unknown, allowed?: readonly string[]): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw invalid('オブジェクトを指定してください。');
  }
  const record = value as Record<string, unknown>;
  if (allowed && Object.keys(record).some(key => !allowed.includes(key))) {
    throw invalid('未対応の項目が含まれています。');
  }
  return record;
}

export function text(value: unknown, label: string, min: number, max: number, field?: string): string {
  const normalized = typeof value === 'string' ? value.trim() : null;
  if (normalized === null || [...normalized].length < min || [...normalized].length > max || normalized.includes('\0')) {
    throw invalid(`${label}は${min === 0 ? '' : `${min}〜`}${max}文字${min === 0 ? '以内' : ''}で入力してください。`, field);
  }
  return normalized;
}

export function integer(value: unknown, label: string, min: number, max: number, field: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw invalid(`${label}は${min}〜${max}の整数で入力してください。`, field);
  }
  return value;
}

export function choice<T extends string>(value: unknown, options: Record<T, string>, field: string): T {
  if (typeof value !== 'string' || !Object.hasOwn(options, value)) {
    throw invalid('選択肢から指定してください。', field);
  }
  return value as T;
}

export const studentId = (value: unknown) => text(value, '生徒ID', 1, 80, 'studentId');
export const teamId = (value: unknown) => text(value, '編成ID', 1, 80, 'teamId');
const memo = (value: unknown) => value === null ? null : text(value, 'メモ', 0, 2000, 'memo') || null;

export function progressPatch(value: unknown): ProgressPatch {
  const input = object(value, [...progressKeys, 'memo']);
  if (!Object.keys(input).length) throw invalid('更新する項目を指定してください。');
  const patch: ProgressPatch = {};
  for (const key of progressKeys) {
    if (!Object.hasOwn(input, key)) continue;
    const { label, min, max } = progressFields[key];
    patch[key] = input[key] === null ? null : integer(input[key], label, min, max, key);
  }
  if (Object.hasOwn(input, 'memo')) patch.memo = memo(input.memo);
  return patch;
}

export const studentFilterKeys = ['q', 'school', 'role', 'position', 'attackType', 'defenseType', 'isLimited', 'state'] as const;
export type StudentFilterKey = typeof studentFilterKeys[number];
export function studentFilters(value: unknown) {
  const input = object(value, studentFilterKeys);
  return {
    q: input.q === undefined ? undefined : text(input.q, '検索語', 0, 100, 'q'),
    school: input.school === undefined ? undefined : text(input.school, '学園', 1, 80, 'school'),
    role: input.role === undefined ? undefined : choice(input.role, roles, 'role'),
    position: input.position === undefined ? undefined : choice(input.position, positions, 'position'),
    attackType: input.attackType === undefined ? undefined : choice(input.attackType, attacks, 'attackType'),
    defenseType: input.defenseType === undefined ? undefined : choice(input.defenseType, defenses, 'defenseType'),
    isLimited: input.isLimited === undefined ? undefined : choice(input.isLimited, limitedValues, 'isLimited'),
    state: input.state === undefined ? undefined : choice(input.state, progressStates, 'state'),
  };
}

export function teamFilters(value: unknown) {
  const { mode } = object(value, ['mode']);
  return mode === undefined ? undefined : choice(mode, modes, 'mode');
}

export function teamMetadata(value: unknown) {
  const input = object(value, ['name', 'mode', 'memo']);
  return {
    name: text(input.name, '編成名', 1, 80, 'name'),
    mode: choice(input.mode, modes, 'mode'),
    memo: Object.hasOwn(input, 'memo') ? memo(input.memo) : null,
  };
}

export const slotCount = 6;
export interface Member {
  positionIndex: number;
  studentId: string;
  isSupport: boolean;
}

export function teamMembers(value: unknown): Member[] {
  if (!Array.isArray(value) || value.length > slotCount) throw invalid('編成は6枠までです。', 'members');
  const positionsUsed = new Set<number>();
  return value.map(item => {
    const input = object(item, ['positionIndex', 'studentId', 'isSupport']);
    const positionIndex = integer(input.positionIndex, '枠番号', 0, slotCount - 1, 'members');
    if (positionsUsed.has(positionIndex)) {
      throw new LedgerError(409, 'DUPLICATE_SLOT', '同じ枠番号を複数指定できません。', { field: 'members' });
    }
    positionsUsed.add(positionIndex);
    if (typeof input.isSupport !== 'boolean') throw invalid('助っ人の指定は真偽値で入力してください。', 'members');
    return { positionIndex, studentId: studentId(input.studentId), isSupport: input.isSupport };
  }).sort((left, right) => left.positionIndex - right.positionIndex);
}

export const revisionId = (value: unknown) => text(value, '編成のリビジョン', 1, 80, 'revision');

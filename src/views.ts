import type { Student, StudentDetail, StudentSummary, TeamDetail, TeamSummary } from './ledger';
import type { ProgressField, StudentFilterKey } from './rules';
import { attacks, defenses, limitedValues, modes, positions, progressFields, progressStates, roles, slotCount } from './rules';

const siteName = 'シャーレ育成手帳';
type Page = 'home' | 'students' | 'teams' | 'none';
type FormValues = Record<string, string>;
type Feedback = { message: string; conflict?: boolean };

export function escape(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, character =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character);
}

type Icon = 'book' | 'students' | 'teams' | 'home' | 'search' | 'filter' | 'arrow' | 'back' | 'plus' | 'logout' | 'check' | 'empty';
const paths: Record<Icon, string> = {
  book: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 3v18m4-13h4m-4 4h4"/>',
  students: '<circle cx="10" cy="8" r="3"/><path d="M3 20v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2m2-15a3 3 0 0 1 0 6m3 9v-2a5 5 0 0 0-3-4"/>',
  teams: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  home: '<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  filter: '<path d="M4 7h16M7 12h10m-7 5h4"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  logout: '<path d="M10 17l5-5-5-5m5 5H3m9-9h5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  empty: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 12h6"/>',
};

function icon(name: Icon): string {
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

const navigation = [
  { id: 'home', href: '/', label: 'ホーム' },
  { id: 'students', href: '/students', label: '生徒一覧' },
  { id: 'teams', href: '/teams', label: '編成' },
] as const;

export function layout(title: string, page: Page, content: string, signedIn = true) {
  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light"><title>${escape(title)} | ${siteName}</title>
<link rel="stylesheet" href="/assets/ledger.css"><script defer src="/assets/ledger.js"></script></head>
<body><a class="skip" href="#main">本文へ移動</a>
<header class="site-header"><div class="shell header-content">
<a class="brand" href="/"><span class="brand-icon">${icon('book')}</span><span>${siteName}</span></a>
${signedIn ? `<nav aria-label="メインメニュー">${navigation.map(item => `<a href="${item.href}"${item.id === page ? ' aria-current="page"' : ''}>${icon(item.id)}<span>${item.label}</span></a>`).join('')}</nav>
<a class="sign-out" href="/cdn-cgi/access/logout" aria-label="ログアウト" title="ログアウト">${icon('logout')}</a>` : ''}
</div></header>
<main class="shell main" id="main">${content}</main>
<footer class="shell footer"><span>${siteName}</span><span>『ブルーアーカイブ』の非公式ファンツール</span></footer>
</body></html>`;
}

const numberText = new Intl.NumberFormat('ja-JP');
const dateText = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const date = (value: string) => `<time datetime="${escape(value)}">${dateText.format(new Date(value))}</time>`;
const back = (label: string, href: string) => `<a class="back" href="${href}">${icon('back')}${label}</a>`;
const chip = (label: string, tone = '') => `<span class="chip ${tone}">${escape(label)}</span>`;
const status = (saved: boolean) => chip(saved ? '登録済み' : '未登録', saved ? 'mint' : 'neutral');
const notice = (message: string) => `<div class="notice" role="status">${icon('check')}${escape(message)}</div>`;
const feedback = (error: Feedback | undefined, reload?: string) => error ?
  `<div class="form-error" role="alert">${escape(error.message)}${error.conflict && reload ? ` <a href="${reload}">最新の編成を開く</a>` : ''}</div>` : '';
const empty = (title: string, message: string) => `<div class="empty-state">${icon('empty')}<h2>${escape(title)}</h2><p>${escape(message)}</p></div>`;

function options(choices: Record<string, string>, selected?: string | null, unselected?: string) {
  const defaultOption = unselected === undefined ? '' : `<option value="">${escape(unselected)}</option>`;
  return defaultOption + Object.entries(choices).map(([value, label]) =>
    `<option value="${escape(value)}"${value === selected ? ' selected' : ''}>${escape(label)}</option>`).join('');
}

const schoolColor: Record<string, string> = { ミレニアム: 'blue', アビドス: 'sand', ゲヘナ: 'rose', トリニティ: 'lilac', 百鬼夜行: 'mint' };
function mark(student: Student, large = false) {
  const tone = Object.hasOwn(schoolColor, student.school) ? schoolColor[student.school] : 'neutral';
  return `<span aria-hidden="true" class="student-mark ${tone}${large ? ' large' : ''}">${escape([...student.name].slice(0, 1).join(''))}</span>`;
}

const labelFor = (labels: Record<string, string>, key: string | null) => key && Object.hasOwn(labels, key) ? labels[key] : '未確認';

export function home(stats: { students: number; recorded: number; teams: number }, recent: TeamSummary[]) {
  const links = [
    { value: stats.students, caption: '収録生徒', label: '生徒を探す', shape: 'students', link: '/students', color: 'blue' },
    { value: stats.recorded, caption: '育成記録', label: '登録済みの生徒', shape: 'check', link: '/students?state=recorded', color: 'mint' },
    { value: stats.teams, caption: '自分の編成', label: '編成を開く', shape: 'teams', link: '/teams', color: 'lilac' },
  ] as const;
  return layout('ホーム', 'home', `<section class="hero">
    <div><h1>育成と編成を、<br>ひとつの手帳に。</h1><p>生徒を探して育成を記録し、総力戦や合同火力演習の編成をまとめられます。</p>
    <a class="button primary" href="/students">生徒を探す ${icon('arrow')}</a></div>
    <div class="hero-emblem" aria-hidden="true">${icon('book')}</div>
  </section>
  <section class="home-stats" aria-label="手帳の状況">${links.map(item =>
    `<a class="summary-card" href="${item.link}"><span class="stat-icon ${item.color}">${icon(item.shape)}</span>
    <span class="stat-caption">${item.caption}</span><strong>${numberText.format(item.value)}<small> 件</small></strong>
    <span class="stat-action">${item.label}${icon('arrow')}</span></a>`).join('')}</section>
  <section aria-label="未登録の育成" class="home-next"><div><h2>未登録の生徒</h2><p>${numberText.format(stats.students - stats.recorded)} 件</p></div>
    <a class="button secondary" href="/students?state=unrecorded">未登録を見る ${icon('arrow')}</a></section>
  <section aria-label="最近更新した編成"><div class="results-header"><h2>最近の編成</h2></div>
    ${recent.length ? teamResults(recent) : empty('まだ編成がありません', '編成の画面から作成できます。')}</section>`);
}

const studentsPerPage = 18;
export function studentsList(students: StudentSummary[], schools: string[], filters: Partial<Record<StudentFilterKey, string>>, requestedPage: number) {
  const pageCount = Math.max(1, Math.ceil(students.length / studentsPerPage));
  const page = Math.min(requestedPage, pageCount);
  const pageStudents = students.slice((page - 1) * studentsPerPage, page * studentsPerPage);
  const pageLink = (pageNumber: number) => {
    const params = new URLSearchParams(Object.entries(filters).filter((entry): entry is [string, string] => !!entry[1]));
    if (pageNumber !== 1) params.set('page', String(pageNumber));
    return '/students' + (params.size ? '?' + params : '');
  };
  const choices: [StudentFilterKey, string, Record<string, string>][] = [
    ['school', '学園', Object.fromEntries(schools.map(school => [school, school]))],
    ['role', '役割', roles], ['position', '配置', positions], ['attackType', '攻撃タイプ', attacks],
    ['defenseType', '防御タイプ', defenses], ['isLimited', '募集区分', limitedValues], ['state', '育成記録', progressStates],
  ];
  const active = choices.flatMap(([field, title, labels]) => filters[field] ?
    [`${title} ${labelFor(labels, filters[field])}`] : []);
  return layout('生徒一覧', 'students', `
    <div class="page-title"><h1>生徒一覧</h1><p>生徒を探して、自分の育成状況を確認できます。</p></div>
    <form method="get" action="/students" class="search-panel">
      <div class="search-line"><label class="search-input">${icon('search')}<span class="sr-only">生徒名・読み</span>
        <input type="search" name="q" value="${escape(filters.q)}" placeholder="生徒名・読みで検索" maxlength="100"></label>
        <button class="button primary" type="submit">検索</button></div>
      <details${active.length ? ' open' : ''}><summary>${icon('filter')}絞り込み${active.length ? chip(String(active.length), 'mint') : ''}</summary>
        <div class="filters">${choices.map(([field, title, labels]) => `<div class="field"><label for="filter-${field}">${title}</label>
          <select id="filter-${field}" name="${field}">${options(labels, filters[field], 'すべて')}</select></div>`).join('')}</div>
        <div class="filter-actions"><button class="button primary" type="submit">絞り込む</button><a class="button secondary" href="/students">クリア</a></div>
      </details>
    </form>
    <div class="results-header"><h2>検索結果 <span>${numberText.format(students.length)} 件</span></h2>
    ${active.length ? `<div class="tags">${active.map(item => chip(item)).join('')}</div>` : ''}</div>
    ${students.length ? `<ul class="student-grid">${pageStudents.map(student => `<li>
      <a class="student-card" href="/students/${encodeURIComponent(student.id)}"><div class="student-card-top">
      ${mark(student)}<div class="student-name"><h3>${escape(student.name)}</h3><span>${escape(student.school)}</span></div>${icon('arrow')}</div>
      <div class="tags">${chip(labelFor(roles, student.role))}${chip(labelFor(attacks, student.attackType), student.attackType === 'mystic' ? 'blue' : '')}</div>
      <div class="student-card-bottom">${status(student.progress !== null)}
      ${student.progress?.level != null ? `<span>Lv ${numberText.format(student.progress.level)}</span>` : ''}
      ${student.progress?.rarity != null ? `<span>★ ${student.progress.rarity}</span>` : ''}</div>
      </a></li>`).join('')}</ul>` : empty('該当する生徒がいません', '検索語や絞り込み条件を変えてください。')}
    ${pageCount > 1 ? `<nav class="pagination" aria-label="生徒一覧のページ">
      ${page > 1 ? `<a class="button secondary" href="${escape(pageLink(page - 1))}">${icon('back')}前へ</a>` : '<span></span>'}
      <span>${page} / ${pageCount}</span>
      ${page < pageCount ? `<a class="button secondary" href="${escape(pageLink(page + 1))}">次へ${icon('arrow')}</a>` : '<span></span>'}
    </nav>` : ''}`);
}

const groups: [string, ProgressField[]][] = [
  ['基本', ['level', 'rarity', 'bondLevel']],
  ['スキル', ['exSkillLevel', 'normalSkillLevel', 'passiveSkillLevel', 'subSkillLevel']],
  ['装備・固有武器', ['equipment1Tier', 'equipment2Tier', 'equipment3Tier', 'uniqueWeaponRank', 'uniqueWeaponLevel']],
  ['神名文字・その他', ['shardsOwned', 'shardsUsed', 'favoriteGifts']],
];

export function studentPage(student: StudentDetail, form?: FormValues, error?: Feedback, saved = false) {
  const data = student.progress;
  const details = [
    ['学園', student.school], ['役割', labelFor(roles, student.role)], ['配置', labelFor(positions, student.position)],
    ['攻撃', labelFor(attacks, student.attackType)], ['防御', labelFor(defenses, student.defenseType)],
    ['初期の星', student.baseRarity === null ? '未確認' : `★ ${student.baseRarity}`],
    ['募集', student.isLimited === null ? '未確認' : student.isLimited ? limitedValues.yes : limitedValues.no],
  ];
  return layout(student.name, 'students', `${back('生徒一覧へ', '/students')}
    <section class="student-banner"><div class="student-identity">${mark(student, true)}<div><h1>${escape(student.name)}</h1>
    <p>${escape(student.school)}</p></div>${status(data !== null)}</div>
    <dl class="facts">${details.map(([key, value]) => `<div><dt>${key}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl></section>
    <form method="post" action="/students/${encodeURIComponent(student.id)}/progress" class="editor" id="progress">
      <div class="editor-title"><div><h2>育成記録</h2><p>記録したい項目を入力できます。</p></div>${data ? `<span class="updated">更新 ${date(data.updatedAt)}</span>` : ''}</div>
      ${saved ? notice('育成記録を保存しました。') : ''}${feedback(error)}
      ${groups.map(([name, fields]) => `<fieldset><legend>${name}</legend><div class="field-grid">
      ${fields.map(field => {
        const spec = progressFields[field];
        return `<label>${spec.label}<input type="number" name="${field}" inputmode="numeric" min="${spec.min}" max="${spec.max}"
          step="1" value="${escape(form?.[field] ?? data?.[field])}" placeholder="未入力"><input type="hidden" name="original_${field}" value="${escape(form?.[`original_${field}`] ?? data?.[field])}"></label>`;
      }).join('')}
      </div></fieldset>`).join('')}
      <div class="field memo"><label for="student-memo">メモ</label><textarea id="student-memo" name="memo" maxlength="2000" rows="4" placeholder="育成方針や次の目標">${escape(form?.memo ?? data?.memo)}</textarea><input type="hidden" name="original_memo" value="${escape(form?.original_memo ?? data?.memo)}"></div>
      <div class="actions"><button class="button primary" type="submit">${icon('check')}育成記録を保存</button></div>
    </form>`);
}

function teamResults(teams: TeamSummary[]) {
  return `<ul class="team-grid">${teams.map(team => `<li><a class="team-card" href="/teams/${encodeURIComponent(team.id)}">
        <span class="stat-icon lilac">${icon('teams')}</span><div class="team-card-info"><h3>${escape(team.name)}</h3>
        <div class="tags">${chip(modes[team.mode], 'lilac')}<span>${team.memberCount} / ${slotCount} 枠</span></div>
        <span class="updated">更新 ${date(team.updatedAt)}</span></div>${icon('arrow')}</a></li>`).join('')}</ul>`;
}

export function teamsList(teams: TeamSummary[], mode?: string, form?: FormValues, error?: Feedback) {
  return layout('編成', 'teams', `<div class="page-title"><h1>編成</h1><p>総力戦や合同火力演習のメンバーを管理します。</p></div>
    <form class="new-team search-panel" method="post" action="/teams">
      <h2>新しい編成</h2>${feedback(error)}
      <div class="new-team-fields"><label>編成名<input name="name" placeholder="例：総力戦 神秘" maxlength="80" required value="${escape(form?.name)}"></label>
      <div class="field"><label for="new-mode">モード</label><select id="new-mode" name="mode">${options(modes, form?.mode ?? 'raid')}</select></div>
      <button class="button primary" type="submit">${icon('plus')}作成</button></div>
    </form>
    <div class="results-header"><h2>自分の編成 <span>${numberText.format(teams.length)} 件</span></h2>
    <nav class="segmented" aria-label="編成のモード">${[['すべて', ''], ...Object.entries(modes).map(([key, title]) => [title, key])]
      .map(([title, value]) => `<a href="/teams${value ? `?mode=${value}` : ''}"${(mode ?? '') === value ? ' aria-current="page"' : ''}>${title}</a>`).join('')}</nav></div>
    ${teams.length ? teamResults(teams) :
      empty('編成はまだありません', mode ? '別のモードを選択すると、ほかの編成を表示できます。' : '上のフォームから編成を作成できます。')}`);
}

export function teamPage(team: TeamDetail, students: StudentSummary[], form?: FormValues, error?: Feedback, saved = false) {
  const url = `/teams/${encodeURIComponent(team.id)}`;
  const slots = Array.from({ length: slotCount }, (_, index) => {
    const member = team.members.find(row => row.positionIndex === index);
    const chosen = form ? form[`student_${index}`] : member?.studentId;
    const isSupport = form ? form[`support_${index}`] === 'yes' : member?.isSupport;
    const studentOptions = Object.fromEntries(students.map(student => [student.id, student.name]));
    if (chosen && !Object.hasOwn(studentOptions, chosen)) studentOptions[chosen] = '未収録の生徒';
    return `<div class="slot">
      <div class="field"><label for="slot-${index}">枠 ${index + 1}</label><select id="slot-${index}" name="student_${index}">${options(studentOptions, chosen, '空き枠')}</select></div>
      <label class="checkbox"><input type="checkbox" name="support_${index}" value="yes"${isSupport ? ' checked' : ''}>
      <span>助っ人<span class="sr-only">（枠 ${index + 1}）</span></span></label></div>`;
  }).join('');

  return layout(team.name, 'teams', `${back('編成一覧へ', '/teams')}
    <div class="page-title team-title"><div><h1>${escape(team.name)}</h1><div class="tags">${chip(modes[team.mode], 'lilac')}
    <span>${team.members.length} / ${slotCount} 枠</span></div></div><span class="updated">更新 ${date(team.updatedAt)}</span></div>
    <form class="editor" method="post" action="${url}" id="lineup">
      <input type="hidden" name="revision" value="${escape(form?.revision ?? team.revision)}">
      ${saved ? notice('編成を保存しました。') : ''}${feedback(error, url)}
      <fieldset><legend>編成情報</legend><div class="field-grid team-fields">
        <label>編成名<input name="name" maxlength="80" required value="${escape(form?.name ?? team.name)}"></label>
        <div class="field"><label for="team-mode">モード</label><select id="team-mode" name="mode">${options(modes, form?.mode ?? team.mode)}</select></div>
      </div><div class="field memo"><label for="team-memo">メモ</label><textarea id="team-memo" name="memo" maxlength="2000" rows="3" placeholder="想定する敵や編成の狙い">${escape(form?.memo ?? team.memo)}</textarea></div></fieldset>
      <fieldset><legend>メンバー</legend><div class="slot-grid">${slots}</div></fieldset>
      <div class="actions"><button class="button primary" type="submit">${icon('check')}編成を保存</button></div>
    </form>`);
}

export function errorPage(message: string, status: number) {
  const title = status === 401 ? 'ログインが必要です' : status === 404 ? 'ページが見つかりません' : 'ページを表示できません';
  return layout(title, 'none', `<div class="page-title"><h1>${title}</h1><p>${escape(message)}</p></div>
  ${status !== 401 ? back('ホームへ', '/') : ''}`, status !== 401);
}

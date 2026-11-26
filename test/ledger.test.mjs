import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';
import { build } from 'esbuild';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { Miniflare } from 'miniflare';
import { chromium, devices } from 'playwright-core';

const issuer = 'https://tests.invalid';
const audience = 'ledger-test';
const { publicKey, privateKey } = await generateKeyPair('RS256');
const publicJwk = { ...await exportJWK(publicKey), kid: 'ledger-test' };

function assertion(sub, aud = audience, expiration = '10m', type = 'app', key = privateKey) {
  return new SignJWT({ email: 'fixture@example.invalid', type })
    .setProtectedHeader({ alg: 'RS256', kid: 'ledger-test' })
    .setSubject(sub).setIssuer(issuer).setAudience(aud).setIssuedAt().setExpirationTime(expiration)
    .sign(key);
}

async function fixture(t) {
  const { outputFiles } = await build({
    stdin: {
      contents: `import { createLocalJWKSet } from 'jose';
        import { accessAuthenticator } from './src/auth.ts';
        import { createWorker } from './src/index.ts';
        const keys = createLocalJWKSet({ keys: [${JSON.stringify(publicJwk)}] });
        export default createWorker(accessAuthenticator(() => keys));`,
      resolveDir: process.cwd(),
    },
    target: 'es2024', format: 'esm', platform: 'browser', bundle: true, write: false,
    loader: { '.css': 'text', '.client': 'text' },
  });
  const worker = new Miniflare({
    workers: [{
      config: {
        name: 'fixture-ledger',
        compatibilityDate: '2026-11-26',
        manifest: {
          mainModule: 'fixture.mjs',
          modulesRoot: process.cwd(),
          modules: { 'fixture.mjs': { type: 'esm', contents: outputFiles[0].text } },
        },
        env: {
          ACCESS_ISSUER: { type: 'text', value: issuer },
          ACCESS_AUDIENCE: { type: 'text', value: audience },
          DB: { type: 'd1', id: 'fixture-ledger-db' },
        },
      },
    }],
  });
  t.after(() => worker.dispose());
  const db = await worker.getD1Database('DB');
  const files = await readdir('migrations');
  for (const filename of files.sort()) {
    if (!filename.endsWith('.sql')) continue;
    const sql = await readFile(`migrations/${filename}`, 'utf8');
    await db.batch(sql.split(';').map(part => part.trim()).filter(Boolean).map(part => db.prepare(part)));
  }

  const alex = await assertion('fixture-alex');
  const rui = await assertion('fixture-rui');
  const url = (await worker.ready).origin;
  function request(path, { token = alex, method = 'GET', fields, origin = url } = {}) {
    return fetch(url + path, {
      method,
      redirect: 'manual',
      headers: {
        ...(token && { 'cf-access-jwt-assertion': token }),
        ...(fields && { origin }),
      },
      ...(fields && { body: new URLSearchParams(fields) }),
    });
  }

  return { db, url, request, alex, rui };
}

test('Access assertion verification and isolated partial progress saves', async t => {
  const { db, request, rui } = await fixture(t);
  assert.equal((await request('/')).status, 200);
  const { privateKey: unrelatedKey } = await generateKeyPair('RS256');
  for (const token of [null, 'forged', await assertion('fixture-alex', 'wrong'),
    await assertion('fixture-alex', audience, '-1m'),
    await assertion('fixture-alex', audience, '10m', 'org'),
    await assertion('fixture-alex', audience, '10m', 'app', unrelatedKey)]) {
    assert.equal((await request('/students', { token })).status, 401);
  }
  assert.equal((await request('/mcp')).status, 404);

  const matches = await (await request('/students?q=%EF%BD%B1%EF%BE%98%EF%BD%BD&school=ミレニアム&attackType=mystic')).text();
  assert.match(matches, /検索結果 <span>1 件/);
  assert.match(matches, /\/students\/aris/);
  const limited = await (await request('/students?isLimited=yes')).text();
  assert.match(limited, /\/students\/mika/);
  const secondPage = await (await request('/students?page=2')).text();
  assert.match(secondPage, /2 \/ 16/);

  const progress = '/students/aris/progress';
  const save = (fields, options) => request(progress, { method: 'POST', fields, ...options });
  assert.equal((await save({ level: '999' })).status, 400);
  assert.equal((await save({ level: '' }, { origin: 'https://example.invalid' })).status, 403);
  const attempts = await Promise.all([
    save({ level: '55', memo: 'fixture only', original_level: '' }),
    save({ level: '', original_level: '', exSkillLevel: '4', shardsOwned: '0' }),
  ]);
  assert.deepEqual(attempts.map(r => r.status), [303, 303]);
  const row = () => db.prepare("SELECT * FROM progress WHERE account_id='fixture-alex' AND student_id='aris'").first();
  const saved = await row();
  assert.deepEqual([saved.level, saved.ex_skill_level, saved.shards_owned, saved.memo], [55, 4, 0, 'fixture only']);
  const other = await (await request('/students/aris', { token: rui })).text();
  assert.match(other, /未登録/);
  assert.doesNotMatch(other, /fixture only/);
  assert.equal((await save({ level: '55' })).status, 303);
  assert.equal((await row()).updated_at, saved.updated_at);
  assert.equal((await save({ memo: '' })).status, 303);
  assert.equal((await row()).memo, null);
  assert.equal((await row()).ex_skill_level, 4);
});

test('team form replacement is atomic and protected from concurrent saves', async t => {
  const { db, request, rui } = await fixture(t);
  const initialMetadata = { name: 'fixture team', mode: 'raid', memo: '' };
  const created = await request('/teams', { method: 'POST', fields: initialMetadata });
  assert.equal(created.status, 303);
  const path = created.headers.get('location');
  const id = path.split('/').at(-1);
  const snapshot = async () => ({
    team: await db.prepare('SELECT * FROM teams WHERE id=?').bind(id).first(),
    slots: (await db.prepare('SELECT * FROM team_slots WHERE team_id=? ORDER BY position_index').bind(id).all()).results,
  });
  const fieldsFor = fields => ({
    ...Object.fromEntries(Array.from({ length: 6 }, (_, i) => [
      [`kind_${i}`, 'owned'], [`owned_${i}`, ''], [`helper_${i}`, ''],
    ]).flat()), ...fields,
  });
  const replace = (revision, fields, token) => request(path, {
    token, method: 'POST', fields: { ...initialMetadata, revision, ...fieldsFor(fields) },
  });
  const initial = await snapshot();
  const register = (student, token) => request(`/students/${student}/progress`, {
    method: 'POST', fields: { level: '25' }, token,
  });
  const choices = html => html.match(/<select id="owned-0"[^>]*>[\s\S]*?<\/select>/)?.[0] ?? '';
  assert.equal((await request(path, { token: rui })).status, 404);
  assert.equal((await replace(initial.team.revision, { owned_0: 'aris' }, rui)).status, 404);
  assert.equal((await replace(initial.team.revision, { owned_0: 'not-in-master' })).status, 400);
  assert.equal((await register('hoshino', rui)).status, 303);
  assert.doesNotMatch(choices(await (await request(path)).text()), /ホシノ/);
  const rejected = await replace(initial.team.revision, { owned_0: 'hoshino' });
  assert.equal(rejected.status, 400);
  assert.match(await rejected.text(), /自分が育成登録した生徒/);
  assert.deepEqual(await snapshot(), initial);
  assert.equal((await replace(initial.team.revision, { kind_0: 'support', helper_0: 'hoshino' })).status, 303);
  const helper = await snapshot();
  assert.equal(helper.slots[0].is_support, 1);
  assert.equal((await register('aris')).status, 303);
  const ownedChoices = choices(await (await request(path)).text());
  assert.match(ownedChoices, /アリス/);
  assert.doesNotMatch(ownedChoices, /ホシノ/);
  assert.equal((await replace(helper.team.revision, { owned_0: 'aris' })).status, 303);
  const updated = await snapshot();
  assert.equal(updated.slots.length, 1);
  assert.equal((await replace(helper.team.revision, { owned_0: 'aris' })).status, 303);
  assert.deepEqual(await snapshot(), updated);

  await db.prepare(`CREATE TRIGGER force_slot_failure BEFORE INSERT ON team_slots WHEN NEW.position_index=2
    BEGIN SELECT RAISE(ABORT, 'test rollback'); END`).run();
  assert.equal((await replace(updated.team.revision, { owned_1: 'aris', kind_2: 'support', helper_2: 'hoshino' })).status, 500);
  await db.prepare('DROP TRIGGER force_slot_failure').run();
  assert.deepEqual(await snapshot(), updated);

  // Simulate eligibility disappearing between the guarded update and the slot insert.
  await db.prepare(`CREATE TRIGGER remove_eligibility BEFORE UPDATE ON teams
    BEGIN DELETE FROM progress WHERE account_id=OLD.account_id AND student_id='aris'; END`).run();
  assert.equal((await replace(updated.team.revision, { owned_1: 'aris' })).status, 500);
  await db.prepare('DROP TRIGGER remove_eligibility').run();
  assert.deepEqual(await snapshot(), updated);
  assert.match(choices(await (await request(path)).text()), /アリス/);

  // An existing slot from the previous release stays visible and requires a correction.
  await db.prepare('INSERT INTO team_slots VALUES (?, 5, ?, 0)').bind(id, 'yuuka').run();
  const invalidSnapshot = await snapshot();
  const legacyHtml = await (await request(path)).text();
  assert.match(legacyHtml, /ユウカ（育成未登録）/);
  assert.match(legacyHtml, /students\/yuuka#progress/);
  assert.equal((await replace(updated.team.revision, { owned_0: 'aris', owned_5: 'yuuka' })).status, 400);
  assert.deepEqual(await snapshot(), invalidSnapshot);

  const attempts = await Promise.all([
    replace(updated.team.revision, { kind_1: 'support', helper_1: 'aris' }),
    replace(updated.team.revision, { kind_3: 'support', helper_3: 'hoshino' }),
  ]);
  assert.deepEqual(attempts.map(r => r.status).sort(), [303, 409]);
  assert.match(await attempts.find(r => r.status === 409).text(), /最新の編成を開く/);
  const final = await snapshot();
  assert.equal(final.slots[0].is_support, 1);
  assert.ok([1, 3].includes(final.slots[0].position_index));
  assert.equal((await replace(final.team.revision, {})).status, 303);
  assert.deepEqual((await snapshot()).slots, []);
});

test('mobile browser can search, save growth, create, replace and clear a lineup', async t => {
  const { url, alex, rui } = await fixture(t);
  const browser = await chromium.launch({
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE && { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }),
  });
  t.after(() => browser.close());
  const context = await browser.newContext({ ...devices['Pixel 5'], extraHTTPHeaders: { 'cf-access-jwt-assertion': alex } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const fits = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await page.goto(url);
  await page.getByRole('link', { name: '生徒一覧', exact: true }).click();
  await page.getByText('絞り込み', { exact: true }).click();
  await page.getByLabel('学園', { exact: true }).selectOption('ミレニアム');
  await page.getByRole('button', { name: '絞り込む' }).click();
  assert.equal(new URL(page.url()).searchParams.get('school'), 'ミレニアム');
  await page.getByRole('link', { name: 'クリア', exact: true }).click();
  await page.getByRole('searchbox').fill('ツクヨ');
  await page.getByRole('button', { name: '検索', exact: true }).click();
  assert.deepEqual(await page.locator('.student-card h3').allTextContents(), ['ツクヨ', 'ツクヨ（ドレス）']);
  await page.getByRole('searchbox').fill('ツクヨ（ドレス）');
  await page.getByRole('button', { name: '検索', exact: true }).click();
  assert.deepEqual(await page.locator('.student-card h3').allTextContents(), ['ツクヨ（ドレス）']);
  await page.getByRole('searchbox').fill('マナミ');
  await page.getByRole('button', { name: '検索', exact: true }).click();
  await page.getByRole('link', { name: /マナミ/ }).click();
  assert.equal(await page.getByRole('link', { name: '公式告知' }).getAttribute('href'), 'https://bluearchive.jp/news/newsJump/716');
  await page.getByRole('link', { name: '生徒一覧へ' }).click();
  await page.getByRole('searchbox').fill('ありす');
  await page.getByRole('button', { name: '検索', exact: true }).click();
  assert.equal(await page.locator('.student-card').count(), 3);
  await fits();
  if (process.env.LEDGER_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.LEDGER_SCREENSHOT_DIR}/students-mobile.png` });
  await page.locator('.student-card[href="/students/aris"]').click();
  await page.getByLabel('レベル', { exact: true }).fill('60');
  await page.getByLabel('メモ', { exact: true }).fill('<script>fixture</script>');
  await page.getByRole('button', { name: '育成記録を保存' }).click();
  assert.equal(await page.getByRole('status').textContent(), '育成記録を保存しました。');
  assert.equal(await page.getByLabel('レベル', { exact: true }).inputValue(), '60');
  assert.equal(await page.getByLabel('メモ', { exact: true }).inputValue(), '<script>fixture</script>');
  await fits();

  await page.getByRole('link', { name: '編成', exact: true }).click();
  await page.getByLabel('編成名').fill('総力戦 テスト');
  await page.getByRole('button', { name: '作成' }).click();
  const teamUrl = page.url();
  const normal = page.getByLabel('所持生徒 1', { exact: true });
  assert.deepEqual(await normal.locator('option').allTextContents(), ['空き枠', 'アリス']);
  await normal.selectOption('aris');
  await page.getByRole('radio', { name: '助っ人（枠 2）', exact: true }).check();
  const helper = page.getByLabel('助っ人生徒 2', { exact: true });
  await page.getByLabel('助っ人を検索 2', { exact: true }).fill('ツクヨ');
  assert.deepEqual(await helper.locator('option').allTextContents(), ['空き枠', 'ツクヨ', 'ツクヨ（ドレス）']);
  await helper.selectOption('tsukuyo-dress');
  await page.getByRole('button', { name: '編成を保存' }).click();
  assert.equal(await page.getByRole('status').textContent(), '編成を保存しました。');
  assert.equal(await page.getByRole('radio', { name: '助っ人（枠 2）', exact: true }).isChecked(), true);
  assert.equal(await normal.inputValue(), 'aris');
  assert.equal(await helper.inputValue(), 'tsukuyo-dress');
  await fits();
  if (process.env.LEDGER_SCREENSHOT_DIR) {
    const screenshotDir = process.env.LEDGER_SCREENSHOT_DIR;
    await page.locator('.slot-grid').evaluate(element => element.scrollIntoView());
    await page.screenshot({ path: `${screenshotDir}/編成-スマホ幅.png` });
    await page.locator('[data-slot]').nth(0).screenshot({ path: `${screenshotDir}/編成-所持生徒の候補.png` });
    await page.locator('[data-slot]').nth(1).screenshot({ path: `${screenshotDir}/編成-助っ人の候補.png` });
  }
  await normal.selectOption('');
  await helper.selectOption('');
  await page.getByRole('button', { name: '編成を保存' }).click();
  assert.match(await page.locator('.team-title').textContent(), /0 \/ 6 枠/);

  const other = await browser.newContext({ ...devices['Pixel 5'], extraHTTPHeaders: { 'cf-access-jwt-assertion': rui } });
  const otherPage = await other.newPage();
  assert.equal((await otherPage.goto(teamUrl)).status(), 404);
  await otherPage.goto(`${url}/students/aris`);
  assert.equal(await otherPage.getByLabel('レベル', { exact: true }).inputValue(), '');
  assert.deepEqual(errors, []);
});

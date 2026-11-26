import { accessAuthenticator } from './auth';
import { cleanSearch, formInput, html, json, pathId, privateHeaders, redirect, trustedOrigin } from './http';
import { Ledger } from './ledger';
import { integer, invalid, LedgerError, missing, progressKeys, slotCount } from './rules';
import { errorPage, home, studentPage, studentsList, teamPage, teamsList } from './views';
import stylesheet from './ledger.css';
import browserScript from './browser.client';

const assets: Record<string, [string, string]> = {
  '/assets/ledger.css': [stylesheet, 'text/css; charset=utf-8'],
  '/assets/ledger.js': [browserScript, 'text/javascript; charset=utf-8'],
};

function teamFormSlots(form: Record<string, string>) {
  // Pages opened before the release still submit the previous form.
  const previousForm = !Object.keys(form).some(key => key.startsWith('kind_'));
  const normalized = { ...form };
  const members = Array.from({ length: slotCount }, (_, positionIndex) => {
    const kindKey = `kind_${positionIndex}`;
    const ownedKey = `owned_${positionIndex}`;
    const helperKey = `helper_${positionIndex}`;
    if (previousForm) {
      const previousKey = `student_${positionIndex}`;
      if (!Object.hasOwn(form, previousKey)) throw invalid('編成画面を開き直してから保存してください。');
      const isSupport = form[`support_${positionIndex}`] === 'yes';
      normalized[kindKey] = isSupport ? 'support' : 'owned';
      normalized[isSupport ? helperKey : ownedKey] = form[previousKey];
    }
    const kind = normalized[kindKey];
    if (kind !== 'owned' && kind !== 'support') throw invalid('編成の枠の種類を選んでください。');
    const isSupport = kind === 'support';
    const studentId = normalized[isSupport ? helperKey : ownedKey];
    if (studentId === undefined) throw invalid('編成画面を開き直してから保存してください。');
    return { positionIndex, studentId, isSupport };
  }).filter(member => member.studentId);
  return { members, normalized };
}

async function browser(request: Request, url: URL, ledger: Ledger) {
  const { pathname: path } = url;
  const { method } = request;

  if (path === '/' && method === 'GET') {
    const [stats, recent] = await Promise.all([ledger.stats(), ledger.listTeams({}, 3)]);
    return html(home(stats ?? { students: 0, recorded: 0, teams: 0 }, recent));
  }
  if (path === '/students' && method === 'GET') {
    const { page, ...filters } = cleanSearch(url);
    const requestedPage = page === undefined ? 1 : integer(Number(page), 'ページ', 1, 10000, 'page');
    const [students, schools] = await Promise.all([ledger.listStudents(filters), ledger.schools()]);
    return html(studentsList(students, schools, filters, requestedPage));
  }
  if (path === '/teams') {
    if (method === 'GET') {
      const filters = cleanSearch(url);
      return html(teamsList(await ledger.listTeams(filters), filters.mode));
    }
    if (method === 'POST') {
      trustedOrigin(request);
      const input = await formInput(request);
      try {
        const team = await ledger.createTeam(input);
        return redirect(`/teams/${encodeURIComponent(team.id)}`);
      } catch (error) {
        if (!(error instanceof LedgerError)) throw error;
        return html(teamsList(await ledger.listTeams({}), undefined, input, error), error.status);
      }
    }
  }
  const student = /^\/students\/([^/]+)(\/progress)?$/.exec(path);
  if (student) {
    const id = pathId(student[1]);
    const detail = `/students/${encodeURIComponent(id)}`;
    if (!student[2] && method === 'GET') return html(studentPage(await ledger.getStudent(id), undefined, undefined, url.searchParams.has('saved')));
    if (student[2] && method === 'POST') {
      trustedOrigin(request);
      const form = await formInput(request);
      try {
        const patch: Record<string, unknown> = {};
        for (const key of progressKeys) {
          if (Object.hasOwn(form, key) && form[key] !== form[`original_${key}`]) {
            patch[key] = form[key].trim() === '' ? null : Number(form[key]);
          }
        }
        if (Object.hasOwn(form, 'memo') && form.memo !== form.original_memo) patch.memo = form.memo;
        if (Object.keys(patch).length) await ledger.saveProgress(id, patch);
        else if (!(await ledger.getStudent(id)).progress) throw invalid('記録する項目を入力してください。');
        return redirect(`${detail}?saved=1#progress`);
      } catch (error) {
        if (!(error instanceof LedgerError) || error.status !== 400) throw error;
        return html(studentPage(await ledger.getStudent(id), form, error), error.status);
      }
    }
  }

  const team = /^\/teams\/([^/]+)$/.exec(path);
  if (team) {
    const id = pathId(team[1]);
    if (method === 'GET') {
      const [saved, students] = await Promise.all([ledger.getTeam(id), ledger.listStudents({})]);
      return html(teamPage(saved, students, undefined, undefined, url.searchParams.has('saved')));
    }
    if (method === 'POST') {
      trustedOrigin(request);
      const form = await formInput(request);
      const { members, normalized } = teamFormSlots(form);
      try {
        await ledger.saveTeam(id, { name: form.name, mode: form.mode, memo: form.memo ?? null, revision: form.revision, members });
        return redirect(`/teams/${encodeURIComponent(id)}?saved=1#lineup`);
      } catch (error) {
        if (!(error instanceof LedgerError) || ![400, 409].includes(error.status)) throw error;
        const [saved, students] = await Promise.all([ledger.getTeam(id), ledger.listStudents({})]);
        return html(teamPage(saved, students, normalized, { message: error.message, conflict: error.code === 'CONFLICT' }), error.status);
      }
    }
  }
  throw missing();
}

export function createWorker(authenticate = accessAuthenticator()) {
  return {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
      const path = url.pathname;
      if (path === '/healthz' && request.method === 'GET') {
        try {
          await env.DB.prepare('SELECT id FROM students LIMIT 1').first();
          return json({ status: 'ok', release: '2.1.0' });
        } catch {
          console.error(JSON.stringify({ code: 'DB_UNAVAILABLE', entry: 'health' }));
          return json({ status: 'unavailable' }, 503);
        }
      }
      if (Object.hasOwn(assets, path) && (request.method === 'GET' || request.method === 'HEAD')) {
        const [data, contentType] = assets[path];
        return new Response(request.method === 'GET' ? data : null, {
          headers: { ...privateHeaders, 'content-type': contentType, 'cache-control': 'public, max-age=300' },
        });
      }

      try {
        const ledger = new Ledger(env.DB, await authenticate(request, env));
        return await browser(request, url, ledger);
      } catch (error) {
        const failure = error instanceof LedgerError ? error :
          new LedgerError(500, 'INTERNAL_ERROR', '処理に失敗しました。時間をおいてお試しください。');
        if (failure.status >= 500) console.error(JSON.stringify({ code: failure.code, entry: 'browser' }));
        return html(errorPage(failure.message, failure.status), failure.status);
      }
    },
  };
}

export default createWorker() satisfies ExportedHandler<Env>;

import { readFile, writeFile } from 'node:fs/promises';

const target = process.argv[2];
if (!['preview', 'production'].includes(target)) {
  throw new Error('引数に preview または production を指定してください。');
}
const { LEDGER_D1_ID, LEDGER_ACCESS_ISSUER, LEDGER_ACCESS_AUDIENCE } = process.env;
if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(LEDGER_D1_ID ?? '') ||
    LEDGER_D1_ID === '00000000-0000-4000-8000-000000000000' ||
    !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(LEDGER_ACCESS_ISSUER ?? '') ||
    !/^[a-f0-9]{64}$/i.test(LEDGER_ACCESS_AUDIENCE ?? '')) {
  throw new Error('対象環境の LEDGER_D1_ID、LEDGER_ACCESS_ISSUER、LEDGER_ACCESS_AUDIENCE を確認してください。');
}

const config = JSON.parse(await readFile('wrangler.jsonc', 'utf8'));
const name = target === 'preview' ? 'schale-ledger-v2-preview' : 'schale-ledger-v2';
config.name = name;
config.workers_dev = true;
config.vars = { ACCESS_ISSUER: LEDGER_ACCESS_ISSUER, ACCESS_AUDIENCE: LEDGER_ACCESS_AUDIENCE };
config.d1_databases = [{
  binding: 'DB',
  database_name: name,
  database_id: LEDGER_D1_ID,
}];
await writeFile('wrangler.release.json', JSON.stringify(config, null, 2) + '\n');

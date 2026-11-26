import { basename } from 'node:path';
import { readFile, readdir } from 'node:fs/promises';

const sqlString = value => "'" + value.replaceAll("'", "''") + "'";

async function generate(path, keys) {
  const { checkedOn, noticesReviewed, students } = JSON.parse(await readFile(path, 'utf8'));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkedOn) || !Number.isInteger(noticesReviewed) || noticesReviewed < 1 ||
      !Array.isArray(students) || students.length < 1) {
    throw new Error(`${path} の確認日・資料件数・生徒一覧を確認してください。`);
  }
  const values = students.map(student => {
    const { id, name, school = '未確認', rarity = null, notice } = student;
    if (Object.keys(student).some(key => !['id', 'name', 'school', 'rarity', 'notice'].includes(key)) ||
        typeof id !== 'string' || !/^jp-[a-f0-9]{16}$/.test(id) ||
        typeof name !== 'string' || !name || name.length > 40 || /[<>\r\n]|[（(]通常[）)]/.test(name) ||
        typeof school !== 'string' || !school || school.length > 40 || /[<>\r\n]/.test(school) ||
        !Number.isInteger(notice) || notice < 1 || ![null, 1, 2, 3].includes(rarity)) {
      throw new Error(`${path} の ${id ?? 'IDなし'} に無効な属性があります。`);
    }
    const normalizedName = name.normalize('NFKC');
    if (keys.ids.has(id) || keys.names.has(normalizedName)) throw new Error(`${path} に重複する生徒がいます。`);
    keys.ids.add(id);
    keys.names.add(normalizedName);
    const reading = normalizedName.replace(/[ァ-ヶ]/g, character =>
      String.fromCharCode(character.charCodeAt(0) - 0x60));
    return `  (${[id, name, reading, school].map(sqlString).join(', ')}, ${rarity ?? 'NULL'}, ${notice})`;
  });
  const parts = [`-- ${basename(path)} から生成。`];
  for (let index = 0; index < values.length; index += 24) {
    const batch = values.slice(index, index + 24);
    parts.push(`INSERT INTO students (id, name, reading, school, base_rarity, announcement_id) VALUES\n${batch.join(',\n')};`);
  }
  return parts.join('\n\n') + '\n';
}

const keys = { ids: new Set(), names: new Set() };
const input = process.argv[2];
if (input === '--check') {
  const entries = (await readdir('catalog')).filter(file => /^\d{4}_catalog_.*\.json$/.test(file)).sort();
  if (!entries.length) throw new Error('確認対象の生徒マスタがありません。');
  for (const file of entries) {
    const expected = await generate(`catalog/${file}`, keys);
    const migration = `migrations/${file.replace(/\.json$/, '.sql')}`;
    if (expected !== await readFile(migration, 'utf8')) throw new Error(`${migration} が生徒マスタと一致しません。`);
  }
  console.log(`公式告知付きの追加生徒 ${keys.ids.size} 件を検証しました。`);
} else {
  if (!input) throw new Error('catalog の確認済み JSON または --check を指定してください。');
  process.stdout.write(await generate(input, keys));
}

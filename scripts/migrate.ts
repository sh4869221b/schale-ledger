import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL が設定されていません");
}

const migrationsDir = path.resolve("db/migrations");

async function run(): Promise<void> {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = (await readdir(migrationsDir))
      .filter((file) => file.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b));

    for (const file of files) {
      const migrationId = file;
      const applied = await client.query(
        "SELECT 1 FROM schema_migrations WHERE id = $1 LIMIT 1",
        [migrationId]
      );

      if (applied.rowCount && applied.rowCount > 0) {
        // eslint-disable-next-line no-console
        console.log(`skip ${migrationId}`);
        continue;
      }

      const sql = await readFile(path.join(migrationsDir, file), "utf-8");
      // eslint-disable-next-line no-console
      console.log(`apply ${migrationId}`);

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (id) VALUES ($1)", [migrationId]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await client.end();
  }
}

await run();

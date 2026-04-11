import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
DB_PACKAGE = ROOT / "packages" / "db" / "package.json"


class DbMigrationScriptTests(unittest.TestCase):
    def test_db_package_uses_explicit_remote_script_names(self):
        package = json.loads(DB_PACKAGE.read_text())
        scripts = package["scripts"]
        self.assertIn("migrate:local", scripts)
        self.assertIn("migrate:remote:dev", scripts)
        self.assertIn("migrate:remote:prod", scripts)
        self.assertNotIn("migrate:dev", scripts)
        self.assertNotIn("migrate:prod", scripts)

    def test_db_package_targets_correct_remote_flags(self):
        package = json.loads(DB_PACKAGE.read_text())
        scripts = package["scripts"]
        self.assertEqual(
            scripts["migrate:remote:dev"],
            "wrangler d1 migrations apply DB --remote --env dev --config ../../apps/web/wrangler.jsonc",
        )
        self.assertEqual(
            scripts["migrate:remote:prod"],
            "wrangler d1 migrations apply DB --remote --config ../../apps/web/wrangler.jsonc",
        )


if __name__ == "__main__":
    unittest.main()

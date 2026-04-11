import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
RUNBOOK = ROOT / "docs" / "runbooks" / "cloudflare-git-deploy.md"
CHECKLIST = ROOT / "infrastructure" / "wrangler" / "cutover-checklist.md"


class CloudflareRunbookTests(unittest.TestCase):
    def test_runbook_exists(self):
        self.assertTrue(RUNBOOK.exists(), "cloudflare git deploy runbook must exist")

    def test_runbook_covers_required_operator_fields(self):
        text = RUNBOOK.read_text()
        self.assertIn("dev` -> dev", text)
        self.assertIn("main` -> prod", text)
        self.assertIn("root directory", text)
        self.assertIn("build command", text)
        self.assertIn("D1", text)
        self.assertIn("CF_ACCESS_AUD", text)
        self.assertIn("CF_ACCESS_TEAM_DOMAIN", text)
        self.assertIn("SESSION_COOKIE_SECRET", text)
        self.assertNotIn("migrate:dev", text)
        self.assertNotIn("migrate:prod", text)
        self.assertIn("migrate:remote:dev", text)
        self.assertIn("migrate:remote:prod", text)

    def test_runbook_and_checklist_cover_runtime_checks_and_migration_order(self):
        combined = RUNBOOK.read_text() + "\n" + CHECKLIST.read_text()
        self.assertIn("/logout", combined)
        self.assertIn("sqlite_master", combined)
        self.assertIn("migration", combined)
        self.assertIn("before", combined)


if __name__ == "__main__":
    unittest.main()

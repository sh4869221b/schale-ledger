import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
RUNBOOK = ROOT / "docs" / "runbooks" / "cloudflare-git-deploy.md"


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


if __name__ == "__main__":
    unittest.main()

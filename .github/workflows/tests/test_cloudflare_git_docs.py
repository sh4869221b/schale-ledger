import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
README = ROOT / "README.md"
CLOUDFLARE_SETUP = ROOT / "docs" / "cloudflare-setup.md"
WRANGLER_README = ROOT / "infrastructure" / "wrangler" / "README.md"
CHECKLIST = ROOT / "infrastructure" / "wrangler" / "cutover-checklist.md"


class CloudflareGitDocsTests(unittest.TestCase):
    def test_docs_describe_cloudflare_git_integration_as_primary_deploy_path(self):
        for path in [README, CLOUDFLARE_SETUP, WRANGLER_README, CHECKLIST]:
            text = path.read_text()
            self.assertIn("Cloudflare", text)
            self.assertNotIn("bun run deploy:dev", text)
            self.assertNotIn("bun run deploy:prod", text)

    def test_docs_state_ci_only_manual_migration_and_branch_mapping(self):
        combined = "\n".join(path.read_text() for path in [README, CLOUDFLARE_SETUP, WRANGLER_README, CHECKLIST])
        self.assertIn("CI-only", combined)
        self.assertIn("manual", combined)
        self.assertIn("dev` -> dev", combined)
        self.assertIn("main` -> prod", combined)


if __name__ == "__main__":
    unittest.main()

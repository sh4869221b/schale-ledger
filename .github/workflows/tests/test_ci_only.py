import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CI_WORKFLOW = ROOT / ".github" / "workflows" / "ci.yml"
DEPLOY_WORKFLOW = ROOT / ".github" / "workflows" / "deploy-workers.yml"


class CiOnlyWorkflowTests(unittest.TestCase):
    def test_deploy_workers_workflow_is_removed(self):
        self.assertFalse(DEPLOY_WORKFLOW.exists(), "deploy-workers.yml must be removed so GitHub Actions is CI-only")

    def test_ci_workflow_keeps_required_verification_commands(self):
        text = CI_WORKFLOW.read_text()
        self.assertIn("bun test", text)
        self.assertIn("bun run check", text)
        self.assertIn("bun run build", text)
        self.assertEqual(text.count("bun run db:migrate:local"), 2)


if __name__ == "__main__":
    unittest.main()

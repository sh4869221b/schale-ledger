import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
HELPER = ROOT / ".github" / "workflows" / "scripts" / "prepare_wrangler.py"
HELPER_TEST = ROOT / ".github" / "workflows" / "scripts" / "test_prepare_wrangler.py"


class GithubDeployHelperRemovalTests(unittest.TestCase):
    def test_prepare_wrangler_helper_is_removed(self):
        self.assertFalse(HELPER.exists(), "prepare_wrangler.py must be removed with GitHub deploy path")

    def test_prepare_wrangler_test_is_removed(self):
        self.assertFalse(HELPER_TEST.exists(), "test_prepare_wrangler.py must be removed with GitHub deploy path")


if __name__ == "__main__":
    unittest.main()

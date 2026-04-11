import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
ROOT_PACKAGE = ROOT / "package.json"
WEB_PACKAGE = ROOT / "apps" / "web" / "package.json"


class RuntimeOpsScriptTests(unittest.TestCase):
    def test_root_package_has_no_deploy_scripts(self):
        package = json.loads(ROOT_PACKAGE.read_text())
        scripts = package["scripts"]
        self.assertNotIn("deploy:dev", scripts)
        self.assertNotIn("deploy:prod", scripts)

    def test_root_package_keeps_verification_scripts(self):
        package = json.loads(ROOT_PACKAGE.read_text())
        scripts = package["scripts"]
        self.assertIn("dev", scripts)
        self.assertIn("build", scripts)
        self.assertIn("check", scripts)
        self.assertIn("test", scripts)
        self.assertIn("db:migrate:local", scripts)

    def test_web_package_has_no_local_deploy_scripts(self):
        package = json.loads(WEB_PACKAGE.read_text())
        scripts = package["scripts"]
        self.assertNotIn("deploy:dev", scripts)
        self.assertNotIn("deploy:prod", scripts)


if __name__ == "__main__":
    unittest.main()

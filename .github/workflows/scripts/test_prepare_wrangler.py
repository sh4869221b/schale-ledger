import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))

import prepare_wrangler


class PrepareWranglerTests(unittest.TestCase):
    def test_prepare_wrangler_keeps_session_secret_placeholder_intact_until_its_own_replacement(self):
        source = """
        {
          "vars": {
            "CF_ACCESS_AUD": "replace-me",
            "CF_ACCESS_TEAM_DOMAIN": "replace-me.cloudflareaccess.com",
            "SESSION_COOKIE_SECRET": "replace-me-session-secret"
          },
          "env": {
            "prod": {
              "vars": {
                "CF_ACCESS_AUD": "replace-me-prod",
                "CF_ACCESS_TEAM_DOMAIN": "replace-me.cloudflareaccess.com",
                "SESSION_COOKIE_SECRET": "replace-me-prod-session-secret"
              },
              "d1_databases": [{ "database_id": "00000000-0000-0000-0000-000000000002" }]
            }
          }
        }
        """

        rendered = prepare_wrangler.prepare_wrangler_text(
            source,
            target_env="prod",
            env={
                "PROD_DB_ID": "db-prod-id",
                "CF_ACCESS_AUD": "aud-prod",
                "CF_ACCESS_TEAM_DOMAIN": "team.example.com",
                "SESSION_COOKIE_SECRET": "secret-prod",
            },
        )

        self.assertIn('"CF_ACCESS_AUD": "aud-prod"', rendered)
        self.assertIn('"SESSION_COOKIE_SECRET": "secret-prod"', rendered)
        self.assertNotIn("replace-me-prod-session-secret", rendered)

    def test_prepare_wrangler_reports_missing_required_envs_clearly(self):
        source = '{"vars":{"CF_ACCESS_AUD":"replace-me-prod","SESSION_COOKIE_SECRET":"replace-me-prod-session-secret"}}'

        with self.assertRaisesRegex(SystemExit, "missing required environment variables"):
            prepare_wrangler.prepare_wrangler_text(
                source,
                target_env="prod",
                env={
                    "PROD_DB_ID": "",
                    "CF_ACCESS_AUD": "",
                    "CF_ACCESS_TEAM_DOMAIN": "",
                    "SESSION_COOKIE_SECRET": "",
                },
            )


if __name__ == "__main__":
    unittest.main()

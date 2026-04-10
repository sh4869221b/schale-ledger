import os
import pathlib
import sys


def replace(text: str, old: str, new: str) -> str:
    if old not in text:
        raise SystemExit(f"placeholder not found: {old}")
    return text.replace(old, new)


def main() -> None:
    target_env = sys.argv[1]
    wrangler_path = pathlib.Path(sys.argv[2])
    text = wrangler_path.read_text()

    text = replace(text, "replace-me.cloudflareaccess.com", os.environ["CF_ACCESS_TEAM_DOMAIN"])
    text = replace(text, f"replace-me-{target_env}", os.environ["CF_ACCESS_AUD"])

    if target_env == "dev":
        text = replace(text, "00000000-0000-0000-0000-000000000001", os.environ["DEV_DB_ID"])
        text = replace(text, "replace-me-dev-session-secret", os.environ["SESSION_COOKIE_SECRET"])
    else:
        text = replace(text, "00000000-0000-0000-0000-000000000002", os.environ["PROD_DB_ID"])
        text = replace(text, "replace-me-prod-session-secret", os.environ["SESSION_COOKIE_SECRET"])

    wrangler_path.write_text(text)


if __name__ == "__main__":
    main()

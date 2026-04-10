import os
import pathlib
import sys


def required_env_names(target_env: str) -> list[str]:
    shared = ["CF_ACCESS_AUD", "CF_ACCESS_TEAM_DOMAIN", "SESSION_COOKIE_SECRET"]
    return (["DEV_DB_ID"] if target_env == "dev" else ["PROD_DB_ID"]) + shared


def validate_env(target_env: str, env: dict[str, str]) -> None:
    missing = [name for name in required_env_names(target_env) if not env.get(name)]
    if missing:
        raise SystemExit(f"missing required environment variables: {', '.join(missing)}")


def replace(text: str, old: str, new: str) -> str:
    if old not in text:
        raise SystemExit(f"placeholder not found: {old}")
    return text.replace(old, new)


def replace_if_present(text: str, old: str, new: str) -> str:
    return text.replace(old, new) if old in text else text


def prepare_wrangler_text(text: str, target_env: str, env: dict[str, str]) -> str:
    validate_env(target_env, env)

    secret_placeholder = (
        "replace-me-dev-session-secret" if target_env == "dev" else "replace-me-prod-session-secret"
    )
    db_placeholder = (
        "00000000-0000-0000-0000-000000000001" if target_env == "dev" else "00000000-0000-0000-0000-000000000002"
    )

    rendered = replace(text, secret_placeholder, env["SESSION_COOKIE_SECRET"])
    rendered = replace_if_present(rendered, "replace-me-session-secret", env["SESSION_COOKIE_SECRET"])
    rendered = replace(rendered, f"replace-me-{target_env}", env["CF_ACCESS_AUD"])
    rendered = replace(rendered, "replace-me.cloudflareaccess.com", env["CF_ACCESS_TEAM_DOMAIN"])
    rendered = replace(rendered, db_placeholder, env["DEV_DB_ID"] if target_env == "dev" else env["PROD_DB_ID"])

    return rendered


def main() -> None:
    target_env = sys.argv[1]
    wrangler_path = pathlib.Path(sys.argv[2])
    text = wrangler_path.read_text()

    text = prepare_wrangler_text(text, target_env=target_env, env=dict(os.environ))

    wrangler_path.write_text(text)


if __name__ == "__main__":
    main()

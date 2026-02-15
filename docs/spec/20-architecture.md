# 20 Architecture

## 実行構成
- 単一サービス: `services/app`（SvelteKit）
- 単一サービス内で UI + REST + MCP を提供する。
- `apps/api` のような別Workerは持たない。

## レイヤ構成
- `packages/domain`
- `packages/application`
- `packages/contracts`
- `packages/infrastructure`
- `services/app`（adapter: HTTP/JSON-RPC/UI）

## 依存方向
- `services/app` -> `packages/application`, `packages/contracts`, `packages/infrastructure`
- `packages/infrastructure` -> `packages/application`, `packages/domain`, `packages/contracts`
- `packages/application` -> `packages/domain`, `packages/contracts`
- `packages/domain` は他層に依存しない

## 認証/認可境界
- Adapters で外部IDを `userId` に解決する。
- Application は `userId` のみを受け取り、Repository条件へ必ず付与する。

## I/F統一
- REST と MCP は同じ Application サービスを呼ぶ。
- エラーモデルは `code/message/details` で共通化する。

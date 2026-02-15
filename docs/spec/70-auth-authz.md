# 70 Auth/AuthZ

## Identity解決
- Cloudflare Access の JWT (`cf-access-jwt-assertion`) を優先
- `sub` を主キーとして外部IDを解決
- `sub` が無い場合のみ `email` を補助使用
- 外部ID未登録の場合は `users` を作成して `userId` を払い出す

## 認可
- Application層は `userId` を必須引数にする
- Repository取得/更新条件に必ず `userId` を含める
- 越境時は `NotFoundError` に統一

## UI保護
- Cloudflare Access は UI に適用
- API/MCP は同一アプリ内エンドポイントとして実行し、userId境界で制御する

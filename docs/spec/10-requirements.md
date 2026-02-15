# 10 Requirements

## 目的
- 生徒育成データと編成データを同一ドメイン/同一ユースケースで扱う。
- UI、REST、MCP が同一 Application 層を呼び、二重実装を禁止する。
- `userId` を唯一のセキュリティ境界として越境アクセスを防止する。

## MVPスコープ
- 生徒マスタの一覧/詳細参照（検索/フィルタ含む）
- ユーザ×生徒の進捗参照と Upsert
- 編成の一覧/詳細参照、メンバー完全置換

## 非スコープ
- 共有・公開・共同編集
- 監査ログ/履歴管理
- 外部ゲームデータ同期
- マスタ編集UI

## 技術制約
- ランタイム: Cloudflare Pages + SvelteKit
- DB: Neon PostgreSQL
- 接続: Hyperdrive
- ORM: Drizzle ORM
- Domain/Application 層はフレームワーク非依存

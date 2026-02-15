# 99 Implementation Tasks

## 実装順
1. ワークスペース初期化（Bun workspace）
2. Domain / Contracts / Application パッケージ作成
3. Drizzle schema + SQL migration 作成
4. Infrastructure（Repository/Identity/DB接続）実装
5. SvelteKit（UI/REST/MCP）実装
6. CI（migration + deploy）実装
7. テストとドキュメント更新

## 破壊的変更方針
- 既存構成の互換は維持しない
- 設計に合わないファイルは削除・置換

## Definition of Done
- docs/spec が実装と一致
- REST/MCP が同一 Application を呼ぶ
- userId越境が再現不能
- dev/main で migration + deploy が分離

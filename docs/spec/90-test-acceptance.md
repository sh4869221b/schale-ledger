# 90 Test & Acceptance

## Unit
- domain: 不変条件、mode別slot制約
- application: userId境界、冪等性、Conflict判定

## Integration
- repository: UNIQUE/FK/CASCADE
- REST: status/code/message/details
- MCP: initialize -> tools/list -> tools/call

## E2E
- 生徒一覧 -> 詳細 -> 進捗Upsert
- 編成一覧 -> 詳細 -> メンバーReplace

## CI acceptance
- `dev` push: dev migration + deploy
- `main` push: prod migration + deploy
- 失敗時に error.code がログで判別可能

# 51 MCP Contracts

## 準拠
- JSON-RPC 2.0 over HTTP
- MCP lifecycle
  - `initialize`
  - `notifications/initialized`
- MCP server tools
  - `tools/list`
  - `tools/call`

## Transport
- Endpoint: `POST /mcp`
- Request/response payload は JSON-RPC 2.0 形式
- Notification (`id` 無し) は `204` を返してよい

## Tool methods
- `students.list`
- `students.get`
- `students.progress.upsert`
- `teams.list`
- `teams.get`
- `teams.members.replace`

## Tool result
- 成功: `content[]` + `structuredContent`
- 業務エラー: `isError: true` + `structuredContent.error = { code, message, details }`
- プロトコルエラー（不正JSON-RPC等）は JSON-RPC `error` を返す

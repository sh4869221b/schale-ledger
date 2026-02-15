# 50 REST Contracts

## 共通
- Content-Type: `application/json; charset=utf-8`
- Error shape:
  - `code: string`
  - `message: string` (日本語)
  - `details?: object`

## Endpoints
- `GET /api/students`
  - query: `q`, `school`, `role`, `position`, `attackType`, `defenseType`, `isLimited`
- `GET /api/students/{studentId}`
- `PUT /api/students/{studentId}/progress`
  - body: patch
- `GET /api/teams`
  - query: `mode`
- `GET /api/teams/{teamId}`
- `PUT /api/teams/{teamId}/members`
  - body: `{ members: TeamMemberInput[] }`

## HTTP status
- 200: 正常
- 400: ValidationError
- 401: AuthenticationRequired
- 404: NotFoundError
- 409: ConflictError
- 500: InternalError

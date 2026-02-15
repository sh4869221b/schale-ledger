# 40 Usecases

## Students

### ListStudents
- Input: `userId`, `filter?`
- Output: `StudentSummary[]`
- Rule: マスタ一覧にユーザ進捗サマリを合成し、未登録は `progress: null`

### GetStudentDetail
- Input: `userId`, `studentId`
- Output: `StudentDetail`
- Rule: マスタ未存在は `NotFoundError`、進捗未登録は `progress: null`

### UpsertStudentProgress
- Input: `userId`, `studentId`, `patch`
- Output: `StudentDetail`
- Rule: 冪等、patch未指定項目は保持
- Rule: 永続化条件に `userId` 必須

## Teams

### ListTeams
- Input: `userId`, `mode?`
- Output: `TeamSummary[]`

### GetTeam
- Input: `userId`, `teamId`
- Output: `TeamDetail`
- Rule: 越境時は `NotFoundError` に統一

### ReplaceTeamMembers
- Input: `userId`, `teamId`, `members[]`
- Output: `TeamDetail`
- Rule: 完全置換（不足削除）
- Rule: 冪等
- Rule: 単一トランザクションで `delete -> insert`
- Rule: `positionIndex` 重複は `ConflictError`

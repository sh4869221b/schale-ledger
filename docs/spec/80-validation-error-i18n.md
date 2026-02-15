# 80 Validation/Error/I18N

## バリデーション
- 数値上限は `progress_caps` を参照
- ReplaceTeamMembers
  - `positionIndex` 重複禁止
  - メンバー数 <= mode slot
  - `studentId` 存在必須

## エラー種別
- `ValidationError`
- `NotFoundError`
- `PermissionError`
- `ConflictError`
- `InternalError`
- `AuthenticationRequiredError`

## 表示方針
- `code`: 機械可読（英字）
- `message`: 日本語
- `details`: 日本語または構造化データ

## i18n
- MVPは日本語固定
- 将来多言語化時も `code` は互換維持

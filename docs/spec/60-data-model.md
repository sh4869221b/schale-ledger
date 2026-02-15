# 60 Data Model

## tables
- `users`
  - `id` (uuid pk)
  - `external_provider`, `external_subject`, `external_email`
- `students`
  - `student_id` (text pk)
  - `name`, `school`, `role`, `position`, `attack_type`, `defense_type`, `rarity_base`, `is_limited`
- `user_student_progress`
  - pk: `(user_id, student_id)`
  - 進捗項目一式
- `teams`
  - `id` (uuid pk)
  - `user_id` fk -> users.id
  - `name`, `mode`, `memo`, timestamps
- `team_members`
  - pk: `(team_id, position_index)`
  - `team_id` fk -> teams.id on delete cascade
  - `student_id` fk -> students.student_id
- `team_mode_rules`
  - `mode` pk
  - `slot_count`
- `progress_caps`
  - `key` pk
  - `min_value`, `max_value`

## 初期データ
- team_mode_rules
  - `raid`: 6
  - `jfd`: 6
- progress_caps
  - `level`, `rarity`, `bondLevel`, `exSkillLevel`, `normalSkillLevel`, `passiveSkillLevel`, `subSkillLevel`, `equipmentTier`, `uniqueWeaponRank`, `uniqueWeaponLevel`, `shards`, `favoriteGifts`

## migration運用
- `db/migrations/*.sql` を順序実行
- CIで `dev/main` それぞれ migration 実行後に deploy

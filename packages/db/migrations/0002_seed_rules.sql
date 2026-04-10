INSERT INTO team_mode_rules (mode, slot_count)
VALUES
  ('raid', 6),
  ('jfd', 6)
ON CONFLICT(mode) DO UPDATE SET
  slot_count = excluded.slot_count,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now');

INSERT INTO progress_caps (key, min_value, max_value)
VALUES
  ('level', 1, 100),
  ('rarity', 1, 8),
  ('bondLevel', 1, 100),
  ('exSkillLevel', 1, 10),
  ('normalSkillLevel', 1, 10),
  ('passiveSkillLevel', 1, 10),
  ('subSkillLevel', 1, 10),
  ('equipmentTier', 0, 10),
  ('uniqueWeaponRank', 0, 5),
  ('uniqueWeaponLevel', 0, 100),
  ('shards', 0, 9999),
  ('favoriteGifts', 0, 999)
ON CONFLICT(key) DO UPDATE SET
  min_value = excluded.min_value,
  max_value = excluded.max_value,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now');

INSERT INTO students (student_id, name, school, role, position, attack_type, defense_type, rarity_base, is_limited)
VALUES
  ('S0001', 'アリス', 'ミレニアム', 'Dealer', 'Back', 'Mystic', 'Light', 3, 0),
  ('S0002', 'ホシノ', 'アビドス', 'Tank', 'Front', 'Explosive', 'Heavy', 3, 0),
  ('S0003', 'ヒマリ', 'ミレニアム', 'Support', 'Back', 'Mystic', 'Special', 3, 0)
ON CONFLICT(student_id) DO UPDATE SET
  name = excluded.name,
  school = excluded.school,
  role = excluded.role,
  position = excluded.position,
  attack_type = excluded.attack_type,
  defense_type = excluded.defense_type,
  rarity_base = excluded.rarity_base,
  is_limited = excluded.is_limited,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now');

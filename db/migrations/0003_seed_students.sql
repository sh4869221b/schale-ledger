INSERT INTO students (student_id, name, school, role, position, attack_type, defense_type, rarity_base, is_limited)
VALUES
  ('S0001', 'アリス', 'ミレニアム', 'Dealer', 'Back', 'Mystic', 'Light', 3, FALSE),
  ('S0002', 'ホシノ', 'アビドス', 'Tank', 'Front', 'Explosive', 'Heavy', 3, FALSE),
  ('S0003', 'ヒマリ', 'ミレニアム', 'Support', 'Back', 'Mystic', 'Special', 3, FALSE)
ON CONFLICT (student_id) DO UPDATE
SET name = EXCLUDED.name,
    school = EXCLUDED.school,
    role = EXCLUDED.role,
    position = EXCLUDED.position,
    attack_type = EXCLUDED.attack_type,
    defense_type = EXCLUDED.defense_type,
    rarity_base = EXCLUDED.rarity_base,
    is_limited = EXCLUDED.is_limited,
    updated_at = NOW();

-- 衣装ごとに進捗と編成を記録できるよう、ツクヨとドレスを別IDで登録。
INSERT INTO students (id, name, reading, school, role, position, attack_type, defense_type, base_rarity, is_limited) VALUES
  ('tsukuyo', 'ツクヨ', 'おおのつくよ', '百鬼夜行', 'tank', 'front', 'mystic', 'light', 3, 0),
  ('tsukuyo-dress', 'ツクヨ（ドレス）', 'おおのつくよどれす', '百鬼夜行', 'tank', 'front', 'piercing', 'light', 3, 0);

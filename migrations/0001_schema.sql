CREATE TABLE accounts (
  id TEXT PRIMARY KEY NOT NULL
) STRICT;

CREATE TABLE students (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  reading TEXT NOT NULL,
  school TEXT NOT NULL,
  role TEXT CHECK (role IN ('dealer','tank','support','heal','tactical')),
  position TEXT CHECK (position IN ('front','middle','back')),
  attack_type TEXT CHECK (attack_type IN ('explosive','piercing','mystic','sonic')),
  defense_type TEXT CHECK (defense_type IN ('light','heavy','special','elastic')),
  base_rarity INTEGER CHECK (base_rarity BETWEEN 1 AND 3),
  is_limited INTEGER CHECK (is_limited IN (0,1))
) STRICT;

CREATE TABLE progress (
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id),
  level INTEGER CHECK (level BETWEEN 1 AND 150),
  rarity INTEGER CHECK (rarity BETWEEN 1 AND 5),
  bond_level INTEGER CHECK (bond_level BETWEEN 1 AND 100),
  ex_skill_level INTEGER CHECK (ex_skill_level BETWEEN 1 AND 5),
  normal_skill_level INTEGER CHECK (normal_skill_level BETWEEN 1 AND 10),
  passive_skill_level INTEGER CHECK (passive_skill_level BETWEEN 1 AND 10),
  sub_skill_level INTEGER CHECK (sub_skill_level BETWEEN 1 AND 10),
  equipment_1_tier INTEGER CHECK (equipment_1_tier BETWEEN 0 AND 15),
  equipment_2_tier INTEGER CHECK (equipment_2_tier BETWEEN 0 AND 15),
  equipment_3_tier INTEGER CHECK (equipment_3_tier BETWEEN 0 AND 15),
  unique_weapon_rank INTEGER CHECK (unique_weapon_rank BETWEEN 0 AND 5),
  unique_weapon_level INTEGER CHECK (unique_weapon_level BETWEEN 0 AND 100),
  shards_owned INTEGER CHECK (shards_owned BETWEEN 0 AND 99999),
  shards_used INTEGER CHECK (shards_used BETWEEN 0 AND 99999),
  favorite_gifts INTEGER CHECK (favorite_gifts BETWEEN 0 AND 99999),
  memo TEXT CHECK (length(memo) <= 2000),
  updated_at TEXT NOT NULL,
  PRIMARY KEY (account_id, student_id)
) STRICT;
CREATE INDEX progress_student ON progress(student_id);

CREATE TABLE teams (
  id TEXT PRIMARY KEY NOT NULL,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 80),
  mode TEXT NOT NULL CHECK (mode IN ('raid','jfd')),
  memo TEXT CHECK (length(memo) <= 2000),
  revision TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;
CREATE INDEX teams_owner_updated ON teams(account_id, updated_at DESC, id);
CREATE INDEX teams_owner_mode_updated ON teams(account_id, mode, updated_at DESC, id);

CREATE TABLE team_slots (
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  position_index INTEGER NOT NULL CHECK (position_index BETWEEN 0 AND 5),
  student_id TEXT NOT NULL REFERENCES students(id),
  is_support INTEGER NOT NULL CHECK (is_support IN (0,1)),
  PRIMARY KEY (team_id, position_index)
) STRICT;
CREATE INDEX team_slots_student ON team_slots(student_id);

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_provider TEXT NOT NULL,
  external_subject TEXT NOT NULL,
  external_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_provider_subject_unique UNIQUE (external_provider, external_subject)
);

CREATE TABLE IF NOT EXISTS students (
  student_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  role TEXT NOT NULL,
  position TEXT NOT NULL,
  attack_type TEXT NOT NULL,
  defense_type TEXT NOT NULL,
  rarity_base INTEGER NOT NULL,
  is_limited BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_student_progress (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  rarity INTEGER NOT NULL,
  bond_level INTEGER NOT NULL,
  ex_skill_level INTEGER NOT NULL,
  normal_skill_level INTEGER NOT NULL,
  passive_skill_level INTEGER NOT NULL,
  sub_skill_level INTEGER NOT NULL,
  equipment1_tier INTEGER NOT NULL,
  equipment2_tier INTEGER NOT NULL,
  equipment3_tier INTEGER NOT NULL,
  unique_weapon_rank INTEGER NOT NULL,
  unique_weapon_level INTEGER NOT NULL,
  shards_owned INTEGER NOT NULL,
  shards_used INTEGER NOT NULL,
  favorite_gifts INTEGER NOT NULL,
  memo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, student_id)
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mode TEXT NOT NULL,
  memo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  position_index INTEGER NOT NULL,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE RESTRICT,
  is_support BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, position_index)
);

CREATE TABLE IF NOT EXISTS team_mode_rules (
  mode TEXT PRIMARY KEY,
  slot_count INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress_caps (
  key TEXT PRIMARY KEY,
  min_value INTEGER NOT NULL,
  max_value INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

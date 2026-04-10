import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const isoNow = sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;

const timestamps = {
  createdAt: text("created_at").notNull().default(isoNow),
  updatedAt: text("updated_at").notNull().default(isoNow)
};

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  externalProvider: text("external_provider").notNull(),
  externalSubject: text("external_subject").notNull(),
  email: text("email"),
  ...timestamps
}, (table) => ({
  providerSubjectUnique: uniqueIndex("users_provider_subject_uidx").on(table.externalProvider, table.externalSubject)
}));

export const sessions = sqliteTable("sessions", {
  sessionId: text("session_id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  ...timestamps
});

export const students = sqliteTable("students", {
  studentId: text("student_id").primaryKey(),
  name: text("name").notNull(),
  school: text("school").notNull(),
  role: text("role").notNull(),
  position: text("position").notNull(),
  attackType: text("attack_type").notNull(),
  defenseType: text("defense_type").notNull(),
  rarityBase: integer("rarity_base").notNull(),
  isLimited: integer("is_limited", { mode: "boolean" }).notNull().default(false),
  ...timestamps
});

export const studentProgress = sqliteTable(
  "student_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => students.studentId, { onDelete: "cascade" }),
    level: integer("level").notNull(),
    rarity: integer("rarity").notNull(),
    bondLevel: integer("bond_level").notNull(),
    exSkillLevel: integer("ex_skill_level").notNull(),
    normalSkillLevel: integer("normal_skill_level").notNull(),
    passiveSkillLevel: integer("passive_skill_level").notNull(),
    subSkillLevel: integer("sub_skill_level").notNull(),
    equipment1Tier: integer("equipment1_tier").notNull(),
    equipment2Tier: integer("equipment2_tier").notNull(),
    equipment3Tier: integer("equipment3_tier").notNull(),
    uniqueWeaponRank: integer("unique_weapon_rank").notNull(),
    uniqueWeaponLevel: integer("unique_weapon_level").notNull(),
    shardsOwned: integer("shards_owned").notNull(),
    shardsUsed: integer("shards_used").notNull(),
    favoriteGifts: integer("favorite_gifts").notNull(),
    memo: text("memo").notNull().default(""),
    ...timestamps
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.studentId] })
  })
);

export const teams = sqliteTable("teams", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  mode: text("mode").notNull(),
  memo: text("memo").notNull().default(""),
  ...timestamps
});

export const teamMembers = sqliteTable(
  "team_members",
  {
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    positionIndex: integer("position_index").notNull(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.studentId, { onDelete: "restrict" }),
    isSupport: integer("is_support", { mode: "boolean" }).notNull().default(false),
    ...timestamps
  },
  (table) => ({
    pk: primaryKey({ columns: [table.teamId, table.positionIndex] })
  })
);

export const teamModeRules = sqliteTable("team_mode_rules", {
  mode: text("mode").primaryKey(),
  slotCount: integer("slot_count").notNull(),
  updatedAt: text("updated_at").notNull().default(isoNow)
});

export const progressCaps = sqliteTable("progress_caps", {
  key: text("key").primaryKey(),
  minValue: integer("min_value").notNull(),
  maxValue: integer("max_value").notNull(),
  updatedAt: text("updated_at").notNull().default(isoNow)
});

export const tableNames = [
  "users",
  "sessions",
  "students",
  "student_progress",
  "teams",
  "team_members",
  "team_mode_rules",
  "progress_caps"
] as const;

export const schema = {
  users,
  sessions,
  students,
  studentProgress,
  teams,
  teamMembers,
  teamModeRules,
  progressCaps
};

import { boolean, integer, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    externalProvider: text("external_provider").notNull(),
    externalSubject: text("external_subject").notNull(),
    externalEmail: text("external_email"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    providerSubjectUnique: uniqueIndex("users_provider_subject_uidx").on(table.externalProvider, table.externalSubject)
  })
);

export const students = pgTable("students", {
  studentId: text("student_id").primaryKey(),
  name: text("name").notNull(),
  school: text("school").notNull(),
  role: text("role").notNull(),
  position: text("position").notNull(),
  attackType: text("attack_type").notNull(),
  defenseType: text("defense_type").notNull(),
  rarityBase: integer("rarity_base").notNull(),
  isLimited: boolean("is_limited").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const userStudentProgress = pgTable(
  "user_student_progress",
  {
    userId: uuid("user_id")
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
    memo: text("memo").default("").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.studentId] })
  })
);

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  mode: text("mode").notNull(),
  memo: text("memo").default("").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const teamMembers = pgTable(
  "team_members",
  {
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    positionIndex: integer("position_index").notNull(),
    studentId: text("student_id")
      .notNull()
      .references(() => students.studentId, { onDelete: "restrict" }),
    isSupport: boolean("is_support").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.teamId, table.positionIndex] })
  })
);

export const teamModeRules = pgTable("team_mode_rules", {
  mode: text("mode").primaryKey(),
  slotCount: integer("slot_count").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const progressCaps = pgTable("progress_caps", {
  key: text("key").primaryKey(),
  minValue: integer("min_value").notNull(),
  maxValue: integer("max_value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

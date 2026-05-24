import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ---- colleges --------------------------------------------------------------

export const colleges = pgTable(
  "colleges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    emailDomain: text("email_domain").notNull(),
    isActive: boolean("is_active").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("colleges_slug_idx").on(t.slug),
    domainIdx: uniqueIndex("colleges_email_domain_idx").on(t.emailDomain),
  }),
);

// ---- branches --------------------------------------------------------------

export const branches = pgTable(
  "branches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    collegeId: uuid("college_id")
      .notNull()
      .references(() => colleges.id, { onDelete: "cascade" }),
    // 'UG' | 'PG' — enforced at insert by the seed. We use text + check
    // constraint (defined in migration) instead of a pgEnum because the
    // set is tiny and unlikely to change.
    level: text("level").notNull(),
    // Degree type: 'B.Tech', 'B.Sc', 'B.Arch', 'B.Pharm', 'M.Tech', 'M.Sc',
    // 'M.Pharm', 'MCA', 'MBA', 'MUP', 'M.A.', 'Integrated M.Sc', 'Integrated MBA', etc.
    degree: text("degree").notNull(),
    // Full official name, e.g. "Computer Science and Engineering".
    name: text("name").notNull(),
    // Short identifier used for URLs / quick reference, e.g. "BTECH-CSE".
    shortName: text("short_name").notNull(),
    // Optional sub-specialization, e.g. "Heat Power Engineering" for one of
    // the four M.Tech Mechanical splits. Null for standalone programs.
    specialization: text("specialization"),
    // Explicit dropdown ordering. Lower = earlier within its level group.
    sortOrder: integer("sort_order").notNull().default(100),
    // Discontinued programs stay in the DB (alumni still have them) but
    // appear in a separate "Older programs" group at the bottom of the
    // dropdown rather than being deleted.
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    collegeShortIdx: uniqueIndex("branches_college_short_idx").on(t.collegeId, t.shortName),
    collegeLevelIdx: index("branches_college_level_idx").on(t.collegeId, t.level, t.sortOrder),
  }),
);

// ---- users -----------------------------------------------------------------
// Mirrors auth.users.id from Supabase. We keep our own users table so we can
// join cleanly in RLS policies and Drizzle queries without crossing schemas.

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(), // matches auth.users.id
    email: text("email").notNull(),
    collegeId: uuid("college_id")
      .notNull()
      .references(() => colleges.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
    collegeIdx: index("users_college_idx").on(t.collegeId),
  }),
);

// ---- profiles --------------------------------------------------------------

export type Socials = {
  instagram?: string;
  linkedin?: string;
  github?: string;
  x?: string;
};

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Denormalised from users.college_id so RLS can do same-college lookups
    // without joining other users' rows (those rows are hidden by the
    // users-table RLS policy). Set automatically by a BEFORE INSERT trigger
    // (drizzle/0004_profiles_college_id.sql) but apps SHOULD pass it
    // explicitly on insert as belt-and-suspenders.
    collegeId: uuid("college_id")
      .notNull()
      .references(() => colleges.id, { onDelete: "restrict" }),
    username: text("username").notNull(),
    displayName: text("display_name").notNull(),
    oneLiner: text("one_liner").notNull().default(""),
    knownFor: text("known_for").notNull().default(""),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id, { onDelete: "restrict" }),
    joiningYear: integer("joining_year").notNull(),
    graduatingYear: integer("graduating_year").notNull(),
    currentState: text("current_state"),
    currentCity: text("current_city"),
    photoPath: text("photo_path"),
    socials: jsonb("socials").$type<Socials>().notNull().default(sql`'{}'::jsonb`),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: uniqueIndex("profiles_user_idx").on(t.userId),
    // username is unique within a college+joining_year batch. We enforce this
    // via a partial unique index in the RLS migration since Drizzle does not
    // express composite cross-table uniqueness ergonomically. Here we add a
    // helpful index on username for lookup.
    usernameIdx: index("profiles_username_idx").on(t.username),
    branchIdx: index("profiles_branch_idx").on(t.branchId),
    yearIdx: index("profiles_joining_year_idx").on(t.joiningYear),
    collegeYearIdx: index("profiles_college_year_idx").on(t.collegeId, t.joiningYear),
  }),
);

// ---- relations -------------------------------------------------------------

export const collegesRelations = relations(colleges, ({ many }) => ({
  branches: many(branches),
  users: many(users),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  college: one(colleges, {
    fields: [branches.collegeId],
    references: [colleges.id],
  }),
  profiles: many(profiles),
}));

export const usersRelations = relations(users, ({ one }) => ({
  college: one(colleges, {
    fields: [users.collegeId],
    references: [colleges.id],
  }),
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  branch: one(branches, {
    fields: [profiles.branchId],
    references: [branches.id],
  }),
}));

// ---- inferred types --------------------------------------------------------

export type College = typeof colleges.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

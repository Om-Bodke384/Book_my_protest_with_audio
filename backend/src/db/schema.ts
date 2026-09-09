import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  doublePrecision,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const protestStatusEnum = pgEnum("protest_status", [
  "upcoming",
  "ongoing",
  "completed",
  "cancelled",
]);

// ---------- ADMINS ----------
// Admins are the organizers who create/manage protest events.
export const admins = pgTable(
  "admins",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    organization: varchar("organization", { length: 160 }),
    // Nullable because Google-authenticated admins never set a password.
    passwordHash: varchar("password_hash", { length: 255 }),
    passwordSalt: varchar("password_salt", { length: 255 }),
    googleId: varchar("google_id", { length: 255 }),
    photoUrl: text("photo_url"),
    isVerified: varchar("is_verified", { length: 5 }).default("false"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("admins_email_idx").on(table.email),
    googleIdIdx: uniqueIndex("admins_google_id_idx").on(table.googleId),
  })
);

// ---------- PROTESTERS ----------
// Everyday users who register with identity details and can join protests.
export const protesters = pgTable(
  "protesters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    // Nullable: a Google sign-up has no address yet until the user fills in
    // their profile, whereas the manual registration form still requires it.
    address: text("address"),
    city: varchar("city", { length: 100 }),
    photoUrl: text("photo_url"),
    // Nullable because Google-authenticated protesters never set a password.
    passwordHash: varchar("password_hash", { length: 255 }),
    passwordSalt: varchar("password_salt", { length: 255 }),
    // Address is required for manual signups but a Google sign-in won't have
    // one yet, so it's collected as a one-time follow-up step (nullable here).
    googleId: varchar("google_id", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("protesters_email_idx").on(table.email),
    googleIdIdx: uniqueIndex("protesters_google_id_idx").on(table.googleId),
  })
);

// ---------- PROTESTS ----------
// A protest event created by an admin, pinned to a real map location.
export const protests = pgTable("protests", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: uuid("admin_id")
    .references(() => admins.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  cause: varchar("cause", { length: 120 }).notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: protestStatusEnum("status").default("upcoming").notNull(),
  bannerUrl: text("banner_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- PARTICIPATION (protester <-> protest) ----------
// A protester "joining" a protest is how they connect with the admin/event,
// and is what powers head-counts + "who's going" on the map popup.
export const participations = pgTable(
  "participations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    protestId: uuid("protest_id")
      .references(() => protests.id, { onDelete: "cascade" })
      .notNull(),
    protesterId: uuid("protester_id")
      .references(() => protesters.id, { onDelete: "cascade" })
      .notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => ({
    uniquePair: uniqueIndex("participation_unique_idx").on(
      table.protestId,
      table.protesterId
    ),
  })
);

// ---------- RELATIONS ----------
export const adminsRelations = relations(admins, ({ many }) => ({
  protests: many(protests),
}));

export const protestersRelations = relations(protesters, ({ many }) => ({
  participations: many(participations),
}));

export const protestsRelations = relations(protests, ({ one, many }) => ({
  admin: one(admins, {
    fields: [protests.adminId],
    references: [admins.id],
  }),
  participations: many(participations),
}));

export const participationsRelations = relations(participations, ({ one }) => ({
  protest: one(protests, {
    fields: [participations.protestId],
    references: [protests.id],
  }),
  protester: one(protesters, {
    fields: [participations.protesterId],
    references: [protesters.id],
  }),
}));

import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow (Manus OAuth).
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Game profiles — système de compte personnalisé pour Ticket Cricket.
 * Pseudo + courriel + mot de passe hashé.
 * Indépendant du système OAuth Manus.
 */
export const gameProfiles = mysqlTable("game_profiles", {
  id: int("id").autoincrement().primaryKey(),
  /** Pseudo unique du joueur (affiché en jeu) */
  pseudo: varchar("pseudo", { length: 50 }).notNull().unique(),
  /** Adresse courriel unique */
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** Mot de passe hashé (bcrypt) */
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  /** Lien optionnel vers le compte Manus OAuth */
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type GameProfile = typeof gameProfiles.$inferSelect;
export type InsertGameProfile = typeof gameProfiles.$inferInsert;

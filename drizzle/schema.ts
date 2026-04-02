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

/**
 * Sauvegardes de parties — une sauvegarde par joueur (mode solo uniquement).
 * Remplace la sauvegarde existante à chaque fois.
 */
export const savedGames = mysqlTable("saved_games", {
  id: int("id").autoincrement().primaryKey(),
  /** ID du profil de jeu du joueur */
  profileId: int("profileId").notNull(),
  /** État complet de la partie sérialisé en JSON */
  gameState: text("gameState").notNull(),
  /** Niveau de difficulté sélectionné */
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  /** Numéro du tour actuel */
  currentTurn: int("currentTurn").notNull().default(0),
  /** Nombre de cartes piochuées */
  cardsDrawn: int("cardsDrawn").notNull().default(0),
  /** Date de la dernière sauvegarde */
  savedAt: timestamp("savedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedGame = typeof savedGames.$inferSelect;
export type InsertSavedGame = typeof savedGames.$inferInsert;

/**
 * Événements mini-jeu multijoueur — synchronise le déclenchement du mini-jeu
 * pour tous les joueurs d'une session simultanément.
 * Une entrée par session active, supprimée après résolution.
 */
export const miniGameEvents = mysqlTable("mini_game_events", {
  id: int("id").autoincrement().primaryKey(),
  /** Code de la session multijoueur Supabase */
  sessionCode: varchar("sessionCode", { length: 10 }).notNull(),
  /** Mode du mini-jeu : 'run' ou 'hide' */
  mode: mysqlEnum("mode", ["run", "hide"]).notNull(),
  /** ID du joueur qui a déclenché le mini-jeu */
  triggeredBy: varchar("triggeredBy", { length: 64 }).notNull(),
  /** Timestamp de déclenchement (pour détecter les nouveaux événements via polling) */
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  /** Indique si l'événement est terminé (tous les joueurs ont joué) */
  resolved: int("resolved").notNull().default(0),
});

export type MiniGameEvent = typeof miniGameEvents.$inferSelect;
export type InsertMiniGameEvent = typeof miniGameEvents.$inferInsert;

/**
 * Résultats individuels des joueurs pour un mini-jeu multijoueur.
 * Chaque joueur enregistre son résultat (succès/échec + montant) ici.
 * Le piocheur attend que tous les joueurs actifs aient soumis leur résultat.
 */
export const miniGameResults = mysqlTable("mini_game_results", {
  id: int("id").autoincrement().primaryKey(),
  /** ID de l'événement mini-jeu associé */
  eventId: int("eventId").notNull(),
  /** Code de la session multijoueur */
  sessionCode: varchar("sessionCode", { length: 10 }).notNull(),
  /** ID du joueur qui a soumis ce résultat */
  playerId: varchar("playerId", { length: 64 }).notNull(),
  /** Succès (1) ou échec (0) */
  success: int("success").notNull().default(0),
  /** Montant de la pénalité/récompense */
  amount: int("amount").notNull().default(0),
  /** Timestamp de soumission */
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});
export type MiniGameResult = typeof miniGameResults.$inferSelect;
export type InsertMiniGameResult = typeof miniGameResults.$inferInsert;

/**
 * Cartes personnalisées — créées par les joueurs connectés.
 * Maximum 100 cartes par joueur.
 * Peuvent être ajoutées au deck en solo ou partagées en multi (host uniquement).
 */
export const customCards = mysqlTable("custom_cards", {
  id: int("id").autoincrement().primaryKey(),
  /** ID du profil de jeu du créateur */
  profileId: int("profileId").notNull(),
  /** Catégorie : contravention | contribuable | investisseur */
  category: mysqlEnum("category", ["contravention", "contribuable", "investisseur"]).notNull(),
  /** Texte du méfait (max 150 chars, null pour investisseur) */
  mefait: varchar("mefait", { length: 150 }),
  /** Prix du ticket en dollars (0 pour contribuable) */
  ticketPrice: int("ticketPrice").notNull().default(0),
  /** Frais additionnels (contravention) : 0, 10, 20, 30, 40, 50 */
  frais: int("frais").notNull().default(0),
  /** Remboursement d'impôts (contribuable) : 0, 10, 20, 30, 40, 50 */
  impots: int("impots").notNull().default(0),
  /** Taxe de réduction (investisseur) : 0, 10, 20, 30, 40, 50 */
  taxe: int("taxe").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomCard = typeof customCards.$inferSelect;
export type InsertCustomCard = typeof customCards.$inferInsert;

/**
 * Cartes personnalisées partagées pour une session multijoueur.
 * L'hôte publie ses cartes ici au démarrage, les autres joueurs les récupèrent.
 * Supprimées automatiquement quand la session se termine.
 */
export const sessionCustomCards = mysqlTable("session_custom_cards", {
  id: int("id").autoincrement().primaryKey(),
  /** Code de la session multijoueur */
  sessionCode: varchar("sessionCode", { length: 10 }).notNull(),
  /** Données des cartes personnalisées en JSON */
  cardsJson: text("cardsJson").notNull(),
  /** Timestamp de publication */
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
});

export type SessionCustomCards = typeof sessionCustomCards.$inferSelect;
export type InsertSessionCustomCards = typeof sessionCustomCards.$inferInsert;

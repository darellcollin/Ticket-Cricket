import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  /** Accès VIP admin — débloque tous les skins et la limite illimitée de cartes */
  isAdmin: boolean("isAdmin").default(false).notNull(),
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

/**
 * Configurations de partie sauvegardées par les joueurs.
 * Permet de sauvegarder et recharger rapidement ses réglages préférés
 * (types de cartes, limite de tickets, cartes personnalisées activées).
 * Maximum 10 configurations par joueur.
 */
export const gameConfigs = mysqlTable("game_configs", {
  id: int("id").autoincrement().primaryKey(),
  /** ID du profil de jeu du joueur */
  profileId: int("profileId").notNull(),
  /** Nom donné à la configuration par le joueur */
  name: varchar("name", { length: 50 }).notNull(),
  /** Niveau de difficulté (clé de la difficulté sélectionnée) */
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  /** Désactiver les cartes contribuables (T2) */
  disableT2: int("disableT2").notNull().default(0),
  /** Désactiver les cartes investisseurs (T3) */
  disableT3: int("disableT3").notNull().default(0),
  /** Inclure les cartes personnalisées du joueur */
  includeCustom: int("includeCustom").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameConfig = typeof gameConfigs.$inferSelect;
export type InsertGameConfig = typeof gameConfigs.$inferInsert;

/**
 * Achats Stripe — packs de cartes personnalisables et dons.
 * Enregistrés lors de checkout.session.completed via webhook.
 */
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  /** ID du profil de jeu du joueur */
  profileId: int("profileId").notNull(),
  /** ID produit Stripe (ex: pack_35, pack_55, pack_85, donation) */
  productId: varchar("productId", { length: 50 }).notNull(),
  /** Nom lisible du produit */
  productName: varchar("productName", { length: 100 }).notNull(),
  /** Montant payé en centimes (ex: 299 = 2,99$) */
  amountCents: int("amountCents").notNull().default(0),
  /** Devise (ex: cad) */
  currency: varchar("currency", { length: 10 }).notNull().default("cad"),
  /** ID de session Stripe pour déduplication */
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).notNull().unique(),
  /** Nombre de cartes débloquées (0 pour les dons) */
  cardsUnlocked: int("cardsUnlocked").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

/**
 * Skins débloqués par un joueur (achat Stripe ou classique gratuit).
 */
export const userSkins = mysqlTable("user_skins", {
  id: int("id").autoincrement().primaryKey(),
  /** ID du profil de jeu du joueur */
  profileId: int("profileId").notNull(),
  /** Identifiant du skin : classique | neon | retro | glace | feu | royal */
  skinId: varchar("skinId", { length: 30 }).notNull(),
  /** Date de déblocage */
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type UserSkin = typeof userSkins.$inferSelect;
export type InsertUserSkin = typeof userSkins.$inferInsert;

/**
 * Skin actif du joueur (un seul par joueur).
 * Utilisé pour afficher les cartes en jeu solo et multijoueur.
 */
export const userActiveSkin = mysqlTable("user_active_skin", {
  id: int("id").autoincrement().primaryKey(),
  /** ID du profil de jeu du joueur */
  profileId: int("profileId").notNull().unique(),
  /** Skin actif sélectionné */
  skinId: varchar("skinId", { length: 30 }).notNull().default("classique"),
  /** Date de la dernière modification */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserActiveSkin = typeof userActiveSkin.$inferSelect;
export type InsertUserActiveSkin = typeof userActiveSkin.$inferInsert;

/**
 * Packs d'extension débloqués par un joueur (achat Stripe).
 * Chaque pack ajoute définitivement ses cartes au deck de base du joueur.
 */
export const userExpansionPacks = mysqlTable("user_expansion_packs", {
  id: int("id").autoincrement().primaryKey(),
  /** ID du profil de jeu du joueur */
  profileId: int("profileId").notNull(),
  /** Identifiant du pack d'extension : halloween | noel | ... */
  packId: varchar("packId", { length: 30 }).notNull(),
  /** Date de déblocage */
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});
export type UserExpansionPack = typeof userExpansionPacks.$inferSelect;
export type InsertUserExpansionPack = typeof userExpansionPacks.$inferInsert;

/**
 * Options de session multijoueur — configurées par le host avant le lancement.
 * Permet d'activer/désactiver les skins des joueurs et les extensions en jeu.
 * Architecture évolutive : les extensionPackIds sont stockés en JSON pour supporter
 * n'importe quel futur pack sans modification de schéma.
 */
export const sessionOptions = mysqlTable("session_options", {
  id: int("id").autoincrement().primaryKey(),
  /** Code de la session multijoueur Supabase */
  sessionCode: varchar("sessionCode", { length: 10 }).notNull().unique(),
  /** ID du profil du host */
  hostProfileId: int("hostProfileId").notNull(),
  /** Autoriser les joueurs à afficher leur skin actif sur leurs cartes */
  skinsEnabled: boolean("skinsEnabled").notNull().default(false),
  /** IDs des packs d'extension activés (JSON array de strings, ex: ["plus", "halloween"]) */
  extensionPackIds: varchar("extensionPackIds", { length: 500 }).notNull().default("[]"),
  /** Skins actifs des joueurs (JSON: { playerName: skinId }) — mis à jour en temps réel */
  playerSkins: varchar("playerSkins", { length: 2000 }).notNull().default("{}"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SessionOptions = typeof sessionOptions.$inferSelect;
export type InsertSessionOptions = typeof sessionOptions.$inferInsert;

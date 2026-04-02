import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { gameProfiles, type GameProfile, type InsertGameProfile } from "../drizzle/schema";

const SALT_ROUNDS = 10;

/**
 * Créer un nouveau profil de jeu (inscription).
 * Retourne le profil créé ou lance une erreur si pseudo/email déjà pris.
 */
export async function createGameProfile(
  pseudo: string,
  email: string,
  password: string
): Promise<GameProfile> {
  const db = await getDb();
  if (!db) throw new Error("Base de données non disponible");

  // Vérifier si le pseudo est déjà pris
  const existingPseudo = await db
    .select()
    .from(gameProfiles)
    .where(eq(gameProfiles.pseudo, pseudo))
    .limit(1);
  if (existingPseudo.length > 0) {
    throw new Error("Ce pseudo est déjà utilisé");
  }

  // Vérifier si l'email est déjà pris
  const existingEmail = await db
    .select()
    .from(gameProfiles)
    .where(eq(gameProfiles.email, email.toLowerCase()))
    .limit(1);
  if (existingEmail.length > 0) {
    throw new Error("Cette adresse courriel est déjà utilisée");
  }

  // Hasher le mot de passe
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Insérer le profil
  await db.insert(gameProfiles).values({
    pseudo,
    email: email.toLowerCase(),
    passwordHash,
  });

  // Récupérer le profil créé
  const [profile] = await db
    .select()
    .from(gameProfiles)
    .where(eq(gameProfiles.email, email.toLowerCase()))
    .limit(1);

  return profile;
}

/**
 * Vérifier les identifiants d'un joueur (connexion).
 * Accepte pseudo OU email + mot de passe.
 * Retourne le profil si valide, null sinon.
 */
export async function verifyGameProfile(
  identifier: string, // pseudo ou email
  password: string
): Promise<GameProfile | null> {
  const db = await getDb();
  if (!db) throw new Error("Base de données non disponible");

  // Chercher par email d'abord, puis par pseudo
  let results = await db
    .select()
    .from(gameProfiles)
    .where(eq(gameProfiles.email, identifier.toLowerCase()))
    .limit(1);

  if (results.length === 0) {
    results = await db
      .select()
      .from(gameProfiles)
      .where(eq(gameProfiles.pseudo, identifier))
      .limit(1);
  }

  if (results.length === 0) return null;

  const profile = results[0];
  const isValid = await bcrypt.compare(password, profile.passwordHash);
  if (!isValid) return null;

  // Mettre à jour lastSignedIn
  await db
    .update(gameProfiles)
    .set({ lastSignedIn: new Date() })
    .where(eq(gameProfiles.id, profile.id));

  return profile;
}

/**
 * Récupérer un profil par ID.
 */
export async function getGameProfileById(id: number): Promise<GameProfile | null> {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(gameProfiles)
    .where(eq(gameProfiles.id, id))
    .limit(1);

  return results.length > 0 ? results[0] : null;
}

/**
 * Routeur tRPC pour les configurations de partie sauvegardées.
 * Permet aux joueurs connectés de sauvegarder, lister, charger et supprimer
 * leurs configurations préférées (types de cartes + limite de tickets).
 * Maximum 10 configurations par joueur.
 */
import { z } from "zod";
import { router } from "./_core/trpc";
import { gameAuthProtectedProcedure } from "./gameAuthRouter";
import { getDb } from "./db";
import { gameConfigs, type GameConfig } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

const MAX_CONFIGS = 10;

/** Schéma de validation d'une configuration */
const gameConfigSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  difficulty: z.string().min(1, "La difficulté est requise"),
  disableT2: z.boolean(),
  disableT3: z.boolean(),
  includeCustom: z.boolean(),
});

export const gameConfigsRouter = router({
  /** Lister toutes les configurations sauvegardées du joueur connecté */
  list: gameAuthProtectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const configs = await db
      .select()
      .from(gameConfigs)
      .where(eq(gameConfigs.profileId, ctx.gameProfile.id))
      .orderBy(gameConfigs.createdAt);

    return configs.map((c: GameConfig) => ({
      id: c.id,
      name: c.name,
      difficulty: c.difficulty,
      disableT2: c.disableT2 === 1,
      disableT3: c.disableT3 === 1,
      includeCustom: c.includeCustom === 1,
      createdAt: c.createdAt,
    }));
  }),

  /** Sauvegarder une nouvelle configuration */
  save: gameAuthProtectedProcedure
    .input(gameConfigSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible");

      // Vérifier la limite de 10 configs
      const existing = await db
        .select({ id: gameConfigs.id })
        .from(gameConfigs)
        .where(eq(gameConfigs.profileId, ctx.gameProfile.id));

      if (existing.length >= MAX_CONFIGS) {
        throw new Error(
          `Vous avez atteint la limite de ${MAX_CONFIGS} configurations sauvegardées. Supprimez-en une pour en créer une nouvelle.`
        );
      }

      const [inserted] = await db.insert(gameConfigs).values({
        profileId: ctx.gameProfile.id,
        name: input.name,
        difficulty: input.difficulty,
        disableT2: input.disableT2 ? 1 : 0,
        disableT3: input.disableT3 ? 1 : 0,
        includeCustom: input.includeCustom ? 1 : 0,
      });

      return { success: true, id: inserted.insertId };
    }),

  /** Supprimer une configuration par ID */
  delete: gameAuthProtectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible");

      // Vérifier que la config appartient bien au joueur
      const [config] = await db
        .select({ id: gameConfigs.id })
        .from(gameConfigs)
        .where(
          and(
            eq(gameConfigs.id, input.id),
            eq(gameConfigs.profileId, ctx.gameProfile.id)
          )
        );

      if (!config) {
        throw new Error("Configuration introuvable ou accès refusé");
      }

      await db
        .delete(gameConfigs)
        .where(
          and(
            eq(gameConfigs.id, input.id),
            eq(gameConfigs.profileId, ctx.gameProfile.id)
          )
        );

      return { success: true };
    }),
});

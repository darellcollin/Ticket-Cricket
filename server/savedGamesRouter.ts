/**
 * Router tRPC pour la sauvegarde et le chargement de parties (mode solo).
 */

import { z } from "zod";
import { router } from "./_core/trpc";
import { getDb } from "./db";
import { savedGames } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { gameAuthProtectedProcedure } from "./gameAuthRouter";

export const savedGamesRouter = router({
  /**
   * Sauvegarder l'état actuel de la partie (mode solo).
   * Remplace la sauvegarde existante si elle existe.
   */
  saveGame: gameAuthProtectedProcedure
    .input(z.object({
      gameState: z.string(), // JSON sérialisé de l'état de la partie
      difficulty: z.string(),
      currentTurn: z.number(),
      cardsDrawn: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const profileId = ctx.gameProfile.id;
      const db = await getDb();
      if (!db) throw new Error("Base de données non disponible");

      // Vérifier si une sauvegarde existe déjà
      const existingResults = await db
        .select()
        .from(savedGames)
        .where(eq(savedGames.profileId, profileId))
        .limit(1);
      const existing = existingResults.length > 0 ? existingResults[0] : null;

      if (existing) {
        // Mettre à jour la sauvegarde existante
        await db.update(savedGames)
          .set({
            gameState: input.gameState,
            difficulty: input.difficulty,
            currentTurn: input.currentTurn,
            cardsDrawn: input.cardsDrawn,
            savedAt: new Date(),
          })
          .where(eq(savedGames.id, existing.id));
        return { success: true, updated: true };
      } else {
        // Créer une nouvelle sauvegarde
        await db.insert(savedGames).values({
          profileId,
          gameState: input.gameState,
          difficulty: input.difficulty,
          currentTurn: input.currentTurn,
          cardsDrawn: input.cardsDrawn,
        });
        return { success: true, updated: false };
      }
    }),

  /**
   * Charger la sauvegarde de partie du joueur connecté.
   */
  loadGame: gameAuthProtectedProcedure
    .query(async ({ ctx }) => {
      const profileId = ctx.gameProfile.id;
      const db = await getDb();
      if (!db) throw new Error("Base de données non disponible");

      const saveResults = await db
        .select()
        .from(savedGames)
        .where(eq(savedGames.profileId, profileId))
        .limit(1);
      const save = saveResults.length > 0 ? saveResults[0] : null;

      if (!save) {
        return { hasSave: false as const };
      }

      return {
        hasSave: true as const,
        gameState: save.gameState,
        difficulty: save.difficulty,
        currentTurn: save.currentTurn,
        cardsDrawn: save.cardsDrawn,
        savedAt: save.savedAt,
      };
    }),

  /**
   * Supprimer la sauvegarde de partie du joueur connecté.
   */
  deleteSave: gameAuthProtectedProcedure
    .mutation(async ({ ctx }) => {
      const profileId = ctx.gameProfile.id;
      const db = await getDb();
      if (!db) throw new Error("Base de données non disponible");

      const existingResults = await db
        .select()
        .from(savedGames)
        .where(eq(savedGames.profileId, profileId))
        .limit(1);
      const existing = existingResults.length > 0 ? existingResults[0] : null;

      if (existing) {
        await db.delete(savedGames).where(eq(savedGames.id, existing.id));
        return { success: true, deleted: true };
      }

      return { success: true, deleted: false };
    }),
});

/**
 * miniGameRouter — Synchronisation des Perquisitions multijoueur.
 *
 * Flux :
 *  1. Le joueur actif déclenche via `trigger` → crée un événement dans mini_game_events
 *  2. Tous les joueurs (via polling `getActive`) détectent l'événement et jouent le mini-jeu
 *  3. Chaque joueur soumet son résultat via `submitResult`
 *  4. Le piocheur poll `getStatus` pour savoir si tous ont terminé
 *  5. Une fois tous les résultats reçus, le piocheur appelle `resolve` pour marquer l'événement
 *
 * Résultats individuels : chaque joueur gagne/perd selon son propre résultat.
 */
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { miniGameEvents, miniGameResults } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const miniGameRouter = router({
  /**
   * Déclenche une Perquisition pour tous les joueurs d'une session.
   * Appelé uniquement par le joueur actif (celui dont c'est le tour).
   * `totalPlayers` = nombre de joueurs non-éliminés qui doivent jouer.
   */
  trigger: publicProcedure
    .input(
      z.object({
        sessionCode: z.string().min(1).max(10),
        playerId: z.string().min(1),
        mode: z.enum(["run", "hide"]),
        totalPlayers: z.number().int().min(1).max(20),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données non disponible");
      const code = input.sessionCode.toUpperCase();

      // Supprimer tout événement non résolu existant pour cette session
      const existing = await db
        .select()
        .from(miniGameEvents)
        .where(and(eq(miniGameEvents.sessionCode, code), eq(miniGameEvents.resolved, 0)))
        .limit(1);

      if (existing.length > 0) {
        await db.delete(miniGameResults).where(eq(miniGameResults.eventId, existing[0].id));
        await db.delete(miniGameEvents).where(eq(miniGameEvents.id, existing[0].id));
      }

      // Créer le nouvel événement
      await db.insert(miniGameEvents).values({
        sessionCode: code,
        mode: input.mode,
        triggeredBy: input.playerId,
        resolved: 0,
      });

      // Récupérer l'ID de l'événement créé
      const newEvent = await db
        .select()
        .from(miniGameEvents)
        .where(and(eq(miniGameEvents.sessionCode, code), eq(miniGameEvents.resolved, 0)))
        .limit(1);

      return { success: true, eventId: newEvent[0]?.id ?? null };
    }),

  /**
   * Récupère l'événement Perquisition actif (non résolu) pour une session.
   * Retourne null si aucune Perquisition n'est en cours.
   */
  getActive: publicProcedure
    .input(z.object({ sessionCode: z.string().min(1).max(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données non disponible");
      const code = input.sessionCode.toUpperCase();

      const rows = await db
        .select()
        .from(miniGameEvents)
        .where(and(eq(miniGameEvents.sessionCode, code), eq(miniGameEvents.resolved, 0)))
        .limit(1);

      if (rows.length === 0) return null;
      return {
        id: rows[0].id,
        mode: rows[0].mode,
        triggeredBy: rows[0].triggeredBy,
        triggeredAt: rows[0].triggeredAt,
      };
    }),

  /**
   * Soumet le résultat individuel d'un joueur pour la Perquisition en cours.
   * Appelé par chaque joueur (y compris le piocheur) une fois son mini-jeu terminé.
   */
  submitResult: publicProcedure
    .input(
      z.object({
        sessionCode: z.string().min(1).max(10),
        eventId: z.number().int(),
        playerId: z.string().min(1),
        success: z.boolean(),
        amount: z.number().int().min(0),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données non disponible");
      const code = input.sessionCode.toUpperCase();

      // Vérifier si ce joueur a déjà soumis un résultat pour cet événement
      const existing = await db
        .select()
        .from(miniGameResults)
        .where(
          and(
            eq(miniGameResults.eventId, input.eventId),
            eq(miniGameResults.playerId, input.playerId),
          ),
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(miniGameResults).values({
          eventId: input.eventId,
          sessionCode: code,
          playerId: input.playerId,
          success: input.success ? 1 : 0,
          amount: input.amount,
        });
      }

      return { success: true };
    }),

  /**
   * Retourne le statut de la Perquisition : combien de joueurs ont soumis leur résultat.
   * Le piocheur poll cette route pour savoir quand tous ont terminé.
   */
  getStatus: publicProcedure
    .input(
      z.object({
        sessionCode: z.string().min(1).max(10),
        eventId: z.number().int(),
        totalPlayers: z.number().int().min(1),
      }),
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données non disponible");

      const results = await db
        .select()
        .from(miniGameResults)
        .where(eq(miniGameResults.eventId, input.eventId));

      const submittedCount = results.length;
      const allDone = submittedCount >= input.totalPlayers;

      return {
        submittedCount,
        totalPlayers: input.totalPlayers,
        allDone,
        results: results.map(r => ({
          playerId: r.playerId,
          success: r.success === 1,
          amount: r.amount,
        })),
      };
    }),

  /**
   * Marque l'événement comme résolu et retourne tous les résultats.
   * Appelé par le piocheur une fois que tous les joueurs ont terminé.
   */
  resolve: publicProcedure
    .input(
      z.object({
        sessionCode: z.string().min(1).max(10),
        eventId: z.number().int(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données non disponible");
      const code = input.sessionCode.toUpperCase();

      // Récupérer tous les résultats avant de résoudre
      const results = await db
        .select()
        .from(miniGameResults)
        .where(eq(miniGameResults.eventId, input.eventId));

      // Marquer comme résolu
      await db
        .update(miniGameEvents)
        .set({ resolved: 1 })
        .where(
          and(
            eq(miniGameEvents.id, input.eventId),
            eq(miniGameEvents.sessionCode, code),
          ),
        );

      return {
        success: true,
        results: results.map(r => ({
          playerId: r.playerId,
          success: r.success === 1,
          amount: r.amount,
        })),
      };
    }),
});

/**
 * miniGameRouter — Synchronisation des mini-jeux multijoueur.
 *
 * Le joueur actif déclenche le mini-jeu via `trigger`, qui écrit un événement
 * dans la table `mini_game_events`. Tous les autres joueurs lisent cet événement
 * via `getActive` (polling). Une fois terminé, `resolve` marque l'événement comme résolu.
 *
 * Architecture :
 *  - trigger(sessionCode, playerId, mode) → crée l'événement
 *  - getActive(sessionCode)               → retourne l'événement actif (non résolu)
 *  - resolve(sessionCode)                 → marque l'événement comme résolu
 */
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { miniGameEvents } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const miniGameRouter = router({
  /**
   * Déclenche un mini-jeu pour tous les joueurs d'une session.
   * Appelé uniquement par le joueur actif (celui dont c'est le tour).
   */
  trigger: publicProcedure
    .input(
      z.object({
        sessionCode: z.string().min(1).max(10),
        playerId: z.string().min(1),
        mode: z.enum(["run", "hide"]),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

      if (!db) throw new Error("Base de données non disponible");

      // Supprimer tout événement non résolu existant pour cette session
      await db
        .delete(miniGameEvents)
        .where(
          and(
            eq(miniGameEvents.sessionCode, input.sessionCode.toUpperCase()),
            eq(miniGameEvents.resolved, 0),
          ),
        );

      // Créer le nouvel événement
      await db.insert(miniGameEvents).values({
        sessionCode: input.sessionCode.toUpperCase(),
        mode: input.mode,
        triggeredBy: input.playerId,
        resolved: 0,
      });

      return { success: true };
    }),

  /**
   * Récupère l'événement mini-jeu actif (non résolu) pour une session.
   * Retourne null si aucun mini-jeu n'est en cours.
   */
  getActive: publicProcedure
    .input(z.object({ sessionCode: z.string().min(1).max(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données non disponible");
      const rows = await db
        .select()
        .from(miniGameEvents)
        .where(
          and(
            eq(miniGameEvents.sessionCode, input.sessionCode.toUpperCase()),
            eq(miniGameEvents.resolved, 0),
          ),
        )
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
   * Marque l'événement mini-jeu comme résolu pour une session.
   * Appelé par le joueur qui a déclenché le mini-jeu une fois terminé.
   */
  resolve: publicProcedure
    .input(z.object({ sessionCode: z.string().min(1).max(10) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données non disponible");
      await db
        .update(miniGameEvents)
        .set({ resolved: 1 })
        .where(
          and(
            eq(miniGameEvents.sessionCode, input.sessionCode.toUpperCase()),
            eq(miniGameEvents.resolved, 0),
          ),
        );
      return { success: true };
    }),
});

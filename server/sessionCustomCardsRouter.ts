/**
 * sessionCustomCardsRouter — Partage des cartes personnalisées de l'hôte
 * en session multijoueur.
 *
 * Flux :
 *  1. L'hôte appelle `publish` avec ses cartes personnalisées au démarrage de la partie
 *  2. Tous les joueurs (y compris l'hôte) appellent `getForSession` pour récupérer les cartes
 *  3. L'hôte appelle `cleanup` quand la partie se termine
 */
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { sessionCustomCards } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const customCardDataSchema = z.object({
  id: z.number().int(),
  category: z.enum(["contravention", "contribuable", "investisseur"]),
  mefait: z.string().nullable(),
  ticketPrice: z.number().int(),
  frais: z.number().int(),
  impots: z.number().int(),
  taxe: z.number().int(),
});

export const sessionCustomCardsRouter = router({
  /**
   * L'hôte publie ses cartes personnalisées pour la session.
   * Remplace toute publication précédente pour ce code de session.
   */
  publish: publicProcedure
    .input(
      z.object({
        sessionCode: z.string().min(1).max(10),
        cards: z.array(customCardDataSchema).max(100),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données non disponible");
      const code = input.sessionCode.toUpperCase();

      // Supprimer l'entrée précédente pour cette session (si elle existe)
      await db
        .delete(sessionCustomCards)
        .where(eq(sessionCustomCards.sessionCode, code));

      // Publier les nouvelles cartes
      if (input.cards.length > 0) {
        await db.insert(sessionCustomCards).values({
          sessionCode: code,
          cardsJson: JSON.stringify(input.cards),
        });
      }

      return { success: true, count: input.cards.length };
    }),

  /**
   * Récupère les cartes personnalisées publiées par l'hôte pour une session.
   * Retourne un tableau vide si aucune carte n'a été publiée.
   */
  getForSession: publicProcedure
    .input(z.object({ sessionCode: z.string().min(1).max(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const code = input.sessionCode.toUpperCase();

      const rows = await db
        .select()
        .from(sessionCustomCards)
        .where(eq(sessionCustomCards.sessionCode, code))
        .limit(1);

      if (rows.length === 0) return [];

      try {
        const cards = JSON.parse(rows[0].cardsJson);
        return Array.isArray(cards) ? cards : [];
      } catch {
        return [];
      }
    }),

  /**
   * Nettoie les cartes personnalisées d'une session (appelé à la fin de la partie).
   */
  cleanup: publicProcedure
    .input(z.object({ sessionCode: z.string().min(1).max(10) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const code = input.sessionCode.toUpperCase();

      await db
        .delete(sessionCustomCards)
        .where(eq(sessionCustomCards.sessionCode, code));

      return { success: true };
    }),
});

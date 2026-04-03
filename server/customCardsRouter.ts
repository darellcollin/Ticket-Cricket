/**
 * customCardsRouter — CRUD pour les cartes personnalisées des joueurs.
 * Toutes les procédures sont protégées par gameAuthProtectedProcedure.
 * Maximum 100 cartes par joueur.
 */
import { z } from "zod";
import { router } from "./_core/trpc";
import { gameAuthProtectedProcedure } from "./gameAuthRouter";
import { getDb } from "./db";
import { customCards } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

const MAX_CARDS_FREE = 15;

const ALLOWED_FEES = [0, 10, 20, 30, 40, 50] as const;

const createCardSchema = z.discriminatedUnion("category", [
  z.object({
    category: z.literal("contravention"),
    mefait: z.string().min(1).max(150),
    ticketPrice: z.number().int().min(10).max(4000),
    frais: z.number().int().refine((v) => (ALLOWED_FEES as readonly number[]).includes(v), {
      message: "Frais invalide",
    }),
  }),
  z.object({
    category: z.literal("contribuable"),
    mefait: z.string().min(1).max(150),
    impots: z.number().int().refine((v) => (ALLOWED_FEES as readonly number[]).includes(v), {
      message: "Impôts invalide",
    }),
  }),
  z.object({
    category: z.literal("investisseur"),
    ticketPrice: z.number().int().min(10).max(4000),
    taxe: z.number().int().refine((v) => (ALLOWED_FEES as readonly number[]).includes(v), {
      message: "Taxe invalide",
    }),
  }),
]);

export const customCardsRouter = router({
  /** Lister toutes les cartes personnalisées du joueur connecté */
  list: gameAuthProtectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const cards = await db
      .select()
      .from(customCards)
      .where(eq(customCards.profileId, ctx.gameProfile.id))
      .orderBy(customCards.createdAt);
    return cards;
  }),

  /** Créer une nouvelle carte personnalisée (max 100) */
  create: gameAuthProtectedProcedure
    .input(createCardSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      if (!db) throw new Error("Base de données non disponible");

      // Vérifier la limite
      const existing = await db
        .select({ id: customCards.id })
        .from(customCards)
        .where(eq(customCards.profileId, ctx.gameProfile.id));

      if (existing.length >= MAX_CARDS_FREE) {
        throw new Error(`LIMIT_REACHED:${MAX_CARDS_FREE}`);
      }

      // Construire les valeurs selon la catégorie
      let values: {
        profileId: number;
        category: "contravention" | "contribuable" | "investisseur";
        mefait?: string;
        ticketPrice: number;
        frais: number;
        impots: number;
        taxe: number;
      };

      if (input.category === "contravention") {
        values = {
          profileId: ctx.gameProfile.id,
          category: "contravention",
          mefait: input.mefait,
          ticketPrice: input.ticketPrice,
          frais: input.frais,
          impots: 0,
          taxe: 0,
        };
      } else if (input.category === "contribuable") {
        values = {
          profileId: ctx.gameProfile.id,
          category: "contribuable",
          mefait: input.mefait,
          ticketPrice: 0,
          frais: 0,
          impots: input.impots,
          taxe: 0,
        };
      } else {
        values = {
          profileId: ctx.gameProfile.id,
          category: "investisseur",
          mefait: undefined,
          ticketPrice: input.ticketPrice,
          frais: 0,
          impots: 0,
          taxe: input.taxe,
        };
      }

      const [result] = await db.insert(customCards).values(values as any);
      const insertId = (result as any).insertId as number;

      const [created] = await db
        .select()
        .from(customCards)
        .where(eq(customCards.id, insertId));

      return created;
    }),

  /** Supprimer une carte personnalisée (doit appartenir au joueur) */
  delete: gameAuthProtectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données non disponible");
      await db
        .delete(customCards)
        .where(
          and(
            eq(customCards.id, input.id),
            eq(customCards.profileId, ctx.gameProfile.id)
          )
        );
      return { success: true };
    }),

  /** Compter les cartes du joueur */
  count: gameAuthProtectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { count: 0, max: MAX_CARDS_FREE };
    const rows = await db
      .select({ id: customCards.id })
      .from(customCards)
      .where(eq(customCards.profileId, ctx.gameProfile.id));
    return { count: rows.length, max: MAX_CARDS_FREE };
  }),
});

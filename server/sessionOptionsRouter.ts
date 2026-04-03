/**
 * Router pour les options de session multijoueur.
 * Permet au host de configurer : skins des joueurs, extensions actives.
 * Architecture évolutive : les extensions sont chargées dynamiquement depuis la DB.
 * Tout nouveau produit ajouté à la boutique sera automatiquement disponible.
 */
import { z } from "zod";
import { router } from "./_core/trpc";
import { gameAuthProtectedProcedure } from "./gameAuthRouter";
import { publicProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { sessionOptions, userExpansionPacks, userActiveSkin } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { SHOP_PRODUCTS } from "./products";

/** Retourne tous les packs d'extension disponibles dans la boutique (dynamique) */
export function getAvailableExpansionPacks() {
  return SHOP_PRODUCTS.filter(p => p.category === "expansion_pack" && p.available && p.expansionPackId);
}

export const sessionOptionsRouter = router({
  /**
   * Créer ou mettre à jour les options d'une session multijoueur.
   * Seul le host (connecté) peut appeler cet endpoint.
   * Appelé depuis le MultiplayerModal avant de créer la session.
   */
  setOptions: gameAuthProtectedProcedure
    .input(z.object({
      sessionCode: z.string().min(4).max(10),
      skinsEnabled: z.boolean().default(false),
      /** IDs des packs d'extension activés (ex: ["plus", "halloween"]) */
      extensionPackIds: z.array(z.string()).default([]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponible");

      const existing = await db
        .select()
        .from(sessionOptions)
        .where(eq(sessionOptions.sessionCode, input.sessionCode))
        .then(r => r[0]);

      const data = {
        sessionCode: input.sessionCode,
        hostProfileId: ctx.gameProfile.id,
        skinsEnabled: input.skinsEnabled,
        extensionPackIds: JSON.stringify(input.extensionPackIds),
        playerSkins: "{}",
      };

      if (existing) {
        await db
          .update(sessionOptions)
          .set({
            skinsEnabled: input.skinsEnabled,
            extensionPackIds: JSON.stringify(input.extensionPackIds),
          })
          .where(eq(sessionOptions.sessionCode, input.sessionCode));
      } else {
        await db.insert(sessionOptions).values(data);
      }

      return { success: true };
    }),

  /**
   * Récupérer les options d'une session (accessible à tous les joueurs).
   * Utilisé par polling dans MultiplayerGameScreen.
   */
  getOptions: publicProcedure
    .input(z.object({ sessionCode: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const row = await db
        .select()
        .from(sessionOptions)
        .where(eq(sessionOptions.sessionCode, input.sessionCode))
        .then(r => r[0]);

      if (!row) return null;

      return {
        skinsEnabled: row.skinsEnabled,
        extensionPackIds: JSON.parse(row.extensionPackIds || "[]") as string[],
      };
    }),

  /**
   * Récupérer la map playerId -> skinId pour tous les joueurs d'une session.
   * Utilisé dans MultiplayerGameScreen pour appliquer les skins sur les cartes.
   */
  getPlayerSkins: publicProcedure
    .input(z.object({ sessionCode: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return {};

      const row = await db
        .select()
        .from(sessionOptions)
        .where(eq(sessionOptions.sessionCode, input.sessionCode))
        .then(r => r[0]);

      if (!row) return {};

      return JSON.parse(row.playerSkins || "{}") as Record<string, string>;
    }),

  /**
   * Enregistrer le skin actif d'un joueur pour une session.
   * Appelé par chaque joueur au début de la partie si skinsEnabled.
   * Utilise playerId comme clé (plus fiable que le nom).
   */
  registerPlayerSkin: publicProcedure
    .input(z.object({
      sessionCode: z.string(),
      playerId: z.string(),
      skinId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      const row = await db
        .select()
        .from(sessionOptions)
        .where(eq(sessionOptions.sessionCode, input.sessionCode))
        .then(r => r[0]);

      if (!row) return { success: false };

      const currentSkins = JSON.parse(row.playerSkins || "{}") as Record<string, string>;
      currentSkins[input.playerId] = input.skinId;

      await db
        .update(sessionOptions)
        .set({ playerSkins: JSON.stringify(currentSkins) })
        .where(eq(sessionOptions.sessionCode, input.sessionCode));

      return { success: true };
    }),

  /**
   * Récupérer les packs d'extension débloqués par le joueur connecté.
   * Utilisé dans le MultiplayerModal pour afficher les options disponibles.
   * Architecture évolutive : tout nouveau pack ajouté à la boutique apparaît automatiquement.
   */
  getHostExpansionPacks: gameAuthProtectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    // Accès VIP admin : tous les packs disponibles
    if (ctx.gameProfile.isAdmin) {
      return getAvailableExpansionPacks().map(p => ({
        packId: p.expansionPackId!,
        name: p.name,
        cardCount: p.expansionCardIds?.length ?? 0,
        color: p.color,
      }));
    }

    const owned = await db
      .select()
      .from(userExpansionPacks)
      .where(eq(userExpansionPacks.profileId, ctx.gameProfile.id));

    const ownedIds = new Set(owned.map(r => r.packId));
    const availablePacks = getAvailableExpansionPacks();

    return availablePacks
      .filter(p => ownedIds.has(p.expansionPackId!))
      .map(p => ({
        packId: p.expansionPackId!,
        name: p.name,
        cardCount: p.expansionCardIds?.length ?? 0,
        color: p.color,
      }));
  }),

  /**
   * Récupérer les IDs de cartes d'extension pour les packs activés.
   * Utilisé par tous les joueurs pour construire le deck avec les extensions.
   * Architecture évolutive : les IDs sont chargés depuis SHOP_PRODUCTS, pas hardcodés.
   */
  getExtensionCardIds: publicProcedure
    .input(z.object({ packIds: z.array(z.string()) }))
    .query(({ input }) => {
      const cardIds: number[] = [];
      for (const packId of input.packIds) {
        const product = SHOP_PRODUCTS.find(
          p => p.category === "expansion_pack" && p.expansionPackId === packId
        );
        if (product?.expansionCardIds) {
          cardIds.push(...product.expansionCardIds);
        }
      }
      return cardIds;
    }),
});

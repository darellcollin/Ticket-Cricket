import { z } from "zod";
import { router } from "./_core/trpc";
import { gameAuthProtectedProcedure } from "./gameAuthRouter";
import { getDb } from "./db";
import { userSkins, userActiveSkin } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { SKIN_IDS } from "../shared/skinIds";

export const skinRouter = router({
  /** Lister les skins débloqués par le joueur connecté */
  listOwnedSkins: gameAuthProtectedProcedure.query(async ({ ctx }) => {
    // Accès VIP admin : tous les skins débloqués
    if (ctx.gameProfile.isAdmin) {
      return [...SKIN_IDS] as string[];
    }
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select()
      .from(userSkins)
      .where(eq(userSkins.profileId, ctx.gameProfile.id));
    // Le skin "classique" est toujours inclus
    const ownedIds = rows.map(r => r.skinId);
    if (!ownedIds.includes("classique")) {
      ownedIds.unshift("classique");
    }
    return ownedIds;
  }),

  /** Récupérer le skin actif du joueur connecté */
  getActiveSkin: gameAuthProtectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return "classique";
    const row = await db
      .select()
      .from(userActiveSkin)
      .where(eq(userActiveSkin.profileId, ctx.gameProfile.id))
      .then(r => r[0]);
    return row?.skinId ?? "classique";
  }),

  /** Définir le skin actif du joueur (doit être débloqué) */
  setActiveSkin: gameAuthProtectedProcedure
    .input(z.object({ skinId: z.enum(SKIN_IDS) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponible");

      // Accès VIP admin : bypass de la vérification
      if (!ctx.gameProfile.isAdmin && input.skinId !== "classique") {
        const owned = await db
          .select()
          .from(userSkins)
          .where(
            and(
              eq(userSkins.profileId, ctx.gameProfile.id),
              eq(userSkins.skinId, input.skinId)
            )
          )
          .then(r => r[0]);
        if (!owned) throw new Error("Skin non débloqué.");
      }

      // Upsert du skin actif
      const existing = await db
        .select()
        .from(userActiveSkin)
        .where(eq(userActiveSkin.profileId, ctx.gameProfile.id))
        .then(r => r[0]);

      if (existing) {
        await db
          .update(userActiveSkin)
          .set({ skinId: input.skinId })
          .where(eq(userActiveSkin.profileId, ctx.gameProfile.id));
      } else {
        await db.insert(userActiveSkin).values({
          profileId: ctx.gameProfile.id,
          skinId: input.skinId,
        });
      }

      return { success: true, skinId: input.skinId };
    }),

  /** Débloquer un skin pour le joueur (appelé par le webhook Stripe) */
  unlockSkin: gameAuthProtectedProcedure
    .input(z.object({ skinId: z.enum(SKIN_IDS) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponible");

      // Éviter les doublons
      const existing = await db
        .select()
        .from(userSkins)
        .where(
          and(
            eq(userSkins.profileId, ctx.gameProfile.id),
            eq(userSkins.skinId, input.skinId)
          )
        )
        .then(r => r[0]);

      if (!existing) {
        await db.insert(userSkins).values({
          profileId: ctx.gameProfile.id,
          skinId: input.skinId,
        });
      }

      return { success: true };
    }),
});

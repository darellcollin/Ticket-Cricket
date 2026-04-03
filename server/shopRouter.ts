import Stripe from "stripe";
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { SHOP_PRODUCTS, AVAILABLE_PRODUCTS, ALL_PAID_SKIN_IDS } from "./products";
import { gameAuthProtectedProcedure } from "./gameAuthRouter";
import { getDb } from "./db";
import { purchases, userExpansionPacks } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export const shopRouter = router({
  /** Récupérer la liste de tous les produits de la boutique */
  listProducts: publicProcedure.query(() => {
    return SHOP_PRODUCTS;
  }),

  /** Créer une session Stripe Checkout pour un produit individuel (skin, pack, extension) */
  createCheckout: gameAuthProtectedProcedure
    .input(
      z.object({
        productId: z.string(),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const product = AVAILABLE_PRODUCTS.find(p => p.id === input.productId);
      if (!product) {
        throw new Error("Produit introuvable ou non disponible.");
      }
      // Les dons libres ont leur propre procédure
      if (product.category === "don") {
        throw new Error("Utilisez createDonCheckout pour les dons.");
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: product.currency,
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: product.price,
            },
            quantity: 1,
          },
        ],
        customer_email: ctx.gameProfile.email ?? undefined,
        client_reference_id: ctx.gameProfile.id.toString(),
        metadata: {
          profile_id: ctx.gameProfile.id.toString(),
          product_id: product.id,
          product_name: product.name,
          product_category: product.category,
          extra_cards: product.extraCards?.toString() ?? "0",
          // Pour les bundles : liste des skins à débloquer
          bundle_skin_ids: product.category === "bundle"
            ? (product.bundleSkinIds ?? ALL_PAID_SKIN_IDS).join(",")
            : "",
          customer_email: ctx.gameProfile.email ?? "",
          customer_pseudo: ctx.gameProfile.pseudo ?? "",
        },
        allow_promotion_codes: true,
        success_url: `${input.origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/`,
      });

      return { url: session.url };
    }),

  /** Lister les achats du joueur connecté */
  listPurchases: gameAuthProtectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select()
      .from(purchases)
      .where(eq(purchases.profileId, ctx.gameProfile.id))
      .orderBy(desc(purchases.createdAt));
    return rows;
  }),

  /** Créer une session Stripe Checkout pour un panier de skins (achat groupé) */
  createCartCheckout: gameAuthProtectedProcedure
    .input(
      z.object({
        productIds: z.array(z.string()).min(1).max(10),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const products = input.productIds.map(id => {
        const p = AVAILABLE_PRODUCTS.find(p => p.id === id);
        if (!p) throw new Error(`Produit introuvable : ${id}`);
        if (p.category === "don") throw new Error("Les dons ne peuvent pas être dans le panier.");
        return p;
      });

      const lineItems = products.map(p => ({
        price_data: {
          currency: p.currency,
          product_data: {
            name: p.name,
            description: p.description,
          },
          unit_amount: p.price,
        },
        quantity: 1,
      }));

      const productIds = products.map(p => p.id).join(",");
      const skinIds = products.filter(p => p.skinId).map(p => p.skinId).join(",");

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: lineItems,
        customer_email: ctx.gameProfile.email ?? undefined,
        client_reference_id: ctx.gameProfile.id.toString(),
        metadata: {
          profile_id: ctx.gameProfile.id.toString(),
          product_ids: productIds,
          skin_ids: skinIds,
          product_category: "cart",
          customer_email: ctx.gameProfile.email ?? "",
          customer_pseudo: ctx.gameProfile.pseudo ?? "",
        },
        allow_promotion_codes: true,
        success_url: `${input.origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/`,
      });

      return { url: session.url };
    }),

  /** Lister les packs d'extension débloqués par le joueur connecté */
  listExpansionPacks: gameAuthProtectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select()
      .from(userExpansionPacks)
      .where(eq(userExpansionPacks.profileId, ctx.gameProfile.id));
    return rows.map(r => r.packId);
  }),

  /** Créer une session Stripe Checkout pour un don à montant libre */
  createDonCheckout: gameAuthProtectedProcedure
    .input(
      z.object({
        amountCents: z.number().int().min(100).max(100000), // 1$ min, 1000$ max
        origin: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "cad",
              product_data: {
                name: "Don — Ticket Cricket",
                description: "Merci de soutenir le développement de Ticket Cricket !",
              },
              unit_amount: input.amountCents,
            },
            quantity: 1,
          },
        ],
        customer_email: ctx.gameProfile.email ?? undefined,
        client_reference_id: ctx.gameProfile.id.toString(),
        metadata: {
          profile_id: ctx.gameProfile.id.toString(),
          product_id: "don_libre",
          product_name: "Don libre",
          product_category: "don",
          customer_email: ctx.gameProfile.email ?? "",
          customer_pseudo: ctx.gameProfile.pseudo ?? "",
        },
        allow_promotion_codes: true,
        success_url: `${input.origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/`,
      });

      return { url: session.url };
    }),
});

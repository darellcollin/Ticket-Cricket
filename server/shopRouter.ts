import Stripe from "stripe";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { SHOP_PRODUCTS, AVAILABLE_PRODUCTS } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export const shopRouter = router({
  /** Récupérer la liste de tous les produits de la boutique */
  listProducts: publicProcedure.query(() => {
    return SHOP_PRODUCTS;
  }),

  /** Créer une session Stripe Checkout pour un pack de cartes (montant fixe) */
  createCheckout: protectedProcedure
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
        customer_email: ctx.user.email ?? undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          product_id: product.id,
          product_name: product.name,
          product_category: product.category,
          extra_cards: product.extraCards?.toString() ?? "0",
          customer_email: ctx.user.email ?? "",
          customer_name: ctx.user.name ?? "",
        },
        allow_promotion_codes: true,
        success_url: `${input.origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/?shop=cancelled`,
      });

      return { url: session.url };
    }),

  /** Créer une session Stripe Checkout pour un don à montant libre */
  createDonCheckout: protectedProcedure
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
        customer_email: ctx.user.email ?? undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          product_id: "don_libre",
          product_name: "Don libre",
          product_category: "don",
          customer_email: ctx.user.email ?? "",
          customer_name: ctx.user.name ?? "",
        },
        allow_promotion_codes: true,
        success_url: `${input.origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/?shop=cancelled`,
      });

      return { url: session.url };
    }),
});

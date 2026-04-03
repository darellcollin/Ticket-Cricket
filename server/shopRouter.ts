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

  /** Créer une session Stripe Checkout pour un produit */
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

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ── Stripe webhook — DOIT être avant express.json() pour la vérification de signature ──
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sigRaw = req.headers["stripe-signature"];
    const sig = Array.isArray(sigRaw) ? sigRaw[0] : sigRaw;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !webhookSecret) {
      res.status(400).send("Missing signature or webhook secret");
      return;
    }
    let event: import("stripe").Stripe.Event;
    try {
      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-03-31.basil" });
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("[Stripe Webhook] Signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    // Détecter les événements de test
    if (event.id.startsWith("evt_test_")) {
      console.log("[Stripe Webhook] Test event detected, returning verification response");
      res.json({ verified: true });
      return;
    }
    // Traitement des événements réels
    console.log(`[Stripe Webhook] Event: ${event.type} | ID: ${event.id}`);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as import("stripe").Stripe.Checkout.Session;
      const productId = session.metadata?.product_id;
      const profileId = session.metadata?.user_id ? parseInt(session.metadata.user_id) : null;
      const productName = session.metadata?.product_name ?? "Achat";
      const extraCards = session.metadata?.extra_cards ? parseInt(session.metadata.extra_cards) : 0;
      const amountTotal = session.amount_total ?? 0;
      const currency = session.currency ?? "cad";
      console.log(`[Stripe Webhook] Paiement complet — profile=${profileId}, product=${productId} (${productName})`);
      if (profileId && productId && session.id) {
        try {
          const { getDb } = await import("../db");
          const { purchases, userSkins } = await import("../../drizzle/schema");
          const { SHOP_PRODUCTS } = await import("../products");
          const { and, eq } = await import("drizzle-orm");
          const db = await getDb();
          if (db) {
            await db.insert(purchases).values({
              profileId,
              productId,
              productName,
              amountCents: amountTotal,
              currency,
              stripeSessionId: session.id,
              cardsUnlocked: extraCards,
            }).onDuplicateKeyUpdate({ set: { productId } }); // déduplication
            console.log(`[Stripe Webhook] Achat enregistré en DB — profile=${profileId}, ${extraCards} cartes débloquées`);

            // Débloquer le skin si c'est un achat de skin
            const product = SHOP_PRODUCTS.find(p => p.id === productId);
            if (product?.category === "skin" && product.skinId) {
              const existing = await db
                .select()
                .from(userSkins)
                .where(and(eq(userSkins.profileId, profileId), eq(userSkins.skinId, product.skinId)))
                .then(r => r[0]);
              if (!existing) {
                await db.insert(userSkins).values({ profileId, skinId: product.skinId });
                console.log(`[Stripe Webhook] Skin "${product.skinId}" débloqué pour profile=${profileId}`);
              }
            }
          }
        } catch (dbErr: any) {
          console.error("[Stripe Webhook] Erreur DB:", dbErr.message);
        }
      }
    }
    res.json({ received: true });
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

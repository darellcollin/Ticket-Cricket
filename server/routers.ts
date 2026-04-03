import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { gameAuthRouter } from "./gameAuthRouter";
import { savedGamesRouter } from "./savedGamesRouter";
import { miniGameRouter } from "./miniGameRouter";
import { customCardsRouter } from "./customCardsRouter";
import { sessionCustomCardsRouter } from "./sessionCustomCardsRouter";
import { gameConfigsRouter } from "./gameConfigsRouter";
import { shopRouter } from "./shopRouter";
import { skinRouter } from "./skinRouter";
import { sessionOptionsRouter } from "./sessionOptionsRouter";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /** Authentification personnalisée pour le jeu (pseudo + courriel + mot de passe) */
  gameAuth: gameAuthRouter,

  /** Sauvegarde et chargement de parties (mode solo) */
  savedGames: savedGamesRouter,

  /** Synchronisation des mini-jeux multijoueur */
  miniGame: miniGameRouter,

  /** Cartes personnalisées par les joueurs */
  customCards: customCardsRouter,

  /** Partage de cartes personnalisées en session multijoueur */
  sessionCustomCards: sessionCustomCardsRouter,

  /** Configurations de partie sauvegardées */
  gameConfigs: gameConfigsRouter,

  /** Boutique Ticket Cricket — produits et paiements Stripe */
  shop: shopRouter,

  /** Skins de cartes — déblocage et sélection */
  skins: skinRouter,

  /** Options de session multijoueur — skins, extensions */
  sessionOptions: sessionOptionsRouter,
});

export type AppRouter = typeof appRouter;

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { gameAuthRouter } from "./gameAuthRouter";
import { savedGamesRouter } from "./savedGamesRouter";
import { miniGameRouter } from "./miniGameRouter";

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
});

export type AppRouter = typeof appRouter;

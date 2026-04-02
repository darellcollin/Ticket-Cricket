import { z } from "zod";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
import { publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { getSessionCookieOptions } from "./_core/cookies";
import { createGameProfile, verifyGameProfile, getGameProfileById } from "./gameProfileDb";

const GAME_COOKIE_NAME = "game_session";
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

function getGameSessionSecret() {
  // Utilise le même secret JWT mais avec un préfixe pour différencier
  return new TextEncoder().encode("game_" + ENV.cookieSecret);
}

async function signGameSession(profileId: number, pseudo: string): Promise<string> {
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor((issuedAt + ONE_YEAR_MS) / 1000);
  const secretKey = getGameSessionSecret();

  return new SignJWT({ profileId, pseudo })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

async function verifyGameSession(
  cookieValue: string | undefined | null
): Promise<{ profileId: number; pseudo: string } | null> {
  if (!cookieValue) return null;
  try {
    const secretKey = getGameSessionSecret();
    const { payload } = await jwtVerify(cookieValue, secretKey, { algorithms: ["HS256"] });
    const { profileId, pseudo } = payload as Record<string, unknown>;
    if (typeof profileId !== "number" || typeof pseudo !== "string") return null;
    return { profileId, pseudo };
  } catch {
    return null;
  }
}

function getGameCookie(req: { headers: { cookie?: string } }): string | undefined {
  if (!req.headers.cookie) return undefined;
  const parsed = parseCookieHeader(req.headers.cookie);
  return parsed[GAME_COOKIE_NAME];
}

/**
 * Procédure protégée qui vérifie que le joueur est connecté via game_session.
 * Injecte `ctx.gameProfile` avec les données du profil.
 */
export const gameAuthProtectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const cookieValue = getGameCookie(ctx.req);
  const session = await verifyGameSession(cookieValue);

  if (!session) {
    throw new Error("Vous devez être connecté pour effectuer cette action");
  }

  const profile = await getGameProfileById(session.profileId);
  if (!profile) {
    throw new Error("Profil de jeu introuvable");
  }

  return next({
    ctx: {
      ...ctx,
      gameProfile: {
        id: profile.id,
        pseudo: profile.pseudo,
        email: profile.email,
        createdAt: profile.createdAt,
      },
    },
  });
});

export const gameAuthRouter = router({
  /** Inscription — créer un nouveau compte de jeu */
  register: publicProcedure
    .input(
      z.object({
        pseudo: z
          .string()
          .min(2, "Le pseudo doit contenir au moins 2 caractères")
          .max(30, "Le pseudo ne peut pas dépasser 30 caractères")
          .regex(/^[a-zA-Z0-9_\-àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ ]+$/, "Le pseudo contient des caractères non autorisés"),
        email: z.string().email("Adresse courriel invalide"),
        password: z
          .string()
          .min(6, "Le mot de passe doit contenir au moins 6 caractères")
          .max(100, "Le mot de passe est trop long"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const profile = await createGameProfile(input.pseudo, input.email, input.password);

        // Créer le cookie de session
        const token = await signGameSession(profile.id, profile.pseudo);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(GAME_COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return {
          success: true as const,
          profile: {
            id: profile.id,
            pseudo: profile.pseudo,
            email: profile.email,
            createdAt: profile.createdAt,
          },
        };
      } catch (error: any) {
        return {
          success: false as const,
          error: error.message || "Erreur lors de l'inscription",
          profile: null,
        };
      }
    }),

  /** Connexion — vérifier les identifiants et créer une session */
  login: publicProcedure
    .input(
      z.object({
        identifier: z.string().min(1, "Veuillez entrer votre pseudo ou courriel"),
        password: z.string().min(1, "Veuillez entrer votre mot de passe"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const profile = await verifyGameProfile(input.identifier, input.password);

      if (!profile) {
        return {
          success: false as const,
          error: "Pseudo/courriel ou mot de passe incorrect",
          profile: null,
        };
      }

      // Créer le cookie de session
      const token = await signGameSession(profile.id, profile.pseudo);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(GAME_COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return {
        success: true as const,
        profile: {
          id: profile.id,
          pseudo: profile.pseudo,
          email: profile.email,
          createdAt: profile.createdAt,
        },
      };
    }),

  /** Récupérer le profil de jeu connecté (via cookie game_session) */
  me: publicProcedure.query(async ({ ctx }) => {
    const cookieValue = getGameCookie(ctx.req);
    const session = await verifyGameSession(cookieValue);

    if (!session) return null;

    const profile = await getGameProfileById(session.profileId);
    if (!profile) return null;

    return {
      id: profile.id,
      pseudo: profile.pseudo,
      email: profile.email,
      createdAt: profile.createdAt,
    };
  }),

  /** Déconnexion — supprimer le cookie de session game */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(GAME_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),
});

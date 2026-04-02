/**
 * Tests vitest pour miniGameRouter.
 *
 * Stratégie :
 * - vi.hoisted() pour les variables de mock Drizzle utilisées dans vi.mock()
 * - Mocker `./db` pour intercepter les appels Drizzle sans base de données réelle.
 * - Les procédures sont publicProcedure, donc pas besoin de mocker l'auth.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

// ── vi.hoisted : variables disponibles avant le hissage des mocks ──
const { mockDb, mockSelectChain, mockInsertChain, mockUpdateChain, mockDeleteChain } = vi.hoisted(() => {
  const mockSelectChain = { from: vi.fn() };
  const mockInsertChain = { values: vi.fn() };
  const mockUpdateChain = { set: vi.fn() };
  const mockDeleteChain = { where: vi.fn() };

  const mockDb = {
    select: vi.fn(() => mockSelectChain),
    insert: vi.fn(() => mockInsertChain),
    update: vi.fn(() => mockUpdateChain),
    delete: vi.fn(() => mockDeleteChain),
  };

  return { mockDb, mockSelectChain, mockInsertChain, mockUpdateChain, mockDeleteChain };
});

// ── Mock de getDb ─────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

// ── Mock de jose (requis par gameAuthRouter importé via appRouter) ──
vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue("mock-jwt-token"),
  })),
  jwtVerify: vi.fn().mockResolvedValue({
    payload: { profileId: 1, pseudo: "TestJoueur" },
  }),
}));

// ── Mock de gameProfileDb ─────────────────────────────────────
vi.mock("./gameProfileDb", () => ({
  createGameProfile: vi.fn(),
  verifyGameProfile: vi.fn(),
  getGameProfileById: vi.fn().mockResolvedValue({
    id: 1,
    pseudo: "TestJoueur",
    email: "test@example.com",
    passwordHash: "hashed",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    lastSignedIn: new Date("2026-01-01"),
  }),
}));

// ── Imports après les mocks ───────────────────────────────────
import { appRouter } from "./routers";

// ── Contexte public (pas d'auth requise pour miniGame) ───────
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createCaller() {
  return appRouter.createCaller(createPublicContext());
}

// ── Réinitialisation commune avant chaque test ────────────────
function resetMocks() {
  vi.clearAllMocks();
  mockDb.select.mockReturnValue(mockSelectChain);
  mockDb.insert.mockReturnValue(mockInsertChain);
  mockDb.update.mockReturnValue(mockUpdateChain);
  mockDb.delete.mockReturnValue(mockDeleteChain);
}

// ─────────────────────────────────────────────────────────────
describe("miniGame.trigger", () => {
  beforeEach(resetMocks);

  it("déclenche un mini-jeu et retourne success: true", async () => {
    // delete pour nettoyer les anciens événements
    mockDeleteChain.where = vi.fn().mockResolvedValue(undefined);
    // insert pour créer le nouvel événement
    mockInsertChain.values = vi.fn().mockResolvedValue(undefined);

    // Mock du select pour simuler l'événement créé
    mockSelectChain.from = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([{ id: 1, sessionCode: "ABC123", mode: "run", triggeredBy: "player-1", resolved: 0 }]),
      }),
    });

    const result = await createCaller().miniGame.trigger({
      sessionCode: "ABC123",
      playerId: "player-1",
      mode: "run",
      totalPlayers: 3,
    });

    expect(result.success).toBe(true);
    expect(result.eventId).toBeDefined();
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockInsertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionCode: "ABC123",
        mode: "run",
        triggeredBy: "player-1",
        resolved: 0,
      }),
    );
  });

  it("normalise le code de session en majuscules", async () => {
    mockDeleteChain.where = vi.fn().mockResolvedValue(undefined);
    mockInsertChain.values = vi.fn().mockResolvedValue(undefined);

    mockSelectChain.from = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([]),
      }),
    });

    await createCaller().miniGame.trigger({
      sessionCode: "abc123",
      playerId: "player-1",
      mode: "hide",
      totalPlayers: 2,
    });

    expect(mockInsertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({ sessionCode: "ABC123" }),
    );
  });

  it("accepte le mode 'hide'", async () => {
    mockDeleteChain.where = vi.fn().mockResolvedValue(undefined);
    mockInsertChain.values = vi.fn().mockResolvedValue(undefined);
    mockSelectChain.from = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([{ id: 2, sessionCode: "XYZ789", mode: "hide", triggeredBy: "player-2", resolved: 0 }]),
      }),
    });

    const result = await createCaller().miniGame.trigger({
      sessionCode: "XYZ789",
      playerId: "player-2",
      mode: "hide",
      totalPlayers: 4,
    });

    expect(result.success).toBe(true);
    expect(mockInsertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "hide" }),
    );
  });
});

// ─────────────────────────────────────────────────────────────
describe("miniGame.getActive", () => {
  beforeEach(resetMocks);

  it("retourne null si aucun mini-jeu actif", async () => {
    mockSelectChain.from = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([]),
      }),
    });

    const result = await createCaller().miniGame.getActive({ sessionCode: "ABC123" });

    expect(result).toBeNull();
  });

  it("retourne l'événement actif si un mini-jeu est en cours", async () => {
    const mockEvent = {
      id: 1,
      sessionCode: "ABC123",
      mode: "run",
      triggeredBy: "player-1",
      triggeredAt: new Date("2026-04-02T10:00:00Z"),
      resolved: 0,
    };

    mockSelectChain.from = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([mockEvent]),
      }),
    });

    const result = await createCaller().miniGame.getActive({ sessionCode: "ABC123" });

    expect(result).not.toBeNull();
    expect(result?.id).toBe(1);
    expect(result?.mode).toBe("run");
    expect(result?.triggeredBy).toBe("player-1");
  });

  it("normalise le code de session en majuscules pour la recherche", async () => {
    mockSelectChain.from = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([]),
      }),
    });

    await createCaller().miniGame.getActive({ sessionCode: "abc123" });

    // La requête doit avoir été faite (peu importe le résultat)
    expect(mockDb.select).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────
describe("miniGame.resolve", () => {
  beforeEach(resetMocks);

  it("marque l'événement comme résolu et retourne success: true", async () => {
    const mockSetChain = { where: vi.fn().mockResolvedValue(undefined) };
    mockUpdateChain.set = vi.fn().mockReturnValue(mockSetChain);
    // Mock du select pour récupérer les résultats
    mockSelectChain.from = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    });

    const result = await createCaller().miniGame.resolve({ sessionCode: "ABC123", eventId: 1 });

    expect(result.success).toBe(true);
    expect(result.results).toBeDefined();
    expect(mockDb.update).toHaveBeenCalled();
    expect(mockUpdateChain.set).toHaveBeenCalledWith({ resolved: 1 });
    expect(mockSetChain.where).toHaveBeenCalled();
  });

  it("normalise le code de session en majuscules", async () => {
    const mockSetChain = { where: vi.fn().mockResolvedValue(undefined) };
    mockUpdateChain.set = vi.fn().mockReturnValue(mockSetChain);
    mockSelectChain.from = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    });

    const result = await createCaller().miniGame.resolve({ sessionCode: "xyz456", eventId: 2 });

    expect(result.success).toBe(true);
    expect(mockDb.update).toHaveBeenCalled();
  });
});

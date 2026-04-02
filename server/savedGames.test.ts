/**
 * Tests vitest pour les endpoints de sauvegarde de parties (savedGamesRouter).
 *
 * Stratégie :
 * - vi.hoisted() pour les variables de mock utilisées dans les factories vi.mock()
 * - Mocker `jose` pour que jwtVerify retourne un payload valide sans vrai JWT.
 * - Mocker `./gameProfileDb` pour que getGameProfileById retourne un profil fictif.
 * - Mocker `./db` pour intercepter les appels Drizzle sans base de données réelle.
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

// ── Mock de jose (JWT) ────────────────────────────────────────
vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue("mock-jwt-token"),
  })),
  jwtVerify: vi.fn().mockResolvedValue({
    payload: { profileId: 42, pseudo: "TestJoueur" },
  }),
}));

// ── Mock de gameProfileDb ─────────────────────────────────────
vi.mock("./gameProfileDb", () => ({
  createGameProfile: vi.fn(),
  verifyGameProfile: vi.fn(),
  getGameProfileById: vi.fn().mockResolvedValue({
    id: 42,
    pseudo: "TestJoueur",
    email: "test@example.com",
    passwordHash: "hashed",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    lastSignedIn: new Date("2026-01-01"),
  }),
}));

// ── Mock de getDb ─────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

// ── Imports après les mocks ───────────────────────────────────
import * as gameProfileDbModule from "./gameProfileDb";
import * as joseModule from "jose";
import { appRouter } from "./routers";

// ── Profil de jeu fictif ──────────────────────────────────────
const MOCK_PROFILE = {
  id: 42,
  pseudo: "TestJoueur",
  email: "test@example.com",
  passwordHash: "hashed",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  lastSignedIn: new Date("2026-01-01"),
};

// ── Contexte avec cookie game_session simulé ──────────────────
function createContextWithGameCookie(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { cookie: "game_session=mock-jwt-token" },
    } as TrpcContext["req"],
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createCaller() {
  return appRouter.createCaller(createContextWithGameCookie());
}

// ── Réinitialisation commune avant chaque test ────────────────
function resetMocks() {
  vi.clearAllMocks();
  vi.mocked(joseModule.jwtVerify).mockResolvedValue({
    payload: { profileId: 42, pseudo: "TestJoueur" },
  } as any);
  vi.mocked(gameProfileDbModule.getGameProfileById).mockResolvedValue(MOCK_PROFILE as any);
  mockDb.select.mockReturnValue(mockSelectChain);
  mockDb.insert.mockReturnValue(mockInsertChain);
  mockDb.update.mockReturnValue(mockUpdateChain);
  mockDb.delete.mockReturnValue(mockDeleteChain);
}

// ─────────────────────────────────────────────────────────────
describe("savedGames.loadGame", () => {
  beforeEach(resetMocks);

  it("retourne hasSave: false si aucune sauvegarde n'existe", async () => {
    mockSelectChain.from = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([]),
      }),
    });

    const result = await createCaller().savedGames.loadGame();

    expect(result).toEqual({ hasSave: false });
  });

  it("retourne hasSave: true avec les données si une sauvegarde existe", async () => {
    const mockSave = {
      id: 1,
      profileId: 42,
      gameState: JSON.stringify({ deck: [1, 2, 3], drawn: [4, 5] }),
      difficulty: "10000",
      currentTurn: 5,
      cardsDrawn: 5,
      savedAt: new Date("2026-04-01T12:00:00Z"),
      createdAt: new Date("2026-04-01T10:00:00Z"),
    };

    mockSelectChain.from = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([mockSave]),
      }),
    });

    const result = await createCaller().savedGames.loadGame();

    expect(result.hasSave).toBe(true);
    if (result.hasSave) {
      expect(result.gameState).toBe(mockSave.gameState);
      expect(result.difficulty).toBe("10000");
      expect(result.currentTurn).toBe(5);
      expect(result.cardsDrawn).toBe(5);
    }
  });
});

// ─────────────────────────────────────────────────────────────
describe("savedGames.saveGame", () => {
  beforeEach(resetMocks);

  it("crée une nouvelle sauvegarde si aucune n'existe (updated: false)", async () => {
    mockSelectChain.from = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([]),
      }),
    });
    mockInsertChain.values = vi.fn().mockResolvedValue(undefined);

    const result = await createCaller().savedGames.saveGame({
      gameState: JSON.stringify({ deck: [1, 2], drawn: [3] }),
      difficulty: "10000",
      currentTurn: 3,
      cardsDrawn: 3,
    });

    expect(result).toEqual({ success: true, updated: false });
    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockInsertChain.values).toHaveBeenCalled();
  });

  it("met à jour la sauvegarde existante (updated: true)", async () => {
    const existingSave = {
      id: 7,
      profileId: 42,
      gameState: "{}",
      difficulty: "5000",
      currentTurn: 2,
      cardsDrawn: 2,
      savedAt: new Date(),
      createdAt: new Date(),
    };

    mockSelectChain.from = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([existingSave]),
      }),
    });
    const mockSetChain = { where: vi.fn().mockResolvedValue(undefined) };
    mockUpdateChain.set = vi.fn().mockReturnValue(mockSetChain);

    const result = await createCaller().savedGames.saveGame({
      gameState: JSON.stringify({ deck: [10], drawn: [1, 2, 3] }),
      difficulty: "10000",
      currentTurn: 4,
      cardsDrawn: 4,
    });

    expect(result).toEqual({ success: true, updated: true });
    expect(mockDb.update).toHaveBeenCalled();
    expect(mockUpdateChain.set).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────
describe("savedGames.deleteSave", () => {
  beforeEach(resetMocks);

  it("supprime la sauvegarde si elle existe (deleted: true)", async () => {
    const existingSave = {
      id: 3,
      profileId: 42,
      gameState: "{}",
      difficulty: "10000",
      currentTurn: 2,
      cardsDrawn: 2,
      savedAt: new Date(),
      createdAt: new Date(),
    };

    mockSelectChain.from = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([existingSave]),
      }),
    });
    mockDeleteChain.where = vi.fn().mockResolvedValue(undefined);

    const result = await createCaller().savedGames.deleteSave();

    expect(result).toEqual({ success: true, deleted: true });
    expect(mockDb.delete).toHaveBeenCalled();
    expect(mockDeleteChain.where).toHaveBeenCalled();
  });

  it("retourne deleted: false si aucune sauvegarde n'existe", async () => {
    mockSelectChain.from = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([]),
      }),
    });

    const result = await createCaller().savedGames.deleteSave();

    expect(result).toEqual({ success: true, deleted: false });
    expect(mockDb.delete).not.toHaveBeenCalled();
  });

  it("rejette si le profil de jeu est introuvable (session invalide)", async () => {
    vi.mocked(gameProfileDbModule.getGameProfileById).mockResolvedValue(null);

    await expect(createCaller().savedGames.deleteSave()).rejects.toThrow();
  });
});

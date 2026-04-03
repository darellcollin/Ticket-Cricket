/**
 * Tests vitest pour les endpoints de configurations de partie (gameConfigsRouter).
 *
 * Stratégie :
 * - vi.hoisted() pour les variables de mock utilisées dans les factories vi.mock()
 * - Mocker `jose` pour que jwtVerify retourne un payload valide sans vrai JWT.
 * - Mocker `./gameProfileDb` pour que getGameProfileById retourne un profil fictif.
 * - Mocker `./db` pour intercepter les appels Drizzle sans base de données réelle.
 * - Fournir un contexte avec cookie `game_session` simulé (requis par gameAuthProtectedProcedure).
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

// ── vi.hoisted : variables disponibles avant le hissage des mocks ──
const { mockDb, mockSelectChain, mockInsertChain, mockDeleteChain } = vi.hoisted(() => {
  const mockSelectChain = { from: vi.fn() };
  const mockInsertChain = { values: vi.fn() };
  const mockDeleteChain = { where: vi.fn() };
  const mockDb = {
    select: vi.fn(() => mockSelectChain),
    insert: vi.fn(() => mockInsertChain),
    delete: vi.fn(() => mockDeleteChain),
  };
  return { mockDb, mockSelectChain, mockInsertChain, mockDeleteChain };
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
  mockDb.delete.mockReturnValue(mockDeleteChain);
}

// ── Données de test ───────────────────────────────────────────
const mockConfig = {
  id: 1,
  profileId: 42,
  name: "Ma config préférée",
  difficulty: "5000",
  disableT2: 0,
  disableT3: 0,
  includeCustom: 1,
  createdAt: new Date("2026-01-01"),
};

// ─────────────────────────────────────────────────────────────
describe("gameConfigs.list", () => {
  beforeEach(resetMocks);

  it("retourne la liste des configurations du joueur", async () => {
    const orderByMock = vi.fn().mockResolvedValue([mockConfig]);
    const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    mockSelectChain.from = vi.fn().mockReturnValue({ where: whereMock });

    const caller = createCaller();
    const result = await caller.gameConfigs.list();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Ma config préférée");
    expect(result[0].difficulty).toBe("5000");
    expect(result[0].disableT2).toBe(false);
    expect(result[0].disableT3).toBe(false);
    expect(result[0].includeCustom).toBe(true);
  });

  it("retourne un tableau vide si aucune configuration", async () => {
    const orderByMock = vi.fn().mockResolvedValue([]);
    const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    mockSelectChain.from = vi.fn().mockReturnValue({ where: whereMock });

    const caller = createCaller();
    const result = await caller.gameConfigs.list();

    expect(result).toHaveLength(0);
  });

  it("convertit les champs int (0/1) en booléens", async () => {
    const configWithFlags = { ...mockConfig, disableT2: 1, disableT3: 1, includeCustom: 0 };
    const orderByMock = vi.fn().mockResolvedValue([configWithFlags]);
    const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock });
    mockSelectChain.from = vi.fn().mockReturnValue({ where: whereMock });

    const caller = createCaller();
    const result = await caller.gameConfigs.list();

    expect(result[0].disableT2).toBe(true);
    expect(result[0].disableT3).toBe(true);
    expect(result[0].includeCustom).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────
describe("gameConfigs.save", () => {
  beforeEach(resetMocks);

  it("sauvegarde une nouvelle configuration avec succès", async () => {
    // Moins de 10 configs existantes
    const whereMock = vi.fn().mockResolvedValue([]);
    mockSelectChain.from = vi.fn().mockReturnValue({ where: whereMock });
    mockInsertChain.values = vi.fn().mockResolvedValue([{ insertId: 5 }]);

    const caller = createCaller();
    const result = await caller.gameConfigs.save({
      name: "Config test",
      difficulty: "10000",
      disableT2: false,
      disableT3: true,
      includeCustom: false,
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe(5);
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it("refuse si la limite de 10 configurations est atteinte", async () => {
    // Simuler 10 configs existantes
    const existingConfigs = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
    const whereMock = vi.fn().mockResolvedValue(existingConfigs);
    mockSelectChain.from = vi.fn().mockReturnValue({ where: whereMock });

    const caller = createCaller();
    await expect(
      caller.gameConfigs.save({
        name: "Config de trop",
        difficulty: "5000",
        disableT2: false,
        disableT3: false,
        includeCustom: false,
      })
    ).rejects.toThrow("limite de 10");
  });

  it("refuse un nom vide", async () => {
    const caller = createCaller();
    await expect(
      caller.gameConfigs.save({
        name: "",
        difficulty: "5000",
        disableT2: false,
        disableT3: false,
        includeCustom: false,
      })
    ).rejects.toThrow();
  });

  it("refuse un nom trop long (> 50 caractères)", async () => {
    const caller = createCaller();
    await expect(
      caller.gameConfigs.save({
        name: "A".repeat(51),
        difficulty: "5000",
        disableT2: false,
        disableT3: false,
        includeCustom: false,
      })
    ).rejects.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────
describe("gameConfigs.delete", () => {
  beforeEach(resetMocks);

  it("supprime une configuration qui appartient au joueur", async () => {
    // Config trouvée pour ce joueur
    const whereMock = vi.fn().mockResolvedValue([{ id: 1 }]);
    mockSelectChain.from = vi.fn().mockReturnValue({ where: whereMock });
    mockDeleteChain.where = vi.fn().mockResolvedValue(undefined);

    const caller = createCaller();
    const result = await caller.gameConfigs.delete({ id: 1 });

    expect(result.success).toBe(true);
    expect(mockDb.delete).toHaveBeenCalled();
  });

  it("refuse de supprimer une configuration qui n'appartient pas au joueur", async () => {
    // Config non trouvée pour ce joueur
    const whereMock = vi.fn().mockResolvedValue([]);
    mockSelectChain.from = vi.fn().mockReturnValue({ where: whereMock });

    const caller = createCaller();
    await expect(caller.gameConfigs.delete({ id: 999 })).rejects.toThrow("introuvable");
  });

  it("refuse un ID invalide (non entier positif)", async () => {
    const caller = createCaller();
    await expect(caller.gameConfigs.delete({ id: -1 })).rejects.toThrow();
  });
});

/**
 * Utilitaire API pour les sessions multijoueur.
 */
import { projectId, publicAnonKey } from "./supabaseInfo";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-1e3da818`;
const HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${publicAnonKey}`,
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
  ready: boolean;
}

export interface Session {
  code: string;
  hostId: string;
  players: Player[];
  state: "lobby" | "playing" | "finished";
  deck: number[];
  drawn: number[];
  turnOrder: string[];
  currentTurnIndex: number;
  lastCard: number | null;
  lastCardDrawnBy: string | null;
  playerCards: Record<string, number[]>;
  /** Dettes reçues via cartes Type 3. playerId → montant $ */
  playerDebts: Record<string, number>;
  /** Cartes T3 reçues (numéros) via transfert. playerId → cardIds[] */
  playerReceivedCards: Record<string, number[]>;
  /** Joueurs éliminés (dette >= seuil). */
  eliminatedPlayers: string[];
  /** Joueurs éliminés en attente de confirmation (pause la partie). */
  pendingEliminationAck: string[];
  /** Limite d'amende avant élimination (défaut 10 000$). */
  eliminationThreshold: number;
  /** IDs de cartes autorisées dans le deck (filtré selon les préférences). */
  allowedCardIds: number[];
  /** Types de cartes désactivés : 2 = contribuable, 3 = investisseur. */
  disabledCardTypes: number[];
  createdAt: number;
  /** Dernier joueur ayant quitté/été expulsé (pour notif temps réel). */
  recentLeave?: { playerName: string; timestamp: number; kickedBy: string | null } | null;
  /** Niveau de taux de perquisition (1-5). Défaut : 1 (2%). */
  miniGameLevel?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function post(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data;
}

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data;
}

// ── API publique ──────────────────────────────────────────────────────────────

export async function createSession(
  hostName: string,
  eliminationThreshold = 10_000,
  allowedCardIds?: number[],
  disabledCardTypes?: number[],
  miniGameLevel?: number,
): Promise<{ code: string; playerId: string; session: Session }> {
  return post("/session/create", { hostName, eliminationThreshold, allowedCardIds, disabledCardTypes, miniGameLevel });
}

export async function getSession(code: string): Promise<{ session: Session }> {
  return get(`/session/${code.toUpperCase()}`);
}

export async function joinSession(
  code: string,
  playerName: string,
  playerId?: string,
): Promise<{ playerId: string; session: Session }> {
  return post(`/session/${code.toUpperCase()}/join`, { playerName, playerId });
}

export async function toggleReady(code: string, playerId: string): Promise<{ session: Session }> {
  return post(`/session/${code.toUpperCase()}/ready`, { playerId });
}

export async function startGame(code: string, playerId: string): Promise<{ session: Session }> {
  return post(`/session/${code.toUpperCase()}/start`, { playerId });
}

export async function drawCard(code: string, playerId: string): Promise<{ session: Session }> {
  return post(`/session/${code.toUpperCase()}/draw`, { playerId });
}

export async function endTurn(code: string, playerId: string): Promise<{ session: Session }> {
  return post(`/session/${code.toUpperCase()}/end-turn`, { playerId });
}

export async function resetGame(code: string, playerId: string): Promise<{ session: Session }> {
  return post(`/session/${code.toUpperCase()}/reset`, { playerId });
}

export async function leaveSession(code: string, playerId: string): Promise<void> {
  await post(`/session/${code.toUpperCase()}/leave`, { playerId });
}

export async function kickPlayer(
  code: string,
  hostId: string,
  targetPlayerId: string,
): Promise<{ session: Session }> {
  return post(`/session/${code.toUpperCase()}/kick`, { hostId, targetPlayerId });
}

export async function addDebt(
  code: string,
  fromPlayerId: string,
  toPlayerId: string,
  amount: number,
  cardId: number,
): Promise<{ session: Session }> {
  return post(`/session/${code.toUpperCase()}/add-debt`, {
    fromPlayerId,
    toPlayerId,
    amount,
    cardId,
  });
}

export async function eliminatePlayer(
  code: string,
  targetPlayerId: string,
): Promise<{ session: Session }> {
  return post(`/session/${code.toUpperCase()}/eliminate`, { targetPlayerId });
}

export async function acknowledgeElimination(
  code: string,
  playerId: string,
): Promise<{ session: Session }> {
  return post(`/session/${code.toUpperCase()}/acknowledge-elimination`, { playerId });
}

// ── SessionStorage helpers ────────────────────────────────────────────────────

export const mpStorage = {
  save(code: string, playerId: string, playerName: string, isHost: boolean) {
    sessionStorage.setItem("mp_code", code);
    sessionStorage.setItem("mp_playerId", playerId);
    sessionStorage.setItem("mp_playerName", playerName);
    sessionStorage.setItem("mp_isHost", isHost ? "1" : "0");
  },
  load() {
    return {
      code: sessionStorage.getItem("mp_code") || "",
      playerId: sessionStorage.getItem("mp_playerId") || "",
      playerName: sessionStorage.getItem("mp_playerName") || "",
      isHost: sessionStorage.getItem("mp_isHost") === "1",
    };
  },
  clear() {
    ["mp_code", "mp_playerId", "mp_playerName", "mp_isHost"].forEach((k) =>
      sessionStorage.removeItem(k),
    );
  },
};

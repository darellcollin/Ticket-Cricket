/**
 * MultiplayerGameScreen — Écran de jeu multijoueur.
 * Tour par tour, cartes T1+T2+T3, transfert de dette, élimination.
 * Design: Arcade Urbaine
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Home, Crown, Shuffle, X, ChevronDown,
  Clock, Trophy, Layers, User, ArrowRight,
  TrendingDown, TrendingUp, Skull, CheckCircle,
  History, ListOrdered, LogOut,
} from "lucide-react";
import {
  getSession, drawCard, resetGame, leaveSession, addDebt, eliminatePlayer,
  endTurn, mpStorage, acknowledgeElimination, kickPlayer, type Session,
} from "@/game/utils/sessionApi";
import { getCardAssetUrl } from "@/game/utils/cardAssets";
import {
  getCardConfig, drawerNetAmount, nextPlayerAmount, computePlayerTotal,
  formatPrice, CATEGORY_INFO, CATEGORY_ORDER, TYPE_INFO,
  type CardCategory,
} from "@/game/utils/cardConfig";
import { filterByCategory } from "@/game/utils/cardCategories";
import { PoliceTape } from "@/game/ui/PoliceUI";
import { WinnerOverlay } from "@/game/ui/WinnerOverlay";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };
const POLL_INTERVAL = 1800;

function getNextActivePlayerId(session: Session, currentId: string): string | null {
  const { turnOrder, eliminatedPlayers } = session;
  const active = turnOrder.filter((id) => !eliminatedPlayers.includes(id));
  if (active.length <= 1) return null;
  const idx = active.indexOf(currentId);
  return active[(idx + 1) % active.length] || null;
}

export default function MultiplayerGameScreen() {
  const [, navigate] = useLocation();
  const mpData = mpStorage.load();
  const { code, playerId, isHost } = mpData;
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [lastDrawnCard, setLastDrawnCard] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<CardCategory | "all">("all");
  const [showWinner, setShowWinner] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const fetchSession = useCallback(async () => {
    if (!code) return;
    try {
      const { session: s } = await getSession(code);
      setSession(s);
      setError("");
      if (s.state === "finished" && !showWinner) {
        setShowWinner(true);
      }
    } catch (e: any) {
      setError(e.message || "Erreur");
    }
  }, [code, showWinner]);

  useEffect(() => {
    if (!code) { navigate("/"); return; }
    fetchSession();
    pollRef.current = setInterval(fetchSession, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [code, fetchSession, navigate]);

  // Detect new card drawn by polling
  useEffect(() => {
    if (session?.lastCard && session.lastCard !== lastDrawnCard) {
      setLastDrawnCard(session.lastCard);
      setShowCard(true);
    }
  }, [session?.lastCard, lastDrawnCard]);

  const handleDraw = async () => {
    if (drawing || !session) return;
    setDrawing(true);
    try {
      const { session: s } = await drawCard(code, playerId);
      setSession(s);
      if (s.lastCard) {
        setLastDrawnCard(s.lastCard);
        setShowCard(true);

        // Handle T3 card — auto add debt to next player
        const cfg = getCardConfig(s.lastCard);
        if (cfg.cardType === 3) {
          const nextId = getNextActivePlayerId(s, playerId);
          if (nextId) {
            const amount = nextPlayerAmount(cfg);
            if (amount > 0) {
              const { session: s2 } = await addDebt(code, playerId, nextId, amount, s.lastCard);
              setSession(s2);
            }
          }
        }

        // Check elimination
        const myCards = s.playerCards[playerId] || [];
        const myDebts = s.playerDebts?.[playerId] || 0;
        const myTotal = computePlayerTotal(myCards) + myDebts;
        if (myTotal >= s.eliminationThreshold && !s.eliminatedPlayers.includes(playerId)) {
          const { session: s3 } = await eliminatePlayer(code, playerId);
          setSession(s3);
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDrawing(false);
    }
  };

  const handleEndTurn = async () => {
    try {
      const { session: s } = await endTurn(code, playerId);
      setSession(s);
      setShowCard(false);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleAckElimination = async () => {
    try {
      const { session: s } = await acknowledgeElimination(code, playerId);
      setSession(s);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleReset = async () => {
    try {
      const { session: s } = await resetGame(code, playerId);
      setSession(s);
      setShowWinner(false);
      setShowCard(false);
      setLastDrawnCard(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveSession(code, playerId);
    } catch { /* ignore */ }
    mpStorage.clear();
    navigate("/");
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🎫</div>
          <p className="text-slate-400" style={FONT_FREDOKA}>Chargement...</p>
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  const players = session.players;
  const currentTurnPlayerId = session.turnOrder[session.currentTurnIndex];
  const isMyTurn = currentTurnPlayerId === playerId;
  const amEliminated = session.eliminatedPlayers.includes(playerId);
  const pendingAck = session.pendingEliminationAck?.includes(playerId);
  const myCards = session.playerCards[playerId] || [];
  const myDebts = session.playerDebts?.[playerId] || 0;
  const myTotal = computePlayerTotal(myCards) + myDebts;
  const hasDrawn = session.lastCardDrawnBy === playerId && session.lastCard !== null;
  const currentPlayer = players.find((p) => p.id === currentTurnPlayerId);

  // Winner detection
  const activePlayers = session.turnOrder.filter((id) => !session.eliminatedPlayers.includes(id));
  const winner = session.state === "finished" && activePlayers.length === 1
    ? players.find((p) => p.id === activePlayers[0])
    : null;

  const lastCardCfg = lastDrawnCard ? getCardConfig(lastDrawnCard) : null;
  const lastCatInfo = lastCardCfg ? CATEGORY_INFO[lastCardCfg.category] : null;
  const lastTypeInfo = lastCardCfg ? TYPE_INFO[lastCardCfg.cardType] : null;
  const lastNetAmount = lastCardCfg ? drawerNetAmount(lastCardCfg) : 0;

  const filteredHistory = historyFilter === "all"
    ? myCards
    : filterByCategory(myCards, historyFilter);

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-2">
          <button onClick={handleLeave} className="text-slate-400 hover:text-white">
            <LogOut size={20} />
          </button>
          <div className="text-center">
            <div className="text-xs text-slate-500" style={FONT_FREDOKA}>MA DETTE</div>
            <div
              className={`text-xl ${myTotal >= session.eliminationThreshold * 0.8 ? "text-red-400" : myTotal < 0 ? "text-emerald-400" : "text-yellow-400"}`}
              style={FONT_BANGERS}
            >
              {formatPrice(myTotal)}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowHistory(!showHistory)} className="text-slate-400 hover:text-white">
              <History size={20} />
            </button>
            {isHost && session.state === "finished" && (
              <button onClick={handleReset} className="text-slate-400 hover:text-white">
                <Shuffle size={20} />
              </button>
            )}
          </div>
        </div>
        {/* Debt progress */}
        <div className="h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 transition-all duration-500"
            style={{ width: `${Math.min(100, (myTotal / session.eliminationThreshold) * 100)}%` }}
          />
        </div>
      </div>

      {/* Turn indicator */}
      <div className="px-4 py-3 text-center">
        {amEliminated ? (
          <div className="flex items-center justify-center gap-2 text-red-400" style={FONT_FREDOKA}>
            <Skull size={18} />
            Vous êtes éliminé — Mode spectateur
          </div>
        ) : isMyTurn ? (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-yellow-400 text-lg"
            style={FONT_BANGERS}
          >
            C'EST VOTRE TOUR !
          </motion.div>
        ) : (
          <div className="text-slate-400" style={FONT_FREDOKA}>
            <Clock size={14} className="inline mr-1" />
            Tour de {currentPlayer?.name || "..."}
          </div>
        )}
      </div>

      {/* Players strip */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
        {players.map((p) => {
          const pCards = session.playerCards[p.id] || [];
          const pDebts = session.playerDebts?.[p.id] || 0;
          const pTotal = computePlayerTotal(pCards) + pDebts;
          const isElim = session.eliminatedPlayers.includes(p.id);
          const isCurrent = p.id === currentTurnPlayerId;
          return (
            <div
              key={p.id}
              className={`flex-shrink-0 rounded-xl px-3 py-2 text-center min-w-[80px] border ${
                isElim
                  ? "bg-red-950/30 border-red-800/30 opacity-50"
                  : isCurrent
                    ? "bg-yellow-500/10 border-yellow-500/50"
                    : "bg-slate-900 border-slate-800"
              }`}
            >
              <div className="text-xs truncate" style={FONT_FREDOKA}>
                {p.id === session.hostId && <Crown size={10} className="inline text-yellow-400 mr-1" />}
                {p.name}
                {p.id === playerId && <span className="text-slate-500"> (moi)</span>}
              </div>
              <div
                className={`text-sm font-bold ${isElim ? "text-red-400 line-through" : pTotal < 0 ? "text-emerald-400" : "text-slate-200"}`}
                style={FONT_BANGERS}
              >
                {isElim ? "ÉLIMINÉ" : formatPrice(pTotal)}
              </div>
              <div className="text-[10px] text-slate-500">{pCards.length} cartes</div>
            </div>
          );
        })}
      </div>

      {/* Card display */}
      <div className="flex flex-col items-center justify-center px-4 py-6 min-h-[40vh]">
        {pendingAck ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <Skull size={48} className="mx-auto mb-4 text-red-400" />
            <h3 className="text-2xl text-red-400 mb-4" style={FONT_BANGERS}>VOUS ÊTES ÉLIMINÉ !</h3>
            <p className="text-slate-400 mb-4" style={FONT_FREDOKA}>
              Votre dette a atteint {formatPrice(session.eliminationThreshold)}
            </p>
            <button
              onClick={handleAckElimination}
              className="rounded-xl bg-red-600 hover:bg-red-500 px-6 py-3 font-bold text-white"
              style={FONT_FREDOKA}
            >
              J'ai compris
            </button>
          </motion.div>
        ) : showCard && lastDrawnCard && lastCardCfg && lastCatInfo && lastTypeInfo ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={lastDrawnCard}
              initial={{ scale: 0.5, rotateY: 180, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-56 sm:w-64"
            >
              <div className="rounded-2xl border-4 overflow-hidden shadow-2xl" style={{ borderColor: lastCatInfo.border }}>
                <div className="relative aspect-[5/7]">
                  <img src={getCardAssetUrl(lastDrawnCard) || ""} alt={`Carte #${lastDrawnCard}`} className="w-full h-full object-cover" />
                </div>
                <div className="px-3 py-2 text-center" style={{ backgroundColor: lastCatInfo.color }}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: lastTypeInfo.color, color: "white" }}>
                      {lastTypeInfo.shortLabel}
                    </span>
                    <span className="text-sm font-bold" style={{ color: lastCatInfo.text }}>{lastCatInfo.label}</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ ...FONT_BANGERS, color: lastCatInfo.text }}>
                    {lastNetAmount >= 0 ? (
                      <span className="flex items-center justify-center gap-1">
                        <TrendingUp size={16} /> +{formatPrice(lastNetAmount)}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <TrendingDown size={16} /> {formatPrice(lastNetAmount)}
                      </span>
                    )}
                  </div>
                  {lastCardCfg.cardType === 3 && (
                    <div className="text-xs mt-1 flex items-center justify-center gap-1" style={{ color: lastCatInfo.text }}>
                      <ArrowRight size={12} />
                      {formatPrice(nextPlayerAmount(lastCardCfg))} au joueur suivant
                    </div>
                  )}
                </div>
              </div>
              {/* Drawn by indicator */}
              {session.lastCardDrawnBy && (
                <div className="text-center mt-2 text-xs text-slate-500" style={FONT_FREDOKA}>
                  Piochée par {players.find((p) => p.id === session.lastCardDrawnBy)?.name || "?"}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-3">🎫</div>
            <p className="text-slate-500" style={FONT_FREDOKA}>
              {session.deck.length === 0 ? "Deck vide !" : "En attente..."}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!amEliminated && !pendingAck && session.state === "playing" && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-3 px-4">
          {isMyTurn && !hasDrawn && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDraw}
              disabled={drawing}
              className="flex-1 max-w-xs rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-4 text-2xl font-bold text-black shadow-lg shadow-yellow-500/30 disabled:opacity-50"
              style={FONT_BANGERS}
            >
              {drawing ? "..." : "PIOCHER"}
            </motion.button>
          )}
          {isMyTurn && hasDrawn && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEndTurn}
              className="flex-1 max-w-xs rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 py-4 text-2xl font-bold text-white shadow-lg"
              style={FONT_BANGERS}
            >
              FIN DU TOUR
            </motion.button>
          )}
        </div>
      )}

      {/* Info bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 px-4 py-2 flex justify-between text-xs text-slate-500" style={FONT_FREDOKA}>
        <span><Layers size={12} className="inline mr-1" />{session.deck.length} restantes</span>
        <span>Code: {code}</span>
        <span><ListOrdered size={12} className="inline mr-1" />{(session.drawn || []).length} piochées</span>
      </div>

      {/* History panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-y-0 right-0 z-40 w-80 bg-slate-900 border-l border-slate-700 overflow-y-auto"
          >
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl text-yellow-400" style={FONT_BANGERS}>MES CARTES</h3>
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setHistoryFilter("all")}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${historyFilter === "all" ? "bg-yellow-400 text-black" : "bg-slate-700 text-slate-300"}`}
                >
                  Tout ({myCards.length})
                </button>
                {CATEGORY_ORDER.map((cat) => {
                  const count = filterByCategory(myCards, cat).length;
                  const info = CATEGORY_INFO[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => setHistoryFilter(cat)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${historyFilter === cat ? "text-black" : "text-slate-300"}`}
                      style={{ backgroundColor: historyFilter === cat ? info.color : undefined }}
                    >
                      {info.emoji} {count}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-4 space-y-2 pb-20">
              {filteredHistory.length === 0 ? (
                <p className="text-slate-500 text-center py-8" style={FONT_FREDOKA}>Aucune carte</p>
              ) : (
                [...filteredHistory].reverse().map((cardId, i) => {
                  const c = getCardConfig(cardId);
                  const ci = CATEGORY_INFO[c.category];
                  const ti = TYPE_INFO[c.cardType];
                  const net = drawerNetAmount(c);
                  return (
                    <div key={`${cardId}-${i}`} className="flex items-center gap-3 rounded-lg bg-slate-800 p-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: ci.color }}>
                        {ci.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-200">#{cardId} — {ci.label}</div>
                        <div className="text-xs text-slate-400">{ti.shortLabel}</div>
                      </div>
                      <div className={`text-sm font-bold ${net >= 0 ? "text-red-400" : "text-emerald-400"}`} style={FONT_BANGERS}>
                        {net >= 0 ? "+" : ""}{formatPrice(net)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner overlay */}
      <WinnerOverlay
        show={showWinner && session.state === "finished"}
        winnerName={winner?.name || "Fin de partie"}
        winnerScore={winner ? formatPrice(computePlayerTotal(session.playerCards[winner.id] || []) + (session.playerDebts?.[winner.id] || 0)) : undefined}
        onClose={() => { setShowWinner(false); if (isHost) handleReset(); else navigate("/"); }}
      />
    </div>
  );
}

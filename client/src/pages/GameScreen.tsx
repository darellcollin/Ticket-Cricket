/**
 * GameScreen — mode solo.
 * Cartes T1 + T2 uniquement (pas de T3 en solo).
 * Élimination si la dette totale atteint le seuil.
 * Design: Arcade Urbaine
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Home, Shuffle, X, ChevronLeft, ChevronRight,
  Trophy, Layers, Skull, CheckCircle, History, ListOrdered,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { getCardAssetUrl } from "@/game/utils/cardAssets";
import {
  getCardConfig, ALL_CARD_IDS,
  computePlayerTotal, drawerNetAmount, formatPrice,
  CATEGORY_INFO, CATEGORY_ORDER, TYPE_INFO,
  type CardCategory,
} from "@/game/utils/cardConfig";
import { filterByCategory } from "@/game/utils/cardCategories";
import { PoliceTape } from "@/game/ui/PoliceUI";
import { SOLO_DIFFICULTY_KEY, SOLO_NO_CONTRIBUABLE_KEY, DIFFICULTIES } from "@/game/components/MultiplayerModal";
import { WinnerOverlay } from "@/game/ui/WinnerOverlay";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GameScreen() {
  const [, navigate] = useLocation();

  // Load solo preferences
  const diffIdx = Number(sessionStorage.getItem(SOLO_DIFFICULTY_KEY) ?? "1");
  const noContribuable = sessionStorage.getItem(SOLO_NO_CONTRIBUABLE_KEY) === "1";
  const threshold = DIFFICULTIES[diffIdx]?.threshold ?? 10000;

  // Build deck: T1 + T2 only (no T3 in solo)
  const buildDeck = useCallback(() => {
    const ids = ALL_CARD_IDS.filter((id) => {
      const cfg = getCardConfig(id);
      if (cfg.cardType === 3) return false; // No T3 in solo
      if (noContribuable && cfg.cardType === 2) return false;
      return true;
    });
    return shuffleArray(ids);
  }, [noContribuable]);

  const [deck, setDeck] = useState<number[]>(() => buildDeck());
  const [drawnCards, setDrawnCards] = useState<number[]>([]);
  const [currentCard, setCurrentCard] = useState<number | null>(null);
  const [showCard, setShowCard] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<CardCategory | "all">("all");

  const total = computePlayerTotal(drawnCards);
  const isEliminated = total >= threshold;
  const deckEmpty = deck.length === 0;

  // Check elimination
  useEffect(() => {
    if (isEliminated && !gameOver) {
      setGameOver(true);
    }
  }, [isEliminated, gameOver]);

  // Check deck empty
  useEffect(() => {
    if (deckEmpty && !gameOver) {
      setGameOver(true);
    }
  }, [deckEmpty, gameOver]);

  const handleDraw = () => {
    if (deck.length === 0 || gameOver) return;
    const [card, ...rest] = deck;
    setDeck(rest);
    setCurrentCard(card);
    setDrawnCards((prev) => [...prev, card]);
    setShowCard(true);
  };

  const handleReset = () => {
    setDeck(buildDeck());
    setDrawnCards([]);
    setCurrentCard(null);
    setShowCard(false);
    setGameOver(false);
    setShowHistory(false);
  };

  const filteredHistory = historyFilter === "all"
    ? drawnCards
    : filterByCategory(drawnCards, historyFilter);

  const cfg = currentCard ? getCardConfig(currentCard) : null;
  const catInfo = cfg ? CATEGORY_INFO[cfg.category] : null;
  const typeInfo = cfg ? TYPE_INFO[cfg.cardType] : null;
  const netAmount = cfg ? drawerNetAmount(cfg) : 0;

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate("/")} className="text-slate-400 hover:text-white">
            <Home size={24} />
          </button>
          <div className="text-center">
            <div className="text-xs text-slate-500" style={FONT_FREDOKA}>DETTE TOTALE</div>
            <div
              className={`text-2xl ${total >= threshold * 0.8 ? "text-red-400" : total < 0 ? "text-emerald-400" : "text-yellow-400"}`}
              style={FONT_BANGERS}
            >
              {formatPrice(total)}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-slate-400 hover:text-white"
            >
              <History size={24} />
            </button>
            <button onClick={handleReset} className="text-slate-400 hover:text-white">
              <Shuffle size={24} />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 transition-all duration-500"
            style={{ width: `${Math.min(100, (total / threshold) * 100)}%` }}
          />
        </div>
      </div>

      {/* Game info */}
      <div className="flex justify-center gap-4 px-4 py-3 text-sm">
        <div className="flex items-center gap-1 text-slate-500">
          <Layers size={14} />
          <span style={FONT_FREDOKA}>{deck.length} restantes</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <ListOrdered size={14} />
          <span style={FONT_FREDOKA}>{drawnCards.length} piochées</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <Skull size={14} />
          <span style={FONT_FREDOKA}>Seuil : {threshold.toLocaleString()}$</span>
        </div>
      </div>

      {/* Card display area */}
      <div className="flex flex-col items-center justify-center px-4 py-8 min-h-[60vh]">
        <AnimatePresence mode="wait">
          {showCard && currentCard && cfg && catInfo && typeInfo ? (
            <motion.div
              key={currentCard}
              initial={{ scale: 0.5, rotateY: 180, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0, x: -200 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-64 sm:w-72"
            >
              {/* Card */}
              <div
                className="rounded-2xl border-4 overflow-hidden shadow-2xl"
                style={{ borderColor: catInfo.border }}
              >
                {/* Card image */}
                <div className="relative aspect-[5/7]">
                  <img
                    src={getCardAssetUrl(currentCard) || ""}
                    alt={`Carte #${currentCard}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Card info bar */}
                <div
                  className="px-4 py-3 text-center"
                  style={{ backgroundColor: catInfo.color }}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-bold"
                      style={{ backgroundColor: typeInfo.color, color: "white" }}
                    >
                      {typeInfo.shortLabel}
                    </span>
                    <span className="text-sm font-bold" style={{ color: catInfo.text }}>
                      {catInfo.label}
                    </span>
                  </div>
                  <div
                    className="text-3xl font-bold"
                    style={{ ...FONT_BANGERS, color: catInfo.text }}
                  >
                    {netAmount >= 0 ? (
                      <span className="flex items-center justify-center gap-1">
                        <TrendingUp size={20} />
                        +{formatPrice(netAmount)}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <TrendingDown size={20} />
                        {formatPrice(netAmount)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🎫</div>
              <p className="text-slate-500 text-lg" style={FONT_FREDOKA}>
                {deckEmpty ? "Le deck est vide !" : "Pioche une carte !"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Draw button */}
      {!gameOver && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDraw}
            disabled={deckEmpty}
            className="w-full max-w-xs rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 px-8 py-5 text-3xl font-bold text-black shadow-lg shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            style={FONT_BANGERS}
          >
            PIOCHER
          </motion.button>
        </div>
      )}

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
                <h3 className="text-xl text-yellow-400" style={FONT_BANGERS}>HISTORIQUE</h3>
                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setHistoryFilter("all")}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    historyFilter === "all" ? "bg-yellow-400 text-black" : "bg-slate-700 text-slate-300"
                  }`}
                >
                  Tout ({drawnCards.length})
                </button>
                {CATEGORY_ORDER.map((cat) => {
                  const count = filterByCategory(drawnCards, cat).length;
                  const info = CATEGORY_INFO[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => setHistoryFilter(cat)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        historyFilter === cat ? "text-black" : "text-slate-300"
                      }`}
                      style={{
                        backgroundColor: historyFilter === cat ? info.color : undefined,
                      }}
                    >
                      {info.emoji} {count}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-4 space-y-2">
              {filteredHistory.length === 0 ? (
                <p className="text-slate-500 text-center py-8" style={FONT_FREDOKA}>Aucune carte</p>
              ) : (
                [...filteredHistory].reverse().map((cardId, i) => {
                  const c = getCardConfig(cardId);
                  const ci = CATEGORY_INFO[c.category];
                  const ti = TYPE_INFO[c.cardType];
                  const net = drawerNetAmount(c);
                  return (
                    <div
                      key={`${cardId}-${i}`}
                      className="flex items-center gap-3 rounded-lg bg-slate-800 p-3"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: ci.color }}
                      >
                        {ci.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-200">
                          #{cardId} — {ci.label}
                        </div>
                        <div className="text-xs text-slate-400">
                          {ti.shortLabel} — {ti.desc}
                        </div>
                      </div>
                      <div
                        className={`text-sm font-bold ${net >= 0 ? "text-red-400" : "text-emerald-400"}`}
                        style={FONT_BANGERS}
                      >
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

      {/* Game over overlay */}
      <WinnerOverlay
        show={gameOver}
        winnerName={isEliminated ? "ÉLIMINÉ !" : "SURVIVANT !"}
        winnerScore={formatPrice(total)}
        onClose={handleReset}
        isSolo
      />
    </div>
  );
}

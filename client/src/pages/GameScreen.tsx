/**
 * GameScreen — mode solo.
 * Cartes T1 + T2 uniquement (pas de T3 en solo).
 * Élimination si la dette totale atteint 10 000$.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "wouter";
import {
  Home, Shuffle, X, ChevronLeft, ChevronRight,
  Trophy, Layers, Skull, CheckCircle, History, ListOrdered,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { getCardImageUrl } from "@/game/utils/imageDB";
import { getCardAssetUrl } from "@/game/utils/cardAssets";
import {
  getCardConfig, ALL_CARD_IDS,
  computePlayerTotal, drawerNetAmount, formatPrice,
  CATEGORY_INFO, CATEGORY_ORDER, TYPE_INFO,
  type CardCategory,
} from "@/game/utils/cardConfig";
import { filterByCategory } from "@/game/utils/cardCategories";
import ticketImg from "@/game/utils/ticketImg";
import { PoliceTape } from "@/game/ui/PoliceUI";
import { SOLO_DIFFICULTY_KEY, SOLO_NO_CONTRIBUABLE_KEY } from "@/game/components/MultiplayerModal";
import { WinnerOverlay } from "@/game/ui/WinnerOverlay";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

// ── Lire le seuil de difficulté depuis localStorage ──────────
function readEliminationThreshold(): number {
  try {
    const stored = localStorage.getItem(SOLO_DIFFICULTY_KEY);
    if (!stored) return 10_000;
    const t = parseInt(stored, 10);
    return [5_000, 10_000, 20_000].includes(t) ? t : 10_000;
  } catch {
    return 10_000;
  }
}

// ── Lire le filtre "sans contribuables" ─────────────────────
function readNoContribuable(): boolean {
  try { return localStorage.getItem(SOLO_NO_CONTRIBUABLE_KEY) === "1"; } catch { return false; }
}

// ── Calcul dynamique du deck solo autorisé ───────────────────
// Appelé à chaque freshDeck() pour lire les préfs actuelles du localStorage.
function getSoloCardIds(): number[] {
  const noContribuable = readNoContribuable();
  return ALL_CARD_IDS.filter((id) => {
    const cfg = getCardConfig(id);
    if (cfg.category === "investisseur") return false;   // T3 toujours exclus en solo
    if (noContribuable && cfg.category === "contribuable") return false;
    return true;
  });
}

// ─── Shuffle ───────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  const rv = new Uint32Array(a.length);
  crypto.getRandomValues(rv);
  for (let i = a.length - 1; i > 0; i--) {
    const j = rv[i] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function freshDeck(): number[] {
  const ids = getSoloCardIds();
  let deck = [...ids];
  deck = shuffle(deck);
  deck = shuffle(deck);
  deck = shuffle(deck);
  return deck;
}

// ─── Validation ────────────────────────────────────────────
// SOLO_CARD_IDS statique conservé pour compter les cartes (hors filtre no-contribuable)
// La validation utilise getSoloCardIds() pour valider avec le filtre courant.
const SOLO_CARD_IDS: number[] = ALL_CARD_IDS.filter(
  (id) => getCardConfig(id).category !== "investisseur"
);
const SOLO_TOTAL  = SOLO_CARD_IDS.length;
const TOTAL_CARDS = SOLO_TOTAL;

function validateAndRepair(deck: number[], drawn: number[]): { deck: number[]; drawn: number[] } {
  const currentIds = getSoloCardIds();
  const currentSet = new Set(currentIds);
  const all = [...deck, ...drawn];
  // Si la taille ne correspond pas au deck courant → rebattre
  if (all.length !== currentIds.length) return { deck: freshDeck(), drawn: [] };
  const seen = new Set<number>();
  for (const n of all) {
    if (!Number.isInteger(n) || !currentSet.has(n) || seen.has(n))
      return { deck: freshDeck(), drawn: [] };
    seen.add(n);
  }
  return { deck, drawn };
}

// ─── Persistence ───────────────────────────────────────────
const STORAGE_KEY = "ticket_cricket_deck_v1";
const DRAWN_KEY   = "ticket_cricket_drawn_v1";

function loadState(): { deck: number[]; drawn: number[] } {
  try {
    const rawDeck  = localStorage.getItem(STORAGE_KEY);
    const rawDrawn = localStorage.getItem(DRAWN_KEY);
    if (rawDeck && rawDrawn) {
      const deck  = JSON.parse(rawDeck);
      const drawn = JSON.parse(rawDrawn);
      if (Array.isArray(deck) && Array.isArray(drawn))
        return validateAndRepair(deck, drawn);
    }
  } catch {}
  return { deck: freshDeck(), drawn: [] };
}

function saveState(deck: number[], drawn: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
    localStorage.setItem(DRAWN_KEY,   JSON.stringify(drawn));
  } catch {}
}

// ─── CardFace ──────────────────────────────────────────────
function CardFace({ cardNumber }: { cardNumber: number }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setImgUrl(null);
    setLoaded(false);
    const staticUrl = getCardAssetUrl(cardNumber);
    if (staticUrl) {
      if (!cancelled) { setImgUrl(staticUrl); setLoaded(true); }
      return;
    }
    getCardImageUrl(cardNumber).then((url) => {
      if (!cancelled) { setImgUrl(url); setLoaded(true); }
    });
    return () => { cancelled = true; };
  }, [cardNumber]);

  if (!loaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1a2a70]/50">
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <img src={ticketImg} alt="" style={{ width: "4rem" }} />
        </motion.div>
      </div>
    );
  }

  if (!imgUrl) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-3"
        style={{ background: "linear-gradient(135deg, #1a2a70 0%, #0c1a4e 100%)" }}
      >
        <img src={ticketImg} alt="" style={{ width: "5rem" }} />
        <div className="bg-yellow-400 border-[3px] border-black rounded-xl px-5 py-2" style={{ boxShadow: "3px 3px 0px #000" }}>
          <span style={{ ...FONT_BANGERS, letterSpacing: "0.12em", fontSize: "1.5rem" }} className="text-black">
            #{String(cardNumber).padStart(3, "0")}
          </span>
        </div>
      </div>
    );
  }

  return <img src={imgUrl} alt={`Ticket #${cardNumber}`} className="w-full h-full object-contain" />;
}

// ─── CardBack ──────────────────────────────────────────────
function CardBack() {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3"
      style={{ background: "repeating-linear-gradient(45deg, #1a2a70 0px, #1a2a70 14px, #0c1a4e 14px, #0c1a4e 28px)" }}
    >
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [-8, 8, -8] }}
        transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut" }}
      >
        <img src={ticketImg} alt="" style={{ width: "5rem" }} />
      </motion.div>
      <motion.span
        animate={{ rotate: [-2, 2, -2], scale: [1, 1.04, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: "2rem",
          letterSpacing: "0.05em",
          lineHeight: 1,
          display: "block",
          textAlign: "center",
          background: "linear-gradient(135deg, #FF3B30 0%, #FFD700 50%, #007AFF 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(3px 3px 0px rgba(0,0,0,0.8))",
        }}
      >
        TICKET CRICKET
      </motion.span>
    </div>
  );
}

// ─── HandIcon ──────────────────────────────────────────────
function HandIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 0 0-4 0v5" />
      <path d="M14 10V4a2 2 0 0 0-4 0v2" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}

// ─── MiniCardFace ──────────────────────────────────────────
function MiniCardFace({ cardNumber }: { cardNumber: number }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const s = getCardAssetUrl(cardNumber);
    if (s) { setImgUrl(s); return; }
    getCardImageUrl(cardNumber).then((u) => { if (!cancelled) setImgUrl(u); });
    return () => { cancelled = true; };
  }, [cardNumber]);

  if (!imgUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0c1a4e]">
        <span style={{ ...FONT_BANGERS, fontSize: "0.55rem" }} className="text-white/30">
          #{String(cardNumber).padStart(3, "0")}
        </span>
      </div>
    );
  }
  return <img src={imgUrl} alt="" className="w-full h-full object-contain" />;
}

// ─── EliminationOverlay ────────────────────────────────────
function EliminationOverlay({
  total,
  drawnCount,
  threshold,
  totalCards,
  onRestart,
  onMenu,
}: {
  total:      number;
  drawnCount: number;
  threshold:  number;
  totalCards?: number;
  onRestart:  () => void;
  onMenu:     () => void;
}) {
  const [confirmMenu, setConfirmMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center px-6 gap-4 overflow-y-auto py-6"
      style={{ background: "rgba(0,0,0,0.94)" }}
    >
      {/* Icône crâne animé */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
        className="relative flex-shrink-0"
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-red-600"
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ filter: "blur(20px)" }}
        />
        <div
          className="relative w-20 h-20 rounded-full border-[5px] border-black flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7f1d1d, #991b1b)", boxShadow: "8px 8px 0px #000" }}
        >
          <Skull className="w-10 h-10 text-red-200" />
        </div>
      </motion.div>

      {/* Titre */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex flex-col items-center gap-1"
      >
        <div
          style={{ ...FONT_BANGERS, fontSize: "2.4rem", letterSpacing: "0.08em", lineHeight: 1 }}
          className="text-red-400 text-center"
        >
          ÉLIMINÉ !
        </div>
        <div style={{ ...FONT_BANGERS, fontSize: "1.2rem", letterSpacing: "0.04em", lineHeight: 1.1 }} className="text-white text-center px-2">
          Tu as trop de tickets,<br />tu vas en prison !
        </div>
      </motion.div>

      {/* Carte récap */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-xs rounded-3xl border-[4px] border-black overflow-hidden flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #1a0000, #2d0000)", boxShadow: "6px 6px 0px #000" }}
      >
        <div className="bg-red-700 border-b-4 border-black px-4 py-1.5 flex items-center justify-between">
          <span style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.06em" }} className="text-red-200">
            RÉSULTAT FINAL
          </span>
          <img src={ticketImg} alt="" style={{ width: "1.4rem", opacity: 0.7 }} />
        </div>
        <div className="px-5 py-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span style={FONT_FREDOKA} className="text-red-400/80 text-sm">Dette totale</span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.55 }}
              style={{ ...FONT_BANGERS, fontSize: "1.8rem", letterSpacing: "0.04em" }}
              className="text-red-400"
            >
              {formatPrice(total)}
            </motion.span>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-1.5">
            <span style={FONT_FREDOKA} className="text-white/30 text-xs">Limite d'élimination</span>
            <span style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-white/30">
              {formatPrice(threshold)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={FONT_FREDOKA} className="text-white/30 text-xs">Cartes piochées</span>
            <span style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-white/50">
              {drawnCount} / {totalCards ?? TOTAL_CARDS}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Boutons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="flex flex-col gap-2.5 w-full max-w-xs flex-shrink-0"
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-2xl bg-yellow-400 -z-10"
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="w-full py-4 bg-yellow-400 border-[5px] border-black rounded-2xl relative overflow-hidden"
            style={{ ...FONT_BANGERS, fontSize: "1.35rem", letterSpacing: "0.08em", color: "#000", boxShadow: "6px 6px 0px #000" }}
          >
            <motion.div
              className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg]"
              animate={{ x: ["-100%", "400%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Shuffle className="w-5 h-5" />
              NOUVELLE PARTIE
            </span>
          </motion.button>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setConfirmMenu(true)}
          className="w-full py-3.5 bg-white/8 border-[4px] border-white/20 rounded-2xl flex items-center justify-center gap-2"
          style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.08em", color: "rgba(255,255,255,0.55)", boxShadow: "4px 4px 0px rgba(0,0,0,0.4)" }}
        >
          <Home className="w-5 h-5" />
          RETOUR AU MENU
        </motion.button>
      </motion.div>

      {/* ── Confirmation quitter depuis l'overlay élimination ── */}
      <AnimatePresence>
        {confirmMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setConfirmMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.82, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.82, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="bg-[#111] border-[5px] border-yellow-400 rounded-3xl p-7 flex flex-col items-center gap-5 w-full max-w-sm"
              style={{ boxShadow: "8px 8px 0px #000" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-16 h-16 bg-yellow-400 border-[4px] border-black rounded-2xl flex items-center justify-center"
                style={{ boxShadow: "4px 4px 0px #000" }}
              >
                <Home className="w-8 h-8 text-black" />
              </div>
              <div style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.06em" }} className="text-yellow-400 text-center leading-tight">
                RETOURNER AU MENU ?
              </div>
              <p style={FONT_FREDOKA} className="text-red-400/80 text-sm text-center">
                Ta partie sera définitivement terminée et ta progression perdue.
              </p>
              <div className="flex gap-3 w-full">
                <motion.button
                  whileTap={{ scale: 0.93 } as any}
                  onClick={() => setConfirmMenu(false)}
                  className="flex-1 py-3.5 bg-white/10 border-[3px] border-white/20 rounded-2xl text-white/70"
                  style={{ ...FONT_BANGERS, fontSize: "1.2rem", letterSpacing: "0.06em", boxShadow: "3px 3px 0px rgba(0,0,0,0.5)" }}
                >
                  ANNULER
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.93 } as any}
                  onClick={onMenu}
                  className="flex-1 py-3.5 bg-red-600 border-[3px] border-black rounded-2xl text-white"
                  style={{ ...FONT_BANGERS, fontSize: "1.2rem", letterSpacing: "0.06em", boxShadow: "4px 4px 0px #000" }}
                >
                  CONFIRMER
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── SoloMyTicketsPanel ────────────────────────────────────
function SoloMyTicketsPanel({
  drawn,
  isEliminated,
  threshold,
  noContribuable,
  onClose,
}: {
  drawn:          number[];
  isEliminated:   boolean;
  threshold:      number;
  noContribuable: boolean;
  onClose:        () => void;
}) {
  // N'afficher que les catégories présentes dans le jeu
  const SOLO_CATS: CardCategory[] = noContribuable
    ? ["contravention"]
    : ["contravention", "contribuable"];
  const [activeTab, setActiveTab]     = useState<CardCategory>("contravention");
  const [focusedCard, setFocusedCard] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const total    = computePlayerTotal(drawn);
  const tabCards = filterByCategory(drawn, activeTab);
  const catInfo  = CATEGORY_INFO[activeTab];
  const zoomedIdx = focusedCard !== null ? tabCards.indexOf(focusedCard) : -1;

  const isOverThreshold = total >= threshold;

  // ── Historique chronologique des cartes piochées ────────────
  const historyEntries = (() => {
    let running = 0;
    return drawn.map((cardNum, i) => {
      const cfg = getCardConfig(cardNum);
      const net = drawerNetAmount(cfg);
      running += net;
      return {
        idx:          i + 1,
        cardNum,
        category:     cfg.category,
        cardType:     cfg.cardType,
        ticketPrice:  cfg.ticketPrice ?? 0,
        frais:        cfg.frais       ?? 0,
        impots:       cfg.impots      ?? 0,
        net,
        runningTotal: running,
      };
    });
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md rounded-t-3xl border-t-4 border-x-4 border-black flex flex-col"
        style={{
          background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 100%)",
          boxShadow:  "0 -6px 0 #000",
          maxHeight:  "92dvh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`border-b-4 flex items-center justify-between px-4 py-3 flex-shrink-0 rounded-t-2xl ${
            isEliminated ? "bg-[#7f1d1d] border-red-500" : "bg-[#111] border-[#22c55e]"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg border-[3px] border-black flex items-center justify-center flex-shrink-0 ${
                isEliminated ? "bg-red-600" : "bg-[#22c55e]"
              }`}
              style={{ boxShadow: "2px 2px 0px #000" }}
            >
              {isEliminated ? <Skull className="w-4 h-4 text-white" /> : <HandIcon size={16} />}
            </div>
            <div>
              <div
                style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.06em" }}
                className={`leading-none ${isEliminated ? "text-red-300" : "text-[#22c55e]"}`}
              >
                {isEliminated ? "ÉLIMINÉ" : "MES TICKETS"}
              </div>
              <div style={FONT_FREDOKA} className="text-white/50 text-xs leading-none mt-0.5">
                Partie solo
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`border-[2px] border-black rounded-full px-2.5 py-0.5 ${isEliminated ? "bg-red-500" : "bg-[#22c55e]"}`}
              style={{ boxShadow: "2px 2px 0px #000" }}
            >
              <span style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-black">{drawn.length}</span>
            </div>
            {/* Bouton Historique */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowHistory(v => !v)}
              className={`w-9 h-9 border-[3px] border-black rounded-full flex items-center justify-center transition-colors ${showHistory ? "bg-yellow-400" : "bg-white/15"}`}
              style={{ boxShadow: "2px 2px 0px #000" }}
              title="Historique des dettes"
            >
              <History className={`w-4 h-4 ${showHistory ? "text-black" : "text-white/70"}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={onClose}
              className="w-9 h-9 bg-red-500 border-[3px] border-black rounded-full flex items-center justify-center"
              style={{ boxShadow: "3px 3px 0px #000" }}
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>

        <PoliceTape />

        {/* Dette totale */}
        <div
          className="flex-shrink-0 mx-4 mt-3 mb-0 rounded-2xl border-[3px] border-black px-4 py-3 flex items-center justify-between"
          style={{
            background:  isOverThreshold ? "rgba(239,68,68,0.15)" : "rgba(255,215,0,0.10)",
            borderColor: isOverThreshold ? "#ef4444" : "#FFD700",
            boxShadow:   "4px 4px 0px #000",
          }}
        >
          <div className="flex flex-col">
            <span style={FONT_FREDOKA} className="text-yellow-400/70 text-xs uppercase tracking-widest leading-none">
              Dette totale
            </span>
            <motion.span
              key={total}
              initial={{ scale: 1.15, color: "#fff" }}
              animate={{ scale: 1, color: isOverThreshold ? "#ef4444" : "#FFD700" }}
              transition={{ duration: 0.4 }}
              style={{ ...FONT_BANGERS, fontSize: "2rem", letterSpacing: "0.04em", lineHeight: 1 }}
            >
              {formatPrice(total)}
            </motion.span>
          </div>
          {isOverThreshold ? (
            <div className="flex items-center gap-1 bg-red-500/20 rounded-xl px-2 py-1 border border-red-500/40">
              <Skull className="w-4 h-4 text-red-400" />
              <span style={{ ...FONT_BANGERS, fontSize: "0.75rem" }} className="text-red-400">ÉLIMINÉ</span>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <span style={FONT_FREDOKA} className="text-white/30 text-[0.6rem]">limite</span>
              <span style={{ ...FONT_BANGERS, fontSize: "0.9rem" }} className="text-white/30">{formatPrice(threshold)}</span>
            </div>
          )}
        </div>

        {/* ── VUE HISTORIQUE ── */}
        {showHistory ? (
          <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <ListOrdered className="w-4 h-4 text-yellow-400/70" />
              <span style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.06em" }} className="text-yellow-400/70">
                HISTORIQUE DES DETTES
              </span>
              <span style={FONT_FREDOKA} className="text-white/30 text-xs ml-auto">
                {historyEntries.length} entrée{historyEntries.length > 1 ? "s" : ""}
              </span>
            </div>

            {historyEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <History className="w-10 h-10 text-white/15" />
                <p style={FONT_FREDOKA} className="text-white/30 text-sm text-center">
                  Aucun ticket pioché pour l'instant…
                </p>
              </div>
            ) : (
              <>
                {historyEntries.map((entry, i) => {
                  const overLimit = entry.runningTotal >= threshold;
                  // ── T1 Contravention ────────────────────────────
                  if (entry.category === "contravention") {
                    const hasFreis = entry.frais > 0;
                    return (
                      <motion.div
                        key={`h-${entry.cardNum}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i * 0.025, 0.4) }}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-[2px] bg-yellow-400/5"
                        style={{ borderColor: "rgba(251,191,36,0.2)" }}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(251,191,36,0.18)" }}>
                          <TrendingUp className="w-3.5 h-3.5 text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {hasFreis ? (
                            <span style={FONT_FREDOKA} className="text-yellow-300 text-xs leading-snug">
                              Ticket <strong>{formatPrice(entry.ticketPrice)}</strong>
                              {" + Frais "}
                              <strong>{formatPrice(entry.frais)}</strong>
                              {" = "}
                              <strong className="text-yellow-400">{formatPrice(entry.ticketPrice + entry.frais)}</strong>
                            </span>
                          ) : (
                            <span style={FONT_FREDOKA} className="text-yellow-300 text-xs">
                              Ticket <strong className="text-yellow-400">{formatPrice(entry.ticketPrice)}</strong>
                            </span>
                          )}
                        </div>
                        <span
                          style={{ ...FONT_BANGERS, fontSize: "0.88rem" }}
                          className={overLimit ? "text-red-400 flex-shrink-0" : "text-yellow-400/80 flex-shrink-0"}
                        >
                          {formatPrice(entry.runningTotal)}
                        </span>
                      </motion.div>
                    );
                  }
                  // ── T2 Contribuable ─────────────────────────────
                  if (entry.category === "contribuable") {
                    const hasReduction = entry.impots > 0;
                    return (
                      <motion.div
                        key={`h-${entry.cardNum}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i * 0.025, 0.4) }}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-[2px] bg-green-500/5"
                        style={{ borderColor: "rgba(34,197,94,0.2)" }}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(34,197,94,0.18)" }}>
                          <TrendingDown className="w-3.5 h-3.5 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                          <span style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-green-400">0 $</span>
                          {hasReduction && (
                            <span style={FONT_FREDOKA} className="text-green-400 text-xs">
                              – Réduction impôts <strong>{formatPrice(entry.impots)}</strong>
                            </span>
                          )}
                        </div>
                        <span
                          style={{ ...FONT_BANGERS, fontSize: "0.88rem" }}
                          className={overLimit ? "text-red-400 flex-shrink-0" : "text-yellow-400/80 flex-shrink-0"}
                        >
                          {formatPrice(entry.runningTotal)}
                        </span>
                      </motion.div>
                    );
                  }
                  return null;
                })}

                {/* Récap final */}
                <div
                  className="mt-1 rounded-2xl border-[3px] px-4 py-3 flex items-center justify-between"
                  style={{
                    borderColor: isOverThreshold ? "#ef4444" : "#FFD700",
                    background: isOverThreshold ? "rgba(239,68,68,0.12)" : "rgba(255,215,0,0.08)",
                    boxShadow: "3px 3px 0px #000",
                  }}
                >
                  <div className="flex flex-col">
                    <span style={FONT_FREDOKA} className="text-white/40 text-xs">Dette totale</span>
                    <span style={{ ...FONT_BANGERS, fontSize: "1.5rem", letterSpacing: "0.04em" }} className={isOverThreshold ? "text-red-400" : "text-yellow-400"}>
                      {formatPrice(total)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span style={FONT_FREDOKA} className="text-white/30 text-[0.6rem]">tickets piochés</span>
                    <span style={{ ...FONT_BANGERS, fontSize: "0.9rem" }} className="text-white/40">{drawn.length}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
        <>

        {/* Onglets — nouveau design segmenté */}
        <div className="px-4 pt-3 pb-0 flex-shrink-0">
          <div
            className="flex rounded-2xl overflow-hidden border-[3px] border-black"
            style={{ boxShadow: "3px 3px 0px #000" }}
          >
            {SOLO_CATS.map((cat, catIdx) => {
              const info     = CATEGORY_INFO[cat];
              const count    = filterByCategory(drawn, cat).length;
              const isActive = activeTab === cat;
              const isLast   = catIdx === SOLO_CATS.length - 1;
              return (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab(cat)}
                  className={`flex-1 relative flex flex-col items-center justify-center py-3 overflow-hidden ${!isLast ? "border-r-[3px] border-black" : ""}`}
                  style={{ background: isActive ? info.color : "rgba(255,255,255,0.05)" }}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 w-1/2 bg-white/10 skew-x-[-20deg]"
                      animate={{ x: ["-100%", "250%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                    />
                  )}
                  <span
                    style={{ ...FONT_BANGERS, fontSize: "0.68rem", letterSpacing: "0.06em", lineHeight: 1 }}
                    className={`relative z-10 ${isActive ? (cat === "contravention" ? "text-black" : "text-white") : "text-white/35"}`}
                  >
                    {info.label}
                  </span>
                  <div
                    className="relative z-10 mt-1 min-w-[20px] h-[18px] px-1.5 rounded-full flex items-center justify-center border-[2px] border-black/40"
                    style={{ background: isActive ? "rgba(0,0,0,0.22)" : (count > 0 ? info.color : "#374151") }}
                  >
                    <span
                      style={{ ...FONT_BANGERS, fontSize: "0.58rem" }}
                      className={isActive ? (cat === "contravention" ? "text-black/80" : "text-white/90") : (count > 0 ? (cat === "contravention" ? "text-black" : "text-white") : "text-white/40")}
                    >
                      {count}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="mx-4 mt-2 mb-1 h-[3px] rounded-full flex-shrink-0" style={{ background: catInfo.color, opacity: 0.6 }} />

        <div className="flex items-center justify-between px-5 pb-2 flex-shrink-0">
          <span style={FONT_FREDOKA} className="text-white/50 text-xs">
            {catInfo.label} — {tabCards.length} ticket{tabCards.length > 1 ? "s" : ""}
          </span>
          <span style={{ ...FONT_BANGERS, fontSize: "0.95rem" }} className="text-white/70">
            {formatPrice(computePlayerTotal(tabCards))}
          </span>
        </div>

        {/* Grille */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <AnimatePresence mode="wait">
            {tabCards.length === 0 ? (
              <motion.div
                key={`empty-${activeTab}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-3 py-10"
              >
                <div className="w-12 h-12 rounded-2xl border-[3px] border-black flex items-center justify-center opacity-30" style={{ background: catInfo.color }}>
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <p style={FONT_FREDOKA} className="text-white/30 text-center text-sm">
                  Aucun ticket {catInfo.label.toLowerCase()} pour l'instant…
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-3 gap-2.5 pt-1"
              >
                {tabCards.map((cardNum, idx) => {
                  const cfg = getCardConfig(cardNum);
                  const net = drawerNetAmount(cfg);
                  const ti  = TYPE_INFO[cfg.cardType];
                  return (
                    <motion.div
                      key={`${cardNum}-${idx}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: Math.min(idx * 0.025, 0.4), type: "spring", stiffness: 320, damping: 22 }}
                      whileTap={{ scale: 0.93 } as any}
                      onClick={() => setFocusedCard(cardNum)}
                      className="relative rounded-xl border-[3px] border-black overflow-hidden cursor-pointer"
                      style={{ aspectRatio: "5/7", boxShadow: "3px 3px 0px #000", background: "#0c1a4e", borderColor: catInfo.color }}
                    >
                      <MiniCardFace cardNumber={cardNum} />
                      <div className="absolute bottom-0 left-0 right-0 py-0.5 flex items-center justify-center" style={{ background: catInfo.color + "ee" }}>
                        <span style={{ ...FONT_BANGERS, fontSize: "0.52rem" }} className="text-white leading-none">
                          {net >= 0 ? "+" : ""}{formatPrice(net)}
                        </span>
                      </div>
                      <div className="absolute top-0.5 right-0.5 px-0.5 rounded border border-black" style={{ background: ti.color + "bb" }}>
                        <span style={{ ...FONT_BANGERS, fontSize: "0.4rem" }} className="text-white leading-none">{ti.shortLabel}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-3 flex-shrink-0" />
        </>
        )}

      </motion.div>

      {/* Vue zoom carte */}
      <AnimatePresence>
        {focusedCard !== null && (() => {
          const cfg = getCardConfig(focusedCard);
          const net = drawerNetAmount(cfg);
          const ti  = TYPE_INFO[cfg.cardType];
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-6 gap-4"
              style={{ background: "rgba(0,0,0,0.93)" }}
              onClick={() => setFocusedCard(null)}
            >
              <motion.div
                initial={{ scale: 0.72, rotateY: -40 }}
                animate={{ scale: 1, rotateY: 0 }}
                exit={{ scale: 0.72, opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="rounded-3xl border-[5px] border-black overflow-hidden"
                style={{ width: "min(78vw, 260px)", aspectRatio: "5/7", boxShadow: "10px 10px 0px #000" }}
                onClick={(e) => e.stopPropagation()}
              >
                <CardFace cardNumber={focusedCard} />
              </motion.div>

              <div
                className="w-full max-w-sm rounded-2xl border-[3px] overflow-hidden"
                style={{ borderColor: ti.color, boxShadow: "6px 6px 0px #000" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-2" style={{ background: ti.color }}>
                  <span style={{ ...FONT_BANGERS, fontSize: "0.95rem", letterSpacing: "0.05em" }} className="text-white">
                    {ti.shortLabel} — #{String(focusedCard).padStart(3, "0")}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between" style={{ background: ti.color + "22" }}>
                  <span style={FONT_FREDOKA} className="text-white/70 text-sm">Effet sur toi</span>
                  <span style={{ ...FONT_BANGERS, fontSize: "1.1rem" }} className={net >= 0 ? "text-red-400" : "text-green-400"}>
                    {net >= 0 ? "+" : ""}{formatPrice(net)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { if (zoomedIdx > 0) setFocusedCard(tabCards[zoomedIdx - 1]); }}
                  disabled={zoomedIdx <= 0}
                  className="w-11 h-11 bg-white/10 border-[2px] border-white/20 rounded-xl flex items-center justify-center text-white/60 disabled:opacity-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <span style={FONT_FREDOKA} className="text-white/40 text-sm min-w-[4rem] text-center">
                  {zoomedIdx + 1} / {tabCards.length}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { if (zoomedIdx < tabCards.length - 1) setFocusedCard(tabCards[zoomedIdx + 1]); }}
                  disabled={zoomedIdx >= tabCards.length - 1}
                  className="w-11 h-11 bg-white/10 border-[2px] border-white/20 rounded-xl flex items-center justify-center text-white/60 disabled:opacity-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setFocusedCard(null)}
                  className="w-11 h-11 bg-red-500 border-[3px] border-black rounded-full flex items-center justify-center ml-1"
                  style={{ boxShadow: "3px 3px 0px #000" }}
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── GameScreen principal ───────────────────────────────────
export function GameScreen() {
  const [, navigate] = useLocation();

  // Lire le seuil et les filtres depuis localStorage à chaque montage du composant
  const ELIMINATION_THRESHOLD = readEliminationThreshold();
  const noContribuable = readNoContribuable();

  const initialState = useRef<{ deck: number[]; drawn: number[] } | null>(null);
  if (initialState.current === null) {
    initialState.current = loadState();
  }

  const [{ deck, drawn }, setState]       = useState(initialState.current);
  const [currentCard, setCurrentCard]     = useState<number | null>(() => {
    const d = initialState.current!.drawn;
    return d.length > 0 ? d[d.length - 1] : null;
  });
  const [isFlipping, setIsFlipping]       = useState(false);
  const [showFront, setShowFront]         = useState(() => initialState.current!.drawn.length > 0);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [isShuffling, setIsShuffling]     = useState(false);
  const [showMyTickets, setShowMyTickets] = useState(false);

  // ─ Élimination ─
  const total            = computePlayerTotal(drawn);
  const isEliminated     = total >= ELIMINATION_THRESHOLD;
  const [showElimOverlay, setShowElimOverlay] = useState(() => {
    // Afficher l'overlay si déjà éliminé au chargement
    return computePlayerTotal(initialState.current!.drawn) >= ELIMINATION_THRESHOLD;
  });

  // Détecter l'élimination après chaque carte piochée
  useEffect(() => {
    if (isEliminated && !showElimOverlay) {
      // Petit délai pour laisser l'animation de la carte se terminer
      const t = setTimeout(() => setShowElimOverlay(true), 700);
      return () => clearTimeout(t);
    }
  }, [isEliminated]);

  const remaining  = deck.length;
  const drawnCount = drawn.length;
  // Taille totale réelle du deck courant (varie selon les filtres actifs)
  const deckTotal  = remaining + drawnCount;
  const isGameOver = remaining === 0 && drawnCount > 0;

  // ─ Piocher ─
  const handleDraw = useCallback(() => {
    if (deck.length === 0 || isFlipping || isShuffling || isEliminated) return;

    setIsFlipping(true);
    setShowFront(false);

    setTimeout(() => {
      setState(prev => {
        if (prev.deck.length === 0) return prev;

        const [next, ...rest] = prev.deck;

        if (prev.drawn.includes(next)) {
          const drawnSet  = new Set(prev.drawn);
          const safeNext  = rest.find(c => !drawnSet.has(c));
          if (safeNext === undefined) return prev;
          const safeRest  = rest.filter(c => c !== safeNext);
          const newDrawn  = [...prev.drawn, safeNext];
          saveState(safeRest, newDrawn);
          setCurrentCard(safeNext);
          setShowFront(true);
          setIsFlipping(false);
          return { deck: safeRest, drawn: newDrawn };
        }

        const newDrawn = [...prev.drawn, next];
        saveState(rest, newDrawn);
        setCurrentCard(next);
        setShowFront(true);
        setIsFlipping(false);
        return { deck: rest, drawn: newDrawn };
      });
    }, 300);
  }, [deck.length, isFlipping, isShuffling, isEliminated]);

  // ─ Réinitialiser ─
  const doReset = useCallback(() => {
    setShowConfirmReset(false);
    setShowElimOverlay(false);
    setIsShuffling(true);
    setShowFront(false);
    setCurrentCard(null);

    setTimeout(() => {
      const newDeck = freshDeck();
      setState({ deck: newDeck, drawn: [] });
      saveState(newDeck, []);
      setIsShuffling(false);
    }, 1200);
  }, []);

  return (
    <div
      className="h-[100dvh] max-w-md mx-auto flex flex-col overflow-hidden select-none relative"
      style={{ background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)" }}
    >
      {/* ── Halos de police — coins ── */}
      <motion.div className="absolute pointer-events-none z-0" style={{ top: -60, left: -60, width: 220, height: 220, borderRadius: "50%" }}
        animate={{ background: ["radial-gradient(circle, rgba(255,40,30,0.55) 0%, rgba(255,40,30,0.18) 38%, transparent 68%)","radial-gradient(circle, rgba(255,40,30,0.08) 0%, transparent 55%)","radial-gradient(circle, rgba(0,100,255,0.08) 0%, transparent 55%)","radial-gradient(circle, rgba(0,100,255,0.55) 0%, rgba(0,100,255,0.18) 38%, transparent 68%)","radial-gradient(circle, rgba(255,40,30,0.55) 0%, rgba(255,40,30,0.18) 38%, transparent 68%)"], scale: [1, 1.08, 1.03, 1.08, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0 }} />
      <motion.div className="absolute pointer-events-none z-0" style={{ top: -60, right: -60, width: 220, height: 220, borderRadius: "50%" }}
        animate={{ background: ["radial-gradient(circle, rgba(0,100,255,0.55) 0%, rgba(0,100,255,0.18) 38%, transparent 68%)","radial-gradient(circle, rgba(0,100,255,0.08) 0%, transparent 55%)","radial-gradient(circle, rgba(255,40,30,0.08) 0%, transparent 55%)","radial-gradient(circle, rgba(255,40,30,0.55) 0%, rgba(255,40,30,0.18) 38%, transparent 68%)","radial-gradient(circle, rgba(0,100,255,0.55) 0%, rgba(0,100,255,0.18) 38%, transparent 68%)"], scale: [1, 1.08, 1.03, 1.08, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.55 }} />
      <motion.div className="absolute pointer-events-none z-0" style={{ bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%" }}
        animate={{ background: ["radial-gradient(circle, rgba(0,100,255,0.45) 0%, rgba(0,100,255,0.15) 38%, transparent 68%)","radial-gradient(circle, rgba(0,100,255,0.06) 0%, transparent 55%)","radial-gradient(circle, rgba(255,40,30,0.06) 0%, transparent 55%)","radial-gradient(circle, rgba(255,40,30,0.45) 0%, rgba(255,40,30,0.15) 38%, transparent 68%)","radial-gradient(circle, rgba(0,100,255,0.45) 0%, rgba(0,100,255,0.15) 38%, transparent 68%)"] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.55 }} />
      <motion.div className="absolute pointer-events-none z-0" style={{ bottom: -60, right: -60, width: 200, height: 200, borderRadius: "50%" }}
        animate={{ background: ["radial-gradient(circle, rgba(255,40,30,0.45) 0%, rgba(255,40,30,0.15) 38%, transparent 68%)","radial-gradient(circle, rgba(255,40,30,0.06) 0%, transparent 55%)","radial-gradient(circle, rgba(0,100,255,0.06) 0%, transparent 55%)","radial-gradient(circle, rgba(0,100,255,0.45) 0%, rgba(0,100,255,0.15) 38%, transparent 68%)","radial-gradient(circle, rgba(255,40,30,0.45) 0%, rgba(255,40,30,0.15) 38%, transparent 68%)"] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0 }} />

      {/* ── Overlay victoire solo (deck épuisé sans élimination) ── */}
      <AnimatePresence>
        {isGameOver && !isEliminated && (
          <WinnerOverlay
            winnerName="Toi"
            isMe={true}
            totalDebt={total}
            mode="solo"
            canRestart={true}
            onRestart={doReset}
            onMenu={() => navigate("/")}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="w-full bg-[#111] border-b-4 border-yellow-400 flex items-center justify-between px-4 py-2.5 z-10 flex-shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowConfirmLeave(true)}
          className="w-11 h-11 bg-yellow-400 border-[3px] border-black rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: "3px 3px 0px #000" }}
        >
          <Home className="w-5 h-5 text-black" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowConfirmReset(true)}
          className="w-11 h-11 bg-[#1565C0] border-[3px] border-black rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: "3px 3px 0px #000" }}
        >
          <Shuffle className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      <PoliceTape />

      {/* ── Micro-barre de progression ── */}
      {deckTotal > 0 && (
        <div className="w-full h-[3px] bg-white/6 flex-shrink-0">
          <motion.div
            className="h-full"
            style={{
              background: isEliminated
                ? "linear-gradient(90deg, #dc2626, #ef4444)"
                : drawnCount / deckTotal >= 0.85
                ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                : "linear-gradient(90deg, #1565C0, #22c55e)",
              width: `${(drawnCount / deckTotal) * 100}%`,
            }}
            animate={{ width: `${(drawnCount / deckTotal) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      )}

      {/* ── Sub-header : compteur cartes + limite ── */}
      <div className="px-4 pt-2 pb-1 flex items-center justify-end gap-3 flex-shrink-0">
        {/* Right: compteur cartes X/Total + Limite */}
        {(() => {
          const pct = deckTotal > 0 ? drawnCount / deckTotal : 0;
          const almostFull = pct >= 0.85;
          return (
            <div className="flex flex-col items-end gap-0.5">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-[2px] flex-shrink-0"
                style={{
                  borderColor: almostFull ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.12)",
                  background: almostFull ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.05)",
                  boxShadow: "2px 2px 0px rgba(0,0,0,0.4)",
                }}
              >
                {almostFull && (
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                  >
                    <Layers className="w-3 h-3 text-red-400/70" />
                  </motion.div>
                )}
                <span style={{ ...FONT_BANGERS, fontSize: "0.92rem", letterSpacing: "0.08em" }}>
                  <span className={almostFull ? "text-red-300/80" : "text-white/65"}>{drawnCount}</span>
                  <span className={almostFull ? "text-red-400/35" : "text-white/28"}>/{deckTotal}</span>
                </span>
              </div>
              {/* Limite sous le compteur — bulle */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg border-[2px]"
                style={{
                  borderColor: isEliminated ? "rgba(239,68,68,0.35)" : "rgba(234,179,8,0.3)",
                  background:  isEliminated ? "rgba(239,68,68,0.10)" : "rgba(234,179,8,0.10)",
                  boxShadow: "1.5px 1.5px 0px rgba(0,0,0,0.5)",
                }}
              >
                <span style={{ ...FONT_FREDOKA, fontSize: "0.52rem" }} className="text-white/45 uppercase tracking-wider leading-none">
                  Limite
                </span>
                <span
                  style={{ ...FONT_BANGERS, fontSize: "0.72rem", letterSpacing: "0.05em" }}
                  className={isEliminated ? "text-red-400/80" : "text-yellow-400/80"}
                >
                  {formatPrice(ELIMINATION_THRESHOLD)}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Bannière élimination */}
      <AnimatePresence>
        {isEliminated && !showElimOverlay && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mt-1 rounded-xl border-[3px] border-black overflow-hidden flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7f1d1d, #991b1b)", boxShadow: "3px 3px 0px #000" }}
          >
            <div className="flex items-center gap-2 px-3 py-2">
              <Skull className="w-4 h-4 text-red-300 flex-shrink-0" />
              <span style={{ ...FONT_BANGERS, fontSize: "0.9rem", letterSpacing: "0.05em" }} className="text-red-300">
                ÉLIMINÉ — {formatPrice(total)} de dette
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone carte */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-2 pb-1 min-h-0">
        {/* Wrapper qui aligne la carte et les boutons sur la même largeur */}
        <div className="flex flex-col gap-2 items-stretch" style={{ width: "min(calc(57dvh * 5 / 7), 300px)" }}>
        <div className="relative flex-shrink-0" style={{ aspectRatio: "5/7", perspective: "1200px" }}>
          <AnimatePresence mode="wait">
            {isGameOver ? (
              <motion.div
                key="gameover"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 rounded-3xl bg-yellow-400 border-[5px] border-black flex flex-col items-center justify-center gap-4"
                style={{ boxShadow: "8px 8px 0px #000" }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Trophy className="w-20 h-20 text-black" />
                </motion.div>
                <div style={{ ...FONT_BANGERS, fontSize: "1.8rem", letterSpacing: "0.08em" }} className="text-black text-center px-4">
                  TOUTES LES CARTES PIOCHÉES !
                </div>
                <p style={FONT_FREDOKA} className="text-black/60 text-sm text-center px-6">
                  Mélangez pour commencer une nouvelle partie.
                </p>
              </motion.div>
            ) : currentCard !== null ? (
              <motion.div
                key={`card-${currentCard}`}
                initial={{ rotateY: -180, scale: 0.65, opacity: 0.5 }}
                animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                exit={{ rotateY: 180, scale: 0.65, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 22, opacity: { duration: 0.15 } }}
                className="absolute inset-0 rounded-3xl bg-white border-[5px] overflow-hidden"
                style={{
                  borderColor: isEliminated ? "#dc2626" : "#000",
                  boxShadow: isEliminated ? "8px 8px 0px #7f1d1d" : "8px 8px 0px #000",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
              >
                {showFront ? <CardFace cardNumber={currentCard} /> : <CardBack />}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 rounded-3xl border-[4px] border-dashed border-yellow-400/40 flex flex-col items-center justify-center gap-4"
                style={{ background: "rgba(26,42,112,0.5)" }}
              >
                <motion.div
                  animate={{ y: [0, -12, 0], rotate: [-5, 5, -5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img src={ticketImg} alt="" style={{ width: "6rem" }} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bouton piocher */}
        {!isGameOver && (
          <div className="flex gap-2 w-full">
            {/* Bouton Mes tickets */}
            <div className="relative flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMyTickets(true)}
                className="h-full min-h-[60px] px-3 border-[4px] border-black rounded-2xl flex flex-col items-center justify-center gap-0.5 relative"
                style={{
                  background: isEliminated ? "#dc2626" : "#22c55e",
                  boxShadow: "5px 5px 0px #000",
                }}
              >
                {isEliminated ? <Skull className="w-5 h-5 text-white" /> : <HandIcon size={18} />}
                <span style={{ ...FONT_BANGERS, fontSize: "0.55rem", letterSpacing: "0.04em" }} className="text-white leading-none">
                  TICKETS
                </span>
                {drawn.length > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 border-[2px] border-black rounded-full flex items-center justify-center">
                    <span style={{ ...FONT_BANGERS, fontSize: "0.6rem" }} className="text-black leading-none">
                      {drawn.length > 99 ? "99" : drawn.length}
                    </span>
                  </div>
                )}
              </motion.button>
            </div>

            {/* Bouton piocher principal */}
            <div className="relative flex-1">
              {!isEliminated && (
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-yellow-400 -z-10"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              )}
              <motion.button
                whileTap={!isEliminated ? { scale: 0.95, y: 2 } as any : {}}
                onClick={isEliminated ? () => setShowElimOverlay(true) : handleDraw}
                disabled={deck.length === 0 || isFlipping || isShuffling}
                className="w-full py-3.5 border-[5px] border-black rounded-2xl relative overflow-hidden disabled:cursor-not-allowed"
                style={{
                  ...FONT_BANGERS,
                  fontSize: "0.95rem",
                  letterSpacing: "0.05em",
                  background: isEliminated ? "#7f1d1d" : "#FFD700",
                  color: isEliminated ? "#fca5a5" : "#000",
                  boxShadow: isEliminated ? "5px 5px 0px #3f0000" : "5px 5px 0px #000",
                }}
              >
                {!isEliminated && (
                  <motion.div
                    className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg]"
                    animate={{ x: ["-100%", "400%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
                  />
                )}
                <span className="flex items-center justify-center gap-2 relative z-10 whitespace-nowrap overflow-hidden px-2">
                  {isEliminated ? (
                    <><Skull className="w-5 h-5 flex-shrink-0" /> VOIR MON RÉSULTAT</>
                  ) : (
                    <>RECEVOIR UN TICKET</>
                  )}
                </span>
              </motion.button>
            </div>
          </div>
        )}

        {/* Bouton nouvelle partie (fin de deck) */}
        {isGameOver && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="w-full py-3.5 bg-[#1565C0] border-[5px] border-black rounded-2xl text-white relative overflow-hidden"
            style={{ ...FONT_BANGERS, letterSpacing: "0.1em", fontSize: "1.2rem", boxShadow: "5px 5px 0px #000" }}
            whileTap={{ scale: 0.95 } as any}
            onClick={doReset}
          >
            <span className="flex items-center justify-center gap-2">
              <Shuffle className="w-6 h-6 text-white" /> NOUVELLE PARTIE
            </span>
          </motion.button>
        )}
        </div>{/* /wrapper */}
      </div>

      <div
        className="w-full bg-[#111] py-1 text-center flex-shrink-0"
        style={{ paddingBottom: "calc(0.25rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <span style={FONT_FREDOKA} className="text-yellow-400/40 text-[0.65rem] tracking-widest">
          © TICKET CRICKET 2026
        </span>
      </div>

      {/* ── Overlay d'élimination ── */}
      <AnimatePresence>
        {showElimOverlay && (
          <EliminationOverlay
            total={total}
            drawnCount={drawnCount}
            threshold={ELIMINATION_THRESHOLD}
            totalCards={deckTotal}
            onRestart={doReset}
            onMenu={() => {
              // Effacer la partie sauvegardée → repartir à zéro au prochain lancement
              try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(DRAWN_KEY); } catch {}
              navigate("/");
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Panneau "Mes tickets" ── */}
      <AnimatePresence>
        {showMyTickets && (
          <SoloMyTicketsPanel
            drawn={drawn}
            isEliminated={isEliminated}
            threshold={ELIMINATION_THRESHOLD}
            noContribuable={noContribuable}
            onClose={() => setShowMyTickets(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Confirm Reset Modal ── */}
      <AnimatePresence>
        {showConfirmReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
            onClick={() => setShowConfirmReset(false)}
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-yellow-400 border-[5px] border-black rounded-3xl p-7 flex flex-col items-center gap-5 w-full max-w-sm"
              style={{ boxShadow: "8px 8px 0px #000" }}
              onClick={(e) => e.stopPropagation()}
            >
              <Shuffle className="w-12 h-12 text-black" />
              <div style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.06em" }} className="text-black text-center">
                MÉLANGER LES CARTES ?
              </div>
              <p style={FONT_FREDOKA} className="text-black/60 text-sm text-center">
                Toutes les {deckTotal} cartes seront remélangées et la partie recommencera depuis zéro.
              </p>
              <div className="flex gap-4 w-full">
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  className="flex-1 py-3 bg-white border-[4px] border-black rounded-2xl text-black"
                  style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.08em", boxShadow: "4px 4px 0px #000" }}
                  onClick={() => setShowConfirmReset(false)}
                >
                  ANNULER
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  className="flex-1 py-3 bg-[#1565C0] border-[4px] border-black rounded-2xl text-white"
                  style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.08em", boxShadow: "4px 4px 0px #000" }}
                  onClick={doReset}
                >
                  MÉLANGER !
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal confirmation quitter ── */}
      <AnimatePresence>
        {showConfirmLeave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center p-6"
            onClick={() => setShowConfirmLeave(false)}
          >
            <motion.div
              initial={{ scale: 0.82, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.82, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="bg-[#111] border-[5px] border-yellow-400 rounded-3xl p-7 flex flex-col items-center gap-5 w-full max-w-sm"
              style={{ boxShadow: "8px 8px 0px #000" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-16 h-16 bg-yellow-400 border-[4px] border-black rounded-2xl flex items-center justify-center"
                style={{ boxShadow: "4px 4px 0px #000" }}
              >
                <Home className="w-8 h-8 text-black" />
              </div>
              <div style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.06em" }} className="text-yellow-400 text-center leading-tight">
                QUITTER LA PARTIE ?
              </div>
              <p style={FONT_FREDOKA} className="text-red-400/80 text-sm text-center">
                Attention ! Ta partie en cours sera définitivement terminée et ta progression perdue.
              </p>
              <div className="flex gap-3 w-full">
                <motion.button
                  whileTap={{ scale: 0.93 } as any}
                  onClick={() => setShowConfirmLeave(false)}
                  className="flex-1 py-3.5 bg-white/10 border-[3px] border-white/20 rounded-2xl text-white/70"
                  style={{ ...FONT_BANGERS, fontSize: "1.2rem", letterSpacing: "0.06em", boxShadow: "3px 3px 0px rgba(0,0,0,0.5)" }}
                >
                  ANNULER
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.93 } as any}
                  onClick={() => {
                    // Effacer la partie sauvegardée → repartir à zéro au prochain lancement
                    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(DRAWN_KEY); } catch {}
                    navigate("/");
                  }}
                  className="flex-1 py-3.5 bg-red-600 border-[3px] border-black rounded-2xl text-white"
                  style={{ ...FONT_BANGERS, fontSize: "1.2rem", letterSpacing: "0.06em", boxShadow: "4px 4px 0px #000" }}
                >
                  CONFIRMER
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Overlay mélange ── */}
      <AnimatePresence>
        {isShuffling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-50 flex flex-col items-center justify-center gap-6"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                animate={{
                  x: [0, (i % 2 === 0 ? 1 : -1) * (60 + i * 30), (i % 2 === 0 ? -1 : 1) * (40 + i * 20), 0],
                  y: [0, -(80 + i * 20), -(40 + i * 10), 0],
                  rotate: [(i - 2) * 15, (i - 2) * 15 + 180, (i - 2) * 15 + 340],
                  opacity: [1, 1, 0.8, 1],
                }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
              >
                <img src={ticketImg} alt="" style={{ width: "3.5rem" }} />
              </motion.div>
            ))}
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="bg-yellow-400 border-[5px] border-black rounded-3xl px-8 py-5 text-center mt-32"
              style={{ boxShadow: "6px 6px 0px #000" }}
            >
              <div style={{ ...FONT_BANGERS, fontSize: "2rem", letterSpacing: "0.1em" }} className="text-black flex items-center justify-center gap-2">
                <Shuffle className="w-7 h-7 text-black" /> MÉLANGE EN COURS...
              </div>
              <p style={FONT_FREDOKA} className="text-black/60 text-sm mt-1">
                {deckTotal} cartes brassées aléatoirement
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
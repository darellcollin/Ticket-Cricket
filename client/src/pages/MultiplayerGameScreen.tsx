/**
 * Écran de jeu multijoueur — Ticket Cricket 2026.
 *
 * Règles clés :
 *  - Tour par tour, seul le joueur actif peut piocher.
 *  - Joueur à 10 000 $ de dette totale → éliminé (spectateur).
 *  - Cartes T3 : transfert automatique de dette au joueur suivant.
 *  - Poll toutes les ~1,8 s.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "wouter";
import {
  Home, Crown, Shuffle, X, ChevronLeft, ChevronRight, ChevronDown,
  Clock, Target, Trophy, Layers, User, ArrowRight, ArrowLeft,
  Banknote, TrendingDown, TrendingUp, Mail, Skull, CheckCircle,
  Eye, EyeOff, History, ListOrdered, UserX, LogOut,
} from "lucide-react";
import {
  getSession, drawCard, resetGame, leaveSession, addDebt, eliminatePlayer,
  endTurn, mpStorage, acknowledgeElimination, kickPlayer, type Session,
} from "@/game/utils/sessionApi";
import { getCardAssetUrl } from "@/game/utils/cardAssets";
import { getCardImageUrl } from "@/game/utils/imageDB";
import {
  getCardConfig, drawerNetAmount, nextPlayerAmount, computePlayerTotal,
  formatPrice, CATEGORY_INFO, CATEGORY_ORDER, TYPE_INFO,
  type CardCategory,
} from "@/game/utils/cardConfig";
import { filterByCategory } from "@/game/utils/cardCategories";
import { PoliceTape } from "@/game/ui/PoliceUI";
import ticketImg from "@/game/utils/ticketImg";
import { WinnerOverlay } from "@/game/ui/WinnerOverlay";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

// ── Palette de couleurs assignée par ordre de jeu ──────────
const PLAYER_COLOR_PALETTE = [
  { text: "#fb923c", bg: "rgba(249,115,22,0.13)", border: "rgba(249,115,22,0.3)", dot: "#f97316" },  // orange
  { text: "#4ade80", bg: "rgba(34,197,94,0.13)",  border: "rgba(34,197,94,0.3)",  dot: "#22c55e" },  // green
  { text: "#c084fc", bg: "rgba(168,85,247,0.13)", border: "rgba(168,85,247,0.3)", dot: "#a855f7" },  // purple
  { text: "#f472b6", bg: "rgba(236,72,153,0.13)", border: "rgba(236,72,153,0.3)", dot: "#ec4899" },  // pink
  { text: "#2dd4bf", bg: "rgba(20,184,166,0.13)", border: "rgba(20,184,166,0.3)", dot: "#14b8a6" },  // teal
  { text: "#facc15", bg: "rgba(234,179,8,0.13)",  border: "rgba(234,179,8,0.3)",  dot: "#eab308" },  // yellow
  { text: "#f87171", bg: "rgba(239,68,68,0.13)",  border: "rgba(239,68,68,0.3)",  dot: "#ef4444" },  // red
];
// Couleur fixe pour le joueur local : bleu
const MY_COLOR = { text: "#60a5fa", bg: "rgba(59,130,246,0.14)", border: "rgba(59,130,246,0.35)", dot: "#3b82f6" };

// ────────────────────────────────────────────────────────────
// Utilitaire : trouver le prochain joueur actif (T3 sans avancement de tour)
// ────────────────────────────────────────────────────────────
function getNextActivePlayerId(s: Session, currentPlayerId: string): string | null {
  const n = s.turnOrder.length;
  const currentIdx = s.turnOrder.indexOf(currentPlayerId);
  if (currentIdx === -1 || n <= 1) return null;
  const eliminated = s.eliminatedPlayers ?? [];
  let nextIdx = (currentIdx + 1) % n;
  let attempts = 0;
  while (eliminated.includes(s.turnOrder[nextIdx]) && attempts < n) {
    nextIdx = (nextIdx + 1) % n;
    attempts++;
  }
  const nextId = s.turnOrder[nextIdx];
  return nextId !== currentPlayerId ? nextId : null;
}

const POLL_INTERVAL       = 1800;
const TOTAL_CARDS         = 324;
const DEFAULT_ELIMINATION_THRESHOLD = 10_000; // remplacé par session.eliminationThreshold

// ────────────────────────────────────────────────────────────
// Icône main SVG
// ────────────────────────────────────────────────────────────
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

// ────────────────────────────────────────────────────────────
// CardBack — dos de carte (identique au mode solo)
// ────────────────────────────────────────────────────────────
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

// ────────────────────────────────────────────────────────────
// CardFace — image de carte avec fallback animé
// ────────────────────────────────────────────────────────────
function CardFace({ cardNumber, mini = false }: { cardNumber: number; mini?: boolean }) {
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
          <img src={ticketImg} alt="" style={{ width: mini ? "1.5rem" : "4rem" }} />
        </motion.div>
      </div>
    );
  }

  if (!imgUrl) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-1"
        style={{ background: "linear-gradient(135deg, #1a2a70 0%, #0c1a4e 100%)" }}
      >
        {!mini && <img src={ticketImg} alt="" style={{ width: "5rem" }} />}
        <div className={`bg-yellow-400 border-[2px] border-black rounded-lg ${mini ? "px-1 py-0.5" : "px-5 py-2"}`}>
          <span style={{ ...FONT_BANGERS, fontSize: mini ? "0.7rem" : "1.5rem" }} className="text-black">
            #{String(cardNumber).padStart(3, "0")}
          </span>
        </div>
      </div>
    );
  }

  return <img src={imgUrl} alt={`Ticket #${cardNumber}`} className="w-full h-full object-contain" />;
}

// ────────────────────────────────────────────────────────────
// TurnNotification — bulle centrale animée
// ────────────────────────────────────────────────────────────
function TurnNotification({
  isMe, myName, currentName, onDismiss,
}: {
  isMe: boolean;
  myName: string;
  currentName: string;
  onDismiss?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={`fixed inset-0 z-[70] flex items-center justify-center px-7 ${isMe ? "" : "pointer-events-none"}`}
      style={isMe ? { background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" } : {}}
    >
      <motion.div
        animate={isMe ? {} : { y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`rounded-3xl border-[5px] border-black flex flex-col items-center gap-3 overflow-hidden ${
          isMe ? "" : ""
        }`}
        style={{
          background: isMe
            ? "linear-gradient(160deg, #FFD700 0%, #FCD34D 100%)"
            : "linear-gradient(160deg, #1a4a8e 0%, #0d2d5e 100%)",
          boxShadow: isMe
            ? "8px 8px 0px #000, 0 0 40px rgba(255,215,0,0.4)"
            : "8px 8px 0px #000, 0 0 30px rgba(21,101,192,0.4)",
          maxWidth: "88vw",
        }}
      >
        {/* Bande top */}
        <div
          className="w-full px-8 py-2 flex items-center justify-center gap-2"
          style={{
            background: isMe ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.08)",
            borderBottom: `3px solid ${isMe ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.1)"}`,
          }}
        >
          <motion.div
            animate={{ rotate: [-12, 12, -12] }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            <img src={ticketImg} alt="" style={{ width: "1.6rem" }} />
          </motion.div>
          <span
            style={{ ...FONT_BANGERS, fontSize: "0.75rem", letterSpacing: "0.14em" }}
            className={isMe ? "text-black/50" : "text-white/40"}
          >
            {isMe ? "TON TOUR !" : "TOUR EN COURS"}
          </span>
        </div>

        {/* Corps */}
        <div className="px-8 pb-6 pt-2 flex flex-col items-center gap-3">
          {isMe ? (
            <>
              <span
                style={{ ...FONT_BANGERS, fontSize: "2.2rem", letterSpacing: "0.06em", lineHeight: 1 }}
                className="text-black text-center"
              >
                C'EST TON TOUR !
              </span>
              <span style={FONT_FREDOKA} className="text-black/55 text-sm">{myName}</span>
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 360, damping: 18, delay: 0.25 }}
                whileTap={{ scale: 0.92 } as any}
                onClick={onDismiss}
                className="flex items-center gap-2 bg-[#22c55e] border-[4px] border-black rounded-2xl px-6 py-3 relative overflow-hidden"
                style={{ boxShadow: "5px 5px 0px #000" }}
              >
                <motion.div
                  className="absolute inset-0 w-1/2 bg-white/15 skew-x-[-20deg]"
                  animate={{ x: ["-100%", "250%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
                />
                <CheckCircle className="w-5 h-5 text-white relative z-10" />
                <span style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.06em" }} className="text-white relative z-10">
                  JE COMMENCE !
                </span>
              </motion.button>
            </>
          ) : (
            <>
              <span
                style={{ ...FONT_BANGERS, fontSize: "0.9rem", letterSpacing: "0.08em", lineHeight: 1 }}
                className="text-white/55 text-center uppercase"
              >
                C'est le tour de
              </span>
              <span
                style={{ ...FONT_BANGERS, fontSize: "2rem", letterSpacing: "0.04em", lineHeight: 1 }}
                className="text-yellow-400 text-center"
              >
                {currentName.toUpperCase()}
              </span>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// EliminationBanner — overlay si je suis éliminé
// ────────────────────────────────────────────────────────────
function EliminationBanner({
  name, threshold, activePlayers,
}: {
  name: string;
  threshold: number;
  activePlayers: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="mx-4 mt-1 rounded-xl border-[3px] border-black overflow-hidden flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #7f1d1d, #991b1b)", boxShadow: "3px 3px 0px #000" }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-7 h-7 bg-red-500 border-[2px] border-black rounded-lg flex items-center justify-center flex-shrink-0">
          <Skull className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ ...FONT_BANGERS, fontSize: "0.9rem", letterSpacing: "0.05em" }} className="text-red-300 leading-none">
            ÉLIMINÉ — mode spectateur
          </div>
          <div style={FONT_FREDOKA} className="text-red-400/65 text-[0.68rem] leading-tight mt-0.5 truncate">
            {name} · seuil {formatPrice(threshold)} atteint
          </div>
        </div>
        {activePlayers > 0 && (
          <div
            className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg border border-red-500/25"
            style={{ background: "rgba(0,0,0,0.25)" }}
          >
            <Eye className="w-3 h-3 text-red-300/50" />
            <span style={{ ...FONT_BANGERS, fontSize: "0.68rem" }} className="text-red-300/60">
              {activePlayers} restant{activePlayers > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// ConfirmResetModal
// ────────────────────────────────────────────────────────────
function ConfirmResetModal({
  onConfirm, onCancel, loading, deckTotal,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  deckTotal: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.82)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 30 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="w-full max-w-xs rounded-3xl border-[5px] border-black overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0c1a4e, #1a083d)", boxShadow: "8px 8px 0px #000" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#111] border-b-4 border-yellow-400 flex items-center justify-center gap-2 px-4 py-3">
          <Shuffle className="w-5 h-5 text-yellow-400" />
          <span style={{ ...FONT_BANGERS, fontSize: "1.2rem", letterSpacing: "0.06em" }} className="text-yellow-400">
            MÉLANGER LE DECK ?
          </span>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <p style={FONT_FREDOKA} className="text-white/70 text-sm text-center">
            Les {deckTotal} cartes seront remises dans le deck, mélangées et les éliminations seront effacées.
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-4 bg-[#1565C0] border-[4px] border-black rounded-2xl disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ ...FONT_BANGERS, fontSize: "1.2rem", letterSpacing: "0.08em", boxShadow: "5px 5px 0px #000", color: "#fff" }}
          >
            <Shuffle className="w-5 h-5 text-white" />
            {loading ? "MÉLANGE..." : "OUI, MÉLANGER"}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            disabled={loading}
            className="w-full py-3 bg-white/10 border-[3px] border-white/20 rounded-2xl text-white/60"
            style={{ ...FONT_FREDOKA, fontSize: "1rem" }}
          >
            Annuler
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// PrisonBars — grilles de prison SVG animées
// ────────────────────────────────────────────────────────────
function PrisonBars() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 280" preserveAspectRatio="none" className="absolute inset-0 pointer-events-none z-10">
      {[30, 70, 110, 150, 170].map((x, i) => (
        <motion.rect
          key={i}
          x={x} y={0} width={10} height={280}
          fill="rgba(0,0,0,0.75)"
          rx={4}
          initial={{ scaleY: 0, originY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

// ────────────────────────────────────────────────────────────
// EliminationPauseOverlay — overlay pour le joueur éliminé
// ────────────────────────────────────────────────────────────
function EliminationPauseOverlay({
  playerName, total, threshold, myCardsCount, onAcknowledge, isAcknowledging,
}: {
  playerName: string;
  total: number;
  threshold: number;
  myCardsCount: number;
  onAcknowledge: () => void;
  isAcknowledging: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 gap-4 overflow-y-auto py-6"
      style={{ background: "linear-gradient(160deg, #1a0000 0%, #3b0000 50%, #000 100%)" }}
    >
      {/* Grilles animées en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <PrisonBars />
      </div>

      {/* Halo rouge pulsé */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 2.4, repeat: Infinity }}
        style={{ background: "radial-gradient(ellipse at center, #dc2626 0%, transparent 70%)" }}
      />

      {/* Icône prison */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.15 }}
        className="relative z-10"
      >
        <div
          className="w-20 h-20 rounded-3xl border-[5px] border-red-500 flex items-center justify-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #450a0a, #7f1d1d)", boxShadow: "0 0 40px #dc2626, 8px 8px 0px #000" }}
        >
          <Skull className="w-14 h-14 text-red-300 relative z-10" />
          <div className="absolute inset-0 opacity-40">
            <PrisonBars />
          </div>
        </div>
      </motion.div>

      {/* Titre */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex flex-col items-center gap-1"
      >
        <div
          style={{ ...FONT_BANGERS, fontSize: "2.2rem", letterSpacing: "0.08em", lineHeight: 1 }}
          className="text-red-400 text-center"
        >
          TU VAS EN PRISON !
        </div>
        <div
          style={{ ...FONT_BANGERS, fontSize: "1.05rem", letterSpacing: "0.04em" }}
          className="text-white/60 text-center"
        >
          {playerName} — éliminé
        </div>
      </motion.div>

      {/* Carte récap dette */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="relative z-10 w-full max-w-xs rounded-3xl border-[4px] border-red-600 overflow-hidden flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #1a0000, #2d0000)", boxShadow: "6px 6px 0px #000" }}
      >
        <div className="bg-red-800 border-b-4 border-red-600 px-4 py-1.5 flex items-center justify-between">
          <span style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.06em" }} className="text-red-200">
            TON BILAN
          </span>
          <Skull className="w-5 h-5 text-red-300" />
        </div>
        <div className="px-5 py-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span style={FONT_FREDOKA} className="text-red-400/80 text-sm">Dette totale</span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.65 }}
              style={{ ...FONT_BANGERS, fontSize: "1.9rem", letterSpacing: "0.04em" }}
              className="text-red-400"
            >
              {formatPrice(total)}
            </motion.span>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-1.5">
            <span style={FONT_FREDOKA} className="text-white/30 text-xs">Limite d'élimination</span>
            <span style={{ ...FONT_BANGERS, fontSize: "0.95rem" }} className="text-white/30">
              {formatPrice(threshold)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={FONT_FREDOKA} className="text-white/30 text-xs">Cartes piochées</span>
            <span style={{ ...FONT_BANGERS, fontSize: "0.95rem" }} className="text-white/50">
              {myCardsCount} ticket{myCardsCount > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Message spectateur */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={FONT_FREDOKA}
        className="relative z-10 text-white/40 text-xs text-center px-4 leading-snug"
      >
        Appuie sur le bouton pour devenir spectateur<br />et laisser la partie continuer.
      </motion.p>

      {/* Bouton terminer */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 w-full max-w-xs flex-shrink-0"
      >
        <motion.div
          className="absolute inset-0 rounded-2xl bg-red-500 -z-10"
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <motion.button
          whileTap={{ scale: 0.95 } as any}
          onClick={onAcknowledge}
          disabled={isAcknowledging}
          className="w-full py-4 bg-red-600 border-[5px] border-black rounded-2xl disabled:opacity-60 relative overflow-hidden"
          style={{ ...FONT_BANGERS, fontSize: "1.2rem", letterSpacing: "0.08em", color: "#fff", boxShadow: "6px 6px 0px #000" }}
        >
          <motion.div
            className="absolute inset-0 w-1/3 bg-white/10 skew-x-[-20deg]"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isAcknowledging ? "EN COURS..." : <><Skull className="w-6 h-6" /> FINIR MES JOURS EN PRISON</>}
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// GamePausedOverlay — notification compacte fixe au centre pour les autres joueurs
// ────────────────────────────────────────────────────────────
function GamePausedOverlay({ eliminatedName, eliminatedTotal, gameFinished = false }: { eliminatedName: string; eliminatedTotal: number; gameFinished?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -18, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -18, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
      className="fixed inset-0 z-[90] flex items-center justify-center px-6 pointer-events-none"
      style={{ background: gameFinished ? "rgba(0,0,0,0.78)" : "transparent" }}
    >
      <div style={{ width: "min(88vw, 320px)" }}>
      <div
        className="rounded-2xl border-[4px] border-red-500 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1c0000 0%, #3b0000 100%)",
          boxShadow: "0 0 32px rgba(220,38,38,0.45), 6px 6px 0px #000",
        }}
      >
        {/* Barre top — titre + icône */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 border-b-[3px] border-red-600 bg-red-900/60">
          <motion.div
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Skull className="w-5 h-5 text-red-300 flex-shrink-0" />
          </motion.div>
          <span
            style={{ ...FONT_BANGERS, fontSize: "1.05rem", letterSpacing: "0.07em" }}
            className="text-red-300 leading-none"
          >
            PARTIE EN PAUSE
          </span>
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="ml-auto flex items-center gap-1"
          >
            <Clock className="w-3.5 h-3.5 text-red-400/70" />
          </motion.div>
        </div>

        {/* Corps — nom du joueur + dette */}
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Avatar prison */}
          <div
            className="w-11 h-11 rounded-xl border-[3px] border-red-500 flex items-center justify-center relative overflow-hidden flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #450a0a, #7f1d1d)", boxShadow: "3px 3px 0px #000" }}
          >
            <Skull className="w-6 h-6 text-red-300 relative z-10" />
            <div className="absolute inset-0 opacity-40">
              <PrisonBars />
            </div>
          </div>

          {/* Texte */}
          <div className="flex-1 min-w-0">
            <div
              style={{ ...FONT_BANGERS, fontSize: "1.15rem", letterSpacing: "0.05em", lineHeight: 1.1 }}
              className="text-yellow-300 truncate"
            >
              {eliminatedName.toUpperCase()}
            </div>
            <div style={FONT_FREDOKA} className="text-white/55 text-xs leading-tight mt-0.5">
              va en prison…
            </div>
          </div>

          {/* Dette totale */}
          <div className="flex flex-col items-end flex-shrink-0">
            <span style={{ ...FONT_BANGERS, fontSize: "1.35rem", letterSpacing: "0.03em" }} className="text-red-400 leading-none">
              {formatPrice(eliminatedTotal)}
            </span>
            <span style={{ ...FONT_FREDOKA, fontSize: "0.68rem" }} className="text-white/35 leading-none mt-0.5">
              de dette
            </span>
          </div>
        </div>

        {/* Footer — attente */}
        <div className="px-4 pb-3">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="flex items-center justify-center gap-1.5 bg-red-950/60 border border-red-600/30 rounded-xl px-3 py-1.5"
          >
            <Clock className="w-3 h-3 text-red-400" />
            <span style={{ ...FONT_FREDOKA, fontSize: "0.78rem" }} className="text-red-300/90">
              {gameFinished
                ? `En attente que ${eliminatedName} confirme avant l'annonce du gagnant…`
                : `En attente que ${eliminatedName} confirme…`}
            </span>
          </motion.div>
        </div>
      </div>
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// MyTicketsPanel — panneau "Mes tickets"
// ────────────────────────────────────────────────────────────
function MyTicketsPanel({
  cards, playerName, receivedDebt = 0, receivedCards = [], isEliminated = false, threshold = 10_000, disabledCardTypes = [], onClose, session, myPlayerId,
}: {
  cards:               number[];
  playerName:          string;
  receivedDebt?:       number;
  receivedCards?:      number[];
  isEliminated?:       boolean;
  threshold?:          number;
  disabledCardTypes?:  number[];
  onClose:             () => void;
  session?:            Session | null;
  myPlayerId?:         string;
}) {
  const [activeTab, setActiveTab]         = useState<CardCategory>("contravention");
  const [focusedCard, setFocusedCard]     = useState<number | null>(null);
  const [focusedIsReceived, setFocusedIsReceived] = useState(false);
  const [showHistory, setShowHistory]     = useState(false);

  const myDrawerTotal    = computePlayerTotal(cards);
  const totalPrice       = myDrawerTotal + receivedDebt;
  const tabCards         = filterByCategory(cards, activeTab);
  const tabReceivedCards = activeTab === "investisseur" ? receivedCards : [];
  const catInfo          = CATEGORY_INFO[activeTab];

  const allTabCards = [...tabCards, ...tabReceivedCards];
  const zoomedIdx   = focusedCard !== null ? allTabCards.indexOf(focusedCard) : -1;

  const isOverThreshold = totalPrice >= threshold;

  // ── Lookup: pour chaque carte T3 piochée, qui l'a reçue ? ──
  const t3ReceiverMap: Record<number, string> = {};
  if (session && myPlayerId) {
    session.turnOrder.forEach(pid => {
      if (pid !== myPlayerId) {
        const theirReceived = session.playerReceivedCards?.[pid] ?? [];
        theirReceived.forEach(cardNum => {
          if (cards.includes(cardNum)) {
            const receiver = session.players.find(p => p.id === pid);
            if (receiver) t3ReceiverMap[cardNum] = receiver.name;
          }
        });
      }
    });
  }

  // ── Construire l'historique enrichi ───────────────────────
  const historyEntries = (() => {
    let running = 0;
    // Cartes piochées
    const drawnEntries = cards.map((cardNum, i) => {
      const cfg = getCardConfig(cardNum);
      const net = drawerNetAmount(cfg);
      running += net;
      return {
        idx:          i + 1,
        cardNum,
        category:     cfg.category as "contravention"|"contribuable"|"investisseur",
        cardType:     cfg.cardType,
        ticketPrice:  cfg.ticketPrice ?? 0,
        frais:        cfg.frais       ?? 0,
        impots:       cfg.impots      ?? 0,
        taxe:         cfg.taxe        ?? 0,
        amountSent:   nextPlayerAmount(cfg),
        receiverName: t3ReceiverMap[cardNum] ?? "",
        net,
        runningTotal: running,
        isReceived:   false,
      };
    });
    // Cartes T3 reçues
    const receivedEntries = receivedCards.map((cardNum, i) => {
      const cfg = getCardConfig(cardNum);
      const amt = nextPlayerAmount(cfg);
      running += amt;
      return {
        idx:           cards.length + i + 1,
        cardNum,
        category:      "investisseur" as const,
        cardType:      3 as const,
        ticketPrice:   cfg.ticketPrice ?? 0,
        frais:         0,
        impots:        0,
        taxe:          cfg.taxe ?? 0,
        amountSent:    0,
        receiverName:  "",
        net:           amt,
        runningTotal:  running,
        isReceived:    true,
      };
    });
    return [...drawnEntries, ...receivedEntries];
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
          background:  "linear-gradient(160deg, #0c1a4e 0%, #1a083d 100%)",
          boxShadow:   "0 -6px 0 #000",
          maxHeight:   "92dvh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`border-b-4 flex items-center justify-between px-4 py-3 flex-shrink-0 rounded-t-2xl ${isEliminated ? "bg-[#7f1d1d] border-red-500" : "bg-[#111] border-[#22c55e]"}`}>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg border-[3px] border-black flex items-center justify-center flex-shrink-0 ${isEliminated ? "bg-red-600" : "bg-[#22c55e]"}`}
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
                {playerName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`border-[2px] border-black rounded-full px-2.5 py-0.5 ${isEliminated ? "bg-red-500" : "bg-[#22c55e]"}`}
              style={{ boxShadow: "2px 2px 0px #000" }}
            >
              <span style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-black">
                {cards.length}
              </span>
            </div>
            {/* Bouton Historique */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowHistory(v => !v)}
              className={`w-9 h-9 border-[3px] border-black rounded-full flex items-center justify-center transition-colors ${
                showHistory ? "bg-yellow-400" : "bg-white/15"
              }`}
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
          className="flex-shrink-0 mx-4 mt-3 mb-0 rounded-2xl border-[3px] border-black px-4 py-3 flex items-center justify-between gap-2"
          style={{
            background: isOverThreshold ? "rgba(239,68,68,0.15)" : "rgba(255,215,0,0.10)",
            borderColor: isOverThreshold ? "#ef4444" : "#FFD700",
            boxShadow: "4px 4px 0px #000",
          }}
        >
          <div className="flex flex-col">
            <span style={FONT_FREDOKA} className="text-yellow-400/70 text-xs uppercase tracking-widest leading-none">
              Dette totale
            </span>
            <motion.span
              key={totalPrice}
              initial={{ scale: 1.15, color: "#fff" }}
              animate={{ scale: 1, color: isOverThreshold ? "#ef4444" : "#FFD700" }}
              transition={{ duration: 0.4 }}
              style={{ ...FONT_BANGERS, fontSize: "2rem", letterSpacing: "0.04em", lineHeight: 1 }}
            >
              {formatPrice(totalPrice)}
            </motion.span>
          </div>
          {isOverThreshold && (
            <div className="flex items-center gap-1 bg-red-500/20 rounded-xl px-2 py-1 border border-red-500/40">
              <Skull className="w-4 h-4 text-red-400" />
              <span style={{ ...FONT_BANGERS, fontSize: "0.75rem" }} className="text-red-400">ÉLIMINÉ</span>
            </div>
          )}
          {!isOverThreshold && (
            <div className="flex flex-col items-end">
              <span style={FONT_FREDOKA} className="text-white/30 text-[0.6rem]">limite</span>
              <span style={{ ...FONT_BANGERS, fontSize: "0.9rem" }} className="text-white/30">{formatPrice(threshold)}</span>
            </div>
          )}
        </div>

        {/* ── VUE HISTORIQUE ── */}
        {showHistory ? (
          <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3 flex flex-col gap-2">
            {/* Titre */}
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
                  Aucun ticket pour l'instant…
                </p>
              </div>
            ) : (
              <>
                {historyEntries.map((entry, i) => {
                  const overLimit = entry.runningTotal >= threshold;

                  // ── T1 Contravention (jaune) ──────────────────
                  if (entry.category === "contravention") {
                    const hasFreis = entry.frais > 0;
                    return (
                      <motion.div
                        key={`hist-${entry.cardNum}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i * 0.025, 0.45) }}
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
                        <span style={{ ...FONT_BANGERS, fontSize: "0.9rem" }} className={overLimit ? "text-red-400 flex-shrink-0" : "text-yellow-400/80 flex-shrink-0"}>
                          {formatPrice(entry.runningTotal)}
                        </span>
                      </motion.div>
                    );
                  }

                  // ── T2 Contribuable (vert) ─────────────────────
                  if (entry.category === "contribuable") {
                    const hasReduction = entry.impots > 0;
                    return (
                      <motion.div
                        key={`hist-${entry.cardNum}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i * 0.025, 0.45) }}
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
                        <span style={{ ...FONT_BANGERS, fontSize: "0.9rem" }} className={overLimit ? "text-red-400 flex-shrink-0" : "text-yellow-400/80 flex-shrink-0"}>
                          {formatPrice(entry.runningTotal)}
                        </span>
                      </motion.div>
                    );
                  }

                  // ── T3 Investisseur REÇUE (rose) ───────────────
                  if (entry.isReceived) {
                    return (
                      <motion.div
                        key={`hist-${entry.cardNum}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i * 0.025, 0.45) }}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-[2px] bg-pink-500/5"
                        style={{ borderColor: "rgba(236,72,153,0.3)" }}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(236,72,153,0.2)" }}>
                          <Mail className="w-3.5 h-3.5 text-pink-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div style={FONT_FREDOKA} className="text-pink-300 text-xs leading-snug">
                            Ticket total reçu{" "}
                            <strong className="text-pink-400">{formatPrice(entry.net)}</strong>
                          </div>
                          {entry.taxe > 0 && (
                            <div style={FONT_FREDOKA} className="text-pink-400/70 text-[0.65rem]">
                              dont Taxes reçues <strong className="text-pink-400">+{formatPrice(entry.taxe)}</strong>
                            </div>
                          )}
                        </div>
                        <span style={{ ...FONT_BANGERS, fontSize: "0.9rem" }} className={overLimit ? "text-red-400 flex-shrink-0" : "text-yellow-400/80 flex-shrink-0"}>
                          {formatPrice(entry.runningTotal)}
                        </span>
                      </motion.div>
                    );
                  }

                  // ── T3 Investisseur ENVOYÉE (mauve) ────────────
                  if (entry.category === "investisseur" && !entry.isReceived) {
                    return (
                      <motion.div
                        key={`hist-${entry.cardNum}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(i * 0.025, 0.45) }}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-[2px] bg-purple-500/5"
                        style={{ borderColor: "rgba(124,58,237,0.3)" }}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.2)" }}>
                          <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {entry.receiverName ? (
                            <div style={FONT_FREDOKA} className="text-purple-300 text-xs leading-snug">
                              Envoyé à <strong className="text-purple-400">{entry.receiverName}</strong>
                              {" : "}
                              <strong className="text-purple-400">{formatPrice(entry.amountSent)}</strong>
                            </div>
                          ) : (
                            <div style={FONT_FREDOKA} className="text-purple-300 text-xs leading-snug">
                              Envoyé <strong className="text-purple-400">{formatPrice(entry.amountSent)}</strong>
                            </div>
                          )}
                          {entry.taxe > 0 && (
                            <div style={FONT_FREDOKA} className="text-purple-400/70 text-[0.65rem]">
                              Réduction taxe <strong className="text-purple-400">– {formatPrice(entry.taxe)}</strong>
                            </div>
                          )}
                        </div>
                        <span style={{ ...FONT_BANGERS, fontSize: "0.9rem" }} className={overLimit ? "text-red-400 flex-shrink-0" : "text-yellow-400/80 flex-shrink-0"}>
                          {formatPrice(entry.runningTotal)}
                        </span>
                      </motion.div>
                    );
                  }

                  return null;
                })}

                {/* Récapitulatif final */}
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
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end text-right gap-0.5">
                    <span style={FONT_FREDOKA} className="text-white/30 text-[0.6rem]">{cards.length} pioché{cards.length > 1 ? "s" : ""}</span>
                    {receivedCards.length > 0 && (
                      <span style={FONT_FREDOKA} className="text-pink-400/60 text-[0.6rem]">{receivedCards.length} reçu{receivedCards.length > 1 ? "s" : ""}</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (

        <>{/* Onglets catégories — nouveau design segmenté */}
        <div className="px-4 pt-3 pb-0 flex-shrink-0">
          <div
            className="flex rounded-2xl overflow-hidden border-[3px] border-black"
            style={{ boxShadow: "3px 3px 0px #000" }}
          >
            {CATEGORY_ORDER.filter((cat) => {
              // Masquer les catégories dont le type est désactivé
              if (cat === "contribuable" && disabledCardTypes.includes(2)) return false;
              if (cat === "investisseur" && disabledCardTypes.includes(3)) return false;
              return true;
            }).map((cat, catIdx, visibleCats) => {
              const info     = CATEGORY_INFO[cat];
              const count    = filterByCategory(cards, cat).length + (cat === "investisseur" ? receivedCards.length : 0);
              const isActive = activeTab === cat;
              const isLast   = catIdx === visibleCats.length - 1;
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
                    style={{ ...FONT_BANGERS, fontSize: "0.62rem", letterSpacing: "0.06em", lineHeight: 1 }}
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

        {/* Séparateur */}
        <div className="mx-4 mt-2 mb-1 h-[3px] rounded-full flex-shrink-0" style={{ background: catInfo.color, opacity: 0.6 }} />

        {/* Sous-total */}
        <div className="flex items-center justify-between px-5 pb-2 flex-shrink-0">
          <span style={FONT_FREDOKA} className="text-white/50 text-xs">
            {catInfo.label} — {tabCards.length + tabReceivedCards.length} ticket{(tabCards.length + tabReceivedCards.length) > 1 ? "s" : ""}
          </span>
          <span style={{ ...FONT_BANGERS, fontSize: "0.95rem" }} className="text-white/70">
            {formatPrice(computePlayerTotal(tabCards) + (activeTab === "investisseur" ? receivedDebt : 0))}
          </span>
        </div>

        {/* Grille de cartes */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <AnimatePresence mode="wait">
            {tabCards.length === 0 && tabReceivedCards.length === 0 ? (
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
                className="flex flex-col gap-3 pt-1"
              >
                {/* Cartes piochées */}
                {tabCards.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {tabReceivedCards.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-white/10" />
                        <span style={FONT_FREDOKA} className="text-white/30 text-xs">Mes cartes piochées</span>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2.5">
                      {tabCards.map((cardNum, idx) => {
                        const cfg = getCardConfig(cardNum);
                        const net = drawerNetAmount(cfg);
                        const bgC = cfg.cardType === 2 ? "#16A34A" : cfg.cardType === 3 ? "#7C3AED" : catInfo.color;
                        const ti  = TYPE_INFO[cfg.cardType];
                        return (
                          <motion.div
                            key={`drawn-${cardNum}-${idx}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: Math.min(idx * 0.025, 0.4), type: "spring", stiffness: 320, damping: 22 }}
                            whileTap={{ scale: 0.93 } as any}
                            onClick={() => { setFocusedCard(cardNum); setFocusedIsReceived(false); }}
                            className="relative rounded-xl border-[3px] overflow-hidden cursor-pointer"
                            style={{
                              aspectRatio: "5/7", boxShadow: "3px 3px 0px #000", background: "#0c1a4e",
                              borderColor: cfg.cardType === 2 ? "#16A34A" : cfg.cardType === 3 ? "#7C3AED" : "#000",
                            }}
                          >
                            <CardFace cardNumber={cardNum} mini />
                            <div className="absolute bottom-0 left-0 right-0 py-0.5 flex items-center justify-center" style={{ background: bgC + "ee" }}>
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
                    </div>
                  </div>
                )}

                {/* Cartes T3 reçues */}
                {tabReceivedCards.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-pink-400/30" />
                      <span style={FONT_FREDOKA} className="text-pink-300/70 text-xs">
                        Reçues d'un autre joueur ({tabReceivedCards.length})
                      </span>
                      <div className="h-px flex-1 bg-pink-400/30" />
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {tabReceivedCards.map((cardNum, idx) => {
                        const cfg     = getCardConfig(cardNum);
                        const nextAmt = nextPlayerAmount(cfg);
                        return (
                          <motion.div
                            key={`recv-${cardNum}-${idx}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: Math.min(idx * 0.025, 0.4), type: "spring", stiffness: 320, damping: 22 }}
                            whileTap={{ scale: 0.93 } as any}
                            onClick={() => { setFocusedCard(cardNum); setFocusedIsReceived(true); }}
                            className="relative rounded-xl overflow-hidden cursor-pointer"
                            style={{
                              aspectRatio: "5/7",
                              border: "3px solid #EC4899",
                              boxShadow: "3px 3px 0px #000",
                              background: "#0c1a4e",
                            }}
                          >
                            <CardFace cardNumber={cardNum} mini />
                            <div className="absolute bottom-0 left-0 right-0 py-0.5 flex items-center justify-center" style={{ background: "#EC4899ee" }}>
                              <span style={{ ...FONT_BANGERS, fontSize: "0.52rem" }} className="text-white leading-none">
                                +{formatPrice(nextAmt)}
                              </span>
                            </div>
                            <div className="absolute top-0.5 left-0.5 px-0.5 rounded border border-black" style={{ background: "#EC4899cc" }}>
                              <span style={{ ...FONT_BANGERS, fontSize: "0.38rem" }} className="text-white leading-none">REÇU</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </>
        )}

        {/* Safe area bottom */}
        <div className="h-safe flex-shrink-0" style={{ height: "env(safe-area-inset-bottom, 12px)" }} />
      </motion.div>

      {/* Vue zoom d'une carte */}
      <AnimatePresence>
        {focusedCard !== null && (() => {
          const cfg      = getCardConfig(focusedCard);
          const net      = drawerNetAmount(cfg);
          const nextAmt  = nextPlayerAmount(cfg);
          const ti       = TYPE_INFO[cfg.cardType];
          const headerBg = focusedIsReceived ? "#EC4899" : ti.color;
          const fCatInfo = CATEGORY_INFO[cfg.category];
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-6 gap-4"
              style={{ background: "rgba(0,0,0,0.93)" }}
              onClick={() => { setFocusedCard(null); setFocusedIsReceived(false); }}
            >
              <motion.div
                initial={{ scale: 0.72, rotateY: -40 }}
                animate={{ scale: 1, rotateY: 0 }}
                exit={{ scale: 0.72, opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="rounded-3xl border-[5px] overflow-hidden flex-shrink-0"
                style={{ width: "min(78vw, 260px)", aspectRatio: "5/7", boxShadow: "10px 10px 0px #000", borderColor: focusedIsReceived ? "#EC4899" : "#000" }}
                onClick={(e) => e.stopPropagation()}
              >
                <CardFace cardNumber={focusedCard} />
              </motion.div>

              <div
                className="w-full max-w-sm rounded-2xl border-[3px] border-black overflow-hidden"
                style={{ borderColor: headerBg, boxShadow: "6px 6px 0px #000" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-2" style={{ background: headerBg }}>
                  <div className="flex items-center gap-1.5">
                    {focusedIsReceived && <Mail className="w-4 h-4 text-white flex-shrink-0" />}
                    <span style={{ ...FONT_BANGERS, fontSize: "0.95rem", letterSpacing: "0.05em" }} className="text-white">
                      {focusedIsReceived ? "REÇUE" : ti.shortLabel} — #{String(focusedCard).padStart(3, "0")}
                    </span>
                  </div>
                  <span style={{ ...FONT_BANGERS, fontSize: "0.9rem" }} className="text-white/80">
                    {fCatInfo.label}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex flex-col gap-1.5" style={{ background: headerBg + "22" }}>
                  {focusedIsReceived ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span style={FONT_FREDOKA} className="text-pink-300 text-sm flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" /> Dette reçue
                        </span>
                        <span style={{ ...FONT_BANGERS, fontSize: "1.05rem" }} className="text-pink-300">+{formatPrice(nextAmt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={FONT_FREDOKA} className="text-white/50 text-xs">Ticket de base</span>
                        <span style={{ ...FONT_BANGERS, fontSize: "0.85rem" }} className="text-white/60">+{formatPrice(cfg.ticketPrice ?? 0)}</span>
                      </div>
                      {(cfg.taxe ?? 0) > 0 && (
                        <div className="flex justify-between">
                          <span style={FONT_FREDOKA} className="text-white/50 text-xs">Taxe incluse</span>
                          <span style={{ ...FONT_BANGERS, fontSize: "0.85rem" }} className="text-white/60">+{formatPrice(cfg.taxe ?? 0)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span style={FONT_FREDOKA} className="text-white/70 text-sm flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> Effet sur toi
                        </span>
                        <span style={{ ...FONT_BANGERS, fontSize: "1.05rem" }} className={net >= 0 ? "text-red-400" : "text-green-400"}>
                          {net >= 0 ? "+" : ""}{formatPrice(net)}
                        </span>
                      </div>
                      {nextAmt > 0 && (
                        <div className="flex justify-between items-center">
                          <span style={FONT_FREDOKA} className="text-pink-300 text-sm flex items-center gap-1">
                            <ArrowRight className="w-3.5 h-3.5" /> Joueur suivant
                          </span>
                          <span style={{ ...FONT_BANGERS, fontSize: "1.05rem" }} className="text-pink-300">+{formatPrice(nextAmt)}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (zoomedIdx > 0) {
                      const prev = allTabCards[zoomedIdx - 1];
                      setFocusedCard(prev);
                      setFocusedIsReceived(tabReceivedCards.includes(prev));
                    }
                  }}
                  disabled={zoomedIdx <= 0}
                  className="w-12 h-12 bg-white/10 border-[2px] border-white/20 rounded-xl flex items-center justify-center text-white/60 disabled:opacity-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <span style={FONT_FREDOKA} className="text-white/40 text-sm min-w-[4rem] text-center">
                  {zoomedIdx + 1} / {allTabCards.length}
                </span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (zoomedIdx < allTabCards.length - 1) {
                      const next = allTabCards[zoomedIdx + 1];
                      setFocusedCard(next);
                      setFocusedIsReceived(tabReceivedCards.includes(next));
                    }
                  }}
                  disabled={zoomedIdx >= allTabCards.length - 1}
                  className="w-12 h-12 bg-white/10 border-[2px] border-white/20 rounded-xl flex items-center justify-center text-white/60 disabled:opacity-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setFocusedCard(null); setFocusedIsReceived(false); }}
                  className="w-12 h-12 bg-red-500 border-[3px] border-black rounded-full flex items-center justify-center ml-1"
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

// ────────────────────────────────────────────────────────────
// MultiplayerGameScreen — écran principal
// ────────────────────────────────────────────────────────────
export function MultiplayerGameScreen() {
  const [, navigate] = useLocation();
  const { code, playerId, playerName, isHost } = mpStorage.load();

  const [session, setSession]                   = useState<Session | null>(null);
  const [error, setError]                       = useState("");
  const [isDrawing, setIsDrawing]               = useState(false);
  const [isResetting, setIsResetting]           = useState(false);
  const [showNotif, setShowNotif]               = useState(false);
  const [showCard, setShowCard]                 = useState(true);
  const [showCardFront, setShowCardFront]       = useState(true); // false = dos, true = face
  const [showMyTickets, setShowMyTickets]       = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [justEliminated, setJustEliminated]     = useState<string | null>(null); // kept for flash notif minor uses
  const [isEndingTurn, setIsEndingTurn]         = useState(false);
  const [bubbleCard, setBubbleCard]             = useState<{ cardNum: number; playerName: string } | null>(null);
  const [showPrevCard, setShowPrevCard]         = useState(false);

  // ─ Masquer la carte (pour les non-actifs) ─
  const [cardHiddenByViewer, setCardHiddenByViewer] = useState(false);

  // ─ Élimination avec pause ─
  const [showMyEliminationOverlay, setShowMyEliminationOverlay] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const prevPendingAck = useRef<string[]>([]);

  // ─ Flux carte T3 investisseur ─
  const [pendingT3, setPendingT3] = useState<{
    nextPlayerId: string; nextAmt: number; taxAmt: number; nextPlayerName: string;
  } | null>(null);
  const [isSendingT3, setIsSendingT3]                         = useState(false);
  const [showTaxNotif, setShowTaxNotif]                       = useState<{ amount: number } | null>(null);
  const [showReceivedTicketNotif, setShowReceivedTicketNotif] = useState<{
    amount: number; fromName: string;
  } | null>(null);
  // Notification spectateur : "X envoie un ticket à Y" (pour les joueurs non impliqués)
  const [showT3SpectatorNotif, setShowT3SpectatorNotif] = useState<{
    senderName: string; receiverName: string;
    senderId: string; receiverId: string;
  } | null>(null);
  // ref gardée mais plus utilisée pour la détection
  const t3NotifReceiverCountRef = useRef<number>(0);

  // ─ Notification "joueur a quitté/été expulsé" ─
  const [playerLeftNotif, setPlayerLeftNotif] = useState<{
    playerName: string; wasKicked: boolean;
  } | null>(null);
  const playerLeftTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRecentLeaveTs = useRef<number>(0); // timestamp déjà affiché

  // ─ Modal d'expulsion (host) ─
  const [showKickModal, setShowKickModal] = useState(false);
  const [isKicking, setIsKicking] = useState(false);

  // ─ Dropdown joueurs ─
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel]     = useState(false);

  const pollRef                = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTurnIdx            = useRef<number>(-1);
  const prevLastCard           = useRef<number | null>(null);
  const notifTimeout           = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elimTimeout            = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstLoadDone          = useRef(false);
  const prevReceivedCardCount  = useRef<number>(0);

  // Déduplication des notifications de tour : mémorise le turnIndex déjà notifié
  const lastNotifTurnIdx       = useRef<number>(-1);
  // Clé incrémentale pour forcer AnimatePresence à remonter proprement la notif
  const [notifMountKey, setNotifMountKey] = useState(0);
  // Ref synchrone pour savoir si la notif est à l'écran (évite les closures stales)
  const showNotifRef           = useRef(false);

  // Redirection si pas de session
  useEffect(() => {
    if (!code || !playerId) navigate("/");
  }, []);

  // Réinitialiser le masquage à chaque nouvelle carte
  useEffect(() => {
    setCardHiddenByViewer(false);
  }, [session?.lastCard]);

  const isMyTurn = useCallback(
    (s: Session) => s.state === "playing" && s.turnOrder[s.currentTurnIndex] === playerId,
    [playerId],
  );

  /**
   * Affiche la notification de tour de manière idempotente.
   * - Ignore si ce turnIndex a déjà déclenché une notif (anti-doublon).
   * - Si une notif est déjà visible, coupe-la 80 ms avant de relancer
   *   pour forcer AnimatePresence à démonter/remonter l'ancien composant.
   */
  const triggerTurnNotif = useCallback((s: Session, forceAutoClose: boolean) => {
    const idx = s.currentTurnIndex;
    // Anti-doublon strict : même tour → on ignore
    if (lastNotifTurnIdx.current === idx) return;
    lastNotifTurnIdx.current = idx;

    const isMeTurn = s.turnOrder[idx] === playerId;

    const doShow = () => {
      if (notifTimeout.current) clearTimeout(notifTimeout.current);
      setNotifMountKey(k => k + 1); // nouveau montage = nouvelle animation d'entrée
      showNotifRef.current = true;
      setShowNotif(true);
      if (!isMeTurn || forceAutoClose) {
        // Auto-dismiss pour les spectateurs ou après handleEndTurn
        notifTimeout.current = setTimeout(() => {
          showNotifRef.current = false;
          setShowNotif(false);
        }, 2400);
      }
    };

    if (showNotifRef.current) {
      // Une notif est déjà visible → on la fait sortir proprement puis on relance
      if (notifTimeout.current) clearTimeout(notifTimeout.current);
      showNotifRef.current = false;
      setShowNotif(false);
      setTimeout(doShow, 120); // laisse exit animation se jouer
    } else {
      doShow();
    }
  }, [playerId]);

  // ── Polling ──────────────────────────────────────────────
  const fetchSession = useCallback(async () => {
    if (!code) return;
    try {
      const { session: s } = await getSession(code);
      setError("");

      // Si ce joueur a été expulsé (plus dans la liste des joueurs)
      if (firstLoadDone.current) {
        const stillInGame = s.players.some(p => p.id === playerId);
        if (!stillInGame) {
          mpStorage.clear();
          navigate("/");
          return;
        }
      }

      const turnChanged = prevTurnIdx.current !== s.currentTurnIndex;
      const cardChanged = prevLastCard.current !== s.lastCard;

      if (turnChanged || cardChanged) {
        setShowCard(false);
        setTimeout(() => setShowCard(true), 50);
      }

      // Notification de changement de tour (sauf au premier chargement)
      if (firstLoadDone.current && turnChanged && s.state === "playing") {
        // Mettre à jour la bulle "carte précédente" avec la carte du joueur qui vient de terminer
        if (s.lastCard !== null && s.lastCardDrawnBy) {
          const bPlayer = s.players.find((p) => p.id === s.lastCardDrawnBy);
          if (bPlayer) setBubbleCard({ cardNum: s.lastCard, playerName: bPlayer.name });
        }
        // Utiliser triggerTurnNotif pour éviter les doublons (race condition poll + handleEndTurn)
        triggerTurnNotif(s, false);
      }

      prevTurnIdx.current  = s.currentTurnIndex;
      prevLastCard.current = s.lastCard;

      // ─ Détecter si JE suis nouvellement dans pendingEliminationAck ─
      const pending = s.pendingEliminationAck ?? [];
      const wasInPending = prevPendingAck.current.includes(playerId);
      const nowInPending = pending.includes(playerId);
      if (!wasInPending && nowInPending) {
        setShowMyEliminationOverlay(true);
      }
      prevPendingAck.current = pending;

      // ─ Détecter un nouveau ticket T3 reçu (pour le joueur destinataire) ─
      const newReceivedCards = s.playerReceivedCards?.[playerId] ?? [];
      const newReceivedCount = newReceivedCards.length;
      if (
        firstLoadDone.current &&
        newReceivedCount > prevReceivedCardCount.current &&
        s.lastCardDrawnBy !== playerId
      ) {
        const drawerPlayer = s.players.find((p) => p.id === s.lastCardDrawnBy);
        if (s.lastCard !== null) {
          const cfg = getCardConfig(s.lastCard);
          const receivedAmt = nextPlayerAmount(cfg);
          setShowReceivedTicketNotif({
            amount: receivedAmt,
            fromName: drawerPlayer?.name ?? "un joueur",
          });
        }
      }
      prevReceivedCardCount.current = newReceivedCount;

      // ─ Détecter si la carte qui vient d'être piochée est T3 (notif spectateur dès la pioche) ─
      if (firstLoadDone.current && cardChanged && s.lastCard !== null) {
        const drawnCfg = getCardConfig(s.lastCard);
        if (drawnCfg.cardType === 3 && s.lastCardDrawnBy && s.lastCardDrawnBy !== playerId) {
          const nextReceiverId = getNextActivePlayerId(s, s.lastCardDrawnBy);
          if (nextReceiverId && nextReceiverId !== playerId) {
            // Je suis spectateur (ni l'envoyeur ni le receveur désigné)
            const senderPlayer   = s.players.find((p) => p.id === s.lastCardDrawnBy);
            const receiverPlayer = s.players.find((p) => p.id === nextReceiverId);
            if (senderPlayer && receiverPlayer) {
              setShowT3SpectatorNotif({
                senderName:   senderPlayer.name,
                receiverName: receiverPlayer.name,
                senderId:     senderPlayer.id,
                receiverId:   nextReceiverId,
              });
            }
          }
        } else if (drawnCfg.cardType !== 3) {
          // Nouvelle carte non-T3 piochée → fermer toute notif spectateur T3 résiduelle
          setShowT3SpectatorNotif(null);
        }
      }

      // ── Détecter si un joueur vient de quitter / être expulsé ──
      if (
        firstLoadDone.current &&
        s.recentLeave &&
        s.recentLeave.timestamp > lastRecentLeaveTs.current
      ) {
        lastRecentLeaveTs.current = s.recentLeave.timestamp;
        // Ne pas afficher la notif pour soi-même (le joueur qui quitte navigue déjà)
        if (s.recentLeave.playerName !== playerName) {
          if (playerLeftTimeout.current) clearTimeout(playerLeftTimeout.current);
          setPlayerLeftNotif({
            playerName: s.recentLeave.playerName,
            wasKicked: !!s.recentLeave.kickedBy,
          });
          playerLeftTimeout.current = setTimeout(() => setPlayerLeftNotif(null), 5000);
        }
      }

      setSession(s);
      firstLoadDone.current = true;

      if (s.state === "lobby") navigate("/lobby");
    } catch (e: any) {
      if (e.message?.includes("introuvable") || e.message?.includes("expirée")) {
        navigate("/");
      } else {
        setError("Connexion instable…");
      }
    }
  }, [code, isMyTurn, navigate, triggerTurnNotif]);

  useEffect(() => {
    fetchSession();
    pollRef.current = setInterval(fetchSession, POLL_INTERVAL);
    return () => {
      if (pollRef.current)  clearInterval(pollRef.current);
      if (notifTimeout.current) clearTimeout(notifTimeout.current);
      if (elimTimeout.current)  clearTimeout(elimTimeout.current);
      if (playerLeftTimeout.current) clearTimeout(playerLeftTimeout.current);
    };
  }, [fetchSession]);

  // ── Auto-fermeture de la notif spectateur T3 ──────────────
  // Se ferme quand l'envoyeur termine son tour (currentTurnIndex change)
  useEffect(() => {
    if (!showT3SpectatorNotif || !session) return;
    const { senderId } = showT3SpectatorNotif;
    const senderNoLongerCurrent = session.turnOrder[session.currentTurnIndex] !== senderId;
    if (senderNoLongerCurrent) {
      setShowT3SpectatorNotif(null);
    }
  }, [session, showT3SpectatorNotif]);

  // ── Vérifier l'élimination après draw ou addDebt ──────────
  const checkAndEliminate = useCallback(async (
    s: Session,
    targetId: string,
    targetName: string,
  ): Promise<Session> => {
    const cards = s.playerCards?.[targetId] ?? [];
    const debt  = s.playerDebts?.[targetId] ?? 0;
    const total = computePlayerTotal(cards) + debt;

    // Lire le seuil depuis la session (dynamique selon la difficulté choisie)
    const sessionThreshold = s.eliminationThreshold ?? DEFAULT_ELIMINATION_THRESHOLD;
    const alreadyElim = (s.eliminatedPlayers ?? []).includes(targetId);
    if (!alreadyElim && total >= sessionThreshold) {
      try {
        const { session: sElim } = await eliminatePlayer(code, targetId);
        // Le polling détectera pendingEliminationAck et affichera les overlays
        setJustEliminated(targetName); // petit flash court pour les spectateurs non-paused
        if (elimTimeout.current) clearTimeout(elimTimeout.current);
        elimTimeout.current = setTimeout(() => setJustEliminated(null), 1800);
        return sElim;
      } catch (e) {
        console.error("Erreur élimination:", e);
      }
    }
    return s;
  }, [code]);

  // ── Piocher ─────────────────────────────────────────────
  const handleDraw = async () => {
    if (!session || isDrawing || !isMyTurn(session)) return;
    const isEliminated = (session.eliminatedPlayers ?? []).includes(playerId);
    if (isEliminated) return;

    setIsDrawing(true);
    showNotifRef.current = false;
    setShowNotif(false);
    setShowCardFront(false); // Montrer le dos en premier (comme en solo)
    try {
      let s = (await drawCard(code, playerId)).session;
      setSession(s);
      prevTurnIdx.current  = s.currentTurnIndex;
      prevLastCard.current = s.lastCard;
      setShowCard(false);
      setTimeout(() => {
        setShowCard(true);
        // Retourner la carte face visible après l'animation d'entrée (350ms)
        setTimeout(() => setShowCardFront(true), 320);
      }, 50);

      // Vérifier mon élimination après avoir pioché
      s = await checkAndEliminate(s, playerId, playerName);
      setSession(s);

      // Carte Type 3 : préparer l'envoi manuel (via bouton "Envoyer le ticket")
      if (s.lastCard !== null && s.turnOrder.length > 1 && s.state === "playing") {
        const cfg     = getCardConfig(s.lastCard);
        const nextAmt = nextPlayerAmount(cfg);
        if (nextAmt > 0) {
          const nextPlayerId = getNextActivePlayerId(s, playerId);
          if (nextPlayerId) {
            const nextPlayer = s.players.find((p) => p.id === nextPlayerId);
            setPendingT3({
              nextPlayerId,
              nextAmt,
              taxAmt: cfg.taxe ?? 0,
              nextPlayerName: nextPlayer?.name ?? "joueur suivant",
            });
          }
        }
      }
    } catch (e: any) {
      setError(e.message ?? "Erreur lors du tirage");
    } finally {
      setIsDrawing(false);
    }
  };

  // ── Envoyer le ticket T3 au joueur suivant (manuel) ────
  const handleSendT3 = async () => {
    if (!pendingT3 || !session || isSendingT3) return;
    setIsSendingT3(true);
    const { nextPlayerId, nextAmt, taxAmt } = pendingT3;
    try {
      let s2 = (await addDebt(code, playerId, nextPlayerId, nextAmt, session.lastCard!)).session;
      setSession(s2);
      setPendingT3(null);

      // Vérifier l'élimination du piocheur et du destinataire
      s2 = await checkAndEliminate(s2, playerId, playerName);
      setSession(s2);
      const nextPlayer = s2.players.find((p) => p.id === nextPlayerId);
      if (nextPlayer) {
        s2 = await checkAndEliminate(s2, nextPlayerId, nextPlayer.name);
        setSession(s2);
      }

      // Afficher la notification de taxe pour le piocheur
      if (taxAmt > 0) {
        setShowTaxNotif({ amount: taxAmt });
      }
    } catch (e: any) {
      setError(e.message ?? "Erreur lors de l'envoi du ticket");
    } finally {
      setIsSendingT3(false);
    }
  };

  // ── Terminer le tour ────────────────────────────────────
  const handleEndTurn = async () => {
    if (!session || isEndingTurn) return;
    setIsEndingTurn(true);
    try {
      const { session: s } = await endTurn(code, playerId);
      // Mettre à jour la bulle immédiatement pour le joueur courant
      if (s.lastCard !== null && s.lastCardDrawnBy) {
        const prevPlayer = s.players.find((p) => p.id === s.lastCardDrawnBy);
        if (prevPlayer) setBubbleCard({ cardNum: s.lastCard, playerName: prevPlayer.name });
      }
      // Mettre à jour prevTurnIdx AVANT triggerTurnNotif pour que le prochain poll ne redéclenche pas
      prevTurnIdx.current = s.currentTurnIndex;
      setSession(s);
      // Afficher la notif "Tour de [suivant]" — forceAutoClose=true car ce n'est plus mon tour
      if (s.state === "playing") {
        triggerTurnNotif(s, true);
      }
    } catch (e: any) {
      setError(e.message ?? "Erreur fin de tour");
    } finally {
      setIsEndingTurn(false);
    }
  };

  // ── Mélanger (host) ─────────────────────────────────────
  const handleReset = async () => {
    if (!isHost || isResetting) return;
    setIsResetting(true);
    try {
      const { session: s } = await resetGame(code, playerId);
      setSession(s);
      prevTurnIdx.current  = s.currentTurnIndex;
      prevLastCard.current = s.lastCard;
      firstLoadDone.current = false; // Éviter la notif immédiate
      lastNotifTurnIdx.current = -1;
      showNotifRef.current = false;
      setShowNotif(false);
      setNotifMountKey(0);
      setJustEliminated(null);
      setBubbleCard(null);
      setShowPrevCard(false);
      setShowCardFront(true);
      setShowConfirmReset(false);
      setPendingT3(null);
      setShowTaxNotif(null);
      setShowReceivedTicketNotif(null);
      setShowT3SpectatorNotif(null);
      setShowMyEliminationOverlay(false);
      prevPendingAck.current = [];
    } catch (e: any) {
      setError(e.message ?? "Erreur mélange");
    } finally {
      setIsResetting(false);
    }
  };

  // ── Expulser un joueur (host) ────────────────────────────
  const handleKick = async (targetId: string) => {
    if (!isHost || isKicking) return;
    setIsKicking(true);
    try {
      const { session: s } = await kickPlayer(code, playerId, targetId);
      setSession(s);
      setShowKickModal(false);
    } catch (e: any) {
      setError(e.message ?? "Erreur expulsion");
    } finally {
      setIsKicking(false);
    }
  };

  // ── Quitter ─────────────────────────────────────────────
  const handleLeave = async () => {
    try { await leaveSession(code, playerId); } catch {}
    mpStorage.clear();
    navigate("/");
  };

  // ── Confirmer l'élimination (devient spectateur) ─────────
  const handleAcknowledge = async () => {
    if (isAcknowledging) return;
    setIsAcknowledging(true);
    try {
      const { session: s } = await acknowledgeElimination(code, playerId);
      setSession(s);
      setShowMyEliminationOverlay(false);
      prevPendingAck.current = s.pendingEliminationAck ?? [];
    } catch (e: any) {
      setError(e.message ?? "Erreur confirmation");
    } finally {
      setIsAcknowledging(false);
    }
  };

  // ── Rendu de chargement ──────────────────────────────────
  if (!session) {
    return (
      <div className="h-[100dvh] max-w-md mx-auto flex flex-col items-center justify-center gap-4"
        style={{ background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 100%)" }}>
        <motion.div animate={{ rotate: [-10, 10, -10], scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <img src={ticketImg} alt="" style={{ width: "5rem" }} />
        </motion.div>
        <span style={FONT_FREDOKA} className="text-white/50 text-sm">Connexion à la session…</span>
        {error && <span style={FONT_FREDOKA} className="text-red-400 text-sm">{error}</span>}
      </div>
    );
  }

  const ELIMINATION_THRESHOLD = session.eliminationThreshold ?? DEFAULT_ELIMINATION_THRESHOLD;
  const disabledCardTypes: number[] = session.disabledCardTypes ?? [];

  const myTurn        = isMyTurn(session);
  const amEliminated  = (session.eliminatedPlayers ?? []).includes(playerId);
  const currentPlayer = session.players.find((p) => p.id === session.turnOrder[session.currentTurnIndex]);
  const remaining     = session.deck.length;
  const drawnCount    = session.drawn.length;
  const isFinished    = session.state === "finished";
  // Taille réelle du deck (filtrée selon les préférences de la session)
  const deckTotal     = (remaining + drawnCount) || (session.allowedCardIds?.length ?? TOTAL_CARDS);
  const lastCardBy    = session.players.find((p) => p.id === session.lastCardDrawnBy);

  const myCards:          number[] = session.playerCards?.[playerId] ?? [];
  const myReceivedDebt:   number   = session.playerDebts?.[playerId] ?? 0;
  const myReceivedCards:  number[] = session.playerReceivedCards?.[playerId] ?? [];

  // Vrai si le joueur actif a déjà pioché sa carte ce tour
  const hasDrawnThisTurn      = myTurn && session.lastCardDrawnBy === playerId;
  // Vrai si le joueur dont c'est le tour a pioché (utile pour les autres)
  const currentPlayerHasDrawn = session.lastCardDrawnBy === session.turnOrder[session.currentTurnIndex];

  // Calcul des totaux pour le classement
  const playerTotals = session.turnOrder.map((pid) => ({
    pid,
    total: computePlayerTotal(session.playerCards?.[pid] ?? []) + (session.playerDebts?.[pid] ?? 0),
  }));
  const minTotal   = Math.min(...playerTotals.filter(t => !(session.eliminatedPlayers ?? []).includes(t.pid)).map(t => t.total));
  const eliminated = session.eliminatedPlayers ?? [];

  // Vainqueur : dernier actif si jeu fini, ou joueur avec la dette la plus faible
  const activePlayers = playerTotals.filter(t => !eliminated.includes(t.pid));

  // ─ T3 : identifier si la carte courante est un investisseur et qui est le receveur ─
  const lastCardIsT3 = session.lastCard !== null && currentPlayerHasDrawn && getCardConfig(session.lastCard).cardType === 3;
  const t3ReceiverId = lastCardIsT3 && session.lastCardDrawnBy
    ? getNextActivePlayerId(session, session.lastCardDrawnBy)
    : null;
  // Je ne suis ni l'envoyeur ni le receveur → spectateur T3
  const isT3Spectator = lastCardIsT3 && session.lastCardDrawnBy !== playerId && t3ReceiverId !== playerId;
  const winner = isFinished && activePlayers.length === 1
    ? session.players.find((p) => p.id === activePlayers[0]?.pid)
    : null;

  // Pause élimination : autres joueurs en attente
  const pendingAck = session.pendingEliminationAck ?? [];
  const gamePausedFor = !amEliminated && pendingAck.length > 0
    ? session.players.find(p => p.id === pendingAck[0])
    : null;
  // Dette totale du joueur en attente d'élimination (pour la notif des autres)
  const gamePausedForTotal = gamePausedFor
    ? computePlayerTotal(session.playerCards?.[gamePausedFor.id] ?? []) + (session.playerDebts?.[gamePausedFor.id] ?? 0)
    : 0;

  // Total pour l'overlay d'élimination du joueur local
  const myTotal = computePlayerTotal(myCards) + myReceivedDebt;

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

      {/* ── Notification de tour ── */}
      <AnimatePresence>
        {showNotif && !isFinished && (
          <TurnNotification
            key={notifMountKey}
            isMe={myTurn}
            myName={playerName}
            currentName={currentPlayer?.name ?? ""}
            onDismiss={() => { if (notifTimeout.current) clearTimeout(notifTimeout.current); showNotifRef.current = false; setShowNotif(false); }}
          />
        )}
      </AnimatePresence>

      {/* ── Overlay élimination — pour le joueur éliminé ── */}
      <AnimatePresence>
        {showMyEliminationOverlay && (
          <EliminationPauseOverlay
            playerName={playerName}
            total={myTotal}
            threshold={ELIMINATION_THRESHOLD}
            myCardsCount={myCards.length}
            onAcknowledge={handleAcknowledge}
            isAcknowledging={isAcknowledging}
          />
        )}
      </AnimatePresence>

      {/* ── Overlay GAGNANT plein écran ── */}
      <AnimatePresence>
        {isFinished && winner !== null && pendingAck.length === 0 && (
          <WinnerOverlay
            winnerName={winner!.name}
            isMe={winner!.id === playerId}
            totalDebt={playerTotals.find(t => t.pid === winner!.id)?.total ?? 0}
            mode="multi"
            canRestart={isHost}
            onRestart={() => { setShowConfirmReset(true); }}
            onMenu={() => setShowConfirmLeave(true)}
          />
        )}
      </AnimatePresence>

      {/* ── Overlay pause — pour les autres joueurs ── */}
      <AnimatePresence>
        {gamePausedFor && (
          <GamePausedOverlay
            eliminatedName={gamePausedFor.name}
            eliminatedTotal={gamePausedForTotal}
            gameFinished={isFinished}
          />
        )}
      </AnimatePresence>

      {/* ── Notif centrale : joueur parti / expulsé ── */}
      <AnimatePresence>
        {playerLeftNotif && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className="fixed top-20 left-0 right-0 z-[88] flex justify-center px-5 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-[300px] rounded-2xl border-[3px] overflow-hidden"
              style={{
                background: playerLeftNotif.wasKicked
                  ? "linear-gradient(135deg, #1c0808 0%, #3b1010 100%)"
                  : "linear-gradient(135deg, #081828 0%, #0f2848 100%)",
                boxShadow: `6px 6px 0px #000, 0 0 28px ${playerLeftNotif.wasKicked ? "rgba(239,68,68,0.28)" : "rgba(59,130,246,0.25)"}`,
                borderColor: playerLeftNotif.wasKicked ? "#ef4444" : "#3b82f6",
              }}
            >
              {/* Bande titre */}
              <div
                className="w-full py-2 px-4 flex items-center gap-2"
                style={{
                  background: playerLeftNotif.wasKicked ? "rgba(239,68,68,0.22)" : "rgba(59,130,246,0.2)",
                  borderBottom: `2px solid ${playerLeftNotif.wasKicked ? "rgba(239,68,68,0.35)" : "rgba(59,130,246,0.3)"}`,
                }}
              >
                {playerLeftNotif.wasKicked
                  ? <UserX className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  : <LogOut className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                }
                <span
                  style={{ ...FONT_BANGERS, fontSize: "0.75rem", letterSpacing: "0.12em" }}
                  className={playerLeftNotif.wasKicked ? "text-red-400" : "text-blue-400"}
                >
                  {playerLeftNotif.wasKicked ? "JOUEUR EXPULSÉ" : "JOUEUR PARTI"}
                </span>
                {/* Bouton fermer */}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => { if (playerLeftTimeout.current) clearTimeout(playerLeftTimeout.current); setPlayerLeftNotif(null); }}
                  className="w-6 h-6 bg-white/10 border border-white/15 rounded-full flex items-center justify-center flex-shrink-0 ml-auto"
                >
                  <X className="w-3 h-3 text-white/50" />
                </motion.button>
              </div>
              {/* Corps */}
              <div className="px-4 py-2.5 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl border-[2px] border-black flex items-center justify-center flex-shrink-0"
                  style={{ background: playerLeftNotif.wasKicked ? "rgba(239,68,68,0.18)" : "rgba(59,130,246,0.18)" }}
                >
                  <User className={`w-4 h-4 ${playerLeftNotif.wasKicked ? "text-red-400" : "text-blue-400"}`} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.04em", lineHeight: 1.15 }}
                    className={`truncate ${playerLeftNotif.wasKicked ? "text-red-300" : "text-blue-300"}`}
                  >
                    {playerLeftNotif.playerName}
                  </span>
                  <span style={FONT_FREDOKA} className="text-white/50 text-xs leading-tight">
                    {playerLeftNotif.wasKicked ? "a été expulsé de la partie" : "a quitté la partie"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal d'expulsion (host) ── */}
      <AnimatePresence>
        {showKickModal && session && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[92] flex items-center justify-center px-5"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
          >
            <motion.div
              initial={{ scale: 0.84, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.87, y: 14, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="w-full max-w-xs rounded-3xl border-[4px] border-black overflow-hidden"
              style={{
                background: "linear-gradient(160deg, #1a0808 0%, #3b0f0f 60%, #1a0808 100%)",
                boxShadow: "8px 8px 0px #000, 0 0 40px rgba(239,68,68,0.35)",
                borderColor: "#ef4444",
              }}
            >
              {/* Titre */}
              <div
                className="w-full py-2.5 px-4 flex items-center gap-2 border-b-[2px]"
                style={{ background: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.35)" }}
              >
                <UserX className="w-4 h-4 text-red-400" />
                <span style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.08em" }} className="text-red-300 flex-1">
                  EXPULSER UN JOUEUR
                </span>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setShowKickModal(false)}
                  className="w-7 h-7 bg-white/10 border-[2px] border-white/15 rounded-full flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5 text-white/50" />
                </motion.button>
              </div>

              {/* Liste des joueurs */}
              <div className="px-4 py-3 flex flex-col gap-2 max-h-64 overflow-y-auto">
                {session.players
                  .filter(p => p.id !== playerId) // Exclure l'host
                  .map(p => {
                    const isElim = (session.eliminatedPlayers ?? []).includes(p.id);
                    return (
                      <motion.button
                        key={p.id}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleKick(p.id)}
                        disabled={isKicking}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border-[2px] border-black text-left"
                        style={{
                          background: isElim ? "rgba(255,255,255,0.04)" : "rgba(239,68,68,0.08)",
                          borderColor: isElim ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.3)",
                          boxShadow: "3px 3px 0px rgba(0,0,0,0.5)",
                          opacity: isKicking ? 0.6 : 1,
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl border-[2px] border-black flex items-center justify-center flex-shrink-0"
                          style={{ background: isElim ? "rgba(255,255,255,0.06)" : "rgba(239,68,68,0.15)" }}
                        >
                          {isElim
                            ? <Skull className="w-4 h-4 text-white/40" />
                            : <User className="w-4 h-4 text-red-400" />
                          }
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span
                            style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.04em", lineHeight: 1.1 }}
                            className={isElim ? "text-white/40" : "text-red-300"}
                          >
                            {p.name}
                          </span>
                          {isElim && (
                            <span style={FONT_FREDOKA} className="text-white/30 text-xs">Éliminé</span>
                          )}
                        </div>
                        <UserX className={`w-4 h-4 flex-shrink-0 ${isElim ? "text-white/20" : "text-red-400"}`} />
                      </motion.button>
                    );
                  })
                }
              </div>

              {/* Footer */}
              <div className="px-4 pb-4">
                <p style={FONT_FREDOKA} className="text-white/35 text-xs text-center">
                  Le joueur expulse sera immediatement retire de la partie.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="w-full bg-[#111] border-b-4 border-yellow-400 flex items-center px-2 py-2 z-10 flex-shrink-0 gap-2">
        {/* GAUCHE : accueil + host actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowConfirmLeave(true)}
            className="w-10 h-10 bg-yellow-400 border-[3px] border-black rounded-xl flex items-center justify-center"
            style={{ boxShadow: "3px 3px 0px #000" }}
          >
            <Home className="w-4 h-4 text-black" />
          </motion.button>
          {isHost && (
            <>
              {session && session.players.filter(p => p.id !== playerId).length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowKickModal(true)}
                  className="w-10 h-10 bg-red-600 border-[3px] border-black rounded-xl flex items-center justify-center"
                  style={{ boxShadow: "3px 3px 0px #000" }}
                  title="Expulser un joueur"
                >
                  <UserX className="w-4 h-4 text-white" />
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowConfirmReset(true)}
                className="w-10 h-10 bg-[#1565C0] border-[3px] border-black rounded-xl flex items-center justify-center"
                style={{ boxShadow: "3px 3px 0px #000" }}
              >
                <Shuffle className="w-4 h-4 text-white" />
              </motion.button>
            </>
          )}
        </div>

        {/* CENTRE : Limite de ticket */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className="flex flex-col items-center px-3 py-1 rounded-xl border-[2px]"
            style={{
              borderColor: amEliminated ? "rgba(239,68,68,0.5)" : "rgba(234,179,8,0.45)",
              background:  amEliminated ? "rgba(239,68,68,0.12)" : "rgba(234,179,8,0.10)",
              boxShadow: "2px 2px 0px rgba(0,0,0,0.5)",
            }}
          >
            <span style={{ ...FONT_FREDOKA, fontSize: "0.48rem" }} className="text-white/40 uppercase tracking-widest leading-none">
              Limite
            </span>
            <span
              style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.06em" }}
              className={amEliminated ? "text-red-400" : "text-yellow-400"}
            >
              {formatPrice(ELIMINATION_THRESHOLD)}
            </span>
          </div>
        </div>

        {/* DROITE : Cartes piochées */}
        <div className="flex-shrink-0">
          <div
            className="flex flex-col items-center px-3 py-1 rounded-xl border-[2px] border-white/15 bg-white/5"
            style={{ boxShadow: "2px 2px 0px rgba(0,0,0,0.4)" }}
          >
            <span style={{ ...FONT_FREDOKA, fontSize: "0.48rem" }} className="text-white/35 uppercase tracking-widest leading-none">
              Piochées
            </span>
            <span style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.08em" }} className="leading-none">
              <span className="text-white/75">{drawnCount}</span>
              <span className="text-white/30">/{deckTotal}</span>
            </span>
          </div>
        </div>
      </div>

      <PoliceTape />

      {/* ── Micro-barre de progression du deck ── */}
      {deckTotal > 0 && (
        <div className="w-full h-[3px] bg-white/6 flex-shrink-0">
          <motion.div
            className="h-full"
            style={{
              background: drawnCount / deckTotal >= 0.85
                ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                : "linear-gradient(90deg, #1565C0, #22c55e)",
              width: `${(drawnCount / deckTotal) * 100}%`,
            }}
            animate={{ width: `${(drawnCount / deckTotal) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      )}

      {/* ── Notification spectateur : transfert T3 — bulle centrale non-bloquante ── */}
      <AnimatePresence>
        {showT3SpectatorNotif && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 8 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            className="fixed inset-0 z-[85] flex items-center justify-center px-6 pointer-events-none"
          >
            <div
              className="pointer-events-auto relative w-full max-w-[300px] rounded-3xl border-[4px] border-black overflow-hidden"
              style={{
                background: "linear-gradient(160deg, #1a0a2e 0%, #2d0a4e 60%, #1a0526 100%)",
                boxShadow: "8px 8px 0px #000, 0 0 36px rgba(236,72,153,0.3)",
                borderColor: "#EC4899",
              }}
            >
              {/* Bouton X fermer */}
              <motion.button
                whileTap={{ scale: 0.88 } as any}
                onClick={() => setShowT3SpectatorNotif(null)}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full border-[2px] border-black flex items-center justify-center z-10"
                style={{ background: "rgba(255,255,255,0.14)", boxShadow: "2px 2px 0px #000" }}
              >
                <X className="w-4 h-4 text-white/70" />
              </motion.button>

              {/* Bande décorative haut */}
              <div
                className="w-full py-2 flex items-center justify-center gap-2"
                style={{ background: "rgba(236,72,153,0.22)", borderBottom: "2px solid rgba(236,72,153,0.35)" }}
              >
                <Mail className="w-3.5 h-3.5 text-pink-400" />
                <span style={{ ...FONT_BANGERS, fontSize: "0.72rem", letterSpacing: "0.12em" }} className="text-pink-300">
                  TRANSFERT DE TICKET
                </span>
                <Mail className="w-3.5 h-3.5 text-pink-400" />
              </div>

              {/* Contenu */}
              <div className="px-5 py-4 flex flex-col items-center gap-2.5 text-center">
                {/* Icône animée */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-2xl border-[3px] border-pink-400 flex items-center justify-center"
                  style={{ background: "rgba(236,72,153,0.18)", boxShadow: "3px 3px 0px #000" }}
                >
                  <ArrowRight className="w-6 h-6 text-pink-400" />
                </motion.div>

                {/* Noms */}
                <div className="flex flex-col gap-0.5">
                  <span
                    style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.04em", lineHeight: 1 }}
                    className="text-pink-300"
                  >
                    {showT3SpectatorNotif.senderName}
                  </span>
                  <span style={FONT_FREDOKA} className="text-white/50 text-xs">
                    envoie un ticket à
                  </span>
                  <span
                    style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.04em", lineHeight: 1 }}
                    className="text-yellow-300"
                  >
                    {showT3SpectatorNotif.receiverName}
                  </span>
                </div>

                {/* Hint auto-close */}
                <motion.div
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pink-500/20"
                  style={{ background: "rgba(236,72,153,0.07)" }}
                >
                  <Clock className="w-3 h-3 text-pink-400/60" />
                  <span style={FONT_FREDOKA} className="text-pink-300/55 text-[0.65rem]">
                    Se ferme à la fin du tour
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bannière élimination personnelle ── */}
      <AnimatePresence mode="wait">
        {amEliminated && (
          <EliminationBanner
            key="elim-banner"
            name={playerName}
            threshold={ELIMINATION_THRESHOLD}
            activePlayers={activePlayers.length}
          />
        )}
      </AnimatePresence>

      {/* ── Sub-header : joueur actif + dropdown + historique ── */}
      <div className="px-4 pt-1.5 pb-1 flex items-start justify-between gap-2 flex-shrink-0 relative">
        {/* Overlay fermeture dropdowns */}
        {(showPlayerDropdown || showHistoryPanel) && (
          <div
            className="fixed inset-0 z-[28]"
            onClick={() => { setShowPlayerDropdown(false); setShowHistoryPanel(false); }}
          />
        )}

        {/* Left: bouton joueur actif + dropdown */}
        <div className="relative flex-1 min-w-0 z-[29]">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowPlayerDropdown(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-[2px] w-full text-left"
            style={{
              borderColor: myTurn ? "rgba(59,130,246,0.9)" : amEliminated ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.15)",
              background: myTurn ? "rgba(59,130,246,0.18)" : amEliminated ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.06)",
              boxShadow: myTurn ? "2px 2px 0px rgba(0,0,0,0.5), 0 0 20px rgba(59,130,246,0.6), 0 0 40px rgba(59,130,246,0.25)" : "2px 2px 0px rgba(0,0,0,0.5)",
            }}
          >
            {amEliminated
              ? <Skull className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              : myTurn
              ? <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Target className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" />
                </motion.div>
              : <User className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
            }
            <motion.span
              style={{ ...FONT_BANGERS, fontSize: myTurn ? "1rem" : "0.92rem", letterSpacing: "0.05em" }}
              className={`flex-1 truncate leading-none ${
                amEliminated ? "text-red-300" : myTurn ? "text-white" : "text-white/55"
              }`}
              animate={myTurn ? { opacity: [1, 0.05, 1], scale: [1, 1.05, 1], textShadow: ["0 0 0px transparent", "0 0 18px rgba(147,197,253,1)", "0 0 0px transparent"] } : { opacity: 1 }}
              transition={myTurn ? { duration: 0.42, repeat: Infinity, ease: "easeInOut" } : {}}
            >
              {currentPlayer?.name ?? "..."}
              {myTurn && <span className="text-blue-200/80 text-[0.75rem]"> (toi)</span>}
            </motion.span>
            <ChevronDown
              className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
                showPlayerDropdown ? "rotate-180" : ""
              } ${myTurn ? "text-blue-400/55" : "text-white/25"}`}
            />
          </motion.button>

          {/* Dropdown liste joueurs */}
          <AnimatePresence>
            {showPlayerDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="absolute top-full mt-1.5 left-0 z-[30] rounded-2xl border-[2px] overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, #0f1f54 0%, #16063a 100%)",
                  boxShadow: "5px 5px 0px #000, 0 0 24px rgba(0,0,0,0.8)",
                  borderColor: "rgba(251,191,36,0.22)",
                  minWidth: "200px",
                  maxWidth: "260px",
                }}
              >
                <div className="px-3 py-1.5 border-b border-white/8">
                  <span style={{ ...FONT_BANGERS, fontSize: "0.68rem", letterSpacing: "0.1em" }} className="text-white/30 uppercase">
                    Ordre de jeu
                  </span>
                </div>
                <div className="py-1">
                  {session.turnOrder.map((pid, idx) => {
                    const player = session.players.find(p => p.id === pid);
                    if (!player) return null;
                    const isElim   = eliminated.includes(pid);
                    const isActive = idx === session.currentTurnIndex && !isFinished;
                    const isMe     = pid === playerId;
                    const pTotal   = playerTotals.find(t => t.pid === pid)?.total ?? 0;
                    const isLeader = !isElim && pTotal === minTotal && drawnCount > 0 && activePlayers.length > 1;
                    // Couleur : bleu pour moi, palette tournante pour les autres
                    const pColor = isMe
                      ? MY_COLOR
                      : PLAYER_COLOR_PALETTE[idx % PLAYER_COLOR_PALETTE.length];
                    return (
                      <div
                        key={pid}
                        className="flex items-center justify-between px-3 py-2 border-b border-white/5 last:border-0"
                        style={{
                          background: isElim
                            ? "rgba(239,68,68,0.04)"
                            : isMe && isActive
                            ? "rgba(59,130,246,0.22)"
                            : isActive
                            ? pColor.bg
                            : isMe
                            ? "rgba(59,130,246,0.07)"
                            : "transparent",
                          borderLeft: `3px solid ${isElim ? "rgba(239,68,68,0.2)" : isMe && isActive ? "rgba(96,165,250,0.85)" : pColor.border}`,
                          boxShadow: isMe && isActive ? "inset 0 0 0 1px rgba(96,165,250,0.18)" : undefined,
                        }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                            {isElim
                              ? <Skull className="w-3 h-3 text-red-400/55" />
                              : isActive
                              ? <motion.div
                                  animate={isMe ? { opacity: [1, 0.2, 1], scale: [1, 0.85, 1] } : {}}
                                  transition={isMe ? { duration: 0.65, repeat: Infinity, ease: "easeInOut" } : {}}
                                >
                                  <Target className="w-3.5 h-3.5" style={{ color: isMe ? "#60a5fa" : pColor.dot }} />
                                </motion.div>
                              : isLeader
                              ? <Trophy className="w-3 h-3 text-yellow-300/65" />
                              : pid === session.hostId
                              ? <Crown className="w-3 h-3" style={{ color: pColor.dot, opacity: 0.6 }} />
                              : <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: pColor.dot, opacity: 0.55 }} />
                            }
                          </div>
                          <motion.span
                            style={{
                              ...(isMe && isActive ? FONT_BANGERS : FONT_FREDOKA),
                              color: isElim
                                ? undefined
                                : isMe && isActive
                                ? "#ffffff"
                                : pColor.text,
                              fontSize: isMe && isActive ? "1.05rem" : "0.8rem",
                              letterSpacing: isMe && isActive ? "0.06em" : 0,
                            }}
                            className={`truncate leading-none ${
                              isElim ? "text-red-400/45 line-through" : ""
                            }`}
                            animate={isMe && isActive
                              ? { opacity: [1, 0.05, 1], scale: [1, 1.06, 1], textShadow: ["0 0 0px transparent", "0 0 16px rgba(147,197,253,1)", "0 0 0px transparent"] }
                              : { opacity: isElim ? 0.45 : 1, scale: 1 }
                            }
                            transition={isMe && isActive
                              ? { duration: 0.42, repeat: Infinity, ease: "easeInOut" }
                              : {}
                            }
                          >
                            {player.name}
                            {isMe && !isActive && <span style={{ opacity: 0.4 }}> ★</span>}
                          </motion.span>
                        </div>
                        {isElim ? (
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            <span style={{ ...FONT_BANGERS, fontSize: "0.65rem" }} className="text-red-400/40">ÉLIM.</span>
                            <span style={FONT_FREDOKA} className="text-white/20 text-[0.6rem]">
                              {formatPrice(pTotal)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end flex-shrink-0 ml-2">
                            <motion.span
                              key={pTotal}
                              initial={{ scale: 1.1 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2 }}
                              style={{ ...FONT_BANGERS, fontSize: "0.8rem", letterSpacing: "0.03em", color: isActive ? pColor.text : "rgba(255,255,255,0.35)" }}
                            >
                              {formatPrice(pTotal)}
                            </motion.span>
                            {(session.playerCards?.[pid]?.length ?? 0) > 0 && (
                              <span style={FONT_FREDOKA} className="text-white/20 text-[0.55rem] leading-none">
                                {session.playerCards?.[pid]?.length ?? 0} carte{(session.playerCards?.[pid]?.length ?? 0) > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: bouton Historique — même hauteur que le dropdown */}
        <div className="relative flex-shrink-0 z-[29]">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { setShowHistoryPanel(v => !v); setShowPlayerDropdown(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-[2px] text-left"
            style={{
              borderColor: showHistoryPanel ? "rgba(251,191,36,0.7)" : "rgba(255,255,255,0.15)",
              background:  showHistoryPanel ? "rgba(251,191,36,0.14)" : "rgba(255,255,255,0.06)",
              boxShadow: showHistoryPanel ? "2px 2px 0px rgba(0,0,0,0.5), 0 0 14px rgba(251,191,36,0.2)" : "2px 2px 0px rgba(0,0,0,0.5)",
            }}
          >
            <History className={`w-3.5 h-3.5 flex-shrink-0 ${showHistoryPanel ? "text-yellow-400" : "text-white/35"}`} />
            <span
              style={{ ...FONT_BANGERS, fontSize: "0.82rem", letterSpacing: "0.06em" }}
              className={showHistoryPanel ? "text-yellow-300 leading-none" : "text-white/35 leading-none"}
            >
              HISTORIQUE
            </span>
            <ChevronDown
              className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${showHistoryPanel ? "rotate-180 text-yellow-400/60" : "text-white/20"}`}
            />
          </motion.button>

          {/* Panel historique — dropdown */}
          <AnimatePresence>
            {showHistoryPanel && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute top-full mt-1.5 right-0 z-[30] rounded-2xl border-[2px] overflow-hidden flex flex-col"
                style={{
                  background: "linear-gradient(160deg, #0f1f54 0%, #16063a 100%)",
                  boxShadow: "5px 5px 0px #000, 0 0 24px rgba(0,0,0,0.8)",
                  borderColor: "rgba(251,191,36,0.22)",
                  width: "min(82vw, 300px)",
                  maxHeight: "55dvh",
                }}
              >
                {/* Titre */}
                <div className="px-3 py-2 border-b border-yellow-400/15 flex items-center gap-2 flex-shrink-0">
                  <ListOrdered className="w-3.5 h-3.5 text-yellow-400/60" />
                  <span style={{ ...FONT_BANGERS, fontSize: "0.75rem", letterSpacing: "0.1em" }} className="text-yellow-400/70 uppercase flex-1">
                    Journal de partie
                  </span>
                  <span style={FONT_FREDOKA} className="text-white/25 text-[0.6rem]">
                    {session.drawn.length} action{session.drawn.length > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Liste des événements */}
                <div className="overflow-y-auto flex-1 py-1">
                  {session.drawn.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-6">
                      <History className="w-8 h-8 text-white/12" />
                      <p style={FONT_FREDOKA} className="text-white/25 text-xs text-center">Aucune carte piochée pour l'instant…</p>
                    </div>
                  ) : (
                    (() => {
                      // Map cardId → playerId
                      const cardOwnerMap = new Map<number, string>();
                      for (const [pid, cards] of Object.entries(session.playerCards ?? {})) {
                        for (const c of (cards as number[])) cardOwnerMap.set(c, pid);
                      }
                      // Map cardId → receiverName (T3)
                      const cardReceiverMap = new Map<number, string>();
                      for (const [pid, received] of Object.entries(session.playerReceivedCards ?? {})) {
                        for (const c of (received as number[])) {
                          const receiver = session.players.find(p => p.id === pid);
                          if (receiver) cardReceiverMap.set(c, receiver.name);
                        }
                      }

                      return (
                        <div className="flex flex-col">
                          {session.drawn.map((cardNum, i) => {
                            const ownerId = cardOwnerMap.get(cardNum);
                            const owner = session.players.find(p => p.id === ownerId);
                            const cfg = getCardConfig(cardNum);
                            const net = drawerNetAmount(cfg);
                            const nextAmt = nextPlayerAmount(cfg);
                            const receiverName = cardReceiverMap.get(cardNum) ?? "";
                            const isElim = (session.eliminatedPlayers ?? []).includes(ownerId ?? "");
                            const isMe = ownerId === playerId;
                            // Couleur selon type
                            const rowColor = cfg.cardType === 1
                              ? { dot: "#DC2626", text: "text-red-300", bg: "rgba(220,38,38,0.07)" }
                              : cfg.cardType === 2
                              ? { dot: "#16A34A", text: "text-green-300", bg: "rgba(22,163,74,0.07)" }
                              : { dot: "#7C3AED", text: "text-purple-300", bg: "rgba(124,58,237,0.07)" };

                            return (
                              <div
                                key={`hist-${i}-${cardNum}`}
                                className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 last:border-0"
                                style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}
                              >
                                {/* Index */}
                                <span style={{ ...FONT_BANGERS, fontSize: "0.6rem" }} className="text-white/20 w-4 text-right flex-shrink-0">
                                  {i + 1}
                                </span>
                                {/* Dot type */}
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: rowColor.dot }} />
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span style={{ ...FONT_BANGERS, fontSize: "0.7rem", letterSpacing: "0.04em" }} className={`${isMe ? "text-blue-300" : "text-white/70"} leading-none`}>
                                      {isMe ? "Toi" : (owner?.name ?? "?")}
                                    </span>
                                    {isElim && <Skull className="w-2.5 h-2.5 text-red-400/50 flex-shrink-0" />}
                                    <span style={FONT_FREDOKA} className={`text-[0.6rem] ${rowColor.text} leading-none`}>
                                      #{String(cardNum).padStart(3, "0")}
                                    </span>
                                  </div>
                                  {cfg.cardType === 3 && receiverName && (
                                    <div className="flex items-center gap-0.5 mt-0.5">
                                      <ArrowRight className="w-2.5 h-2.5 text-purple-400/60 flex-shrink-0" />
                                      <span style={{ ...FONT_FREDOKA, fontSize: "0.58rem" }} className="text-purple-300/60 leading-none truncate">
                                        → {receiverName} +{formatPrice(nextAmt)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {/* Montant */}
                                <span style={{ ...FONT_BANGERS, fontSize: "0.7rem", letterSpacing: "0.03em" }} className={`flex-shrink-0 ${net < 0 ? "text-green-400" : "text-red-400"}`}>
                                  {net >= 0 ? "+" : ""}{formatPrice(net)}
                                </span>
                              </div>
                            );
                          })}

                          {/* Joueurs éliminés */}
                          {(session.eliminatedPlayers ?? []).length > 0 && (
                            <>
                              <div className="px-3 py-1 border-t border-red-500/15 flex items-center gap-1.5 mt-1">
                                <Skull className="w-3 h-3 text-red-400/50" />
                                <span style={{ ...FONT_BANGERS, fontSize: "0.62rem", letterSpacing: "0.08em" }} className="text-red-400/50 uppercase">
                                  Éliminés
                                </span>
                              </div>
                              {(session.eliminatedPlayers ?? []).map(pid => {
                                const p = session.players.find(pl => pl.id === pid);
                                const pTotal = playerTotals.find(t => t.pid === pid)?.total ?? 0;
                                return (
                                  <div key={pid} className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 last:border-0">
                                    <Skull className="w-2.5 h-2.5 text-red-400/50 flex-shrink-0" />
                                    <span style={{ ...FONT_BANGERS, fontSize: "0.72rem" }} className="text-red-300/60 flex-1 truncate leading-none">
                                      {pid === playerId ? "Toi" : (p?.name ?? "?")}
                                    </span>
                                    <span style={{ ...FONT_BANGERS, fontSize: "0.7rem" }} className="text-red-400/60 flex-shrink-0">
                                      {formatPrice(pTotal)}
                                    </span>
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Zone carte + bouton piocher ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-2 pb-1 min-h-0">

        {/* Bulle "carte précédente" — bouton pour voir la carte du joueur précédent */}
        <AnimatePresence>
          {!isFinished && bubbleCard !== null && (

            <motion.button
              key="bubble-prev-card"
              initial={{ opacity: 0, y: -8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 340, damping: 22 }}
              whileTap={{ scale: 0.93 } as any}
              onClick={() => setShowPrevCard(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-[2px] border-yellow-400"
              style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #1a2a70 50%, #312e81 100%)",
                boxShadow: "3px 3px 0px #000, 0 0 14px rgba(251,191,36,0.22)",
              }}
            >
              <motion.div
                animate={{ x: [-3, 0, -3] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowLeft className="w-4 h-4 text-yellow-400" style={{ strokeWidth: 2.5 }} />
              </motion.div>
              <span style={{ ...FONT_BANGERS, fontSize: "0.88rem", letterSpacing: "0.08em" }} className="text-yellow-300">
                CARTE PRÉCÉDEMMENT JOUÉE
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Wrapper qui aligne la carte et les boutons sur la même largeur */}
        <div className="flex flex-col gap-2 items-stretch" style={{ width: "min(calc(50dvh * 5 / 7), 257px)" }}>
        {/* Carte */}
        <div className="relative flex-shrink-0" style={{ aspectRatio: "5/7", perspective: "1200px" }}>
          <AnimatePresence mode="wait">
            {isFinished && !winner && pendingAck.length === 0 ? (
              /* Deck épuisé sans gagnant clair (cas rare) */
              <motion.div
                key="gameover-nodeck"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 rounded-3xl border-[5px] border-black flex flex-col items-center justify-center gap-3 px-4"
                style={{ background: "linear-gradient(135deg, #FFD700, #FCD34D)", boxShadow: "8px 8px 0px #000" }}
              >
                <Trophy className="w-14 h-14 text-black" />
                <div style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.06em" }} className="text-black text-center">
                  TOUTES LES CARTES PIOCHÉES !
                </div>
                <p style={FONT_FREDOKA} className="text-black/60 text-xs text-center">
                  {isHost ? "Utilise le bouton mélanger pour rembattre." : "Le host peut rembattre le deck."}
                </p>
              </motion.div>
            ) : session.lastCard !== null && showCard && currentPlayerHasDrawn ? (
              <motion.div
                key={`card-${session.lastCard}-${session.currentTurnIndex}`}
                initial={{ rotateY: -180, scale: 0.65, opacity: 0.5 }}
                animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                exit={{ rotateY: 180, scale: 0.65, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 22, opacity: { duration: 0.15 } }}
                className="absolute inset-0 rounded-3xl bg-white border-[5px] border-black overflow-hidden"
                style={{ boxShadow: "8px 8px 0px #000", transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
              >
                {showCardFront && !cardHiddenByViewer && !isT3Spectator
                  ? <CardFace cardNumber={session.lastCard} />
                  : <CardBack />
                }
                {showCardFront && lastCardBy && !cardHiddenByViewer && !isT3Spectator && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                    <div className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                      <span style={FONT_FREDOKA} className="text-white/80 text-xs">{lastCardBy.name}</span>
                    </div>
                  </div>
                )}
                {/* Bouton oeil — masquage local pour les non-actifs (masqué pour T3 spectateurs) */}
                {showCardFront && !myTurn && !isT3Spectator && (
                  <motion.button
                    whileTap={{ scale: 0.88 } as any}
                    onClick={() => setCardHiddenByViewer(v => !v)}
                    className="absolute top-2 right-2 w-9 h-9 rounded-xl border-[2px] border-black flex items-center justify-center z-20"
                    style={{
                      background: cardHiddenByViewer ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.6)",
                      boxShadow: "2px 2px 0px #000",
                    }}
                    title={cardHiddenByViewer ? "Voir la carte" : "Masquer la carte"}
                  >
                    {cardHiddenByViewer
                      ? <Eye className="w-4 h-4 text-black" />
                      : <EyeOff className="w-4 h-4 text-white" />
                    }
                  </motion.button>
                )}
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
        {!isFinished && (
          <div className="flex gap-4 w-full">
            {/* Bouton Mes tickets */}
            <div className="relative flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMyTickets(true)}
                className="h-full min-h-[60px] px-3 border-[4px] border-black rounded-2xl flex flex-col items-center justify-center gap-0.5 relative"
                style={{
                  background: amEliminated ? "#dc2626" : "#22c55e",
                  boxShadow: "5px 5px 0px #000",
                }}
              >
                {amEliminated ? <Skull className="w-5 h-5 text-white" /> : <HandIcon size={18} />}
                <span style={{ ...FONT_BANGERS, fontSize: "0.55rem", letterSpacing: "0.04em" }} className="text-white leading-none">
                  TICKETS
                </span>
                {myCards.length > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 border-[2px] border-black rounded-full flex items-center justify-center">
                    <span style={{ ...FONT_BANGERS, fontSize: "0.6rem" }} className="text-black leading-none">
                      {myCards.length > 99 ? "99" : myCards.length}
                    </span>
                  </div>
                )}
              </motion.button>
            </div>

            {/* Bouton piocher / envoyer T3 / terminer mon tour */}
            <div className="relative flex-1">
              {myTurn && !amEliminated && (
                <motion.div
                  className="absolute inset-0 rounded-2xl -z-10"
                  style={{
                    background: pendingT3 ? "#EC4899"
                      : (hasDrawnThisTurn && !showTaxNotif) ? "#22c55e"
                      : "#FFD700",
                  }}
                  animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              )}
              <motion.button
                whileTap={myTurn && !amEliminated ? { scale: 0.95, y: 2 } as any : {}}
                onClick={
                  pendingT3 ? handleSendT3
                  : hasDrawnThisTurn ? handleEndTurn
                  : handleDraw
                }
                disabled={
                  amEliminated || !myTurn || isDrawing || isEndingTurn || isSendingT3
                  || (hasDrawnThisTurn && !pendingT3 && showTaxNotif !== null)
                  || pendingAck.length > 0
                }
                className="w-full py-3.5 border-[5px] border-black rounded-2xl relative overflow-hidden disabled:cursor-not-allowed transition-colors"
                style={{
                  ...FONT_BANGERS,
                  letterSpacing: "0.05em",
                  fontSize: "0.95rem",
                  background: amEliminated
                    ? "#7f1d1d"
                    : pendingT3
                    ? "#EC4899"
                    : (hasDrawnThisTurn && !showTaxNotif)
                    ? "#22c55e"
                    : (hasDrawnThisTurn && showTaxNotif)
                    ? "rgba(255,255,255,0.06)"
                    : myTurn
                    ? "#FFD700"
                    : "rgba(255,255,255,0.06)",
                  color: amEliminated
                    ? "#fca5a5"
                    : pendingT3
                    ? "#fff"
                    : (hasDrawnThisTurn && !showTaxNotif)
                    ? "#fff"
                    : (hasDrawnThisTurn && showTaxNotif)
                    ? "rgba(255,255,255,0.28)"
                    : myTurn
                    ? "#000"
                    : "rgba(255,255,255,0.22)",
                  boxShadow:
                    pendingT3
                      ? "7px 7px 0px #000, 0 0 20px rgba(236,72,153,0.3)"
                      : myTurn && !amEliminated && !(hasDrawnThisTurn && showTaxNotif && !pendingT3)
                      ? "7px 7px 0px #000"
                      : "3px 3px 0px rgba(0,0,0,0.3)",
                }}
              >
                {myTurn && !amEliminated && !pendingT3 && !(hasDrawnThisTurn && showTaxNotif) && (
                  <motion.div
                    className="absolute inset-0 w-1/3 skew-x-[-20deg]"
                    style={{ background: hasDrawnThisTurn ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.20)" }}
                    animate={{ x: ["-100%", "400%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
                  />
                )}
                {pendingT3 && !isSendingT3 && (
                  <motion.div
                    className="absolute inset-0 w-1/3 skew-x-[-20deg]"
                    style={{ background: "rgba(255,255,255,0.18)" }}
                    animate={{ x: ["-100%", "400%"] }}
                    transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
                  />
                )}
                <span className="flex items-center justify-center gap-2 relative z-10 whitespace-nowrap overflow-hidden px-2">
                  {amEliminated ? (
                    <><Skull className="w-5 h-5" /> ÉLIMINÉ</>
                  ) : pendingT3 ? (
                    <>
                      <Mail className="w-5 h-5 flex-shrink-0" />
                      <span>
                        {isSendingT3 ? "ENVOI EN COURS..." : `ENVOYER LE TICKET`}
                      </span>
                      {!isSendingT3 && <ArrowRight className="w-4 h-4 flex-shrink-0" />}
                    </>
                  ) : hasDrawnThisTurn && showTaxNotif ? (
                    <span style={{ fontSize: "0.78rem" }} className="text-center leading-snug opacity-60">
                      Ferme la notification d'abord
                    </span>
                  ) : hasDrawnThisTurn ? (
                    <><CheckCircle className="w-5 h-5" /> {isEndingTurn ? "EN COURS..." : "TERMINER MON TOUR"}</>
                  ) : myTurn && pendingAck.length > 0 && !hasDrawnThisTurn ? (
                    <span style={{ fontSize: "0.78rem" }} className="text-center leading-snug opacity-60">
                      En pause — élimination en cours…
                    </span>
                  ) : myTurn ? (
                    <>{isDrawing ? "PIOCHE..." : "RECEVOIR UN TICKET"}</>
                  ) : (
                    <span className="flex items-center gap-1.5 flex-wrap justify-center leading-snug">
                      <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>Attends,</span>
                      <span style={{ ...FONT_BANGERS, color: "#FFD700", opacity: 0.75, fontSize: "1rem" }}>
                        {currentPlayer?.name}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>est en train de jouer</span>
                    </span>
                  )}
                </span>
              </motion.button>
            </div>
          </div>
        )}

        </div>{/* /wrapper */}

        {/* Erreur */}
        {error && (
          <div style={FONT_FREDOKA} className="text-red-400 text-xs text-center px-4">
            {error}
          </div>
        )}
      </div>

      <div
        className="w-full bg-[#111] py-1 text-center flex-shrink-0"
        style={{ paddingBottom: "calc(0.25rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <span style={FONT_FREDOKA} className="text-yellow-400/40 text-[0.65rem] tracking-widest">
          © TICKET CRICKET 2026
        </span>
      </div>

      {/* ── Aperçu carte précédente ── */}
      <AnimatePresence>
        {showPrevCard && bubbleCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-5 px-6"
            style={{ background: "rgba(0,0,0,0.92)" }}
            onClick={() => setShowPrevCard(false)}
          >
            <motion.div
              initial={{ scale: 0.75, rotateY: -30 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0.75, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-0"
            >
              {/* Bulle BD style — "Pioché par {joueur}" — attachée au-dessus de la carte */}
              <div
                className="relative px-5 py-2.5 rounded-2xl border-[3px] border-black flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #fff 0%, #f0f0ff 100%)",
                  boxShadow: "4px 4px 0px #000",
                }}
              >
                <span style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.06em" }} className="text-black whitespace-nowrap">
                  Pioché par{" "}
                  <span className="text-blue-600">{bubbleCard.playerName}</span>
                </span>
                {/* Pointe de la bulle vers le bas (vers la carte) */}
                <div
                  className="absolute -bottom-[14px] left-1/2 -translate-x-1/2"
                  style={{ width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "14px solid #000" }}
                />
                <div
                  className="absolute -bottom-[10px] left-1/2 -translate-x-1/2"
                  style={{ width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "11px solid #f0f0ff" }}
                />
              </div>

              {/* Carte */}
              <div
                className="rounded-3xl border-[5px] border-yellow-400 overflow-hidden mt-[14px]"
                style={{ width: "min(78vw, 260px)", aspectRatio: "5/7", boxShadow: "10px 10px 0px #000" }}
              >
                <CardFace cardNumber={bubbleCard.cardNum} />
              </div>
              <motion.button
                whileTap={{ scale: 0.9 } as any}
                onClick={() => setShowPrevCard(false)}
                className="mt-4 w-12 h-12 bg-red-500 border-[3px] border-black rounded-full flex items-center justify-center"
                style={{ boxShadow: "3px 3px 0px #000" }}
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Panneau "Mes tickets" ── */}
      <AnimatePresence>
        {showMyTickets && (
          <MyTicketsPanel
            cards={myCards}
            playerName={playerName}
            receivedDebt={myReceivedDebt}
            receivedCards={myReceivedCards}
            isEliminated={amEliminated}
            threshold={ELIMINATION_THRESHOLD}
            disabledCardTypes={disabledCardTypes}
            onClose={() => setShowMyTickets(false)}
            session={session}
            myPlayerId={playerId}
          />
        )}
      </AnimatePresence>

      {/* ── Modal confirmation mélange ── */}
      <AnimatePresence>
        {showConfirmReset && (
          <ConfirmResetModal
            onConfirm={handleReset}
            onCancel={() => setShowConfirmReset(false)}
            loading={isResetting}
            deckTotal={session.allowedCardIds?.length ?? deckTotal}
          />
        )}
      </AnimatePresence>

      {/* ── Notification taxe T3 (piocheur) ── */}
      <AnimatePresence>
        {showTaxNotif && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[95] flex items-center justify-center px-5"
            style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(4px)" }}
          >
            <motion.div
              initial={{ scale: 0.72, y: 40, rotate: -4 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.72, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
              className="w-full max-w-sm rounded-3xl border-[5px] border-black overflow-hidden"
              style={{
                background: "linear-gradient(160deg, #0f2d0f 0%, #1a3d10 50%, #0f1f0f 100%)",
                boxShadow: "10px 10px 0px #000, 0 0 50px rgba(34,197,94,0.3)",
                borderColor: "#22c55e",
              }}
            >
              {/* Header */}
              <div className="bg-[#22c55e] px-5 py-3 flex items-center gap-3 border-b-[4px] border-black">
                <motion.div
                  animate={{ rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                >
                  <TrendingDown className="w-6 h-6 text-black" />
                </motion.div>
                <span style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.08em" }} className="text-black flex-1">
                  RÉDUCTION OBTENUE !
                </span>
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-8 h-8 bg-black/20 rounded-xl flex items-center justify-center"
                >
                  <TrendingDown className="w-4 h-4 text-black/70" />
                </motion.div>
              </div>

              {/* Corps */}
              <div className="px-6 py-5 flex flex-col items-center gap-4">
                {/* Réduction */}
                <div className="w-full rounded-2xl border-[3px] border-green-500/40 px-5 py-4 flex items-center justify-between"
                  style={{ background: "rgba(34,197,94,0.1)" }}>
                  <div>
                    <span style={FONT_FREDOKA} className="text-green-400/70 text-xs uppercase tracking-wider block mb-0.5">
                      Taxe déduite de ta dette
                    </span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.2 }}
                      style={{ ...FONT_BANGERS, fontSize: "2rem", letterSpacing: "0.04em" }}
                      className="text-green-400 leading-none block"
                    >
                      -{formatPrice(showTaxNotif.amount)}
                    </motion.span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl border-[3px] border-green-500/40 flex items-center justify-center"
                    style={{ background: "rgba(34,197,94,0.15)" }}>
                    <motion.div
                      animate={{ rotate: [0, -12, 12, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    >
                      <TrendingDown className="w-7 h-7 text-green-400" />
                    </motion.div>
                  </div>
                </div>

                <p style={FONT_FREDOKA} className="text-white/55 text-sm text-center leading-snug">
                  En tant que piocheur d'une carte Investisseur,<br/>
                  <span className="text-green-400">tu bénéficies d'une réduction de taxe</span> sur ta propre dette.
                </p>

                <motion.button
                  whileTap={{ scale: 0.95 } as any}
                  onClick={() => setShowTaxNotif(null)}
                  className="w-full py-3.5 bg-[#22c55e] border-[4px] border-black rounded-2xl text-black flex items-center justify-center gap-2 relative overflow-hidden"
                  style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.08em", boxShadow: "5px 5px 0px #000" }}
                >
                  <motion.div
                    className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg]"
                    animate={{ x: ["-100%", "400%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
                  />
                  <CheckCircle className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">SUPER, J'AI COMPRIS !</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Notification ticket reçu T3 (joueur suivant) ── */}
      <AnimatePresence>
        {showReceivedTicketNotif && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[95] flex items-center justify-center px-5"
            style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(4px)" }}
          >
            <motion.div
              initial={{ scale: 0.72, y: 44, rotate: 3 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.72, y: 32, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 24 }}
              className="w-full max-w-sm rounded-3xl border-[5px] border-black overflow-hidden"
              style={{
                background: "linear-gradient(160deg, #2d0547 0%, #1a083d 60%, #2d0547 100%)",
                boxShadow: "10px 10px 0px #000, 0 0 50px rgba(236,72,153,0.35)",
                borderColor: "#EC4899",
              }}
            >
              {/* Header dramatique */}
              <div
                className="px-5 py-3 flex items-center gap-3 border-b-[4px] border-black"
                style={{ background: "linear-gradient(90deg, #be185d, #9d174d)" }}
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <Mail className="w-6 h-6 text-white" />
                </motion.div>
                <span style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.07em" }} className="text-white flex-1">
                  TICKET REÇU !
                </span>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Mail className="w-4 h-4 text-pink-200/60" />
                </motion.div>
              </div>

              {/* Corps */}
              <div className="px-6 py-5 flex flex-col items-center gap-4">
                {/* Expéditeur */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-pink-500/25" style={{ background: "rgba(236,72,153,0.08)" }}>
                  <User className="w-4 h-4 text-pink-400/70" />
                  <span style={FONT_FREDOKA} className="text-white/65 text-sm">
                    De la part de{" "}
                    <strong className="text-pink-300">{showReceivedTicketNotif.fromName}</strong>
                  </span>
                </div>

                {/* Montant */}
                <div
                  className="w-full rounded-2xl border-[3px] border-pink-500/40 px-5 py-4 flex items-center justify-between"
                  style={{ background: "rgba(236,72,153,0.1)" }}
                >
                  <div>
                    <span style={FONT_FREDOKA} className="text-pink-400/70 text-xs uppercase tracking-wider block mb-0.5">
                      Dette ajoutée
                    </span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.3 }}
                      style={{ ...FONT_BANGERS, fontSize: "2rem", letterSpacing: "0.04em" }}
                      className="text-red-400 leading-none block"
                    >
                      +{formatPrice(showReceivedTicketNotif.amount)}
                    </motion.span>
                  </div>
                  <div
                    className="w-14 h-14 rounded-2xl border-[3px] border-pink-500/40 flex items-center justify-center"
                    style={{ background: "rgba(236,72,153,0.15)" }}
                  >
                    <TrendingUp className="w-7 h-7 text-red-400" />
                  </div>
                </div>

                {/* Bouton confirmation */}
                <div className="relative w-full">
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-pink-500 -z-10"
                    animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.96 } as any}
                    onClick={() => setShowReceivedTicketNotif(null)}
                    className="w-full py-4 bg-pink-500 border-[4px] border-black rounded-2xl text-white flex items-center justify-center gap-2 relative overflow-hidden"
                    style={{ ...FONT_BANGERS, fontSize: "1.05rem", letterSpacing: "0.07em", boxShadow: "6px 6px 0px #000" }}
                  >
                    <motion.div
                      className="absolute inset-0 w-1/3 bg-white/15 skew-x-[-20deg]"
                      animate={{ x: ["-100%", "400%"] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
                    />
                    <CheckCircle className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">CONFIRMER LA RÉCEPTION</span>
                  </motion.button>
                </div>
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
              <p style={FONT_FREDOKA} className="text-white/50 text-sm text-center">
                Tu ne pourras plus revenir dans la partie en cours.
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
                  onClick={handleLeave}
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
    </div>
  );
}

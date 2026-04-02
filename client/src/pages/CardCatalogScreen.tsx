/**
 * CardCatalogScreen — Catalogue de référence des 324 cartes.
 * Permet de naviguer, filtrer et voir le prix/mécanisme de chaque carte.
 * Accessible via la route /catalog.
 */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "wouter";
import { Home, Search, X, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import { getCardConfig } from "@/game/utils/cardConfig";
import { GeneratedCard } from "@/game/components/GeneratedCard";
import {
  CARD_PRICES, getCardData, getCardNetAmount, computeTotal,
  MECHANIC_LABELS, MECHANIC_COLORS,
  type CardData, type CardMechanic,
} from "@/game/utils/cardPrices";
import { PoliceTape } from "@/game/ui/PoliceUI";
import ticketImg from "@/game/utils/ticketImg";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

// ── Palette par mécanisme ──────────────────────────────────────────────────────
const MECH_STYLE: Record<CardMechanic, { bg: string; border: string; label: string; emoji: string }> = {
  contravention: { bg: "#D97706", border: "#92400E", label: "Contravention", emoji: "🚨" },
  contribuable:  { bg: "#16A34A", border: "#14532D", label: "Contribuable",  emoji: "📋" },
  investisseur:  { bg: "#DB2777", border: "#BE185D", label: "Investisseur",  emoji: "💼" },
  frais_only:    { bg: "#0891B2", border: "#0E7490", label: "Frais",         emoji: "🧾" },
  bonus:         { bg: "#16A34A", border: "#14532D", label: "Bonus",         emoji: "✅" },
};

function formatPrice(n: number): string {
  const abs = Math.abs(n);
  const str = abs.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
  return n < 0 ? `- ${str}` : str;
}

// ── Miniature de carte ─────────────────────────────────────────────────────────
function CardThumb({
  cardNum,
  onClick,
  highlight,
}: {
  cardNum: number;
  onClick: () => void;
  highlight?: boolean;
}) {
  const data = getCardData(cardNum);
  const cfg  = getCardConfig(cardNum);
  const net  = getCardNetAmount(cardNum);
  const ms   = MECH_STYLE[data.mechanic];

  return (
    <motion.div
      whileHover={{ scale: 1.07, y: -2 } as any}
      whileTap={{ scale: 0.94 } as any}
      onClick={onClick}
      className="relative rounded-xl border-[3px] border-black overflow-hidden cursor-pointer"
      style={{
        aspectRatio: "5/7",
        boxShadow: highlight ? `0 0 0 3px ${ms.bg}, 4px 4px 0px #000` : "3px 3px 0px #000",
        background: "#0c1a4e",
        borderColor: highlight ? ms.bg : "#000",
      }}
    >
      <GeneratedCard card={cfg} size="xs" style={{ width: '100%', height: '100%' }} />
      {/* Overlay bas — prix net */}
      <div
        className="absolute bottom-0 left-0 right-0 py-[2px] flex flex-col items-center"
        style={{ background: ms.bg + "ee" }}
      >
        <span style={{ ...FONT_BANGERS, fontSize: "0.58rem", letterSpacing: "0.02em" }} className="text-white leading-none">
          {net >= 0 ? "+" : ""}{formatPrice(net)}
        </span>
      </div>
    </motion.div>
  );
}

// ── Vue détaillée d'une carte ─────────────────────────────────────────────────
function CardDetail({
  cardNum,
  allFiltered,
  onClose,
  onPrev,
  onNext,
}: {
  cardNum: number;
  allFiltered: number[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [zoomedIn, setZoomedIn] = useState(false);

  const data = getCardData(cardNum);
  const cfg  = getCardConfig(cardNum);
  const net  = getCardNetAmount(cardNum);
  const ms   = MECH_STYLE[data.mechanic];
  const idx  = allFiltered.indexOf(cardNum);

  useEffect(() => {
    setZoomedIn(false);
  }, [cardNum]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center px-4 gap-4"
      style={{ background: "rgba(0,0,0,0.94)" }}
      onClick={onClose}
    >
      {/* Carte + bouton zoom */}
      <motion.div
        initial={{ scale: 0.7, rotateY: -35 }}
        animate={{ scale: 1, rotateY: 0 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative flex-shrink-0"
        style={{ width: "min(72vw, 270px)", aspectRatio: "5/7" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Carte générée */}
        <div
          className="w-full h-full rounded-3xl border-[5px] border-black overflow-hidden cursor-pointer"
          style={{ boxShadow: "10px 10px 0px #000" }}
          onClick={() => setZoomedIn(true)}
        >
          <GeneratedCard card={cfg} size="md" style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Bouton + zoom — déborde en coin bas droit */}
        <motion.button
          className="absolute -bottom-4 -right-4 w-11 h-11 rounded-full border-[3px] border-black flex items-center justify-center z-20 cursor-pointer"
          style={{ background: "#FFD700", boxShadow: "3px 3px 0px #000" }}
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          onClick={() => setZoomedIn(true)}
          title="Agrandir l'image"
        >
          <Plus className="w-5 h-5 text-black" style={{ strokeWidth: 3 }} />
        </motion.button>
      </motion.div>

      {/* Fiche de données */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="w-full max-w-sm rounded-2xl border-[3px] border-black overflow-hidden"
        style={{ boxShadow: "6px 6px 0px #000" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête coloré */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: ms.bg }}
        >
          <div className="flex items-center gap-2.5">
            {/* Miniature cliquable avec badge + */}
            <motion.button
              whileTap={{ scale: 0.9 } as any}
              onClick={() => setZoomedIn(true)}
              className="relative flex-shrink-0 rounded-xl border-[2px] border-yellow-300 overflow-visible cursor-pointer"
              style={{
                width: "42px",
                aspectRatio: "5/7",
                background: "#0c1a4e",
                boxShadow: "2px 2px 0px #000",
              }}
              title="Agrandir la carte"
            >
              <div className="w-full h-full rounded-[10px] overflow-hidden">
                <GeneratedCard card={cfg} size="xs" style={{ width: '100%', height: '100%' }} />
              </div>
              {/* Badge + jaune en coin supérieur droit */}
              <motion.div
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full border-[2px] border-black flex items-center justify-center z-20"
                style={{ background: "#FFD700", boxShadow: "1px 1px 0px #000" }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.0, repeat: Infinity, ease: "easeInOut" }}
              >
                <Plus className="w-3 h-3 text-black" style={{ strokeWidth: 3 }} />
              </motion.div>
            </motion.button>

            <div>
              <div style={{ ...FONT_BANGERS, fontSize: "1.05rem", letterSpacing: "0.06em" }} className="text-white leading-none">
                {ms.emoji} {ms.label}
              </div>
              <div style={FONT_FREDOKA} className="text-white/70 text-sm leading-none mt-0.5">
                Carte #{String(cardNum).padStart(3, "0")}
              </div>
            </div>
          </div>

          {data.confirmed
            ? <CheckCircle2 className="w-5 h-5 text-white/80" />
            : <AlertCircle  className="w-5 h-5 text-yellow-300" />}
        </div>

        {/* Corps — prix net */}
        <div
          className="px-4 py-3 flex flex-col gap-2"
          style={{ background: "linear-gradient(160deg,#0c1a4e,#1a083d)" }}
        >
          {/* Montant principal */}
          <div className="flex justify-between items-center">
            <span style={FONT_FREDOKA} className="text-white/60 text-sm">Montant principal</span>
            <span
              style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.04em" }}
              className={data.isSubtraction ? "text-green-400" : "text-red-400"}
            >
              {data.isSubtraction ? "-" : "+"}{formatPrice(data.basePrice)}
            </span>
          </div>

          {/* Frais */}
          {(data.frais ?? 0) > 0 && (
            <div className="flex justify-between items-center">
              <span style={FONT_FREDOKA} className="text-cyan-400/80 text-sm">+ Frais</span>
              <span style={{ ...FONT_BANGERS, fontSize: "1.1rem" }} className="text-cyan-400">
                +{formatPrice(data.frais!)}
              </span>
            </div>
          )}

          {/* Total net */}
          <div className="border-t border-white/10 pt-2 flex justify-between items-center">
            <span style={FONT_FREDOKA} className="text-yellow-400 text-sm">Net total</span>
            <span
              style={{ ...FONT_BANGERS, fontSize: "1.5rem", letterSpacing: "0.04em" }}
              className={net < 0 ? "text-green-400" : "text-yellow-400"}
            >
              {net >= 0 ? "+" : ""}{formatPrice(net)}
            </span>
          </div>

          {/* Avertissement prix non confirmé */}
          {!data.confirmed && (
            <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-3 py-1.5 mt-1">
              <AlertCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
              <span style={FONT_FREDOKA} className="text-yellow-400/80 text-xs">
                Prix non confirmé — valeur par défaut
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Boutons navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onPrev}
          disabled={idx <= 0}
          className="w-12 h-12 bg-white/10 border-[2px] border-white/20 rounded-xl flex items-center justify-center text-white/60 disabled:opacity-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>

        <span style={FONT_FREDOKA} className="text-white/40 text-sm min-w-[5rem] text-center">
          {idx + 1} / {allFiltered.length}
        </span>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onNext}
          disabled={idx >= allFiltered.length - 1}
          className="w-12 h-12 bg-white/10 border-[2px] border-white/20 rounded-xl flex items-center justify-center text-white/60 disabled:opacity-20"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="w-12 h-12 bg-red-500 border-[3px] border-black rounded-full flex items-center justify-center ml-1"
          style={{ boxShadow: "3px 3px 0px #000" }}
        >
          <X className="w-6 h-6 text-white" />
        </motion.button>
      </motion.div>

      {/* ── Vue plein écran de la carte ── */}
      <AnimatePresence>
        {zoomedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[80] flex flex-col items-center justify-center"
            style={{ background: "rgba(0,0,0,0.97)" }}
            onClick={() => setZoomedIn(false)}
          >
            {/* Badge catégorie */}
            <motion.div
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.08 }}
              className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none"
            >
              <div
                className="px-4 py-1.5 rounded-full border-[2px] border-black flex items-center gap-2"
                style={{ background: ms.bg, boxShadow: "3px 3px 0px #000" }}
              >
                <span className="text-sm">{ms.emoji}</span>
                <span style={{ ...FONT_BANGERS, fontSize: "0.95rem", letterSpacing: "0.08em" }} className="text-white">
                  #{String(cardNum).padStart(3, "0")} — {ms.label}
                </span>
              </div>
            </motion.div>

            {/* Image agrandie */}
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="rounded-3xl border-[5px] border-black overflow-hidden"
              style={{
                width: "min(90vw, 380px)",
                aspectRatio: "5/7",
                boxShadow: "12px 12px 0px #000",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <GeneratedCard card={cfg} size="lg" style={{ width: '100%', height: '100%' }} />
            </motion.div>

            {/* Bouton fermer */}
            <motion.button
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              whileTap={{ scale: 0.9 } as any}
              onClick={() => setZoomedIn(false)}
              className="absolute bottom-8 w-14 h-14 bg-red-500 border-[4px] border-black rounded-full flex items-center justify-center"
              style={{ boxShadow: "4px 4px 0px #000" }}
            >
              <X className="w-7 h-7 text-white" />
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={FONT_FREDOKA}
              className="absolute bottom-24 text-white/25 text-xs"
            >
              Appuie n'importe où pour fermer
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────────
const ALL_MECHS: CardMechanic[] = ["contravention", "contribuable", "investisseur", "frais_only", "bonus"];
const ALL_IDS = Array.from({ length: 324 }, (_, i) => i + 1);

export function CardCatalogScreen() {
  const [, navigate] = useLocation();

  const [filter, setFilter]         = useState<CardMechanic | "all">("all");
  const [search, setSearch]         = useState("");
  const [focusedCard, setFocused]   = useState<number | null>(null);
  const [showOnlyTodo, setShowTodo] = useState(false);
  const [showOnlySub, setShowSub]   = useState(false);

  const filtered = useMemo(() => {
    return ALL_IDS.filter((id) => {
      const d = getCardData(id);
      if (filter !== "all" && d.mechanic !== filter) return false;
      if (showOnlyTodo && d.confirmed)      return false;
      if (showOnlySub  && !d.isSubtraction) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!String(id).includes(q) && !(d.note ?? "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [filter, search, showOnlyTodo, showOnlySub]);

  const totalConfirmed   = ALL_IDS.filter((id) => getCardData(id).confirmed).length;
  const totalSubtraction = ALL_IDS.filter((id) => getCardData(id).isSubtraction).length;
  const totalWithFrais   = ALL_IDS.filter((id) => (getCardData(id).frais ?? 0) > 0).length;

  const focusedIdx = focusedCard !== null ? filtered.indexOf(focusedCard) : -1;
  const goNext = () => { if (focusedIdx < filtered.length - 1) setFocused(filtered[focusedIdx + 1]); };
  const goPrev = () => { if (focusedIdx > 0) setFocused(filtered[focusedIdx - 1]); };

  return (
    <div
      className="h-[100dvh] max-w-md mx-auto flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)" }}
    >
      {/* Header */}
      <div className="w-full bg-[#111] border-b-4 border-yellow-400 flex items-center px-3 py-2.5 gap-2 flex-shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => window.history.back()}
          className="w-10 h-10 bg-yellow-400 border-[3px] border-black rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: "3px 3px 0px #000" }}
        >
          <Home className="w-5 h-5 text-black" />
        </motion.button>
        <div className="flex-1 text-center">
          <div style={{ ...FONT_BANGERS, fontSize: "1.2rem", letterSpacing: "0.08em" }} className="text-yellow-400 leading-none">
            CATALOGUE DES CARTES
          </div>
          <div style={FONT_FREDOKA} className="text-yellow-400/50 text-xs leading-none">
            {totalConfirmed} / 324 prix confirmés
          </div>
        </div>
      </div>

      <PoliceTape />

      {/* Statistiques rapides */}
      <div className="px-4 pt-3 pb-2 grid grid-cols-3 gap-2">
        {[
          { label: "Confirmés",     value: totalConfirmed,   color: "#22c55e", icon: "✅" },
          { label: "Soustractions", value: totalSubtraction, color: "#22c55e", icon: "➖" },
          { label: "Avec frais",    value: totalWithFrais,   color: "#0891B2", icon: "🧾" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border-[2px] border-black px-2 py-2 flex flex-col items-center gap-0.5"
            style={{ background: s.color + "18", borderColor: s.color + "60", boxShadow: "2px 2px 0px #000" }}
          >
            <span className="text-base leading-none">{s.icon}</span>
            <span style={{ ...FONT_BANGERS, fontSize: "1.2rem" }} className="text-white leading-none">{s.value}</span>
            <span style={FONT_FREDOKA} className="text-white/40 text-[0.6rem] leading-none text-center">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Barre de recherche */}
      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Rechercher par numéro…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border-[2px] border-white/20 bg-white/8 text-white text-sm outline-none focus:border-yellow-400/60"
            style={FONT_FREDOKA}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-white/40" />
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setFilter("all")}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg border-[2px] border-black text-xs"
          style={{
            background: filter === "all" ? "#FFD700" : "rgba(255,255,255,0.08)",
            color:      filter === "all" ? "#000"    : "rgba(255,255,255,0.5)",
            boxShadow:  "2px 2px 0px #000",
          }}
        >
          <span style={FONT_BANGERS}>TOUT ({ALL_IDS.length})</span>
        </motion.button>

        {ALL_MECHS.map((m) => {
          const ms    = MECH_STYLE[m];
          const count = ALL_IDS.filter((id) => getCardData(id).mechanic === m).length;
          if (count === 0) return null;
          return (
            <motion.button
              key={m}
              whileTap={{ scale: 0.93 }}
              onClick={() => setFilter(m)}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg border-[2px] border-black text-xs"
              style={{
                background:  filter === m ? ms.bg     : "rgba(255,255,255,0.08)",
                borderColor: filter === m ? ms.border  : "rgba(255,255,255,0.15)",
                color:       filter === m ? "#fff"    : "rgba(255,255,255,0.5)",
                boxShadow:   "2px 2px 0px #000",
              }}
            >
              <span>{ms.emoji}</span>
              <span style={FONT_BANGERS}>{ms.label} ({count})</span>
            </motion.button>
          );
        })}

        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setShowTodo(!showOnlyTodo)}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg border-[2px] border-black text-xs"
          style={{
            background:  showOnlyTodo ? "#D97706" : "rgba(255,255,255,0.08)",
            borderColor: showOnlyTodo ? "#92400E" : "rgba(255,255,255,0.15)",
            color:       showOnlyTodo ? "#fff"    : "rgba(255,255,255,0.5)",
            boxShadow:   "2px 2px 0px #000",
          }}
        >
          <span style={FONT_BANGERS}>⚠️ TODO</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setShowSub(!showOnlySub)}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg border-[2px] border-black text-xs"
          style={{
            background:  showOnlySub ? "#16A34A" : "rgba(255,255,255,0.08)",
            borderColor: showOnlySub ? "#14532D" : "rgba(255,255,255,0.15)",
            color:       showOnlySub ? "#fff"    : "rgba(255,255,255,0.5)",
            boxShadow:   "2px 2px 0px #000",
          }}
        >
          <span style={FONT_BANGERS}>✅ Soustractions</span>
        </motion.button>
      </div>

      {/* Compteur */}
      <div className="px-4 pb-1.5 flex items-center justify-between">
        <span style={FONT_FREDOKA} className="text-white/40 text-xs">
          {filtered.length} carte{filtered.length > 1 ? "s" : ""}
        </span>
        <span style={FONT_FREDOKA} className="text-yellow-400/60 text-xs">
          Total: {formatPrice(computeTotal(filtered))}
        </span>
      </div>

      {/* Grille */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <span className="text-4xl opacity-30">🔍</span>
            <p style={FONT_FREDOKA} className="text-white/30 text-center text-sm">
              Aucune carte ne correspond aux filtres.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {filtered.map((id) => (
              <CardThumb
                key={id}
                cardNum={id}
                onClick={() => setFocused(id)}
                highlight={focusedCard === id}
              />
            ))}
          </div>
        )}
      </div>

      <PoliceTape />
      <div className="w-full bg-[#111] py-1.5 text-center flex-shrink-0">
        <span style={FONT_FREDOKA} className="text-yellow-400/50 text-xs tracking-widest">
          © TICKET CRICKET 2026 — CATALOGUE
        </span>
      </div>

      {/* Vue détail */}
      <AnimatePresence>
        {focusedCard !== null && (
          <CardDetail
            cardNum={focusedCard}
            allFiltered={filtered}
            onClose={() => setFocused(null)}
            onPrev={goPrev}
            onNext={goNext}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

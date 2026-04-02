/**
 * CardCatalogScreen — Catalogue de référence des 324 cartes.
 * Permet de naviguer, filtrer et voir le prix/mécanisme de chaque carte.
 * Accessible via la route /catalog.
 */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "wouter";
import { Home, Search, X, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle2, Plus,
  Target, User, ArrowRight, Banknote, Sparkles,
} from "lucide-react";
import {
  getCardConfig, CATEGORY_INFO, TYPE_INFO,
  drawerNetAmount, nextPlayerAmount,
  formatPrice as cfgFormatPrice,
  type CardConfig, type CardCategory,
} from "@/game/utils/cardConfig";
import { GeneratedCard } from "@/game/components/GeneratedCard";
import { getCardMefait } from "@/game/utils/cardMefaits";
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
const MECH_STYLE: Record<CardMechanic, { bg: string; border: string; label: string }> = {
  contravention: { bg: "#D97706", border: "#92400E", label: "Contravention" },
  contribuable:  { bg: "#16A34A", border: "#14532D", label: "Contribuable"  },
  investisseur:  { bg: "#DB2777", border: "#BE185D", label: "Investisseur"  },
  frais_only:    { bg: "#0891B2", border: "#0E7490", label: "Frais"         },
  bonus:         { bg: "#16A34A", border: "#14532D", label: "Bonus"         },
};

// Résoudre la vraie couleur/label depuis cardConfig (source de vérité)
function getCatStyle(cardNum: number) {
  const cfg = getCardConfig(cardNum);
  const cat = cfg.category;
  const catInfo = CATEGORY_INFO[cat];
  const styles: Record<string, { bg: string; border: string; label: string }> = {
    contravention: { bg: "#D97706", border: "#92400E", label: catInfo.label },
    contribuable:  { bg: "#16A34A", border: "#14532D", label: catInfo.label },
    investisseur:  { bg: "#DB2777", border: "#BE185D", label: catInfo.label },
  };
  return styles[cat] ?? { bg: "#D97706", border: "#92400E", label: catInfo.label };
}

function formatPrice(n: number): string {
  const abs = Math.abs(n);
  const str = abs.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
  return n < 0 ? `- ${str}` : str;
}

// ── PriceBox réutilisable ─────────────────────────────────────────────────────
function PriceBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="rounded-xl border-[2px] border-black p-2.5 flex flex-col items-center gap-1"
      style={{ background: color + "22", borderColor: color, boxShadow: "2px 2px 0px #000" }}
    >
      <span style={FONT_FREDOKA} className="text-white/60 text-xs text-center leading-tight">{label}</span>
      <span
        style={{ ...FONT_BANGERS, fontSize: "1.1rem" }}
        className={value >= 0 ? "text-red-400" : "text-green-400"}
      >
        {value >= 0 ? "+" : ""}{formatPrice(value)}
      </span>
    </div>
  );
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
  const cfg  = getCardConfig(cardNum);
  const net  = drawerNetAmount(cfg);
  const cs   = getCatStyle(cardNum);

  return (
    <motion.div
      whileHover={{ scale: 1.07, y: -2 } as any}
      whileTap={{ scale: 0.94 } as any}
      onClick={onClick}
      className="relative rounded-xl border-[3px] border-black overflow-hidden cursor-pointer"
      style={{
        aspectRatio: "5/7",
        boxShadow: highlight ? `0 0 0 3px ${cs.bg}, 4px 4px 0px #000` : "3px 3px 0px #000",
        background: "#0c1a4e",
        borderColor: highlight ? cs.bg : "#000",
      }}
    >
      <GeneratedCard card={cfg} size="xs" style={{ width: '100%', height: '100%' }} />
      {/* Overlay bas — prix net */}
      <div
        className="absolute bottom-0 left-0 right-0 py-[2px] flex flex-col items-center"
        style={{ background: cs.bg + "ee" }}
      >
        <span style={{ ...FONT_BANGERS, fontSize: "0.58rem", letterSpacing: "0.02em" }} className="text-white leading-none">
          {net >= 0 ? "+" : ""}{formatPrice(net)}
        </span>
      </div>
    </motion.div>
  );
}

// ── Vue détaillée d'une carte — Bottom Sheet optimisé ────────────────────────
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
  const [zoomed, setZoomed] = useState(false);

  const cfg      = getCardConfig(cardNum);
  const catInfo  = CATEGORY_INFO[cfg.category];
  const typeInfo = TYPE_INFO[cfg.cardType];
  const cs       = getCatStyle(cardNum);
  const net      = drawerNetAmount(cfg);
  const nextAmt  = nextPlayerAmount(cfg);
  const mefait   = getCardMefait(cardNum);
  const idx      = allFiltered.indexOf(cardNum);

  useEffect(() => {
    setZoomed(false);
  }, [cardNum]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex flex-col"
      style={{ background: "rgba(0,0,0,0.80)" }}
      onClick={onClose}
    >
      {/* ── Bottom Sheet ── */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="mt-auto w-full max-w-md mx-auto rounded-t-3xl border-t-4 border-x-4 border-black overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(160deg, #111827 0%, #0c1a4e 100%)",
          boxShadow: "0 -6px 0 #000",
          maxHeight: "92dvh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header coloré avec navigation ── */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b-[3px] flex-shrink-0"
          style={{ borderColor: cs.bg, background: cs.bg + "22" }}
        >
          <div className="flex-1">
            <div style={{ ...FONT_BANGERS, fontSize: "1.5rem", letterSpacing: "0.06em" }} className="text-white leading-none">
              CARTE #{String(cardNum).padStart(3, "0")}
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                className="px-2 py-0.5 rounded-full border-[2px] border-black text-white"
                style={{ ...FONT_BANGERS, background: cs.bg, fontSize: "0.7rem" }}
              >
                {cs.label}
              </span>
              <span
                className="px-2 py-0.5 rounded-full border-[2px] border-black text-white"
                style={{ ...FONT_BANGERS, background: typeInfo.color, fontSize: "0.7rem" }}
              >
                {typeInfo.shortLabel}
              </span>
            </div>
          </div>

          {/* Nav + fermer */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1">
              <motion.button whileTap={{ scale: 0.88 }} onClick={onPrev} disabled={idx <= 0}
                className="w-8 h-8 bg-white/10 border-[2px] border-white/20 rounded-lg flex items-center justify-center disabled:opacity-20">
                <ChevronLeft className="w-4 h-4 text-white" />
              </motion.button>
              <motion.button whileTap={{ scale: 0.88 }} onClick={onNext} disabled={idx >= allFiltered.length - 1}
                className="w-8 h-8 bg-white/10 border-[2px] border-white/20 rounded-lg flex items-center justify-center disabled:opacity-20">
                <ChevronRight className="w-4 h-4 text-white" />
              </motion.button>
            </div>
            <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}
              className="w-8 h-8 bg-red-500 border-[2px] border-black rounded-full flex items-center justify-center"
              style={{ boxShadow: "2px 2px 0px #000" }}>
              <X className="w-4 h-4 text-white" />
            </motion.button>
            <span style={FONT_FREDOKA} className="text-white/30 text-[0.6rem]">
              {idx + 1}/{allFiltered.length}
            </span>
          </div>
        </div>

        {/* ── Corps scrollable ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">

          {/* ── Carte agrandie centrée + bouton zoom ── */}
          <div className="flex justify-center">
            <div className="relative" style={{ width: "min(60vw, 220px)", aspectRatio: "5/7" }}>
              <div
                className="w-full h-full rounded-2xl border-[4px] border-black overflow-hidden cursor-pointer"
                style={{ boxShadow: `8px 8px 0px #000, 0 0 30px ${cs.bg}44`, background: "#0c1a4e" }}
                onClick={() => setZoomed(true)}
              >
                <GeneratedCard card={cfg} size="md" style={{ width: '100%', height: '100%' }} />
              </div>

              {/* Bouton + zoom */}
              <motion.button
                className="absolute -bottom-4 -right-4 w-11 h-11 rounded-full border-[3px] border-black flex items-center justify-center z-20"
                style={{ background: "#FFD700", boxShadow: "3px 3px 0px #000" }}
                animate={{ scale: [1, 1.18, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                onClick={() => setZoomed(true)}
                title="Agrandir la carte"
              >
                <Plus className="w-5 h-5 text-black" style={{ strokeWidth: 3 }} />
              </motion.button>
            </div>
          </div>

          {/* ── Texte du méfait ── */}
          {mefait && mefait !== "---" && (
            <div
              className="rounded-2xl border-[3px] border-black px-4 py-3 text-center"
              style={{ background: cs.bg + "18", borderColor: cs.bg, boxShadow: "3px 3px 0px #000" }}
            >
              <span
                style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.04em", lineHeight: 1.2 }}
                className="text-white"
              >
                {mefait}
              </span>
            </div>
          )}

          {/* ── Effets de cette carte ── */}
          <div
            className="rounded-2xl border-[3px] border-black p-3 flex flex-col gap-2"
            style={{ background: "rgba(255,215,0,0.08)", borderColor: "#FFD700", boxShadow: "3px 3px 0px #000" }}
          >
            <span style={FONT_FREDOKA} className="text-yellow-400/60 text-xs uppercase tracking-wide flex items-center gap-1">
              <Target className="w-3.5 h-3.5" /> Effets de cette carte
            </span>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span style={FONT_FREDOKA} className="text-white/70 text-sm flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Joueur qui pioche
                </span>
                <motion.span
                  key={net}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  style={{ ...FONT_BANGERS, fontSize: "1.4rem" }}
                  className={net >= 0 ? "text-red-400" : "text-green-400"}
                >
                  {net >= 0 ? "+" : ""}{formatPrice(net)}
                </motion.span>
              </div>
              {nextAmt > 0 && (
                <div className="flex items-center justify-between">
                  <span style={FONT_FREDOKA} className="text-purple-300 text-sm flex items-center gap-1">
                    <ArrowRight className="w-3.5 h-3.5" /> Joueur suivant recoit
                  </span>
                  <span style={{ ...FONT_BANGERS, fontSize: "1.4rem" }} className="text-purple-300">
                    +{formatPrice(nextAmt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Détail des montants ── */}
          <div className="rounded-2xl border-[2px] border-white/10 bg-white/5 p-3 flex flex-col gap-2">
            <span style={FONT_FREDOKA} className="text-white/50 text-xs uppercase tracking-wide flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5" /> Detail des montants
            </span>
            <div className="grid grid-cols-2 gap-2">
              {cfg.cardType === 1 && (
                <>
                  <PriceBox label="Ticket de base" value={cfg.ticketPrice} color="#DC2626" />
                  {(cfg.frais ?? 0) > 0
                    ? <PriceBox label="Frais additionnels" value={cfg.frais!} color="#0891B2" />
                    : <PriceBox label="Frais additionnels" value={0} color="#374151" />
                  }
                </>
              )}
              {cfg.cardType === 2 && (
                <PriceBox label="Reduction impots" value={-(cfg.impots ?? 0)} color="#16A34A" />
              )}
              {cfg.cardType === 3 && (
                <>
                  <PriceBox label="Ticket (joueur suivant)" value={cfg.ticketPrice} color="#7C3AED" />
                  {cfg.taxe !== undefined && cfg.taxe > 0 && (
                    <PriceBox label="Taxe (reduction piocheur)" value={-(cfg.taxe)} color="#16A34A" />
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Note ── */}
          {cfg.note && (
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <span style={FONT_FREDOKA} className="text-white/50 text-sm italic">{cfg.note}</span>
            </div>
          )}

          {/* ── Avertissement prix non confirmé ── */}
          {!getCardData(cardNum).confirmed && (
            <div className="flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-3 py-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
              <span style={FONT_FREDOKA} className="text-yellow-400/80 text-xs">
                Prix non confirme — valeur par defaut
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Overlay zoom plein écran ── */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[80] flex flex-col items-center justify-center"
            style={{ background: "rgba(0,0,0,0.97)" }}
            onClick={() => setZoomed(false)}
          >
            {/* Badge catégorie */}
            <motion.div
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.08 }}
              className="absolute top-6 flex items-center gap-2 px-4 py-1.5 rounded-full border-[2px] border-black"
              style={{ background: cs.bg, boxShadow: "3px 3px 0px #000" }}
            >
              <span style={{ ...FONT_BANGERS, fontSize: "0.95rem", letterSpacing: "0.08em" }} className="text-white">
                #{String(cardNum).padStart(3, "0")} — {cs.label}
              </span>
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
              onClick={() => setZoomed(false)}
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
              Appuie n'importe ou pour fermer
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
      const d   = getCardData(id);
      const cfg = getCardConfig(id);
      if (filter !== "all" && d.mechanic !== filter) return false;
      if (showOnlyTodo && d.confirmed)      return false;
      if (showOnlySub  && !d.isSubtraction) return false;
      if (search) {
        const q      = search.toLowerCase();
        const mefait = getCardMefait(id) ?? "";
        const note   = d.note ?? "";
        const cat    = cfg.category ?? "";
        if (
          !String(id).includes(q) &&
          !note.toLowerCase().includes(q) &&
          !mefait.toLowerCase().includes(q) &&
          !cat.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [filter, search, showOnlyTodo, showOnlySub]);

  const totalConfirmed   = ALL_IDS.filter((id) => getCardData(id).confirmed).length;
  const totalSubtraction = ALL_IDS.filter((id) => getCardData(id).isSubtraction).length;
  const totalWithFrais   = ALL_IDS.filter((id) => (getCardData(id).frais ?? 0) > 0).length;
  const totalWithMefait  = ALL_IDS.filter((id) => { const m = getCardMefait(id); return m && m !== "---"; }).length;

  const focusedIdx = focusedCard !== null ? filtered.indexOf(focusedCard) : -1;
  const goNext = () => { if (focusedIdx < filtered.length - 1) setFocused(filtered[focusedIdx + 1]); };
  const goPrev = () => { if (focusedIdx > 0) setFocused(filtered[focusedIdx - 1]); };

  return (
    <div
      className="h-[100dvh] w-full flex flex-col overflow-hidden"
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
            {totalConfirmed} / 324 prix confirmes
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/custom-cards")}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#FF4081] border-[3px] border-black rounded-xl text-white flex-shrink-0"
          style={{ ...FONT_BANGERS, fontSize: "0.85rem", boxShadow: "3px 3px 0px #000", letterSpacing: "0.04em" }}
        >
          <Sparkles className="w-4 h-4" />
          PERSONNALISATION
        </motion.button>
      </div>

      <PoliceTape />

      {/* Statistiques rapides */}
      <div className="px-4 pt-3 pb-2 grid grid-cols-3 gap-2">
        {[
          { label: "Confirmes",   value: totalConfirmed,   color: "#22c55e" },
          { label: "Avec méfait",  value: totalWithMefait,  color: "#D97706" },
          { label: "Avec frais",   value: totalWithFrais,   color: "#0891B2" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border-[2px] border-black px-2 py-2 flex flex-col items-center gap-0.5"
            style={{ background: s.color + "18", borderColor: s.color + "60", boxShadow: "2px 2px 0px #000" }}
          >
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
            placeholder="Rechercher par numéro, méfait, catégorie..."
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
          <span style={FONT_BANGERS}>TODO</span>
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
          <span style={FONT_BANGERS}>Soustractions</span>
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
            <p style={FONT_FREDOKA} className="text-white/30 text-center text-sm">
              Aucune carte ne correspond aux filtres.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
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
          TICKET CRICKET 2026 — CATALOGUE
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

/**
 * CardAdminScreen — Catalogue de consultation des 324 cartes.
 * Route : /admin
 *
 * Interface de visualisation des cartes : image, catégorie, type, effets et prix.
 * Lecture seule — aucune modification possible.
 */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "wouter";
import { Home, X, ChevronLeft, ChevronRight, Target, User, ArrowRight, Banknote, Layers, Plus } from "lucide-react";
import { GeneratedCard } from "@/game/components/GeneratedCard";
import {
  getCardConfig, drawerNetAmount, nextPlayerAmount,
  formatPrice, CATEGORY_INFO, CATEGORY_ORDER, ALL_CARD_IDS,
  type CardConfig, type CardCategory,
} from "@/game/utils/cardConfig";
import { PoliceTape } from "@/game/ui/PoliceUI";
import ticketImg from "@/game/utils/ticketImg";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

// ── Miniature carte ───────────────────────────────────────────────────────────
function CardThumb({
  cardNum, cfg, isSelected, onClick,
}: {
  cardNum:    number;
  cfg:        CardConfig;
  isSelected: boolean;
  onClick:    () => void;
}) {
  const catInfo  = CATEGORY_INFO[cfg.category];
  const net      = drawerNetAmount(cfg);

  return (
    <motion.div
      whileTap={{ scale: 0.92 } as any}
      onClick={onClick}
      className="relative rounded-xl border-[3px] overflow-hidden cursor-pointer select-none"
      style={{
        aspectRatio: "5/7",
        borderColor: isSelected ? "#FFD700" : catInfo.color,
        boxShadow:   isSelected ? "0 0 0 3px #FFD700, 3px 3px 0px #000" : "2px 2px 0px #000",
        background:  "#0c1a4e",
      }}
    >
      <GeneratedCard card={cfg} size="xs" style={{ width: '100%', height: '100%' }} />

      {/* Prix net en bas */}
      <div
        className="absolute bottom-0 left-0 right-0 py-[2px] flex items-center justify-center"
        style={{ background: catInfo.color + "ee" }}
      >
        <span style={{ ...FONT_BANGERS, fontSize: "0.52rem" }} className="text-white leading-none">
          {net >= 0 ? "+" : ""}{formatPrice(net)}
        </span>
      </div>
    </motion.div>
  );
}

// ── PriceBox ─────────────────────────────────────────────────────────────────
function PriceBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border-[2px] border-black p-2.5 flex flex-col items-center gap-1"
      style={{ background: color + "22", borderColor: color, boxShadow: "2px 2px 0px #000" }}>
      <span style={FONT_FREDOKA} className="text-white/60 text-xs text-center leading-tight">{label}</span>
      <span style={{ ...FONT_BANGERS, fontSize: "1.1rem" }} className={value >= 0 ? "text-red-400" : "text-green-400"}>
        {value >= 0 ? "+" : ""}{formatPrice(value)}
      </span>
    </div>
  );
}

// ── Fiche détail d'une carte (bottom sheet) ───────────────────────────────────
function CardDetail({
  cardId,
  onClose,
  onPrev,
  onNext,
  filteredIds,
}: {
  cardId:      number;
  onClose:     () => void;
  onPrev:      () => void;
  onNext:      () => void;
  filteredIds: number[];
}) {
  const [zoomed, setZoomed] = useState(false);
  const cfg      = getCardConfig(cardId);
  const catInfo  = CATEGORY_INFO[cfg.category];
  const net      = drawerNetAmount(cfg);
  const nextAmt  = nextPlayerAmount(cfg);
  const idx      = filteredIds.indexOf(cardId);

  useEffect(() => {
    setZoomed(false);
  }, [cardId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="mt-auto w-full max-w-md mx-auto rounded-t-3xl border-t-4 border-x-4 border-black overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(160deg, #111827 0%, #0c1a4e 100%)",
          boxShadow:  "0 -6px 0 #000",
          maxHeight:  "88dvh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b-[3px] flex-shrink-0"
          style={{ borderColor: catInfo.color, background: catInfo.color + "22" }}
        >
          <div className="flex-1">
            <div style={{ ...FONT_BANGERS, fontSize: "1.5rem", letterSpacing: "0.06em" }} className="text-white leading-none">
              CARTE #{String(cardId).padStart(3, "0")}
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                className="px-2 py-0.5 rounded-full border-[2px] border-black text-white"
                style={{ ...FONT_BANGERS, background: catInfo.color, fontSize: "0.7rem" }}
              >
                {catInfo.label}
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
              <motion.button whileTap={{ scale: 0.88 }} onClick={onNext} disabled={idx >= filteredIds.length - 1}
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
              {idx + 1}/{filteredIds.length}
            </span>
          </div>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">

          {/* ── Image de la carte agrandie + bouton zoom ── */}
          <div className="flex justify-center">
            <div className="relative" style={{ width: "min(55vw, 200px)", aspectRatio: "5/7" }}>
              {/* Carte cliquable */}
              <div
                className="w-full h-full rounded-2xl border-[4px] border-black overflow-hidden cursor-pointer"
                style={{ boxShadow: "8px 8px 0px #000", background: "#0c1a4e" }}
                onClick={() => setZoomed(true)}
              >
                <GeneratedCard card={cfg} size="sm" style={{ width: '100%', height: '100%' }} />
              </div>

              {/* Bouton + zoom — déborde en coin bas droit */}
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

          {/* Effets */}
          <div
            className="rounded-2xl border-[3px] border-black p-3 flex flex-col gap-2"
            style={{ background: "rgba(255,215,0,0.08)", borderColor: "#FFD700", boxShadow: "3px 3px 0px #000" }}
          >
            <span style={FONT_FREDOKA} className="text-yellow-400/60 text-xs uppercase tracking-wide flex items-center gap-1">
              <Target className="w-3.5 h-3.5" /> Effets de cette carte
            </span>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span style={FONT_FREDOKA} className="text-white/70 text-sm flex items-center gap-1"><User className="w-3.5 h-3.5" /> Joueur qui pioche</span>
                <motion.span
                  key={net}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  style={{ ...FONT_BANGERS, fontSize: "1.3rem" }}
                  className={net >= 0 ? "text-red-400" : "text-green-400"}
                >
                  {net >= 0 ? "+" : ""}{formatPrice(net)}
                </motion.span>
              </div>
              {nextAmt > 0 && (
                <div className="flex items-center justify-between">
                  <span style={FONT_FREDOKA} className="text-purple-300 text-sm flex items-center gap-1"><ArrowRight className="w-3.5 h-3.5" /> Joueur suivant reçoit</span>
                  <span style={{ ...FONT_BANGERS, fontSize: "1.3rem" }} className="text-purple-300">
                    +{formatPrice(nextAmt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Détail des prix */}
          <div className="rounded-2xl border-[2px] border-white/10 bg-white/5 p-3 flex flex-col gap-2">
            <span style={FONT_FREDOKA} className="text-white/50 text-xs uppercase tracking-wide flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5" /> Détail des montants
            </span>
            <div className="grid grid-cols-2 gap-2">
              {cfg.cardType === 1 && (
                <>
                  <PriceBox label="Ticket de base" value={cfg.ticketPrice} color="#DC2626" />
                  {(cfg.frais ?? 0) > 0 && <PriceBox label="Frais additionnels" value={cfg.frais!} color="#0891B2" />}
                  {(cfg.frais ?? 0) === 0 && <PriceBox label="Frais additionnels" value={0} color="#374151" />}
                </>
              )}
              {cfg.cardType === 2 && (
                <>
                  <PriceBox label="Réduction impôts" value={-(cfg.impots ?? 0)} color="#16A34A" />
                </>
              )}
              {cfg.cardType === 3 && (
                <>
                  <PriceBox label="Ticket (joueur suivant)" value={cfg.ticketPrice} color="#7C3AED" />
                  {cfg.taxe !== undefined && <PriceBox label="Taxe (réduction piocheur)" value={-(cfg.taxe)} color="#16A34A" />}
                </>
              )}
            </div>
          </div>

          {/* Note */}
          {cfg.note && (
            <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <span style={FONT_FREDOKA} className="text-white/50 text-sm italic">{cfg.note}</span>
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
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
            style={{ background: "rgba(0,0,0,0.97)" }}
            onClick={() => setZoomed(false)}
          >
            {/* Badge catégorie */}
            <motion.div
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.08 }}
              className="absolute top-6 flex items-center gap-2 px-4 py-1.5 rounded-full border-[2px] border-black"
              style={{ background: catInfo.color, boxShadow: "3px 3px 0px #000" }}
            >
              <span style={{ ...FONT_BANGERS, fontSize: "0.95rem", letterSpacing: "0.08em" }} className="text-white">
                #{String(cardId).padStart(3, "0")} — {catInfo.label}
              </span>
            </motion.div>

            {/* Image agrandie */}
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="rounded-3xl border-[5px] border-black overflow-hidden"
              style={{ width: "min(90vw, 380px)", aspectRatio: "5/7", boxShadow: "12px 12px 0px #000" }}
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
              Appuie n'importe où pour fermer
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Écran principal ───────────────────────────────────────────────────────────
type FilterCat = CardCategory | "all";

export function CardAdminScreen() {
  const [, navigate] = useLocation();

  const [filterCat, setFilterCat]       = useState<FilterCat>("all");
  const [detailCardId, setDetailCardId] = useState<number | null>(null);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const id of ALL_CARD_IDS) {
      const cfg = getCardConfig(id);
      counts[cfg.category] = (counts[cfg.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  const filtered = useMemo(() => {
    if (filterCat === "all") return ALL_CARD_IDS;
    return ALL_CARD_IDS.filter((id) => getCardConfig(id).category === filterCat);
  }, [filterCat]);

  const handlePrev = () => {
    if (detailCardId === null) return;
    const idx = filtered.indexOf(detailCardId);
    if (idx > 0) setDetailCardId(filtered[idx - 1]);
  };
  const handleNext = () => {
    if (detailCardId === null) return;
    const idx = filtered.indexOf(detailCardId);
    if (idx < filtered.length - 1) setDetailCardId(filtered[idx + 1]);
  };

  return (
    <div
      className="flex flex-col w-full h-full overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0a0f2e 0%, #111827 100%)" }}
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
          <div style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.08em" }} className="text-yellow-400 leading-none">
            CATALOGUE DES CARTES
          </div>
        </div>
      </div>

      <PoliceTape />

      {/* Filtres catégorie */}
      <div className="flex flex-col gap-1.5 px-4 pt-3 pb-2 flex-shrink-0">
        {/* Bouton "Toutes les cartes" — pleine largeur */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setFilterCat("all")}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl border-[3px] border-black relative overflow-hidden"
          style={{
            background:  filterCat === "all" ? "#FFD700" : "rgba(255,255,255,0.06)",
            boxShadow:   filterCat === "all" ? "4px 4px 0px #000" : "2px 2px 0px #000",
            borderColor: filterCat === "all" ? "#B8860B" : "rgba(255,255,255,0.12)",
          }}
        >
          {filterCat === "all" && (
            <motion.div
              className="absolute inset-0 w-1/3 bg-white/15 skew-x-[-20deg]"
              animate={{ x: ["-100%", "350%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            />
          )}
          <div
            className="relative z-10 w-5 h-5 rounded-full border-[2px] border-black/40 flex-shrink-0"
            style={{ background: filterCat === "all" ? "#000" : "rgba(255,255,255,0.2)" }}
          />
          <span
            style={{ ...FONT_BANGERS, fontSize: "0.95rem", letterSpacing: "0.05em" }}
            className={`relative z-10 flex-1 text-left leading-none ${filterCat === "all" ? "text-black" : "text-white/40"}`}
          >
            TOUTES LES CARTES
          </span>
          <span
            style={{ ...FONT_BANGERS, fontSize: "1.05rem" }}
            className={`relative z-10 flex-shrink-0 ${filterCat === "all" ? "text-black" : "text-white/40"}`}
          >
            {ALL_CARD_IDS.length}
          </span>
        </motion.button>

        {/* Boutons par catégorie */}
        <div className="flex gap-1.5">
          {CATEGORY_ORDER.map((cat) => {
            const ci       = CATEGORY_INFO[cat];
            const isActive = filterCat === cat;
            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.96 }}
                onClick={() => setFilterCat(isActive ? "all" : cat)}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-[3px] border-black relative overflow-hidden"
                style={{
                  background:  isActive ? ci.color : "rgba(255,255,255,0.06)",
                  boxShadow:   isActive ? "4px 4px 0px #000" : "2px 2px 0px #000",
                  borderColor: isActive ? "#000" : "rgba(255,255,255,0.12)",
                }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 w-1/2 bg-white/10 skew-x-[-20deg]"
                    animate={{ x: ["-100%", "260%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  />
                )}
                <div
                  className="relative z-10 w-3.5 h-3.5 rounded-full border-[2px] border-black/40 flex-shrink-0"
                  style={{ background: isActive ? "rgba(0,0,0,0.3)" : ci.color }}
                />
                <span
                  style={{ ...FONT_BANGERS, fontSize: "0.62rem", letterSpacing: "0.04em" }}
                  className={`relative z-10 leading-tight text-center ${isActive ? (cat === "contravention" ? "text-black" : "text-white") : "text-white/50"}`}
                >
                  {ci.label}
                </span>
                <span
                  style={{ ...FONT_BANGERS, fontSize: "0.85rem" }}
                  className={`relative z-10 leading-none ${isActive ? (cat === "contravention" ? "text-black" : "text-white") : "text-white/40"}`}
                >
                  {catCounts[cat] ?? 0}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Résumé */}
      <div className="flex items-center justify-between px-4 pb-2 flex-shrink-0">
        <span style={FONT_FREDOKA} className="text-white/35 text-xs">
          {filtered.length} carte{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}
        </span>
        {filterCat !== "all" && (
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => setFilterCat("all")}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 border border-white/15"
          >
            <X className="w-3 h-3 text-white/40" />
            <span style={FONT_FREDOKA} className="text-white/40 text-xs">Effacer</span>
          </motion.button>
        )}
      </div>

      {/* Grille */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-16"
            >
              <Layers className="w-10 h-10 text-white/30" />
              <p style={FONT_FREDOKA} className="text-white/30 text-sm">Aucune carte trouvée.</p>
            </motion.div>
          ) : (
            <motion.div
              key={filterCat}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-4 gap-2"
            >
              {filtered.map((id) => (
                <CardThumb
                  key={id}
                  cardNum={id}
                  cfg={getCardConfig(id)}
                  isSelected={detailCardId === id}
                  onClick={() => setDetailCardId(id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fiche détail */}
      <AnimatePresence>
        {detailCardId !== null && (
          <CardDetail
            key={detailCardId}
            cardId={detailCardId}
            filteredIds={filtered}
            onClose={() => setDetailCardId(null)}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
/**
 * CardCatalogScreen — Browse all 324 cards.
 * Design: Arcade Urbaine
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Home, Search, Filter } from "lucide-react";
import {
  getCardConfig, ALL_CARD_IDS, drawerNetAmount, formatPrice,
  CATEGORY_INFO, CATEGORY_ORDER, TYPE_INFO,
  type CardCategory,
} from "@/game/utils/cardConfig";
import { getCardAssetUrl } from "@/game/utils/cardAssets";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

export default function CardCatalogScreen() {
  const [, navigate] = useLocation();
  const [catFilter, setCatFilter] = useState<CardCategory | "all">("all");
  const [typeFilter, setTypeFilter] = useState<number | "all">("all");
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const filteredCards = useMemo(() => {
    return ALL_CARD_IDS.filter((id) => {
      const cfg = getCardConfig(id);
      if (catFilter !== "all" && cfg.category !== catFilter) return false;
      if (typeFilter !== "all" && cfg.cardType !== typeFilter) return false;
      return true;
    });
  }, [catFilter, typeFilter]);

  const selectedCfg = selectedCard ? getCardConfig(selectedCard) : null;
  const selectedCatInfo = selectedCfg ? CATEGORY_INFO[selectedCfg.category] : null;
  const selectedTypeInfo = selectedCfg ? TYPE_INFO[selectedCfg.cardType] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate("/")} className="text-slate-400 hover:text-white">
            <Home size={24} />
          </button>
          <h1 className="text-2xl text-yellow-400 flex-1" style={FONT_BANGERS}>
            CATALOGUE ({filteredCards.length})
          </h1>
        </div>
        {/* Filters */}
        <div className="px-4 pb-3 flex gap-2 flex-wrap">
          <button
            onClick={() => setCatFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
              catFilter === "all" ? "bg-yellow-400 text-black" : "bg-slate-700 text-slate-300"
            }`}
          >
            Toutes
          </button>
          {CATEGORY_ORDER.map((cat) => {
            const info = CATEGORY_INFO[cat];
            return (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  catFilter === cat ? "text-black" : "text-slate-300 bg-slate-700"
                }`}
                style={catFilter === cat ? { backgroundColor: info.color } : {}}
              >
                {info.emoji} {info.label}
              </button>
            );
          })}
          <div className="w-px bg-slate-700 mx-1" />
          {([1, 2, 3] as const).map((t) => {
            const info = TYPE_INFO[t];
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(typeFilter === t ? "all" : t)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  typeFilter === t ? "text-white" : "text-slate-300 bg-slate-700"
                }`}
                style={typeFilter === t ? { backgroundColor: info.color } : {}}
              >
                {info.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card grid */}
      <div className="px-4 py-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {filteredCards.map((id) => {
          const cfg = getCardConfig(id);
          const catInfo = CATEGORY_INFO[cfg.category];
          const net = drawerNetAmount(cfg);
          return (
            <motion.button
              key={id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCard(id)}
              className="rounded-lg overflow-hidden border-2 transition-colors"
              style={{ borderColor: catInfo.border }}
            >
              <img
                src={getCardAssetUrl(id) || ""}
                alt={`Carte #${id}`}
                className="w-full aspect-[5/7] object-cover"
                loading="lazy"
              />
              <div
                className="px-1 py-1 text-center"
                style={{ backgroundColor: catInfo.color }}
              >
                <div className="text-[10px] font-bold" style={{ color: catInfo.text }}>
                  #{id}
                </div>
                <div
                  className={`text-xs font-bold ${net >= 0 ? "" : ""}`}
                  style={{ color: catInfo.text, ...FONT_BANGERS }}
                >
                  {net >= 0 ? "+" : ""}{formatPrice(net)}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Card detail modal */}
      {selectedCard && selectedCfg && selectedCatInfo && selectedTypeInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSelectedCard(null)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getCardAssetUrl(selectedCard) || ""}
              alt={`Carte #${selectedCard}`}
              className="w-full aspect-[5/7] object-cover"
            />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{selectedCatInfo.emoji}</span>
                <span
                  className="text-xl font-bold"
                  style={{ color: selectedCatInfo.color, ...FONT_BANGERS }}
                >
                  #{selectedCard} — {selectedCatInfo.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="rounded-full px-3 py-1 text-sm font-bold text-white"
                  style={{ backgroundColor: selectedTypeInfo.color }}
                >
                  {selectedTypeInfo.label}
                </span>
              </div>
              <div className="space-y-1 text-sm text-slate-300" style={FONT_FREDOKA}>
                {selectedCfg.cardType === 1 && (
                  <>
                    <p>Ticket : {formatPrice(selectedCfg.ticketPrice)}</p>
                    {selectedCfg.frais !== undefined && <p>Frais : {formatPrice(selectedCfg.frais)}</p>}
                    <p className="text-red-400 font-bold">
                      Total ajouté : +{formatPrice(drawerNetAmount(selectedCfg))}
                    </p>
                  </>
                )}
                {selectedCfg.cardType === 2 && (
                  <>
                    {selectedCfg.impots !== undefined && <p>Impôts : {formatPrice(selectedCfg.impots)}</p>}
                    <p className="text-emerald-400 font-bold">
                      Réduction : {formatPrice(drawerNetAmount(selectedCfg))}
                    </p>
                  </>
                )}
                {selectedCfg.cardType === 3 && (
                  <>
                    <p>Ticket transféré : {formatPrice(selectedCfg.ticketPrice)}</p>
                    {selectedCfg.taxe !== undefined && <p>Taxe (réduction) : {formatPrice(selectedCfg.taxe)}</p>}
                    <p className="text-purple-400 font-bold">
                      Effet piocheur : {formatPrice(drawerNetAmount(selectedCfg))}
                    </p>
                  </>
                )}
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="mt-4 w-full rounded-xl bg-slate-800 py-3 text-center font-bold text-slate-300 hover:bg-slate-700"
                style={FONT_FREDOKA}
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

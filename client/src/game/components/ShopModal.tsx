/**
 * ShopModal — Boutique en jeu Ticket Cricket.
 * Vue principale avec boutons de navigation.
 * Vues : accueil → packs | skins | don
 */
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Layers, Heart, Sparkles, Gift, Star, ShoppingBag, Loader2, ChevronLeft, ChevronRight, Check, Flame, Snowflake, Crown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { GeneratedCard } from "@/game/components/GeneratedCard";
import { SKIN_CATALOG } from "@/game/utils/skinConfig";
import type { CardSkinId, SkinMeta } from "@/game/utils/skinConfig";
import type { CardConfig } from "@/game/utils/cardConfig";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive", letterSpacing: "0.06em" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

interface ShopModalProps {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}

const CARD_PACKS = [
  {
    id: "card_pack_35",
    name: "Pack Starter",
    cards: 35,
    total: 50,
    price: "2,99 $",
    priceCents: 299,
    color: "#34C759",
    badge: "POPULAIRE",
    perks: ["+ 35 cartes personnalisables", "Idéal pour commencer", "Accès immédiat"],
  },
  {
    id: "card_pack_55",
    name: "Pack Pro",
    cards: 55,
    total: 70,
    price: "6,99 $",
    priceCents: 699,
    color: "#007AFF",
    badge: "MEILLEURE VALEUR",
    perks: ["+ 55 cartes personnalisables", "Meilleur rapport qualité/prix", "Accès immédiat"],
  },
  {
    id: "card_pack_85",
    name: "Pack Ultimate",
    cards: 85,
    total: 100,
    price: "9,99 $",
    priceCents: 999,
    color: "#AF52DE",
    badge: "MAXIMUM",
    perks: ["+ 85 cartes personnalisables", "Collection complète", "Accès immédiat"],
  },
];

const COMING_SOON = [
  { icon: Gift,     name: "Decks exclusifs",    desc: "Nouveaux tickets thématiques",        color: "#FF9500" },
  { icon: Star,     name: "Contenu saisonnier", desc: "Événements et cartes limitées",       color: "#FFD700" },
];

// Cartes de démo pour la preview des skins (une par catégorie)
const DEMO_CONTRAVENTION: CardConfig = { id: 150, category: "contravention", cardType: 1, ticketPrice: 200, frais: 30 };
const DEMO_CONTRIBUABLE: CardConfig = { id: 80, category: "contribuable", cardType: 2, ticketPrice: 0, impots: 40 };
const DEMO_INVESTISSEUR: CardConfig = { id: 30, category: "investisseur", cardType: 3, ticketPrice: 500, taxe: 20 };

const SKIN_ICON_MAP: Record<CardSkinId, React.ElementType> = {
  classique: Layers,
  neon: Sparkles,
  retro: Star,
  glace: Snowflake,
  feu: Flame,
  royal: Crown,
};

type View = "home" | "packs" | "don" | "skins";

export function ShopModal({ open, onClose, isLoggedIn }: ShopModalProps) {
  const [view, setView] = useState<View>("home");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [donAmount, setDonAmount] = useState<string>("5");
  const [donError, setDonError] = useState<string | null>(null);
  const [previewSkin, setPreviewSkin] = useState<CardSkinId>("classique");

  // Skins débloqués par le joueur
  const { data: ownedSkins = [] } = trpc.skins.listOwnedSkins.useQuery(undefined, {
    enabled: isLoggedIn,
  });

  const checkoutMutation = trpc.shop.createCheckout.useMutation({
    onSuccess: ({ url }) => {
      setLoadingId(null);
      if (url) {
        toast.success("Redirection vers le paiement...");
        window.open(url, "_blank");
      }
    },
    onError: (err) => {
      setLoadingId(null);
      toast.error(err.message || "Erreur lors du paiement.");
    },
  });

  const donCheckoutMutation = trpc.shop.createDonCheckout.useMutation({
    onSuccess: ({ url }) => {
      setLoadingId(null);
      if (url) {
        toast.success("Redirection vers le paiement...");
        window.open(url, "_blank");
      }
    },
    onError: (err) => {
      setLoadingId(null);
      setDonError(err.message);
    },
  });

  function handleBuyPack(productId: string) {
    if (!isLoggedIn) { toast.error("Connectez-vous pour acheter."); return; }
    setLoadingId(productId);
    checkoutMutation.mutate({ productId, origin: window.location.origin });
  }

  function handleBuySkin(productId: string) {
    if (!isLoggedIn) { toast.error("Connectez-vous pour acheter."); return; }
    setLoadingId(productId);
    checkoutMutation.mutate({ productId, origin: window.location.origin });
  }

  function handleDon() {
    setDonError(null);
    if (!isLoggedIn) { toast.error("Connectez-vous pour faire un don."); return; }
    const amount = parseFloat(donAmount.replace(",", "."));
    if (isNaN(amount) || amount < 1) { setDonError("Montant minimum : 1,00 $"); return; }
    if (amount > 1000) { setDonError("Montant maximum : 1 000,00 $"); return; }
    const cents = Math.round(amount * 100);
    setLoadingId("don_libre");
    donCheckoutMutation.mutate({ amountCents: cents, origin: window.location.origin });
  }

  function handleClose() {
    setView("home");
    onClose();
  }

  const headerTitle = {
    home: "BOUTIQUE",
    packs: "PACKS DE CARTES",
    don: "SOUTENIR LE PROJET",
    skins: "SKINS DE CARTES",
  }[view];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="relative w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[88dvh] overflow-hidden rounded-3xl border-[4px] border-black flex flex-col"
            style={{
              background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)",
              boxShadow: "8px 8px 0px #000",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b-[3px] border-black"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)" }}
            >
              <div className="flex items-center gap-2">
                {view !== "home" && (
                  <button
                    onClick={() => setView("home")}
                    className="w-8 h-8 rounded-lg border-[2px] border-white/30 bg-white/10 flex items-center justify-center mr-1 active:scale-95 transition-transform"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                )}
                <ShoppingBag className="w-6 h-6 text-white" />
                <span style={{ ...FONT_BANGERS, fontSize: "1.6rem", color: "#fff" }}>
                  {headerTitle}
                </span>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-xl border-[3px] border-white/30 bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* ── Contenu ── */}
            <AnimatePresence mode="wait">

              {/* ── VUE ACCUEIL ── */}
              {view === "home" && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-y-auto flex-1 px-5 py-5 space-y-3"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {!isLoggedIn && (
                    <div className="p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl">
                      <p style={FONT_FREDOKA} className="text-yellow-300 text-xs text-center">
                        Connectez-vous pour acheter ou faire un don.
                      </p>
                    </div>
                  )}

                  {/* Bouton Packs de cartes */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setView("packs")}
                    className="w-full rounded-2xl border-[3px] border-black overflow-hidden"
                    style={{ boxShadow: "4px 4px 0px #000" }}
                  >
                    <div className="w-full py-1 border-b-[2px] border-black text-center" style={{ background: "#34C759", fontFamily: "'Bangers', cursive", fontSize: "0.7rem", letterSpacing: "0.08em", color: "#fff" }}>
                      15 CARTES GRATUITES INCLUSES
                    </div>
                    <div className="flex items-center gap-4 px-4 py-4" style={{ background: "rgba(52,199,89,0.12)" }}>
                      <div className="w-14 h-14 rounded-xl border-[3px] border-black flex items-center justify-center flex-shrink-0" style={{ background: "#34C759", boxShadow: "3px 3px 0px #000" }}>
                        <Layers className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div style={{ ...FONT_BANGERS, fontSize: "1.25rem" }} className="text-white leading-none">
                          PACKS DE CARTES
                        </div>
                        <div style={FONT_FREDOKA} className="text-white/60 text-xs mt-1 leading-tight">
                          Débloquez des cartes personnalisables supplémentaires — de 2,99 $ à 9,99 $
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-white/60 flex-shrink-0" />
                    </div>
                  </motion.button>

                  {/* Bouton Skins de cartes */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setView("skins")}
                    className="w-full rounded-2xl border-[3px] border-black overflow-hidden"
                    style={{ boxShadow: "4px 4px 0px #000" }}
                  >
                    <div className="w-full py-1 border-b-[2px] border-black text-center" style={{ background: "#7C3AED", fontFamily: "'Bangers', cursive", fontSize: "0.7rem", letterSpacing: "0.08em", color: "#fff" }}>
                      1 SKIN GRATUIT INCLUS
                    </div>
                    <div className="flex items-center gap-4 px-4 py-4" style={{ background: "rgba(124,58,237,0.12)" }}>
                      <div className="w-14 h-14 rounded-xl border-[3px] border-black flex items-center justify-center flex-shrink-0" style={{ background: "#7C3AED", boxShadow: "3px 3px 0px #000" }}>
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div style={{ ...FONT_BANGERS, fontSize: "1.25rem" }} className="text-white leading-none">
                          SKINS DE CARTES
                        </div>
                        <div style={FONT_FREDOKA} className="text-white/60 text-xs mt-1 leading-tight">
                          6 designs exclusifs — Néon, Rétro, Glace, Feu, Royal — 2,99 $ chacun
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-white/60 flex-shrink-0" />
                    </div>
                  </motion.button>

                  {/* Bouton Don */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setView("don")}
                    className="w-full rounded-2xl border-[3px] border-black overflow-hidden"
                    style={{ boxShadow: "4px 4px 0px #000" }}
                  >
                    <div className="flex items-center gap-4 px-4 py-4" style={{ background: "rgba(239,68,68,0.12)" }}>
                      <div className="w-14 h-14 rounded-xl border-[3px] border-black flex items-center justify-center flex-shrink-0" style={{ background: "#EF4444", boxShadow: "3px 3px 0px #000" }}>
                        <Heart className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div style={{ ...FONT_BANGERS, fontSize: "1.25rem" }} className="text-white leading-none">
                          SOUTENIR LE PROJET
                        </div>
                        <div style={FONT_FREDOKA} className="text-white/60 text-xs mt-1 leading-tight">
                          Don libre — vous choisissez le montant
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-white/60 flex-shrink-0" />
                    </div>
                  </motion.button>

                  {/* Séparateur */}
                  <div className="border-t-[2px] border-white/10 pt-1" />

                  {/* Bientôt disponible */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Lock className="w-4 h-4 text-yellow-400" />
                      <span style={{ ...FONT_BANGERS, fontSize: "1.1rem" }} className="text-yellow-400">
                        BIENTÔT DISPONIBLE
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {COMING_SOON.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.name}
                            className="p-3 rounded-xl border-[2px] border-white/10 flex items-center gap-2 opacity-45"
                            style={{ background: "rgba(255,255,255,0.03)" }}
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.color + "30" }}>
                              <Icon className="w-4 h-4" style={{ color: item.color }} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div style={{ ...FONT_BANGERS, fontSize: "0.78rem" }} className="text-white/70 leading-none">{item.name}</div>
                              <div style={FONT_FREDOKA} className="text-white/40 text-[0.58rem] leading-tight mt-0.5">{item.desc}</div>
                            </div>
                            <Lock className="w-3 h-3 text-white/25 flex-shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p style={FONT_FREDOKA} className="text-white/25 text-[10px] text-center pb-1">
                    Ticket Cricket 2026 — Projet 100 % québécois
                  </p>
                </motion.div>
              )}

              {/* ── VUE PACKS ── */}
              {view === "packs" && (
                <motion.div
                  key="packs"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-y-auto flex-1 px-4 py-4 flex flex-col gap-3"
                  style={{ scrollbarWidth: "thin" }}
                >
                  <p style={FONT_FREDOKA} className="text-white/50 text-xs text-center">
                    Vous avez déjà 15 cartes personnalisables gratuites. Les packs s'ajoutent par-dessus.
                  </p>

                  {!isLoggedIn && (
                    <div className="p-2.5 bg-yellow-400/10 border border-yellow-400/30 rounded-xl">
                      <p style={FONT_FREDOKA} className="text-yellow-300 text-xs text-center">
                        Connectez-vous pour acheter un pack.
                      </p>
                    </div>
                  )}

                  {CARD_PACKS.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl border-[3px] border-black overflow-hidden"
                      style={{ background: p.color + "18", boxShadow: "3px 3px 0px #000" }}
                    >
                      {/* Bandeau badge */}
                      <div
                        className="w-full text-center py-1 border-b-[2px] border-black"
                        style={{ background: p.color, fontFamily: "'Bangers', cursive", fontSize: "0.72rem", letterSpacing: "0.1em", color: "#fff" }}
                      >
                        {p.badge}
                      </div>

                      {/* Corps : icône | infos | prix+bouton */}
                      <div className="flex items-center gap-3 px-3 py-3">
                        <div
                          className="w-11 h-11 rounded-xl border-[3px] border-black flex items-center justify-center flex-shrink-0"
                          style={{ background: p.color, boxShadow: "2px 2px 0px #000" }}
                        >
                          <Layers className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div style={{ ...FONT_BANGERS, fontSize: "1rem", lineHeight: 1 }} className="text-white">
                            {p.name}
                          </div>
                          <div style={{ ...FONT_BANGERS, fontSize: "1.45rem", lineHeight: 1.1 }}>
                            <span style={{ color: p.color }}>+{p.cards}</span>
                            <span style={{ ...FONT_FREDOKA, fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginLeft: "4px" }}>cartes</span>
                          </div>
                          <div style={{ ...FONT_FREDOKA, fontSize: "0.62rem" }} className="text-white/45 leading-tight">
                            Total avec les 15 gratuites : <span style={{ color: p.color, fontWeight: 700 }}>{p.total} cartes</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <div
                            className="px-2.5 py-0.5 rounded-lg border-[2px] border-black"
                            style={{ background: p.color, fontFamily: "'Bangers', cursive", fontSize: "1.1rem", color: "#fff", letterSpacing: "0.04em", boxShadow: "1px 1px 0px #000" }}
                          >
                            {p.price}
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.93 }}
                            onClick={() => handleBuyPack(p.id)}
                            disabled={!isLoggedIn || !!loadingId}
                            className="px-3 py-1.5 rounded-xl border-[3px] border-black text-black transition-opacity disabled:opacity-40 flex items-center justify-center gap-1"
                            style={{ background: "#FFD700", fontFamily: "'Bangers', cursive", fontSize: "0.9rem", letterSpacing: "0.05em", boxShadow: "2px 2px 0px #000" }}
                          >
                            {loadingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            ACHETER
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <p style={FONT_FREDOKA} className="text-white/25 text-[10px] text-center pb-1">
                    Paiement sécurisé via Stripe — Achat permanent et non remboursable.
                  </p>
                </motion.div>
              )}

              {/* ── VUE SKINS ── */}
              {view === "skins" && (
                <motion.div
                  key="skins"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {/* ── Layout 2 colonnes sur PC, 1 colonne sur mobile ── */}
                  <div className="flex-1 overflow-y-auto flex flex-col md:flex-row gap-0 min-h-0">

                    {/* ── Colonne gauche : sélecteur de skin ── */}
                    <div className="px-4 pt-4 pb-3 flex-shrink-0 md:w-44 md:border-r md:border-white/10 md:overflow-y-auto">
                      <p style={FONT_FREDOKA} className="text-white/50 text-[0.65rem] text-center mb-2">
                        Choisir un skin
                      </p>
                      <div className="grid grid-cols-5 md:grid-cols-1 gap-2">
                        {SKIN_CATALOG.filter((s) => s.id !== "classique").map((skin: SkinMeta) => {
                          const Icon = SKIN_ICON_MAP[skin.id];
                          const isOwned = ownedSkins.includes(skin.id);
                          const isSelected = previewSkin === skin.id;
                          return (
                            <motion.button
                              key={skin.id}
                              whileTap={{ scale: 0.92 }}
                              onClick={() => setPreviewSkin(skin.id)}
                              className="flex md:flex-row flex-col items-center gap-1 md:gap-2.5 py-2 px-1 md:px-3 rounded-xl border-[2px] transition-all"
                              style={{
                                background: isSelected ? skin.color + "33" : "rgba(255,255,255,0.06)",
                                borderColor: isSelected ? skin.color : "rgba(255,255,255,0.15)",
                                boxShadow: isSelected ? `0 0 8px ${skin.color}88` : "none",
                              }}
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center relative flex-shrink-0"
                                style={{ background: skin.color }}
                              >
                                <Icon className="w-4 h-4 text-white" />
                                {isOwned && (
                                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 border border-black flex items-center justify-center">
                                    <Check className="w-2 h-2 text-black" />
                                  </div>
                                )}
                              </div>
                              <span
                                style={{ fontFamily: "'Fredoka One', cursive", fontSize: "0.7rem", lineHeight: 1.1, color: isSelected ? skin.color : "rgba(255,255,255,0.6)" }}
                                className="text-center md:text-left leading-tight"
                              >
                                {skin.name}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── Colonne droite : aperçu + achat ── */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3" style={{ scrollbarWidth: "thin" }}>
                      {(() => {
                        const activeSkin = SKIN_CATALOG.find((s) => s.id === previewSkin)!;
                        const isOwned = ownedSkins.includes(previewSkin);
                        return (
                          <>
                            {/* Titre du skin actif */}
                            <div className="flex items-center justify-center gap-2 mb-4">
                              <div
                                className="w-7 h-7 rounded-md flex items-center justify-center"
                                style={{ background: activeSkin.color }}
                              >
                                {(() => { const Icon = SKIN_ICON_MAP[previewSkin]; return <Icon className="w-4 h-4 text-white" />; })()}
                              </div>
                              <span style={{ ...FONT_BANGERS, fontSize: "1.3rem", color: activeSkin.color }}>
                                {activeSkin.name.toUpperCase()}
                              </span>
                              <span style={FONT_FREDOKA} className="text-white/40 text-xs hidden md:inline">
                                — {activeSkin.description}
                              </span>
                            </div>

                            {/* 3 cartes — plus grandes sur PC */}
                            <div className="flex gap-3 justify-center items-start mb-4">
                              <div className="flex flex-col items-center gap-1.5">
                                <GeneratedCard card={DEMO_CONTRAVENTION} size="xs" skinId={previewSkin} mefaitOverride="Excès de vitesse en zone scolaire" style={{ width: 110, height: 154 }} />
                                <span style={FONT_FREDOKA} className="text-white/50 text-[0.6rem]">Contravention</span>
                              </div>
                              <div className="flex flex-col items-center gap-1.5">
                                <GeneratedCard card={DEMO_CONTRIBUABLE} size="xs" skinId={previewSkin} mefaitOverride="Remboursement d'impôt reçu" style={{ width: 110, height: 154 }} />
                                <span style={FONT_FREDOKA} className="text-white/50 text-[0.6rem]">Contribuable</span>
                              </div>
                              <div className="flex flex-col items-center gap-1.5">
                                <GeneratedCard card={DEMO_INVESTISSEUR} size="xs" skinId={previewSkin} mefaitOverride="Dividendes versés aux actionnaires" style={{ width: 110, height: 154 }} />
                                <span style={FONT_FREDOKA} className="text-white/50 text-[0.6rem]">Investisseur</span>
                              </div>
                            </div>

                            {/* Panneau achat */}
                            <div className="rounded-2xl border-[3px] border-black overflow-hidden" style={{ boxShadow: "3px 3px 0px #000" }}>
                              <div
                                className="px-4 py-2.5 flex items-center justify-between"
                                style={{ background: activeSkin.color + "33", borderBottom: `2px solid ${activeSkin.color}55` }}
                              >
                                <div className="flex flex-col">
                                  <span style={{ ...FONT_BANGERS, fontSize: "1.1rem", color: activeSkin.color }}>
                                    {activeSkin.name.toUpperCase()}
                                  </span>
                                  <span style={FONT_FREDOKA} className="text-white/40 text-[0.65rem]">
                                    {activeSkin.description}
                                  </span>
                                </div>
                                {isOwned ? (
                                  <span
                                    className="px-3 py-1 rounded-lg border-[2px] border-black text-sm flex-shrink-0"
                                    style={{ background: "#34C759", fontFamily: "'Bangers', cursive", color: "#fff", letterSpacing: "0.05em" }}
                                  >
                                    ✓ DÉBLOQUÉ
                                  </span>
                                ) : (
                                  <span
                                    className="px-3 py-1 rounded-lg border-[2px] border-black flex-shrink-0"
                                    style={{ background: activeSkin.color, fontFamily: "'Bangers', cursive", fontSize: "1.1rem", color: "#fff" }}
                                  >
                                    {activeSkin.price}
                                  </span>
                                )}
                              </div>
                              <div className="px-4 py-3 flex items-center justify-between" style={{ background: "rgba(0,0,0,0.3)" }}>
                                <p style={FONT_FREDOKA} className="text-white/50 text-xs">
                                  {isOwned ? "Skin déjà dans votre collection." : "Achat unique — disponible sur tous vos appareils."}
                                </p>
                                {!isOwned && (
                                  <motion.button
                                    whileTap={{ scale: 0.93 }}
                                    onClick={() => handleBuySkin(activeSkin.productId)}
                                    disabled={!isLoggedIn || !!loadingId}
                                    className="ml-3 px-5 py-2 rounded-xl border-[3px] border-black text-black disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0"
                                    style={{ background: "#FFD700", fontFamily: "'Bangers', cursive", fontSize: "1.1rem", letterSpacing: "0.05em", boxShadow: "2px 2px 0px #000" }}
                                  >
                                    {loadingId === activeSkin.productId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                                    ACHETER
                                  </motion.button>
                                )}
                              </div>
                            </div>

                            {!isLoggedIn && (
                              <div className="mt-2 p-2.5 bg-yellow-400/10 border border-yellow-400/30 rounded-xl">
                                <p style={FONT_FREDOKA} className="text-yellow-300 text-xs text-center">
                                  Connectez-vous pour acheter un skin.
                                </p>
                              </div>
                            )}

                            <p style={FONT_FREDOKA} className="text-white/20 text-[10px] text-center mt-2 pb-1">
                              Paiement sécurisé via Stripe — Achat permanent et non remboursable.
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── VUE DON ── */}
              {view === "don" && (
                <motion.div
                  key="don"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-y-auto flex-1 px-5 py-5 space-y-4"
                  style={{ scrollbarWidth: "thin" }}
                >
                  <div className="flex flex-col items-center gap-3 pb-2">
                    <div className="w-20 h-20 rounded-2xl border-[4px] border-black flex items-center justify-center" style={{ background: "#EF4444", boxShadow: "4px 4px 0px #000" }}>
                      <Heart className="w-10 h-10 text-white" />
                    </div>
                    <p style={FONT_FREDOKA} className="text-white/60 text-sm text-center leading-snug">
                      Votre don aide à créer la version physique et à continuer le développement. Vous choisissez le montant.
                    </p>
                  </div>

                  {/* Montants rapides */}
                  <div className="grid grid-cols-4 gap-2">
                    {["2", "5", "10", "25"].map((amt) => (
                      <motion.button
                        key={amt}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDonAmount(amt)}
                        className="py-2.5 rounded-xl border-[3px] border-black text-center transition-all"
                        style={{
                          background: donAmount === amt ? "#EF4444" : "rgba(255,255,255,0.08)",
                          fontFamily: "'Bangers', cursive",
                          fontSize: "1.1rem",
                          color: "#fff",
                          boxShadow: donAmount === amt ? "2px 2px 0px #000" : "none",
                        }}
                      >
                        {amt}$
                      </motion.button>
                    ))}
                  </div>

                  {/* Input montant libre */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        value={donAmount}
                        onChange={(e) => { setDonAmount(e.target.value); setDonError(null); }}
                        min="1"
                        max="1000"
                        step="0.01"
                        className="w-full px-4 py-3 bg-white/10 border-[3px] border-white/20 rounded-xl text-white focus:outline-none focus:border-red-400/60 transition-colors"
                        style={FONT_FREDOKA}
                        placeholder="Autre montant..."
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" style={FONT_FREDOKA}>$</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDon}
                      disabled={!!loadingId}
                      className="px-5 py-3 rounded-xl border-[3px] border-black text-white disabled:opacity-40 flex items-center gap-1"
                      style={{ background: "#EF4444", fontFamily: "'Bangers', cursive", fontSize: "1.1rem", boxShadow: "2px 2px 0px #000" }}
                    >
                      {loadingId === "don_libre" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      DONNER
                    </motion.button>
                  </div>

                  {donError && (
                    <p style={FONT_FREDOKA} className="text-red-400 text-xs text-center">{donError}</p>
                  )}
                  <p style={FONT_FREDOKA} className="text-white/30 text-[10px] text-center">
                    Paiement sécurisé via Stripe. Aucun remboursement sur les dons.
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

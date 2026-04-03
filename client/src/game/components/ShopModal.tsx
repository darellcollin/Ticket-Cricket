/**
 * ShopModal — Boutique en jeu Ticket Cricket.
 * Vue principale avec boutons de navigation.
 * Clic sur "Packs de cartes" → vue dédiée avec les 3 packs.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Layers, Heart, Sparkles, Gift, Crown, Star, ShoppingBag, Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive", letterSpacing: "0.06em" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

interface ShopModalProps {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}

const CARD_PACKS = [
  {
    id: "pack_35",
    name: "Pack Starter",
    cards: 35,
    price: "2,99 $",
    priceCents: 299,
    color: "#34C759",
    badge: "POPULAIRE",
    perks: ["35 cartes permanentes", "Idéal pour commencer", "Accès immédiat"],
  },
  {
    id: "pack_55",
    name: "Pack Pro",
    cards: 55,
    price: "6,99 $",
    priceCents: 699,
    color: "#007AFF",
    badge: "MEILLEURE VALEUR",
    perks: ["55 cartes permanentes", "Meilleur rapport qualité/prix", "Accès immédiat"],
  },
  {
    id: "pack_85",
    name: "Pack Ultimate",
    cards: 85,
    price: "9,99 $",
    priceCents: 999,
    color: "#AF52DE",
    badge: "MAXIMUM",
    perks: ["85 cartes permanentes", "Collection complète", "Accès immédiat"],
  },
];

const COMING_SOON = [
  { icon: Sparkles, name: "Skins de cartes",    desc: "Designs exclusifs pour vos cartes",  color: "#7C3AED" },
  { icon: Gift,     name: "Decks exclusifs",    desc: "Nouveaux tickets thématiques",        color: "#FF9500" },
  { icon: Crown,    name: "Skins + Decks",      desc: "Bundles exclusifs en préparation",   color: "#F59E0B" },
  { icon: Star,     name: "Contenu saisonnier", desc: "Événements et cartes limitées",       color: "#FFD700" },
];

type View = "home" | "packs" | "don";

export function ShopModal({ open, onClose, isLoggedIn }: ShopModalProps) {
  const [view, setView] = useState<View>("home");
  const [selectedPack, setSelectedPack] = useState<number>(1); // index 0-2
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [donAmount, setDonAmount] = useState<string>("5");
  const [donError, setDonError] = useState<string | null>(null);

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
    if (!isLoggedIn) {
      toast.error("Connectez-vous pour acheter.");
      return;
    }
    setLoadingId(productId);
    checkoutMutation.mutate({ productId, origin: window.location.origin });
  }

  function handleDon() {
    setDonError(null);
    if (!isLoggedIn) {
      toast.error("Connectez-vous pour faire un don.");
      return;
    }
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

  const pack = CARD_PACKS[selectedPack];

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
            className="relative w-full max-w-md max-h-[88dvh] overflow-hidden rounded-3xl border-[4px] border-black flex flex-col"
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
                  {view === "home" ? "BOUTIQUE" : view === "packs" ? "PACKS DE CARTES" : "SOUTENIR LE PROJET"}
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
                  className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-4"
                  style={{ scrollbarWidth: "thin" }}
                >
                  <p style={FONT_FREDOKA} className="text-white/50 text-xs text-center">
                    15 cartes gratuites incluses. Débloquez-en plus de façon permanente.
                  </p>

                  {/* Sélecteur de pack — navigation gauche/droite */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedPack((p) => (p - 1 + CARD_PACKS.length) % CARD_PACKS.length)}
                      className="w-10 h-10 rounded-xl border-[3px] border-white/20 bg-white/8 flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                    >
                      <ChevronLeft className="w-5 h-5 text-white/70" />
                    </button>

                    {/* Carte du pack sélectionné */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={pack.id}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ duration: 0.15 }}
                        className="flex-1 rounded-2xl border-[3px] border-black overflow-hidden"
                        style={{ background: pack.color + "20", boxShadow: "4px 4px 0px #000" }}
                      >
                        {/* Badge */}
                        <div
                          className="w-full text-center py-1.5 border-b-[2px] border-black"
                          style={{ background: pack.color, fontFamily: "'Bangers', cursive", fontSize: "0.85rem", letterSpacing: "0.1em", color: "#fff" }}
                        >
                          {pack.badge}
                        </div>

                        <div className="p-5 flex flex-col items-center gap-4">
                          {/* Icône + nom */}
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className="w-20 h-20 rounded-2xl border-[4px] border-black flex items-center justify-center"
                              style={{ background: pack.color, boxShadow: "4px 4px 0px #000" }}
                            >
                              <Layers className="w-10 h-10 text-white" />
                            </div>
                            <div style={{ ...FONT_BANGERS, fontSize: "1.5rem" }} className="text-white text-center">
                              {pack.name}
                            </div>
                            <div
                              className="px-4 py-1 rounded-full border-[2px] border-black"
                              style={{ background: pack.color, fontFamily: "'Bangers', cursive", fontSize: "1.8rem", color: "#fff", letterSpacing: "0.04em", boxShadow: "2px 2px 0px #000" }}
                            >
                              {pack.cards} cartes
                            </div>
                          </div>

                          {/* Avantages */}
                          <div className="w-full space-y-2">
                            {pack.perks.map((perk) => (
                              <div key={perk} className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full border-[2px] border-black flex items-center justify-center flex-shrink-0" style={{ background: pack.color }}>
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                                <span style={FONT_FREDOKA} className="text-white/80 text-sm">{perk}</span>
                              </div>
                            ))}
                          </div>

                          {/* Prix + bouton */}
                          <div className="w-full flex flex-col items-center gap-2">
                            <div
                              className="px-6 py-2 rounded-xl border-[3px] border-black"
                              style={{ background: pack.color, fontFamily: "'Bangers', cursive", fontSize: "2rem", color: "#fff", letterSpacing: "0.04em", boxShadow: "3px 3px 0px #000" }}
                            >
                              {pack.price}
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              onClick={() => handleBuyPack(pack.id)}
                              disabled={!isLoggedIn || !!loadingId}
                              className="w-full py-3 rounded-2xl border-[4px] border-black text-black transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                              style={{ background: "#FFD700", fontFamily: "'Bangers', cursive", fontSize: "1.3rem", letterSpacing: "0.06em", boxShadow: "4px 4px 0px #000" }}
                            >
                              {loadingId === pack.id ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                              ACHETER
                            </motion.button>
                            {!isLoggedIn && (
                              <p style={FONT_FREDOKA} className="text-yellow-300 text-xs text-center">
                                Connectez-vous pour acheter.
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <button
                      onClick={() => setSelectedPack((p) => (p + 1) % CARD_PACKS.length)}
                      className="w-10 h-10 rounded-xl border-[3px] border-white/20 bg-white/8 flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                    >
                      <ChevronRight className="w-5 h-5 text-white/70" />
                    </button>
                  </div>

                  {/* Indicateurs de position */}
                  <div className="flex justify-center gap-2">
                    {CARD_PACKS.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPack(i)}
                        className="rounded-full border-[2px] border-black transition-all"
                        style={{
                          width: i === selectedPack ? "2rem" : "0.6rem",
                          height: "0.6rem",
                          background: i === selectedPack ? CARD_PACKS[i].color : "rgba(255,255,255,0.2)",
                        }}
                      />
                    ))}
                  </div>

                  <p style={FONT_FREDOKA} className="text-white/25 text-[10px] text-center">
                    Paiement sécurisé via Stripe. Achat permanent et non remboursable.
                  </p>
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

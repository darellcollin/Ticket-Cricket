/**
 * ShopModal — Boutique en jeu Ticket Cricket.
 * Packs de cartes personnalisables disponibles + don libre.
 * Skins, decks et packs de personnalisation verrouillés (bientôt).
 */
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Layers, Heart, Sparkles, Gift, Crown, Star, ShoppingBag, Loader2 } from "lucide-react";
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
    id: "card_pack_35",
    name: "Pack 35 cartes",
    description: "35 cartes personnalisables supplémentaires, permanentes.",
    price: "2,99 $",
    extraCards: 35,
    color: "#34C759",
    badge: "POPULAIRE",
  },
  {
    id: "card_pack_55",
    name: "Pack 55 cartes",
    description: "55 cartes personnalisables supplémentaires, permanentes.",
    price: "6,99 $",
    extraCards: 55,
    color: "#007AFF",
    badge: "MEILLEURE VALEUR",
  },
  {
    id: "card_pack_85",
    name: "Pack 85 cartes",
    description: "85 cartes personnalisables supplémentaires, permanentes.",
    price: "9,99 $",
    extraCards: 85,
    color: "#AF52DE",
    badge: "MAXIMUM",
  },
];

const COMING_SOON = [
  { icon: Sparkles, name: "Skins de cartes",          desc: "Designs exclusifs pour vos cartes",     color: "#7C3AED" },
  { icon: Gift,     name: "Decks exclusifs",           desc: "Nouveaux tickets thématiques",           color: "#FF9500" },
  { icon: Crown,    name: "Packs de personnalisation", desc: "Skins + Decks en bundle",                color: "#F59E0B" },
  { icon: Star,     name: "Contenu saisonnier",        desc: "Événements et cartes limitées",          color: "#FFD700" },
];

export function ShopModal({ open, onClose, isLoggedIn }: ShopModalProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [donAmount, setDonAmount] = useState<string>("5");
  const [donError, setDonError] = useState<string | null>(null);
  const [showDonInput, setShowDonInput] = useState(false);

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
    if (isNaN(amount) || amount < 1) {
      setDonError("Montant minimum : 1,00 $");
      return;
    }
    if (amount > 1000) {
      setDonError("Montant maximum : 1 000,00 $");
      return;
    }
    const cents = Math.round(amount * 100);
    setLoadingId("don_libre");
    donCheckoutMutation.mutate({ amountCents: cents, origin: window.location.origin });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
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
                <ShoppingBag className="w-6 h-6 text-white" />
                <span style={{ ...FONT_BANGERS, fontSize: "1.6rem", color: "#fff" }}>
                  BOUTIQUE
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl border-[3px] border-white/30 bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* ── Contenu scrollable ── */}
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5" style={{ scrollbarWidth: "thin" }}>

              {/* ── PACKS DE CARTES PERSONNALISABLES ── */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-5 h-5 text-green-400" />
                  <span style={{ ...FONT_BANGERS, fontSize: "1.2rem" }} className="text-white">
                    PACKS DE CARTES PERSONNALISABLES
                  </span>
                </div>
                <p style={FONT_FREDOKA} className="text-white/50 text-xs mb-3">
                  15 cartes gratuites incluses. Débloquez-en plus de façon permanente.
                </p>

                {!isLoggedIn && (
                  <div className="mb-3 p-2.5 bg-yellow-400/10 border border-yellow-400/30 rounded-xl">
                    <p style={FONT_FREDOKA} className="text-yellow-300 text-xs text-center">
                      Connectez-vous pour acheter des packs.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {CARD_PACKS.map((pack) => (
                    <motion.div
                      key={pack.id}
                      className="relative p-3 rounded-2xl border-[3px] border-black flex items-center gap-3 overflow-hidden"
                      style={{ background: pack.color + "22", boxShadow: "3px 3px 0px #000" }}
                      whileHover={{ scale: 1.01 }}
                    >
                      {/* Badge */}
                      {pack.badge && (
                        <div
                          className="absolute -top-2 right-3 px-2 py-0.5 rounded-full border-2 border-black text-[0.55rem]"
                          style={{ background: pack.color, color: "#000", fontFamily: "'Bangers', cursive", letterSpacing: "0.05em" }}
                        >
                          {pack.badge}
                        </div>
                      )}

                      {/* Icône */}
                      <div
                        className="w-11 h-11 rounded-xl border-[3px] border-black flex items-center justify-center flex-shrink-0"
                        style={{ background: pack.color, boxShadow: "2px 2px 0px #000" }}
                      >
                        <Layers className="w-5 h-5 text-white" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-white leading-none">
                          {pack.name}
                        </div>
                        <div style={FONT_FREDOKA} className="text-white/55 text-xs mt-0.5 leading-tight">
                          {pack.description}
                        </div>
                      </div>

                      {/* Prix + bouton */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <div style={{ ...FONT_BANGERS, fontSize: "1.1rem", color: pack.color }}>
                          {pack.price}
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleBuyPack(pack.id)}
                          disabled={!isLoggedIn || !!loadingId}
                          className="px-3 py-1.5 rounded-xl border-[3px] border-black text-black transition-opacity disabled:opacity-40 flex items-center gap-1"
                          style={{ background: pack.color, fontFamily: "'Bangers', cursive", fontSize: "0.9rem", boxShadow: "2px 2px 0px #000" }}
                        >
                          {loadingId === pack.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                          ACHETER
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* ── Séparateur ── */}
              <div className="border-t-[2px] border-white/10" />

              {/* ── DON LIBRE ── */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span style={{ ...FONT_BANGERS, fontSize: "1.2rem" }} className="text-white">
                    SOUTENIR LE PROJET
                  </span>
                </div>
                <p style={FONT_FREDOKA} className="text-white/50 text-xs mb-3">
                  Votre don aide à créer la version physique et à continuer le développement. Vous choisissez le montant.
                </p>

                {!showDonInput ? (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowDonInput(true)}
                    className="w-full py-3 rounded-2xl border-[3px] border-black flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #EF444488, #FF3B3088)", boxShadow: "3px 3px 0px #000" }}
                  >
                    <Heart className="w-5 h-5 text-white" />
                    <span style={{ ...FONT_BANGERS, fontSize: "1.1rem" }} className="text-white">
                      FAIRE UN DON — MONTANT LIBRE
                    </span>
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl border-[3px] border-black space-y-3"
                    style={{ background: "rgba(239,68,68,0.12)", boxShadow: "3px 3px 0px #000" }}
                  >
                    <p style={FONT_FREDOKA} className="text-white/70 text-sm text-center">
                      Choisissez le montant de votre don (en $CAD)
                    </p>

                    {/* Montants rapides */}
                    <div className="grid grid-cols-4 gap-2">
                      {["2", "5", "10", "25"].map((amt) => (
                        <motion.button
                          key={amt}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDonAmount(amt)}
                          className="py-2 rounded-xl border-[3px] border-black text-center transition-all"
                          style={{
                            background: donAmount === amt ? "#EF4444" : "rgba(255,255,255,0.08)",
                            fontFamily: "'Bangers', cursive",
                            fontSize: "1rem",
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
                          className="w-full px-4 py-2.5 bg-white/10 border-[3px] border-white/20 rounded-xl text-white focus:outline-none focus:border-red-400/60 transition-colors"
                          style={FONT_FREDOKA}
                          placeholder="Autre montant..."
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" style={FONT_FREDOKA}>$</span>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDon}
                        disabled={!!loadingId}
                        className="px-4 py-2.5 rounded-xl border-[3px] border-black text-white disabled:opacity-40 flex items-center gap-1"
                        style={{ background: "#EF4444", fontFamily: "'Bangers', cursive", fontSize: "1rem", boxShadow: "2px 2px 0px #000" }}
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
              </div>

              {/* ── Séparateur ── */}
              <div className="border-t-[2px] border-white/10" />

              {/* ── BIENTÔT DISPONIBLE ── */}
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
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: item.color + "30" }}
                        >
                          <Icon className="w-4 h-4" style={{ color: item.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div style={{ ...FONT_BANGERS, fontSize: "0.78rem" }} className="text-white/70 leading-none">
                            {item.name}
                          </div>
                          <div style={FONT_FREDOKA} className="text-white/40 text-[0.58rem] leading-tight mt-0.5">
                            {item.desc}
                          </div>
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

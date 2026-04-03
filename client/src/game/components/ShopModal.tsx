/**
 * ShopModal — Boutique en jeu Ticket Cricket.
 * Dons disponibles via Stripe. Skins/Decks/Packs à venir.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Palette, Package, Sparkles, Heart, ShoppingBag, ExternalLink, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

interface ShopModalProps {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}

const DON_PRODUCTS = [
  { id: "don_5",  label: "5 $",  desc: "Un petit coup de pouce",     color: "#EF4444" },
  { id: "don_10", label: "10 $", desc: "Soutenir généreusement",     color: "#FF6B6B" },
  { id: "don_25", label: "25 $", desc: "Grand soutien au projet",    color: "#FF3B30" },
];

const COMING_SOON = [
  { icon: Palette,  title: "Skins de cartes",          desc: "Designs exclusifs pour vos cartes.", color: "#7C3AED", bg: "linear-gradient(135deg,#7C3AED,#A855F7)" },
  { icon: Package,  title: "Decks exclusifs",           desc: "Nouveaux tickets inédits.",          color: "#0EA5E9", bg: "linear-gradient(135deg,#0EA5E9,#38BDF8)" },
  { icon: Sparkles, title: "Packs de personnalisation", desc: "Avatars, effets et animations.",     color: "#F59E0B", bg: "linear-gradient(135deg,#F59E0B,#FCD34D)" },
];

export function ShopModal({ open, onClose, isLoggedIn }: ShopModalProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const createCheckout = trpc.shop.createCheckout.useMutation({
    onSuccess: ({ url }) => {
      if (url) {
        toast.success("Redirection vers le paiement...");
        window.open(url, "_blank");
      }
      setLoadingId(null);
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la création du paiement.");
      setLoadingId(null);
    },
  });

  const handleBuy = (productId: string) => {
    if (!isLoggedIn) {
      toast.error("Vous devez être connecté pour effectuer un achat.");
      return;
    }
    setLoadingId(productId);
    createCheckout.mutate({ productId, origin: window.location.origin });
  };

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
                <span style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.08em", color: "#fff" }}>
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

              {/* ── Section Dons ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span style={{ ...FONT_BANGERS, fontSize: "1.2rem", letterSpacing: "0.06em" }} className="text-white">
                    SOUTENIR LE PROJET
                  </span>
                </div>
                <p style={FONT_FREDOKA} className="text-white/60 text-xs mb-3 leading-relaxed">
                  Votre don aide à créer la version physique et à continuer le développement.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {DON_PRODUCTS.map((don) => {
                    const isLoading = loadingId === don.id;
                    return (
                      <motion.button
                        key={don.id}
                        whileHover={isLoggedIn ? { scale: 1.05, y: -2 } as any : {}}
                        whileTap={isLoggedIn ? { scale: 0.95 } as any : {}}
                        onClick={() => handleBuy(don.id)}
                        disabled={isLoading || !!loadingId}
                        className="relative rounded-2xl border-[3px] border-black py-3 px-2 flex flex-col items-center gap-1 overflow-hidden transition-opacity"
                        style={{
                          background: `linear-gradient(135deg, ${don.color}cc, ${don.color}88)`,
                          boxShadow: "4px 4px 0px #000",
                          opacity: loadingId && loadingId !== don.id ? 0.5 : 1,
                        }}
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                          <Heart className="w-5 h-5 text-white" />
                        )}
                        <span style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.06em" }} className="text-white">
                          {don.label}
                        </span>
                        <span style={FONT_FREDOKA} className="text-white/80 text-[10px] text-center leading-tight">
                          {don.desc}
                        </span>
                        {!isLoggedIn && (
                          <div className="absolute inset-0 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                            <Lock className="w-5 h-5 text-white/70" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                {!isLoggedIn && (
                  <p style={FONT_FREDOKA} className="text-yellow-400/70 text-xs text-center mt-2">
                    Connectez-vous pour effectuer un don.
                  </p>
                )}
                <p style={FONT_FREDOKA} className="text-white/35 text-[10px] text-center mt-2">
                  Paiement sécurisé via Stripe. Aucun remboursement sur les dons.
                </p>
              </div>

              {/* ── Séparateur ── */}
              <div className="border-t-[2px] border-white/10" />

              {/* ── Section Bientôt disponible ── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-yellow-400" />
                  <span style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.06em" }} className="text-yellow-400">
                    BIENTÔT DISPONIBLE
                  </span>
                </div>
                <div className="space-y-2">
                  {COMING_SOON.map((cat, i) => {
                    const Icon = cat.icon;
                    return (
                      <div
                        key={i}
                        className="relative rounded-2xl border-[3px] border-black overflow-hidden"
                        style={{ boxShadow: "3px 3px 0px #000", opacity: 0.65 }}
                      >
                        <div className="absolute inset-0 opacity-15" style={{ background: cat.bg }} />
                        <div className="relative flex items-center gap-3 px-4 py-3">
                          <div
                            className="w-10 h-10 rounded-xl border-[2px] border-black flex items-center justify-center flex-shrink-0"
                            style={{ background: cat.bg, boxShadow: "2px 2px 0px #000" }}
                          >
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.06em" }} className="text-white">
                              {cat.title}
                            </div>
                            <p style={FONT_FREDOKA} className="text-white/50 text-xs leading-snug">
                              {cat.desc}
                            </p>
                          </div>
                          <Lock className="w-4 h-4 text-white/30 flex-shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p style={FONT_FREDOKA} className="text-white/30 text-[10px] text-center pb-1">
                Ticket Cricket 2026 — Projet 100 % québécois
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

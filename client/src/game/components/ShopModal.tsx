/**
 * ShopModal — Boutique en jeu (bientôt disponible).
 * Accessible via le bouton "Boutique" sur l'accueil.
 * Affiche les catégories de produits à venir, verrouillées pour l'instant.
 */
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Palette, Package, Sparkles, Heart, ShoppingBag } from "lucide-react";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

interface ShopModalProps {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}

const SHOP_CATEGORIES = [
  {
    icon: Palette,
    title: "Skins de cartes",
    desc: "Personnalisez l'apparence de vos cartes avec des designs exclusifs.",
    color: "#7C3AED",
    bg: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
  },
  {
    icon: Package,
    title: "Decks exclusifs",
    desc: "Nouveaux tickets inédits avec des infractions encore plus absurdes.",
    color: "#0EA5E9",
    bg: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
  },
  {
    icon: Sparkles,
    title: "Packs de personnalisation",
    desc: "Avatars, effets visuels et animations spéciales pour votre profil.",
    color: "#F59E0B",
    bg: "linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)",
  },
  {
    icon: Heart,
    title: "Faire un don",
    desc: "Soutenir le développement de Ticket Cricket et sa version physique.",
    color: "#EF4444",
    bg: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
  },
];

export function ShopModal({ open, onClose, isLoggedIn }: ShopModalProps) {
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
                <span
                  style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.08em", color: "#fff" }}
                >
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

            {/* ── Badge "Bientôt disponible" ── */}
            <div className="px-6 pt-5 pb-3 flex-shrink-0">
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl border-[3px] border-yellow-400/60"
                style={{ background: "rgba(255,215,0,0.10)" }}
              >
                <Lock className="w-5 h-5 text-yellow-400" />
                <span style={{ ...FONT_BANGERS, fontSize: "1.2rem", letterSpacing: "0.06em" }} className="text-yellow-400">
                  BIENTÔT DISPONIBLE
                </span>
              </motion.div>
              {!isLoggedIn && (
                <p style={FONT_FREDOKA} className="text-white/50 text-xs text-center mt-2">
                  Un compte sera requis pour accéder à la boutique.
                </p>
              )}
            </div>

            {/* ── Catégories ── */}
            <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-3" style={{ scrollbarWidth: "thin" }}>
              {SHOP_CATEGORIES.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05 * i, type: "spring", stiffness: 300, damping: 24 }}
                    className="relative rounded-2xl border-[3px] border-black overflow-hidden"
                    style={{ boxShadow: "4px 4px 0px #000", opacity: 0.75 }}
                  >
                    {/* Fond coloré */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{ background: cat.bg }}
                    />
                    <div className="relative flex items-center gap-4 px-4 py-3">
                      {/* Icône */}
                      <div
                        className="w-12 h-12 rounded-xl border-[2.5px] border-black flex items-center justify-center flex-shrink-0"
                        style={{ background: cat.bg, boxShadow: "3px 3px 0px #000" }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {/* Texte */}
                      <div className="flex-1 min-w-0">
                        <div style={{ ...FONT_BANGERS, fontSize: "1.05rem", letterSpacing: "0.06em" }} className="text-white">
                          {cat.title}
                        </div>
                        <p style={FONT_FREDOKA} className="text-white/55 text-xs leading-snug mt-0.5">
                          {cat.desc}
                        </p>
                      </div>
                      {/* Cadenas */}
                      <Lock className="w-5 h-5 text-white/30 flex-shrink-0" />
                    </div>
                  </motion.div>
                );
              })}

              <p style={FONT_FREDOKA} className="text-white/35 text-xs text-center pt-2 leading-relaxed">
                La boutique sera disponible dans une prochaine mise à jour.{"\n"}
                Merci de votre patience !
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

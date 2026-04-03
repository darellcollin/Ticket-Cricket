/**
 * MiniGamePresentationModal — Présentation des fonctionnalités des Perquisitions multijoueur.
 * Accessible depuis le bouton Infos ou les règles.
 */
import { motion, AnimatePresence } from "motion/react";
import { X, Users, Zap, Trophy, Clock, Shield, Target } from "lucide-react";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

interface MiniGamePresentationModalProps {
  open: boolean;
  onClose: () => void;
}

const FEATURES = [
  {
    icon: Zap,
    title: "Déclenchement automatique",
    desc: "Au début de chaque tour, il y a une chance qu'une Perquisition soit déclenchée. Le joueur actif ne pioche pas de carte — la Perquisition remplace son tour.",
    color: "#FFD700",
    bg: "linear-gradient(135deg, #F59E0B 0%, #FFD700 100%)",
  },
  {
    icon: Users,
    title: "Tout le monde joue en même temps",
    desc: "Dès qu'une Perquisition est déclenchée, TOUS les joueurs actifs voient le mini-jeu apparaître simultanément sur leur écran et jouent en parallèle.",
    color: "#34C759",
    bg: "linear-gradient(135deg, #059669 0%, #34C759 100%)",
  },
  {
    icon: Target,
    title: "Deux modes de jeu",
    desc: "Enfuis-toi : tapez le plus vite possible pour atteindre l'objectif avant la fin du temps.\nCache-toi : suivez les flèches directionnelles dans le bon ordre pour vous dissimuler.",
    color: "#007AFF",
    bg: "linear-gradient(135deg, #0EA5E9 0%, #007AFF 100%)",
  },
  {
    icon: Clock,
    title: "10 secondes pour réagir",
    desc: "Chaque joueur dispose de 10 secondes pour compléter son mini-jeu. La barre de progression indique le temps restant en temps réel.",
    color: "#FF9500",
    bg: "linear-gradient(135deg, #F97316 0%, #FF9500 100%)",
  },
  {
    icon: Shield,
    title: "Résultats individuels",
    desc: "Chaque joueur obtient son propre résultat. Réussite : -1 000 $ de dette. Échec : +1 000 $ de dette. Vos performances n'affectent pas les autres.",
    color: "#AF52DE",
    bg: "linear-gradient(135deg, #9333EA 0%, #AF52DE 100%)",
  },
  {
    icon: Trophy,
    title: "Synchronisation et résumé",
    desc: "Le joueur actif attend que tous aient terminé avant de passer son tour. Un résumé des résultats de chaque joueur est affiché à tous à la fin.",
    color: "#FF3B30",
    bg: "linear-gradient(135deg, #EF4444 0%, #FF3B30 100%)",
  },
];

export function MiniGamePresentationModal({ open, onClose }: MiniGamePresentationModalProps) {
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
            className="relative w-full max-w-lg max-h-[88dvh] overflow-hidden rounded-3xl border-[4px] border-black flex flex-col"
            style={{
              background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)",
              boxShadow: "8px 8px 0px #000",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b-[3px] border-black"
              style={{ background: "linear-gradient(135deg, #FF3B30 0%, #FF6B6B 100%)" }}
            >
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "1.4rem" }}>🚨</span>
                <span
                  style={{ ...FONT_BANGERS, fontSize: "1.5rem", letterSpacing: "0.08em", color: "#fff" }}
                >
                  PERQUISITIONS MULTIJOUEUR
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl border-[3px] border-white/30 bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* ── Intro ── */}
            <div className="px-6 pt-4 pb-2 flex-shrink-0">
              <p style={FONT_FREDOKA} className="text-white/70 text-sm leading-relaxed text-center">
                Les Perquisitions sont des événements surprise qui mettent tous les joueurs à l'épreuve simultanément. Voici comment ça fonctionne :
              </p>
            </div>

            {/* ── Fonctionnalités ── */}
            <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-3 pt-2" style={{ scrollbarWidth: "thin" }}>
              {FEATURES.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.06 * i, type: "spring", stiffness: 300, damping: 24 }}
                    className="relative rounded-2xl border-[3px] border-black overflow-hidden"
                    style={{ boxShadow: "4px 4px 0px #000" }}
                  >
                    {/* Fond coloré subtil */}
                    <div
                      className="absolute inset-0 opacity-15"
                      style={{ background: feat.bg }}
                    />
                    <div className="relative flex items-start gap-4 px-4 py-3">
                      {/* Icône */}
                      <div
                        className="w-11 h-11 rounded-xl border-[2.5px] border-black flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: feat.bg, boxShadow: "3px 3px 0px #000" }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      {/* Texte */}
                      <div className="flex-1 min-w-0">
                        <div
                          style={{ ...FONT_BANGERS, fontSize: "1.0rem", letterSpacing: "0.05em", color: feat.color }}
                        >
                          {feat.title}
                        </div>
                        <p
                          style={{ ...FONT_FREDOKA, whiteSpace: "pre-line" }}
                          className="text-white/70 text-xs leading-snug mt-0.5"
                        >
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Note finale */}
              <div
                className="rounded-2xl border-[2.5px] border-yellow-400/40 px-4 py-3"
                style={{ background: "rgba(255,215,0,0.08)" }}
              >
                <p style={FONT_FREDOKA} className="text-yellow-400/80 text-xs text-center leading-relaxed">
                  Les Perquisitions s'appliquent uniquement en mode multijoueur.{"\n"}
                  En solo, elles fonctionnent de manière identique mais sans synchronisation réseau.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

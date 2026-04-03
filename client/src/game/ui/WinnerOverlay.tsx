/**
 * WinnerOverlay — Animation plein écran pour annoncer le gagnant.
 * Utilisé en mode solo (survie) et multijoueur.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Shuffle, Home, Star, X } from "lucide-react";
import { ShareScore } from "@/game/components/ShareScore";

const FONT_BANGERS: React.CSSProperties  = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties  = { fontFamily: "'Fredoka One', cursive" };

function formatPrice(n: number): string {
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n);
}

// ── Particules de confetti ────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 18 }, (_, i) => i);
  const colors = ["#FFD700", "#FF3B30", "#34C759", "#007AFF", "#FF9500", "#AF52DE", "#FF2D55"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((i) => {
        const color  = colors[i % colors.length];
        const left   = 5 + (i * 5.5) % 90;
        const delay  = (i * 0.18) % 1.8;
        const dur    = 2.2 + (i * 0.13) % 1.4;
        const size   = 7 + (i * 3) % 10;
        const rotate = (i * 47) % 360;
        return (
          <motion.div
            key={i}
            initial={{ y: -20, opacity: 0, rotate }}
            animate={{ y: "110dvh", opacity: [0, 1, 1, 0], rotate: rotate + 360 }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: "linear" }}
            style={{
              position:    "absolute",
              left:        `${left}%`,
              top:         0,
              width:       size,
              height:      size * 0.5,
              background:  color,
              borderRadius: 2,
            }}
          />
        );
      })}
    </div>
  );
}

// ── Étoile décorative ─────────────────────────────────────────
function StarBurst({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: 0, opacity: 0 }}
      animate={{ scale: [0, 1.3, 1], rotate: [0, 20, 0], opacity: [0, 1, 0.8] }}
      transition={{ duration: 0.6, delay, type: "tween", ease: "easeOut" }}
    >
      <Star className="w-5 h-5 text-yellow-300" fill="#FFD700" />
    </motion.div>
  );
}

// ── Props communes ────────────────────────────────────────────
interface WinnerOverlayBaseProps {
  winnerName:   string;
  isMe:         boolean;
  totalDebt:    number;
  onRestart?:   () => void;
  onMenu:       () => void;
  canRestart?:  boolean;
  mode:         "solo" | "multi";
}

export function WinnerOverlay({
  winnerName, isMe, totalDebt, onRestart, onMenu, canRestart = false, mode,
}: WinnerOverlayBaseProps) {
  const [showConfirmMenu, setShowConfirmMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[88] flex flex-col items-center justify-center px-6 gap-4 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0a1628 0%, #1a0a2e 50%, #0a1628 100%)" }}
    >
      <Confetti />

      {/* Halo doré derrière le trophée */}
      <motion.div
        animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0.08, 0.3] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="absolute"
        style={{ width: 200, height: 200, borderRadius: "50%", background: "#FFD700", filter: "blur(50px)" }}
      />

      {/* Trophée */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
        className="relative z-10 flex-shrink-0"
      >
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="w-24 h-24 rounded-full border-[5px] border-black flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #FFD700, #F59E0B)",
              boxShadow: "0 0 40px rgba(255,215,0,0.6), 8px 8px 0px #000",
            }}
          >
            <Trophy className="w-12 h-12 text-black" />
          </div>
        </motion.div>

        {/* Étoiles décoratives */}
        <div className="absolute -top-3 -left-4">
          <StarBurst delay={0.5} />
        </div>
        <div className="absolute -top-2 -right-5">
          <StarBurst delay={0.7} />
        </div>
        <div className="absolute -bottom-1 -left-5">
          <StarBurst delay={0.9} />
        </div>
      </motion.div>

      {/* Texte principal */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex flex-col items-center gap-2 text-center"
      >
        {mode === "solo" ? (
          <>
            <div
              style={{ ...FONT_BANGERS, fontSize: "2.8rem", letterSpacing: "0.08em", lineHeight: 1 }}
              className="text-yellow-400"
            >
              TU AS SURVÉCU !
            </div>
            <p style={FONT_FREDOKA} className="text-white/70 text-base leading-snug px-2">
              Tu as traversé tout le deck sans finir en prison.
            </p>
          </>
        ) : isMe ? (
          <>
            <div
              style={{ ...FONT_BANGERS, fontSize: "2.6rem", letterSpacing: "0.08em", lineHeight: 1 }}
              className="text-yellow-400"
            >
              FÉLICITATIONS !
            </div>
            <div
              style={{ ...FONT_BANGERS, fontSize: "1.5rem", letterSpacing: "0.06em", lineHeight: 1.1 }}
              className="text-white"
            >
              TU AS GAGNÉ LA PARTIE !
            </div>
            <p style={FONT_FREDOKA} className="text-white/60 text-sm leading-snug px-2">
              Tu es le dernier joueur à éviter la prison.
            </p>
          </>
        ) : (
          <>
            <div
              style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.06em", lineHeight: 1 }}
              className="text-white/50 uppercase tracking-widest"
            >
              GAGNANT
            </div>
            <div
              style={{ ...FONT_BANGERS, fontSize: "2.4rem", letterSpacing: "0.08em", lineHeight: 1.05 }}
              className="text-yellow-400"
            >
              {winnerName.toUpperCase()}
            </div>
            <p style={FONT_FREDOKA} className="text-white/60 text-sm leading-snug px-2">
              A évité la prison jusqu'au bout !
            </p>
          </>
        )}
      </motion.div>

      {/* Badge dette totale */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 220, damping: 16 }}
        className="relative z-10 rounded-2xl border-[4px] border-black px-6 py-3 flex flex-col items-center"
        style={{
          background: "rgba(255,215,0,0.12)",
          borderColor: "#FFD700",
          boxShadow: "6px 6px 0px #000",
        }}
      >
        <span style={FONT_FREDOKA} className="text-yellow-400/60 text-xs uppercase tracking-widest">
          Dette finale
        </span>
        <motion.span
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.65, type: "spring", stiffness: 260, damping: 14 }}
          style={{ ...FONT_BANGERS, fontSize: "2.2rem", letterSpacing: "0.04em", lineHeight: 1 }}
          className="text-yellow-400"
        >
          {formatPrice(totalDebt)}
        </motion.span>
      </motion.div>

      {/* Boutons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="relative z-10 flex flex-col gap-2.5 w-full max-w-xs flex-shrink-0"
      >
        {canRestart && onRestart && (
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-2xl bg-yellow-400 -z-10"
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onRestart}
              className="w-full py-4 bg-yellow-400 border-[5px] border-black rounded-2xl relative overflow-hidden"
              style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.08em", color: "#000", boxShadow: "6px 6px 0px #000" }}
            >
              <motion.div
                className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg]"
                animate={{ x: ["-100%", "400%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Shuffle className="w-5 h-5" />
                NOUVELLE PARTIE
              </span>
            </motion.button>
          </div>
        )}
        {/* Partage réseaux sociaux */}
        <ShareScore
          playerName={winnerName}
          totalDebt={totalDebt}
          mode={mode}
          isWinner={isMe}
        />

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowConfirmMenu(true)}
          className="w-full py-3.5 border-[4px] border-white/20 rounded-2xl flex items-center justify-center gap-2"
          style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.08em", color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.06)", boxShadow: "4px 4px 0px rgba(0,0,0,0.4)" }}
        >
          <Home className="w-5 h-5" />
          RETOUR AU MENU
        </motion.button>
      </motion.div>

      {/* Confirmation menu */}
      <AnimatePresence>
        {showConfirmMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setShowConfirmMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.82, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.82, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="bg-[#111] border-[5px] border-yellow-400 rounded-3xl p-7 flex flex-col items-center gap-5 w-full max-w-sm"
              style={{ boxShadow: "8px 8px 0px #000" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-yellow-400 border-[4px] border-black rounded-2xl flex items-center justify-center" style={{ boxShadow: "4px 4px 0px #000" }}>
                <Home className="w-8 h-8 text-black" />
              </div>
              <div style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.06em" }} className="text-yellow-400 text-center leading-tight">
                RETOURNER AU MENU ?
              </div>
              <p style={FONT_FREDOKA} className="text-white/50 text-sm text-center">
                La partie sera terminée.
              </p>
              <div className="flex gap-3 w-full">
                <motion.button whileTap={{ scale: 0.93 } as any} onClick={() => setShowConfirmMenu(false)}
                  className="flex-1 py-4 bg-white/10 border-[3px] border-white/20 rounded-2xl text-white/60"
                  style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.05em" }}>
                  ANNULER
                </motion.button>
                <motion.button whileTap={{ scale: 0.93 } as any} onClick={onMenu}
                  className="flex-1 py-4 bg-red-600 border-[3px] border-black rounded-2xl text-white flex items-center justify-center gap-2"
                  style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.05em", boxShadow: "4px 4px 0px #000" }}>
                  <X className="w-5 h-5" />
                  OUI
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
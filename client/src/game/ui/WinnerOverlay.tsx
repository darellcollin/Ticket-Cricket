/**
 * Winner overlay with confetti animation.
 */
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy } from "lucide-react";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

interface WinnerOverlayProps {
  show: boolean;
  winnerName?: string;
  winnerScore?: string;
  onClose: () => void;
  isSolo?: boolean;
}

export function WinnerOverlay({ show, winnerName, winnerScore, onClose, isSolo }: WinnerOverlayProps) {
  const confettiFired = useRef(false);

  useEffect(() => {
    if (show && !confettiFired.current) {
      confettiFired.current = true;
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#FBBF24", "#22C55E", "#EC4899", "#3B82F6"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#FBBF24", "#22C55E", "#EC4899", "#3B82F6"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
    if (!show) confettiFired.current = false;
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: "spring", damping: 15 }}
            className="mx-4 max-w-md rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Trophy className="mx-auto mb-4 h-16 w-16 text-yellow-900" />
            </motion.div>

            <h2
              className="mb-2 text-4xl text-yellow-900 drop-shadow-lg"
              style={FONT_BANGERS}
            >
              {isSolo ? "PARTIE TERMINÉE !" : "VICTOIRE !"}
            </h2>

            {winnerName && (
              <p className="mb-2 text-2xl font-bold text-yellow-800" style={FONT_FREDOKA}>
                {winnerName}
              </p>
            )}

            {winnerScore && (
              <p className="mb-6 text-lg text-yellow-900/80" style={FONT_FREDOKA}>
                Score : {winnerScore}
              </p>
            )}

            <button
              onClick={onClose}
              className="rounded-full bg-yellow-900 px-8 py-3 text-lg font-bold text-yellow-100 shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={FONT_FREDOKA}
            >
              CONTINUER
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

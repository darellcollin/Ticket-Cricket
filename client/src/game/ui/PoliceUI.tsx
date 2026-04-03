/**
 * Composants UI partagés entre les écrans du jeu.
 * Évite la duplication de PoliceTape et SirenLight.
 *
 * SirenLight : visible uniquement sur HomeScreen, GameScreen (solo) et MultiplayerGameScreen.
 */
import { motion } from "motion/react";

export function PoliceTape() {
  return (
    <div
      className="w-full h-5 flex-shrink-0"
      style={{
        background:
          "repeating-linear-gradient(45deg, #FFD700, #FFD700 14px, #1a1a1a 14px, #1a1a1a 28px)",
      }}
    />
  );
}

/**
 * Gyrophare de police — lumineux, avec halo large qui se fond dans l'interface.
 * Alterne rouge ↔ bleu à l'infini.
 */
export function SirenLight({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="relative flex flex-col items-center flex-shrink-0"
      style={{ width: "2.4rem" }}
    >
      {/* ── Halo ambiant large — déborde doucement sur l'interface adjacente ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: "6rem",
          height: "5.5rem",
          top: "-0.8rem",
          left: "50%",
          transform: "translateX(-50%)",
          borderRadius: "50%",
          zIndex: 0,
        }}
        animate={{
          background: [
            "radial-gradient(circle, rgba(255,59,48,0.48) 0%, rgba(255,59,48,0.14) 32%, transparent 62%)",
            "radial-gradient(circle, rgba(255,59,48,0.07) 0%, transparent 50%)",
            "radial-gradient(circle, rgba(0,122,255,0.07) 0%, transparent 50%)",
            "radial-gradient(circle, rgba(0,122,255,0.48) 0%, rgba(0,122,255,0.14) 32%, transparent 62%)",
            "radial-gradient(circle, rgba(255,59,48,0.48) 0%, rgba(255,59,48,0.14) 32%, transparent 62%)",
          ],
        }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay }}
      />

      {/* ── Tige métallique ── */}
      <div
        className="relative z-10 rounded-sm"
        style={{
          width: "0.6rem",
          height: "0.55rem",
          background: "linear-gradient(to right, #1e1e1e, #aaa, #666, #aaa, #1e1e1e)",
          border: "1px solid #000",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 5px rgba(0,0,0,0.7)",
        }}
      />

      {/* ── Socle plat ── */}
      <div
        className="relative z-10"
        style={{
          width: "2.1rem",
          height: "0.38rem",
          marginTop: "-1px",
          background: "linear-gradient(to right, #111, #999, #555, #999, #111)",
          borderRadius: "3px 3px 0 0",
          border: "1px solid #000",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 3px 7px rgba(0,0,0,0.75)",
        }}
      />

      {/* ── Dôme lumineux ── */}
      <motion.div
        className="relative z-10 overflow-hidden"
        style={{
          width: "2.35rem",
          height: "1.25rem",
          marginTop: "-1px",
          borderRadius: "1.2rem 1.2rem 0.18rem 0.18rem",
          border: "2px solid rgba(0,0,0,0.6)",
        }}
        animate={{
          backgroundColor: ["#CC2200", "#FF5544", "#0055CC", "#4488FF", "#CC2200"],
          boxShadow: [
            "0 0 16px 6px rgba(255,59,48,0.92), 0 0 38px 12px rgba(255,59,48,0.28), inset 0 2px 12px rgba(255,210,210,0.38)",
            "0 0 3px 1px rgba(255,59,48,0.18), inset 0 1px 4px rgba(255,210,210,0.08)",
            "0 0 3px 1px rgba(0,122,255,0.18), inset 0 1px 4px rgba(160,210,255,0.08)",
            "0 0 16px 6px rgba(0,122,255,0.92), 0 0 38px 12px rgba(0,122,255,0.28), inset 0 2px 12px rgba(160,210,255,0.38)",
            "0 0 16px 6px rgba(255,59,48,0.92), 0 0 38px 12px rgba(255,59,48,0.28), inset 0 2px 12px rgba(255,210,210,0.38)",
          ],
        }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay }}
      >
        {/* Reflet principal */}
        <div
          className="absolute"
          style={{
            top: "3px",
            left: "5px",
            width: "0.65rem",
            height: "0.32rem",
            borderRadius: "0.32rem",
            background: "rgba(255,255,255,0.48)",
            filter: "blur(1.5px)",
          }}
        />
        {/* Reflet secondaire */}
        <div
          className="absolute"
          style={{
            top: "6px",
            right: "6px",
            width: "0.28rem",
            height: "0.22rem",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.22)",
            filter: "blur(1px)",
          }}
        />
      </motion.div>
    </div>
  );
}

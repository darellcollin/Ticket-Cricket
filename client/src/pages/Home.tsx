/**
 * HomeScreen — Ticket Cricket 2026
 * Design: Arcade Urbaine — fond sombre, particules flottantes, Bangers + Fredoka One
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { BookOpen, Layers } from "lucide-react";
import { PoliceTape } from "@/game/ui/PoliceUI";
import { MultiplayerModal } from "@/game/components/MultiplayerModal";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

// Floating background particles
const BG_PARTICLES = [
  { e: "🎫", top: 5, left: 4, size: 2.4, fd: 4.2, dist: 18, rd: 5.1, d: 0.0, o: 0.60 },
  { e: "🚨", top: 12, left: 80, size: 2.2, fd: 3.5, dist: 14, rd: 3.8, d: 0.7, o: 0.50 },
  { e: "🚔", top: 20, left: 52, size: 2.6, fd: 5.0, dist: 22, rd: 6.5, d: 1.2, o: 0.45 },
  { e: "🚓", top: 30, left: 88, size: 2.2, fd: 3.8, dist: 16, rd: 4.2, d: 0.3, o: 0.50 },
  { e: "🎫", top: 38, left: 2, size: 2.5, fd: 4.6, dist: 20, rd: 5.8, d: 1.8, o: 0.55 },
  { e: "🚨", top: 50, left: 72, size: 2.4, fd: 3.2, dist: 12, rd: 3.5, d: 0.5, o: 0.52 },
  { e: "🚔", top: 60, left: 16, size: 2.5, fd: 4.8, dist: 24, rd: 7.0, d: 2.1, o: 0.45 },
  { e: "🚓", top: 68, left: 84, size: 2.2, fd: 3.6, dist: 15, rd: 4.5, d: 0.9, o: 0.50 },
  { e: "🎫", top: 78, left: 42, size: 2.6, fd: 5.2, dist: 19, rd: 6.0, d: 1.5, o: 0.58 },
  { e: "🚨", top: 88, left: 8, size: 2.3, fd: 3.3, dist: 13, rd: 3.9, d: 0.4, o: 0.45 },
  { e: "🚔", top: 93, left: 68, size: 2.5, fd: 4.0, dist: 17, rd: 5.3, d: 2.5, o: 0.50 },
  { e: "🚓", top: 25, left: 30, size: 2.2, fd: 3.7, dist: 14, rd: 4.8, d: 1.0, o: 0.45 },
  { e: "🎫", top: 55, left: 94, size: 2.4, fd: 4.4, dist: 21, rd: 5.6, d: 0.2, o: 0.55 },
  { e: "🚔", top: 44, left: 38, size: 2.2, fd: 3.4, dist: 11, rd: 4.0, d: 1.7, o: 0.45 },
  { e: "🚨", top: 72, left: 58, size: 2.4, fd: 4.9, dist: 23, rd: 6.2, d: 0.8, o: 0.50 },
  { e: "🚓", top: 15, left: 45, size: 2.1, fd: 3.9, dist: 15, rd: 4.4, d: 1.3, o: 0.45 },
  { e: "🎫", top: 83, left: 22, size: 2.5, fd: 4.3, dist: 18, rd: 5.7, d: 0.6, o: 0.58 },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {BG_PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute select-none"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              fontSize: `${p.size}rem`,
              opacity: p.o,
            }}
            animate={{
              y: [0, -p.dist, 0],
              rotate: [0, 360],
            }}
            transition={{
              y: { duration: p.fd, repeat: Infinity, ease: "easeInOut", delay: p.d },
              rotate: { duration: p.rd, repeat: Infinity, ease: "linear", delay: p.d },
            }}
          >
            {p.e}
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        {/* Police tape top */}
        <div className="absolute top-0 left-0 right-0">
          <PoliceTape>
            <span className="text-sm tracking-widest">TICKET CRICKET — NE PAS FRANCHIR</span>
          </PoliceTape>
        </div>

        {/* Logo / Title */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, delay: 0.2 }}
          className="mb-8 text-center"
        >
          <div className="mb-2 text-6xl">🎫</div>
          <h1
            className="text-6xl sm:text-7xl text-yellow-400 drop-shadow-[0_4px_8px_rgba(251,191,36,0.3)]"
            style={FONT_BANGERS}
          >
            TICKET
          </h1>
          <h1
            className="text-6xl sm:text-7xl text-emerald-400 drop-shadow-[0_4px_8px_rgba(52,211,153,0.3)] -mt-2"
            style={FONT_BANGERS}
          >
            CRICKET
          </h1>
          <p className="mt-2 text-slate-400 text-sm tracking-wider" style={FONT_FREDOKA}>
            Le jeu de cartes d'amendes
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <button
            onClick={() => setShowModal(true)}
            className="w-full rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 px-8 py-4 text-2xl font-bold text-black shadow-lg shadow-yellow-500/20 transition-transform hover:scale-105 active:scale-95"
            style={FONT_BANGERS}
          >
            JOUER
          </button>

          <button
            onClick={() => navigate("/rules")}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-800 border border-slate-700 px-8 py-3 text-lg text-slate-200 transition-colors hover:bg-slate-700"
            style={FONT_FREDOKA}
          >
            <BookOpen size={20} />
            Règles du jeu
          </button>

          <button
            onClick={() => navigate("/catalog")}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-800 border border-slate-700 px-8 py-3 text-lg text-slate-200 transition-colors hover:bg-slate-700"
            style={FONT_FREDOKA}
          >
            <Layers size={20} />
            Catalogue des cartes
          </button>
        </motion.div>

        {/* Police tape bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <PoliceTape>
            <span className="text-sm tracking-widest">ZONE DE CONTRAVENTIONS</span>
          </PoliceTape>
        </div>
      </div>

      {/* Multiplayer modal */}
      <MultiplayerModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

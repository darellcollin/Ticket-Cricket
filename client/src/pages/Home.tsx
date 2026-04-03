import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "wouter";
import { useState } from "react";
import ticketImg from "@/game/utils/ticketImg";
import { PoliceTape } from "@/game/ui/PoliceUI";
import { MultiplayerModal } from "@/game/components/MultiplayerModal";
import { AccountModal } from "@/game/components/AccountModal";
import { useGameAuth } from "@/hooks/useGameAuth";

const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

// ── Particules flottantes en arrière-plan ──
const BG_PARTICLES = [
  { e: "🎫",  top: 5,   left: 4,   size: 2.4, fd: 4.2, dist: 18, rd: 5.1, d: 0.0, o: 0.60, t: true  },
  { e: "🚨",  top: 12,  left: 80,  size: 2.2, fd: 3.5, dist: 14, rd: 3.8, d: 0.7, o: 0.50, t: false },
  { e: "🚔",  top: 20,  left: 52,  size: 2.6, fd: 5.0, dist: 22, rd: 6.5, d: 1.2, o: 0.45, t: false },
  { e: "🚓",  top: 30,  left: 88,  size: 2.2, fd: 3.8, dist: 16, rd: 4.2, d: 0.3, o: 0.50, t: false },
  { e: "🎫",  top: 38,  left: 2,   size: 2.5, fd: 4.6, dist: 20, rd: 5.8, d: 1.8, o: 0.55, t: true  },
  { e: "🚨",  top: 50,  left: 72,  size: 2.4, fd: 3.2, dist: 12, rd: 3.5, d: 0.5, o: 0.52, t: false },
  { e: "🚔",  top: 60,  left: 16,  size: 2.5, fd: 4.8, dist: 24, rd: 7.0, d: 2.1, o: 0.45, t: false },
  { e: "🚓",  top: 68,  left: 84,  size: 2.2, fd: 3.6, dist: 15, rd: 4.5, d: 0.9, o: 0.50, t: false },
  { e: "🎫",  top: 78,  left: 42,  size: 2.6, fd: 5.2, dist: 19, rd: 6.0, d: 1.5, o: 0.58, t: true  },
  { e: "🚨",  top: 88,  left: 8,   size: 2.3, fd: 3.3, dist: 13, rd: 3.9, d: 0.4, o: 0.45, t: false },
  { e: "🚔",  top: 93,  left: 68,  size: 2.5, fd: 4.0, dist: 17, rd: 5.3, d: 2.5, o: 0.50, t: false },
  { e: "🚓",  top: 25,  left: 30,  size: 2.2, fd: 3.7, dist: 14, rd: 4.8, d: 1.0, o: 0.45, t: false },
  { e: "🎫",  top: 55,  left: 94,  size: 2.4, fd: 4.4, dist: 21, rd: 5.6, d: 0.2, o: 0.55, t: true  },
  { e: "🚔",  top: 44,  left: 38,  size: 2.2, fd: 3.4, dist: 11, rd: 4.0, d: 1.7, o: 0.45, t: false },
  { e: "🚨",  top: 72,  left: 58,  size: 2.4, fd: 4.9, dist: 23, rd: 6.2, d: 0.8, o: 0.50, t: false },
  { e: "🚓",  top: 15,  left: 45,  size: 2.1, fd: 3.9, dist: 15, rd: 4.4, d: 1.3, o: 0.45, t: false },
  { e: "🎫",  top: 83,  left: 22,  size: 2.5, fd: 4.3, dist: 18, rd: 5.7, d: 0.6, o: 0.58, t: true  },
  { e: "🎫",  top: 8,   left: 58,  size: 2.3, fd: 4.5, dist: 16, rd: 5.0, d: 0.9, o: 0.55, t: true  },
  { e: "🚔",  top: 33,  left: 62,  size: 2.2, fd: 3.6, dist: 13, rd: 4.3, d: 2.0, o: 0.45, t: false },
  { e: "🎫",  top: 47,  left: 22,  size: 2.4, fd: 4.8, dist: 20, rd: 5.5, d: 1.1, o: 0.58, t: true  },
  { e: "🚨",  top: 62,  left: 46,  size: 2.3, fd: 3.4, dist: 15, rd: 4.0, d: 0.3, o: 0.48, t: false },
  { e: "🚓",  top: 18,  left: 10,  size: 2.2, fd: 4.1, dist: 14, rd: 4.6, d: 1.6, o: 0.45, t: false },
  { e: "🎫",  top: 90,  left: 46,  size: 2.5, fd: 5.0, dist: 19, rd: 6.1, d: 0.5, o: 0.55, t: true  },
  { e: "🚔",  top: 75,  left: 76,  size: 2.3, fd: 3.8, dist: 16, rd: 4.7, d: 1.4, o: 0.48, t: false },
  { e: "🎫",  top: 3,   left: 76,  size: 2.2, fd: 4.2, dist: 15, rd: 5.2, d: 2.2, o: 0.52, t: true  },
];

function BackgroundParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {BG_PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.t ? `${p.size * 16}px` : undefined,
            fontSize: p.t ? undefined : `${p.size}rem`,
            lineHeight: 1,
            opacity: p.o,
            display: "block",
            userSelect: "none",
          }}
          animate={{
            y: [0, -p.dist, p.dist * 0.4, -p.dist * 0.6, 0],
            x: [0, p.dist * 0.3, -p.dist * 0.2, p.dist * 0.15, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.15, 0.9, 1.05, 1],
          }}
          transition={{
            y:      { duration: p.fd,        repeat: Infinity, ease: "easeInOut", delay: p.d },
            x:      { duration: p.fd * 1.3,  repeat: Infinity, ease: "easeInOut", delay: p.d + 0.4 },
            rotate: { duration: p.rd,        repeat: Infinity, ease: "linear",    delay: p.d },
            scale:  { duration: p.fd * 0.8,  repeat: Infinity, ease: "easeInOut", delay: p.d + 0.2 },
          }}
        >
          {p.t
            ? <img src={ticketImg} alt="" style={{ width: `${p.size * 16}px`, display: "block" }} />
            : p.e
          }
        </motion.div>
      ))}
    </div>
  );
}

function SpeechBubble() {
  return (
    <motion.div
      className="relative"
      animate={{ y: [0, -5, 0], rotate: [-1, 1.5, -1] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
    >
      <div
        className="absolute inset-0 bg-black"
        style={{ transform: "translate(4px, 4px)", borderRadius: "1rem" }}
      />
      <div
        className="relative px-4 py-1.5 border-[3px] border-black"
        style={{ background: "#fffbe6", borderRadius: "1rem" }}
      >
        <span
          style={{
            ...FONT_FREDOKA,
            fontSize: "0.88rem",
            color: "#1a1a1a",
            display: "block",
            textAlign: "center",
            letterSpacing: "0.02em",
          }}
        >
          Prêt à recevoir vos tickets ?
        </span>
        <div
          className="absolute -bottom-[14px] left-6"
          style={{
            width: 0, height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "14px solid #1a1a1a",
          }}
        />
        <div
          className="absolute -bottom-[10px] left-[26px]"
          style={{
            width: 0, height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "12px solid #fffbe6",
          }}
        />
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const [rulesAnimating, setRulesAnimating] = useState(false);
  // Ouvrir automatiquement le modal si ?join=CODE est dans l'URL (scan QR)
  const [showMpModal, setShowMpModal] = useState(() => {
    try {
      return !!new URLSearchParams(window.location.search).get("join");
    } catch { return false; }
  });
  const [showAccountModal, setShowAccountModal] = useState(false);
  const { profile, isAuthenticated, logout } = useGameAuth();

  const handleRulesClick = () => {
    if (rulesAnimating) return;
    setRulesAnimating(true);
    setTimeout(() => {
      navigate("/rules");
      setRulesAnimating(false);
    }, 320);
  };

  return (
    <div
      className="h-[100dvh] w-full flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)" }}
    >
      <PoliceTape />

      {/* ── ICÔNE COMPTE — haut à droite ── */}
      <div className="absolute top-[22px] right-3 z-50">
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <span
              style={{ ...FONT_FREDOKA, fontSize: '0.75rem' }}
              className="text-yellow-400/80 hidden sm:inline"
            >
              {profile?.pseudo}
            </span>
            <motion.button
              className="w-10 h-10 rounded-full bg-yellow-400 border-[3px] border-black flex items-center justify-center"
              style={{ boxShadow: '3px 3px 0px #000', marginTop: '9px' }}
              whileHover={{ scale: 1.1 } as any}
              whileTap={{ scale: 0.9 } as any}
              onClick={() => setShowAccountModal(true)}
              title={profile?.pseudo}
            >
              <span style={{ ...FONT_FREDOKA, fontSize: '1rem', color: '#000' }}>
                {profile?.pseudo?.charAt(0).toUpperCase()}
              </span>
            </motion.button>
          </div>
        ) : (
          <motion.button
            className="w-10 h-10 rounded-full bg-white/15 border-[2px] border-white/30 flex items-center justify-center backdrop-blur-sm"
            style={{ boxShadow: '2px 2px 0px rgba(0,0,0,0.3)' }}
            whileHover={{ scale: 1.1, borderColor: 'rgba(255,215,0,0.6)' } as any}
            whileTap={{ scale: 0.9 } as any}
            onClick={() => setShowAccountModal(true)}
            title="Se connecter"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </motion.button>
        )}
      </div>

      {/* ── ZONE BLEUE CENTRALE avec particules confinées ── */}
      <div className="flex-1 relative overflow-hidden">

        {/* ── HALOS DE POLICE — coins ── */}
        <motion.div
          className="absolute pointer-events-none z-0"
          style={{ top: -60, left: -60, width: 220, height: 220, borderRadius: "50%" }}
          animate={{
            background: [
              "radial-gradient(circle, rgba(255,40,30,0.62) 0%, rgba(255,40,30,0.22) 38%, transparent 68%)",
              "radial-gradient(circle, rgba(255,40,30,0.10) 0%, transparent 55%)",
              "radial-gradient(circle, rgba(0,100,255,0.10) 0%, transparent 55%)",
              "radial-gradient(circle, rgba(0,100,255,0.62) 0%, rgba(0,100,255,0.22) 38%, transparent 68%)",
              "radial-gradient(circle, rgba(255,40,30,0.62) 0%, rgba(255,40,30,0.22) 38%, transparent 68%)",
            ],
            scale: [1, 1.08, 1.03, 1.08, 1],
          }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0 }}
        />
        <motion.div
          className="absolute pointer-events-none z-0"
          style={{ top: -60, right: -60, width: 220, height: 220, borderRadius: "50%" }}
          animate={{
            background: [
              "radial-gradient(circle, rgba(0,100,255,0.62) 0%, rgba(0,100,255,0.22) 38%, transparent 68%)",
              "radial-gradient(circle, rgba(0,100,255,0.10) 0%, transparent 55%)",
              "radial-gradient(circle, rgba(255,40,30,0.10) 0%, transparent 55%)",
              "radial-gradient(circle, rgba(255,40,30,0.62) 0%, rgba(255,40,30,0.22) 38%, transparent 68%)",
              "radial-gradient(circle, rgba(0,100,255,0.62) 0%, rgba(0,100,255,0.22) 38%, transparent 68%)",
            ],
            scale: [1, 1.08, 1.03, 1.08, 1],
          }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.55 }}
        />
        <motion.div
          className="absolute pointer-events-none z-0"
          style={{ bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%" }}
          animate={{
            background: [
              "radial-gradient(circle, rgba(0,100,255,0.50) 0%, rgba(0,100,255,0.18) 38%, transparent 68%)",
              "radial-gradient(circle, rgba(0,100,255,0.08) 0%, transparent 55%)",
              "radial-gradient(circle, rgba(255,40,30,0.08) 0%, transparent 55%)",
              "radial-gradient(circle, rgba(255,40,30,0.50) 0%, rgba(255,40,30,0.18) 38%, transparent 68%)",
              "radial-gradient(circle, rgba(0,100,255,0.50) 0%, rgba(0,100,255,0.18) 38%, transparent 68%)",
            ],
          }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.55 }}
        />
        <motion.div
          className="absolute pointer-events-none z-0"
          style={{ bottom: -60, right: -60, width: 200, height: 200, borderRadius: "50%" }}
          animate={{
            background: [
              "radial-gradient(circle, rgba(255,40,30,0.50) 0%, rgba(255,40,30,0.18) 38%, transparent 68%)",
              "radial-gradient(circle, rgba(255,40,30,0.08) 0%, transparent 55%)",
              "radial-gradient(circle, rgba(0,100,255,0.08) 0%, transparent 55%)",
              "radial-gradient(circle, rgba(0,100,255,0.50) 0%, rgba(0,100,255,0.18) 38%, transparent 68%)",
              "radial-gradient(circle, rgba(255,40,30,0.50) 0%, rgba(255,40,30,0.18) 38%, transparent 68%)",
            ],
          }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0 }}
        />

        <BackgroundParticles />

        {/* ── MAIN CONTENT ── */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 py-4 gap-6">

          {/* ── ZONE LOGO + TITRE ── */}
          <div className="flex flex-col items-center w-full" style={{ gap: "clamp(0.5rem, 2vw, 1.2rem)" }}>
            {/* Logo ticket animé */}
            <motion.div
              style={{
                width: "clamp(90px, 22vw, 180px)",
                userSelect: "none",
                flexShrink: 0,
              }}
              animate={{
                y: [0, -10, 0],
                rotate: [-7, 7, -7],
                filter: [
                  "drop-shadow(0 6px 0px rgba(0,0,0,0.5))",
                  "drop-shadow(0 12px 0px rgba(0,0,0,0.35))",
                  "drop-shadow(0 6px 0px rgba(0,0,0,0.5))",
                ],
              }}
              transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src={ticketImg} alt="Ticket" style={{ width: "100%", display: "block" }} />
            </motion.div>

            {/* Titre TICKET CRICKET */}
            <motion.div
              style={{ zIndex: 2, position: "relative" }}
              animate={{ rotate: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex flex-col items-center" style={{ gap: 0 }}>
                <span
                  style={{
                    fontFamily: "'Bangers', cursive",
                    fontSize: "clamp(2.2rem, 9vw, 5.5rem)",
                    letterSpacing: "0.06em",
                    lineHeight: 1,
                    display: "block",
                    textAlign: "center",
                    color: "#FFD700",
                    fontWeight: 900,
                    textShadow: "3px 3px 0px #000, 0px 0px 20px rgba(255,215,0,0.4)",
                    transform: "skewX(-2deg)",
                  }}
                >
                  TICKET
                </span>
                <span
                  style={{
                    fontFamily: "'Bangers', cursive",
                    fontSize: "clamp(1.6rem, 7vw, 4.2rem)",
                    letterSpacing: "0.1em",
                    lineHeight: 1,
                    display: "block",
                    textAlign: "center",
                    color: "#FFFFFF",
                    fontWeight: 900,
                    textShadow: "2px 2px 0px #000",
                  }}
                >
                  CRICKET
                </span>
              </div>
            </motion.div>
          </div>

          {/* ── ZONE BOUTONS ── */}
          <div className="flex flex-col items-center gap-2.5 w-full">
            {/* Bulle de texte au-dessus des boutons */}
            <div style={{ zIndex: 2, position: "relative" }}>
              <SpeechBubble />
            </div>

            {/* Ligne 1 : JOUER + RÈGLES côte à côte sur PC, en colonne sur mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
              {/* ── JOUER BUTTON ── */}
              <div className="relative w-full max-w-[220px]">
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-yellow-400 -z-10"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.button
                  className="w-full py-2.5 bg-yellow-400 border-[4px] border-black rounded-2xl text-black relative overflow-hidden"
                  style={{
                    ...FONT_FREDOKA,
                    letterSpacing: "0.1em",
                    fontSize: "1.7rem",
                    boxShadow: "5px 5px 0px #000",
                  }}
                  whileHover={{ scale: 1.06, y: -3, boxShadow: "7px 7px 0px #000" } as any}
                  whileTap={{ scale: 0.94, y: 2, boxShadow: "3px 3px 0px #000" } as any}
                  onClick={() => setShowMpModal(true)}
                >
                  <motion.div
                    className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg]"
                    animate={{ x: ["-100%", "400%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  />
                  JOUER
                </motion.button>
              </div>

              {/* ── RÈGLES BUTTON ── */}
              <div className="relative w-full max-w-[220px]">
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-blue-500 -z-10"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.button
                  className="w-full py-2.5 bg-[#1565C0] border-[4px] border-black rounded-2xl text-white relative overflow-hidden"
                  style={{
                    ...FONT_FREDOKA,
                    letterSpacing: "0.1em",
                    fontSize: "1.7rem",
                    boxShadow: "5px 5px 0px #000",
                  }}
                  whileHover={{ scale: 1.06, y: -3, boxShadow: "7px 7px 0px #000" } as any}
                  whileTap={{ scale: 0.94, y: 2, boxShadow: "3px 3px 0px #000" } as any}
                  onClick={handleRulesClick}
                >
                  <motion.div
                    className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg]"
                    animate={{ x: ["-100%", "400%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  />
                  RÈGLES
                </motion.button>
              </div>
            </div>

            {/* Ligne 2 : PERSONNALISATION pleine largeur (max 460px sur PC) */}
            {/* ── PERSONNALISATION BUTTON ── */}
            <div className="relative w-full max-w-[220px] sm:max-w-[460px]">
              <motion.button
                className="w-full py-2 bg-[#FF4081] border-[4px] border-black rounded-2xl text-white relative overflow-hidden"
                style={{
                  ...FONT_FREDOKA,
                  letterSpacing: "0.08em",
                  fontSize: "1.1rem",
                  boxShadow: "5px 5px 0px #000",
                }}
                whileHover={{ scale: 1.05, y: -2, boxShadow: "7px 7px 0px #000" } as any}
                whileTap={{ scale: 0.94, y: 2, boxShadow: "3px 3px 0px #000" } as any}
                onClick={() => navigate("/custom-cards")}
              >
                <motion.div
                  className="absolute inset-0 w-1/3 bg-white/15 skew-x-[-20deg]"
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                />
                PERSONNALISATION
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <PoliceTape />

      {/* Bottom label */}
      <div className="w-full bg-[#111] py-1 text-center flex-shrink-0" style={{ paddingBottom: "calc(0.25rem + env(safe-area-inset-bottom, 0px))" }}>
        <span style={FONT_FREDOKA} className="text-yellow-400/60 text-xs tracking-widest">
          © TICKET CRICKET 2026
        </span>
      </div>

      {/* ── Modal Multijoueur ── */}
      <AnimatePresence>
        {showMpModal && <MultiplayerModal onClose={() => setShowMpModal(false)} />}
      </AnimatePresence>

      {/* ── Modal Compte ── */}
      <AnimatePresence>
        {showAccountModal && (
          isAuthenticated ? (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAccountModal(false)} />
              <motion.div
                className="relative w-[85%] max-w-[340px] rounded-2xl overflow-hidden p-5"
                style={{
                  background: 'linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)',
                  border: '3px solid rgba(255,215,0,0.4)',
                  boxShadow: '0 0 40px rgba(255,215,0,0.15), 0 20px 60px rgba(0,0,0,0.5)',
                }}
                initial={{ scale: 0.8, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 40 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              >
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <span className="text-white text-lg leading-none">&times;</span>
                </button>

                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-400 border-[3px] border-black flex items-center justify-center" style={{ boxShadow: '4px 4px 0px #000' }}>
                    <span style={{ ...FONT_FREDOKA, fontSize: '1.8rem', color: '#000' }}>
                      {profile?.pseudo?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-center">
                    <h3 style={{ ...FONT_FREDOKA, fontSize: '1.3rem' }} className="text-yellow-400">{profile?.pseudo}</h3>
                    <p className="text-white/50 text-sm mt-1">{profile?.email}</p>
                  </div>

                  <motion.button
                    className="w-full py-2.5 bg-red-500 border-[3px] border-black rounded-xl text-white"
                    style={{ ...FONT_FREDOKA, fontSize: '0.95rem', boxShadow: '4px 4px 0px #000' }}
                    whileHover={{ scale: 1.03 } as any}
                    whileTap={{ scale: 0.97 } as any}
                    onClick={async () => { await logout(); setShowAccountModal(false); }}
                  >
                    SE DECONNECTER
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <AccountModal onClose={() => setShowAccountModal(false)} />
          )
        )}
      </AnimatePresence>
    </div>
  );
}

import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import ticketImg from "@/game/utils/ticketImg";
import { PoliceTape } from "@/game/ui/PoliceUI";
import { MultiplayerModal } from "@/game/components/MultiplayerModal";
import { AccountModal } from "@/game/components/AccountModal";
import { ProfileModal } from "@/game/components/ProfileModal";
import { GameInfoModal } from "@/game/components/GameInfoModal";
import { ShopModal } from "@/game/components/ShopModal";
import { useGameAuth } from "@/hooks/useGameAuth";
import { Info, Share2, X, Copy, Check, ShoppingBag, Layers, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";

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

// ── Logo orbital : orbite elliptique fluide avec requestAnimationFrame ──
// Un seul composant anime le ticket sur une ellipse complète.
// L'effet "devant/derrière" est géré dynamiquement via le z-index selon la position angulaire.

const ORBIT_DURATION_MS = 5000; // 5 secondes par tour — plus lent = plus fluide
const TICKET_SIZE = "clamp(44px, 9vw, 76px)";

function OrbitalTicketBack({ ticketImg: _ticketImg }: { ticketImg: string }) {
  return null; // remplacé par OrbitalTicket
}
function OrbitalTicketFront({ ticketImg: _ticketImg }: { ticketImg: string }) {
  return null; // remplacé par OrbitalTicket
}

function OrbitalTicket({ ticketImg }: { ticketImg: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const animate = (ts: number) => {
      if (!ref.current) { rafRef.current = requestAnimationFrame(animate); return; }
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = (elapsed % ORBIT_DURATION_MS) / ORBIT_DURATION_MS; // 0..1
      const angle = t * 2 * Math.PI; // 0..2π

      // Rayon de l'ellipse en px (responsive via vw)
      // Limité pour ne jamais déborder de l'écran
      const vw = window.innerWidth;
      const titleW = Math.min(vw * 0.85, 600); // largeur approximative du titre
      const rx = Math.min(titleW * 0.52, vw * 0.38, 240);
      const ry = Math.min(rx * 0.32, 80);

      const x = rx * Math.cos(angle);
      const y = ry * Math.sin(angle);

      // Devant (sin > 0 = demi-bas) ou derrière (sin < 0 = demi-haut)
      const zIndex = Math.sin(angle) > 0 ? 2 : 8;
      // Légère variation de scale pour effet de profondeur
      const scale = 0.80 + 0.25 * (Math.sin(angle) + 1) / 2;
      // Rotation du ticket lui-même — sens inverse de l'orbite pour effet naturel
      const rotateDeg = -(t * 360);

      ref.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rotateDeg}deg) scale(${scale})`;
      ref.current.style.zIndex = String(zIndex);
      ref.current.style.opacity = String(0.7 + 0.3 * scale);

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: TICKET_SIZE,
        pointerEvents: "none",
        willChange: "transform",
      }}
    >
      <img
        src={ticketImg}
        alt=""
        style={{
          width: "100%",
          display: "block",
          filter: "drop-shadow(2px 2px 6px rgba(255,215,0,0.5))",
        }}
      />
    </div>
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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
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

      {/* ── ICONE INFOS — haut à gauche ── */}
      <div className="absolute top-[22px] left-3 z-50">
        <motion.button
          className="w-10 h-10 rounded-full bg-[#007AFF] border-[3px] border-black flex items-center justify-center"
          style={{ boxShadow: '3px 3px 0px #000', marginTop: '9px' }}
          whileHover={{ scale: 1.1, y: -2 } as any}
          whileTap={{ scale: 0.9 } as any}
          onClick={() => setShowInfoModal(true)}
          title="Infos sur le jeu"
        >
          <Info className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {/* ── ICONE COMPTE — haut à droite ── */}
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
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 pt-3 pb-3" style={{ gap: "clamp(1rem, 3vh, 2.5rem)" }}>

          {/* ── TITRE GÉANT + LOGO ORBITAL ── */}
          <div className="flex-shrink-0 relative flex items-center justify-center" style={{ width: "100%" }}>

            {/* ── Logo orbital fluide (devant/derrière géré dynamiquement) ── */}
            <OrbitalTicket ticketImg={ticketImg} />

            {/* ── Titre TICKET CRICKET (couche milieu) ── */}
            <motion.div
              style={{ position: "relative", zIndex: 5, textAlign: "center" }}
              animate={{ rotate: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <div style={{ lineHeight: 0.9 }}>
                <div
                  style={{
                    fontFamily: "'Bangers', cursive",
                    fontSize: "clamp(4rem, 16vw, 9rem)",
                    letterSpacing: "0.06em",
                    lineHeight: 0.9,
                    color: "#FFD700",
                    fontWeight: 900,
                    textShadow: "4px 4px 0px #000, 0px 0px 30px rgba(255,215,0,0.5)",
                    transform: "skewX(-2deg)",
                    display: "block",
                  }}
                >
                  TICKET
                </div>
                <div
                  style={{
                    fontFamily: "'Bangers', cursive",
                    fontSize: "clamp(3rem, 12vw, 7rem)",
                    letterSpacing: "0.1em",
                    lineHeight: 0.9,
                    color: "#FFFFFF",
                    fontWeight: 900,
                    textShadow: "3px 3px 0px #000",
                    display: "block",
                  }}
                >
                  CRICKET
                </div>
              </div>
            </motion.div>

          </div>

          {/* ── ZONE BOUTONS ── */}
          <div className="flex flex-col items-center gap-2 w-full flex-shrink-0" style={{ maxWidth: "min(480px, 90vw)", margin: "0 auto" }}>

            {/* Bulle slogan au-dessus du bouton JOUER */}
            <div style={{ zIndex: 2, position: "relative" }}>
              <SpeechBubble />
            </div>

            {/* Ligne 1 : JOUER + RÈGLES côte à côte */}
            <div className="flex flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
              {/* ── JOUER BUTTON ── */}
              <div className="relative flex-1">
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-[#34C759] -z-10"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.button
                  className="w-full py-3 bg-[#34C759] border-[4px] border-black rounded-2xl text-white relative overflow-hidden"
                  style={{
                    ...FONT_FREDOKA,
                    letterSpacing: "0.1em",
                    fontSize: "clamp(1.3rem, 4vw, 1.8rem)",
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
              <div className="relative flex-1">
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-yellow-400 -z-10"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.button
                  className="w-full py-3 bg-yellow-400 border-[4px] border-black rounded-2xl text-white relative overflow-hidden"
                  style={{
                    ...FONT_FREDOKA,
                    letterSpacing: "0.1em",
                    fontSize: "clamp(1.3rem, 4vw, 1.8rem)",
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

            {/* Ligne 2 : PERSONNALISATION + BOUTIQUE */}
            <div className="flex flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
            {/* ── PERSONNALISATION BUTTON ── */}
            <div className="relative flex-1">
              <motion.button
                className="w-full py-2.5 bg-[#FF4081] border-[4px] border-black rounded-2xl text-white relative overflow-hidden"
                style={{
                  ...FONT_FREDOKA,
                  letterSpacing: "0.05em",
                  fontSize: "clamp(0.85rem, 2.5vw, 1.1rem)",
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

            {/* ── BOUTIQUE BUTTON ── */}
            <div className="relative flex-1">
              <motion.button
                className="w-full py-2.5 bg-[#7C3AED] border-[4px] border-black rounded-2xl text-white relative overflow-hidden"
                style={{
                  ...FONT_FREDOKA,
                  letterSpacing: "0.05em",
                  fontSize: "clamp(0.85rem, 2.5vw, 1.1rem)",
                  boxShadow: "5px 5px 0px #000",
                }}
                whileHover={{ scale: 1.05, y: -2, boxShadow: "7px 7px 0px #000" } as any}
                whileTap={{ scale: 0.94, y: 2, boxShadow: "3px 3px 0px #000" } as any}
                onClick={() => setShowShopModal(true)}
              >
                <motion.div
                  className="absolute inset-0 w-1/3 bg-white/15 skew-x-[-20deg]"
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                />
                BOUTIQUE
              </motion.button>
            </div>

            </div>

            {/* Ligne 3 : bouton partage centré — même taille que le bouton compte */}
            <div className="flex items-center justify-center w-full">
              <motion.button
                className="w-10 h-10 rounded-full border-[2.5px] border-white/30 bg-white/10 flex items-center justify-center"
                style={{ boxShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}
                whileHover={{ scale: 1.12, borderColor: 'rgba(255,215,0,0.6)', backgroundColor: 'rgba(255,255,255,0.18)' } as any}
                whileTap={{ scale: 0.9 } as any}
                onClick={() => setShowShareModal(true)}
                title="Partager le jeu"
              >
                <Share2 size={18} color="white" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <PoliceTape />

      {/* Bottom bar : copyright uniquement */}
      <div className="w-full bg-[#111] py-1 flex-shrink-0 flex items-center justify-center" style={{ paddingBottom: "calc(0.25rem + env(safe-area-inset-bottom, 0px))" }}>
        <span style={FONT_FREDOKA} className="text-yellow-400/60 text-xs tracking-widest">
          © TICKET CRICKET 2026
        </span>
      </div>

      {/* ── Modal Multijoueur ── */}
      <AnimatePresence>
        {showMpModal && <MultiplayerModal onClose={() => setShowMpModal(false)} />}
      </AnimatePresence>

      {/* ── Modal Infos sur le jeu ── */}
      <GameInfoModal open={showInfoModal} onClose={() => setShowInfoModal(false)} onOpenShop={() => { setShowInfoModal(false); setShowShopModal(true); }} />

      {/* ── Modal Boutique ── */}
      <ShopModal open={showShopModal} onClose={() => setShowShopModal(false)} isLoggedIn={isAuthenticated} />

      {/* ── Modal Partage ── */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              className="w-full max-w-sm mx-4 mb-6 sm:mb-0 rounded-2xl border-[3px] border-black overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #0c1a4e 0%, #1a083d 100%)', boxShadow: '6px 6px 0px #000' }}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
                <span style={{ ...FONT_FREDOKA, fontSize: '1.4rem', color: '#FFD700', letterSpacing: '0.05em' }}>PARTAGER LE JEU</span>
                <button onClick={() => setShowShareModal(false)} className="text-white/60 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Lien */}
              <div className="px-5 py-3">
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 border border-white/20">
                  <span className="text-white/80 text-xs flex-1 truncate">{window.location.origin}</span>
                  <button
                    className="flex items-center gap-1 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-lg border border-black flex-shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin).then(() => {
                        setShareCopied(true);
                        setTimeout(() => setShareCopied(false), 2000);
                      });
                    }}
                  >
                    {shareCopied ? <Check size={12} /> : <Copy size={12} />}
                    {shareCopied ? 'Copié !' : 'Copier'}
                  </button>
                </div>
              </div>

              {/* Boutons réseaux sociaux */}
              <div className="grid grid-cols-2 gap-3 px-5 pb-5">
                {/* Web Share API (mobile natif) */}
                {'share' in navigator && (
                  <button
                    className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl border-[3px] border-black text-white font-bold text-sm"
                    style={{ background: '#34C759', boxShadow: '3px 3px 0px #000', fontFamily: "'Fredoka One', cursive", fontSize: '1.1rem' }}
                    onClick={() => {
                      navigator.share({
                        title: 'Ticket Cricket',
                        text: 'Viens jouer à Ticket Cricket — le jeu de contraventions absurdes !',
                        url: window.location.origin,
                      }).catch(() => {});
                    }}
                  >
                    <Share2 size={18} /> PARTAGER
                  </button>
                )}

                {/* X (Twitter) */}
                <button
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-[2px] border-black text-white text-sm font-bold"
                  style={{ background: '#000', boxShadow: '3px 3px 0px #000' }}
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Viens jouer à Ticket Cricket — le jeu de contraventions absurdes ! 🎫')}&url=${encodeURIComponent(window.location.origin)}`, '_blank')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X (Twitter)
                </button>

                {/* Facebook */}
                <button
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-[2px] border-black text-white text-sm font-bold"
                  style={{ background: '#1877F2', boxShadow: '3px 3px 0px #000' }}
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`, '_blank')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </button>

                {/* WhatsApp */}
                <button
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-[2px] border-black text-white text-sm font-bold"
                  style={{ background: '#25D366', boxShadow: '3px 3px 0px #000' }}
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Viens jouer à Ticket Cricket ! ' + window.location.origin)}`, '_blank')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </button>

                {/* SMS */}
                <button
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-[2px] border-black text-white text-sm font-bold"
                  style={{ background: '#007AFF', boxShadow: '3px 3px 0px #000' }}
                  onClick={() => window.open(`sms:?body=${encodeURIComponent('Viens jouer à Ticket Cricket ! ' + window.location.origin)}`, '_blank')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  SMS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal Compte ── */}
      <AnimatePresence>
        {showAccountModal && (
          isAuthenticated ? (
            <ProfileModal
              profile={profile}
              onClose={() => setShowAccountModal(false)}
              onLogout={async () => { await logout(); setShowAccountModal(false); }}
              onOpenShop={() => { setShowAccountModal(false); setShowShopModal(true); }}
            />
          ) : (
            <AccountModal onClose={() => setShowAccountModal(false)} />
          )
        )}
      </AnimatePresence>
    </div>
  );
}

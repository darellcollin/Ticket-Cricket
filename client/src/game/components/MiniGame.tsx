/**
 * MiniGame — Perquisition qui se déclenche rarement en début de tour.
 * Deux modes :
 *  - "run"  : Clics/taps rapides pour s'enfuir de la police (10 sec)
 *  - "hide" : Clics sur flèches / swipe / touches clavier dans les directions indiquées (10 sec)
 *
 * Props :
 *  - mode            : "run" | "hide"
 *  - onComplete      : callback avec (success, amount)
 *  - isSpectator     : si true, affiche une version "en cours" sans interaction
 *  - triggeredByName : nom du joueur qui joue (affiché en mode spectateur)
 *
 * Résultat :
 *  - Succès  → réduction de 1000$ de dette
 *  - Échec   → ticket de 1000$ de dette
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Siren, Zap, Shield, AlertTriangle } from "lucide-react";
import ticketImg from "@/game/utils/ticketImg";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

const GAME_DURATION = 10;
const PENALTY_AMOUNT = 1000;
const REWARD_AMOUNT = 1000;
const RUN_TARGET = 60;
const HIDE_TARGET = 20;
const HIDE_DIRECTIONS: Array<"left" | "right" | "up" | "down"> = ["left", "right", "up", "down"];

import type { MiniGameMode } from "@/game/utils/miniGameUtils";
type MiniGamePhase = "intro" | "countdown" | "playing" | "result";
type SwipeDir = "left" | "right" | "up" | "down";

interface MiniGameProps {
  mode: MiniGameMode;
  onComplete: (success: boolean, amount: number) => void;
  isSpectator?: boolean;
  triggeredByName?: string;
}

// ── Confettis améliorés ────────────────────────────────────────
function Confetti({ success }: { success: boolean }) {
  const colors = success
    ? ["#FFD700", "#16a34a", "#22c55e", "#fbbf24", "#a3e635", "#00E676", "#FFEB3B"]
    : ["#DC2626", "#ef4444", "#f97316", "#b91c1c", "#fca5a5", "#FF6B00"];
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.6,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 5 + Math.random() * 12,
    rotation: Math.random() * 360,
    shape: i % 3 === 0 ? "circle" : i % 3 === 1 ? "square" : "diamond",
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}%`, opacity: 1, rotate: p.rotation, scale: 0 }}
          animate={{
            y: "120%",
            opacity: [0, 1, 1, 0],
            rotate: p.rotation + 540,
            scale: [0, 1.2, 1, 0.8],
          }}
          transition={{ duration: 1.8 + Math.random() * 0.8, delay: p.delay, ease: "easeIn" }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            top: 0,
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "diamond" ? "2px" : "2px",
            transform: p.shape === "diamond" ? "rotate(45deg)" : undefined,
          }}
        />
      ))}
    </div>
  );
}

// ── Lumières de sirène améliorées ──────────────────────────────
function PoliceLights({ urgency = false }: { urgency?: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={{
          background: urgency ? [
            "radial-gradient(ellipse at 20% 0%, rgba(220,38,38,0.7) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(59,130,246,0.3) 0%, transparent 55%)",
            "radial-gradient(ellipse at 80% 0%, rgba(59,130,246,0.7) 0%, transparent 55%), radial-gradient(ellipse at 20% 100%, rgba(220,38,38,0.3) 0%, transparent 55%)",
            "radial-gradient(ellipse at 20% 0%, rgba(220,38,38,0.7) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(59,130,246,0.3) 0%, transparent 55%)",
          ] : [
            "radial-gradient(ellipse at 20% 0%, rgba(220,38,38,0.4) 0%, transparent 60%)",
            "radial-gradient(ellipse at 80% 0%, rgba(59,130,246,0.4) 0%, transparent 60%)",
            "radial-gradient(ellipse at 20% 0%, rgba(220,38,38,0.4) 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: urgency ? 0.5 : 0.8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Scanlines effect */}
      <div
        className="absolute inset-0"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ── Flèche directionnelle cliquable ───────────────────────────
function Arrow({
  dir, active, correct, onClick,
}: {
  dir: SwipeDir;
  active: boolean;
  correct?: boolean;
  onClick?: () => void;
}) {
  const arrows = { left: "←", right: "→", up: "↑", down: "↓" };
  const isCorrect = correct === true;
  const isWrong = correct === false;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.8 }}
      animate={
        isCorrect ? { scale: [1, 1.5, 1.2], background: "#16a34a", boxShadow: "0 0 20px rgba(22,163,74,0.8), 5px 5px 0px #000" } :
        isWrong ? { scale: [1, 0.7, 1], background: "#dc2626", boxShadow: "0 0 20px rgba(220,38,38,0.8), 5px 5px 0px #000" } :
        active ? { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7], boxShadow: ["5px 5px 0px #000", "7px 7px 0px #000", "5px 5px 0px #000"] } :
        { scale: 1, opacity: 0.3 }
      }
      transition={active && !isCorrect && !isWrong ? { duration: 0.5, repeat: Infinity } : { duration: 0.18 }}
      className="w-16 h-16 rounded-2xl border-[4px] border-black flex items-center justify-center"
      style={{
        background: isCorrect ? "#16a34a" : isWrong ? "#dc2626" : active ? "#FFD700" : "rgba(255,255,255,0.1)",
        boxShadow: active ? "5px 5px 0px #000" : "2px 2px 0px rgba(0,0,0,0.3)",
        fontSize: "2rem",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {arrows[dir]}
    </motion.button>
  );
}

// ── Composant principal ────────────────────────────────────────
export function MiniGame({ mode, onComplete, isSpectator = false, triggeredByName }: MiniGameProps) {
  const [phase, setPhase] = useState<MiniGamePhase>("intro");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [progress, setProgress] = useState(0);
  const [taps, setTaps] = useState(0);
  const [success, setSuccess] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; big?: boolean }[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [flashScreen, setFlashScreen] = useState<"success" | "fail" | null>(null);
  const rippleId = useRef(0);

  const [currentDir, setCurrentDir] = useState<SwipeDir>("right");
  const [swipeResult, setSwipeResult] = useState<boolean | null>(null);
  const [swipesCompleted, setSwipesCompleted] = useState(0);
  const swipeTouchStart = useRef<{ x: number; y: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const nextDir = useCallback((prev: SwipeDir): SwipeDir => {
    const dirs = HIDE_DIRECTIONS.filter((d) => d !== prev);
    return dirs[Math.floor(Math.random() * dirs.length)];
  }, []);

  const startCountdown = useCallback(() => {
    setPhase("countdown");
    setCountdown(3);
    let c = 3;
    countdownRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(countdownRef.current!);
        setPhase("playing");
        setTimeLeft(GAME_DURATION);
        setProgress(0);
        setTaps(0);
        setSwipesCompleted(0);
        setCurrentDir(HIDE_DIRECTIONS[Math.floor(Math.random() * HIDE_DIRECTIONS.length)]);
        setSwipeResult(null);
      }
    }, 800);
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Fin du temps
  useEffect(() => {
    if (phase !== "playing" || timeLeft > 0) return;
    const won = progress >= 100;
    setSuccess(won);
    setPhase("result");
    setFlashScreen(won ? "success" : "fail");
    setTimeout(() => setFlashScreen(null), 600);
    if (won) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    } else {
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 700);
    }
  }, [timeLeft, phase, progress]);

  // Tap/clic handler (mode run)
  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== "playing" || mode !== "run") return;
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (rect) {
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : (e as React.MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : (e as React.MouseEvent).clientY;
      const id = ++rippleId.current;
      const big = Math.random() > 0.7;
      setRipples((r) => [...r.slice(-15), { id, x: clientX - rect.left, y: clientY - rect.top, big }]);
      setTimeout(() => setRipples((r) => r.filter((rr) => rr.id !== id)), 600);
    }
    setTaps((t) => {
      const newTaps = t + 1;
      const newProgress = Math.min(100, (newTaps / RUN_TARGET) * 100);
      setProgress(newProgress);
      if (newProgress >= 100 && phase === "playing") {
        clearInterval(timerRef.current!);
        setSuccess(true);
        setPhase("result");
        setFlashScreen("success");
        setTimeout(() => setFlashScreen(null), 600);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
      }
      return newTaps;
    });
  }, [phase, mode]);

  // Logique commune pour un input directionnel
  const processHideInput = useCallback((dir: SwipeDir) => {
    const correct = dir === currentDir;
    setSwipeResult(correct);
    setTimeout(() => setSwipeResult(null), 250);
    if (!correct) {
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 300);
    }
    if (correct) {
      setSwipesCompleted((s) => {
        const newS = s + 1;
        const newProgress = Math.min(100, (newS / HIDE_TARGET) * 100);
        setProgress(newProgress);
        if (newProgress >= 100) {
          clearInterval(timerRef.current!);
          setSuccess(true);
          setPhase("result");
          setFlashScreen("success");
          setTimeout(() => setFlashScreen(null), 600);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2500);
        }
        return newS;
      });
      setCurrentDir((d) => nextDir(d));
    }
  }, [currentDir, nextDir]);

  // Swipe touch (mode hide)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (phase !== "playing" || mode !== "hide") return;
    swipeTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, [phase, mode]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (phase !== "playing" || mode !== "hide" || !swipeTouchStart.current) return;
    const dx = e.changedTouches[0].clientX - swipeTouchStart.current.x;
    const dy = e.changedTouches[0].clientY - swipeTouchStart.current.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    let dir: SwipeDir;
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = dx > 0 ? "right" : "left";
    } else {
      dir = dy > 0 ? "down" : "up";
    }
    swipeTouchStart.current = null;
    processHideInput(dir);
  }, [phase, mode, processHideInput]);

  // Touches clavier (mode hide)
  useEffect(() => {
    if (phase !== "playing" || mode !== "hide") return;
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, SwipeDir> = {
        ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
      };
      if (map[e.key]) { e.preventDefault(); processHideInput(map[e.key]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, mode, processHideInput]);

  const handleArrowClick = useCallback((dir: SwipeDir) => {
    if (phase !== "playing" || mode !== "hide") return;
    processHideInput(dir);
  }, [phase, mode, processHideInput]);

  const isRun = mode === "run";
  const timerPct = (timeLeft / GAME_DURATION) * 100;
  const timerColor = timerPct > 50 ? "#16a34a" : timerPct > 25 ? "#ca8a04" : "#dc2626";
  const urgency = timerPct <= 30;

  // ── Mode spectateur ────────────────────────────────────────
  if (isSpectator) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.9)" }}
      >
        <PoliceLights />
        <motion.div
          initial={{ scale: 0.7, rotate: -4 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="w-full max-w-sm rounded-3xl border-[5px] border-black overflow-hidden relative"
          style={{
            background: isRun
              ? "linear-gradient(160deg, #0c1a4e 0%, #1a083d 100%)"
              : "linear-gradient(160deg, #064e3b 0%, #1a083d 100%)",
            boxShadow: "10px 10px 0px #000",
          }}
        >
          <motion.div
            className="px-5 py-3 border-b-4 border-black flex items-center justify-between"
            style={{ background: isRun ? "#DC2626" : "#065F46" }}
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
                <Siren className="w-5 h-5 text-white" />
              </motion.div>
              <div style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.06em" }} className="text-white">
                PERQUISITION !
              </div>
            </div>
            <div className="px-3 py-1 rounded-xl border-[2px] border-black" style={{ background: "rgba(0,0,0,0.3)" }}>
              <span style={{ ...FONT_BANGERS, fontSize: "1.1rem" }} className="text-yellow-400">
                {isRun ? "ENFUIS-TOI" : "CACHE-TOI"}
              </span>
            </div>
          </motion.div>
          <div className="p-5 flex flex-col items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [-10, 10, -10], y: [0, -10, 0] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            >
              <img src={ticketImg} alt="" style={{ width: "4.5rem" }} />
            </motion.div>
            <div style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.06em" }} className="text-yellow-400 text-center">
              {triggeredByName ? `${triggeredByName} joue !` : "Un joueur joue !"}
            </div>
            <p style={FONT_FREDOKA} className="text-white/60 text-sm text-center">
              {isRun
                ? "Il doit cliquer le plus vite possible pour s'enfuir !"
                : "Il doit cliquer les bonnes flèches pour se cacher !"}
            </p>
            <div className="flex gap-3 w-full">
              <div className="flex-1 px-3 py-2.5 rounded-xl border-[3px] border-black flex flex-col items-center gap-1" style={{ background: "rgba(220,38,38,0.2)", borderColor: "#dc2626" }}>
                <span style={{ ...FONT_BANGERS, fontSize: "1.1rem" }} className="text-red-400">ÉCHEC</span>
                <span style={FONT_FREDOKA} className="text-red-300 text-xs text-center">+{PENALTY_AMOUNT.toLocaleString("fr-CA")}$</span>
              </div>
              <div className="flex-1 px-3 py-2.5 rounded-xl border-[3px] border-black flex flex-col items-center gap-1" style={{ background: "rgba(22,163,74,0.2)", borderColor: "#16a34a" }}>
                <span style={{ ...FONT_BANGERS, fontSize: "1.1rem" }} className="text-green-400">SUCCÈS</span>
                <span style={FONT_FREDOKA} className="text-green-300 text-xs text-center">-{REWARD_AMOUNT.toLocaleString("fr-CA")}$</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-yellow-400"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.4, 0.8] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.27 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ── Mode joueur actif ──────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.97)" }}
    >
      <PoliceLights urgency={urgency && phase === "playing"} />

      {/* Flash d'écran succès/échec */}
      <AnimatePresence>
        {flashScreen && (
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[210] pointer-events-none"
            style={{ background: flashScreen === "success" ? "rgba(22,163,74,0.5)" : "rgba(220,38,38,0.5)" }}
          />
        )}
      </AnimatePresence>

      {showConfetti && (
        <div className="fixed inset-0 z-[210] pointer-events-none">
          <Confetti success={success} />
        </div>
      )}

      <motion.div
        initial={{ scale: 0.6, rotate: -6, y: 60 }}
        animate={shakeScreen
          ? { scale: 1, rotate: 0, y: 0, x: [-12, 12, -8, 8, -4, 4, 0] }
          : { scale: 1, rotate: 0, y: 0, x: 0 }
        }
        exit={{ scale: 0.6, opacity: 0, y: 60, rotate: 6 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="w-full max-w-sm rounded-3xl border-[5px] border-black overflow-hidden relative"
        style={{
          background: isRun
            ? "linear-gradient(160deg, #0c1a4e 0%, #1a083d 100%)"
            : "linear-gradient(160deg, #064e3b 0%, #1a083d 100%)",
          boxShadow: urgency && phase === "playing"
            ? "10px 10px 0px #000, 0 0 40px rgba(220,38,38,0.6)"
            : "10px 10px 0px #000",
        }}
      >
        {/* ── Header avec sirène ── */}
        <motion.div
          className="px-5 py-3 border-b-4 border-black flex items-center justify-between"
          style={{ background: isRun ? "#DC2626" : "#065F46" }}
          animate={urgency && phase === "playing" ? { opacity: [1, 0.5, 1] } : {}}
          transition={urgency ? { duration: 0.35, repeat: Infinity } : {}}
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ duration: 0.4, repeat: Infinity }}
            >
              <Siren className="w-5 h-5 text-white" />
            </motion.div>
            <div style={{ ...FONT_BANGERS, fontSize: "1.2rem", letterSpacing: "0.06em" }} className="text-white">
              PERQUISITION !
            </div>
          </div>
          <motion.div
            className="px-3 py-1 rounded-xl border-[2px] border-black"
            style={{ background: "rgba(0,0,0,0.3)" }}
            animate={urgency && phase === "playing" ? { scale: [1, 1.15, 1] } : {}}
            transition={urgency ? { duration: 0.35, repeat: Infinity } : {}}
          >
            <span style={{ ...FONT_BANGERS, fontSize: "1.1rem" }} className="text-yellow-400">
              {isRun ? "ENFUIS-TOI !" : "CACHE-TOI !"}
            </span>
          </motion.div>
        </motion.div>

        {/* ── Corps ── */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* ── INTRO ── */}
            {phase === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="flex flex-col gap-4"
              >
                <motion.div
                  animate={{
                    rotate: [-12, 12, -12],
                    scale: [1, 1.25, 1],
                    y: [0, -10, 0],
                    filter: [
                      "drop-shadow(0 4px 8px rgba(255,215,0,0.3))",
                      "drop-shadow(0 12px 20px rgba(255,215,0,0.7))",
                      "drop-shadow(0 4px 8px rgba(255,215,0,0.3))",
                    ],
                  }}
                  transition={{ duration: 1.0, repeat: Infinity }}
                  className="text-center"
                >
                  <img src={ticketImg} alt="" style={{ width: "5rem", display: "inline-block" }} />
                </motion.div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ ...FONT_BANGERS, fontSize: "2.2rem", letterSpacing: "0.08em" }}
                  className="text-yellow-400 text-center leading-tight"
                >
                  {isRun ? "🚨 ENFUIS-TOI !" : "🫣 CACHE-TOI !"}
                </motion.div>
                <div className="w-full px-4 py-3 rounded-2xl border-[3px] border-black" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <p style={FONT_FREDOKA} className="text-white/80 text-sm text-center leading-snug">
                    {isRun
                      ? `Clique / tape le plus vite possible pendant ${GAME_DURATION} secondes !`
                      : `Clique la bonne flèche (ou swipe / touches ←↑↓→) le plus vite possible !`}
                  </p>
                </div>
                <div className="flex gap-3 w-full">
                  <div className="flex-1 px-3 py-2.5 rounded-xl border-[3px] border-black flex flex-col items-center gap-1" style={{ background: "rgba(220,38,38,0.2)", borderColor: "#dc2626" }}>
                    <span style={{ ...FONT_BANGERS, fontSize: "1.2rem" }} className="text-red-400">ÉCHEC</span>
                    <span style={FONT_FREDOKA} className="text-red-300 text-xs text-center">+{PENALTY_AMOUNT.toLocaleString("fr-CA")}$ de dette</span>
                  </div>
                  <div className="flex-1 px-3 py-2.5 rounded-xl border-[3px] border-black flex flex-col items-center gap-1" style={{ background: "rgba(22,163,74,0.2)", borderColor: "#16a34a" }}>
                    <span style={{ ...FONT_BANGERS, fontSize: "1.2rem" }} className="text-green-400">SUCCÈS</span>
                    <span style={FONT_FREDOKA} className="text-green-300 text-xs text-center">-{REWARD_AMOUNT.toLocaleString("fr-CA")}$ de dette</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.06, y: -3, boxShadow: "8px 8px 0px #000" } as any}
                  whileTap={{ scale: 0.92, y: 3 } as any}
                  onClick={startCountdown}
                  className="w-full py-4 bg-yellow-400 border-[4px] border-black rounded-2xl relative overflow-hidden"
                  style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.1em", boxShadow: "6px 6px 0px #000" }}
                >
                  <motion.div
                    className="absolute inset-0 w-1/3 bg-white/30 skew-x-[-20deg]"
                    animate={{ x: ["-100%", "400%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.3 }}
                  />
                  <span className="relative z-10 text-black flex items-center justify-center gap-2">
                    <Zap className="w-6 h-6" />
                    COMMENCER !
                  </span>
                </motion.button>
              </motion.div>
            )}

            {/* ── COUNTDOWN ── */}
            {phase === "countdown" && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-4 py-6"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={countdown}
                    initial={{ scale: 2.5, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.3, opacity: 0, rotate: 20 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    style={{
                      ...FONT_BANGERS,
                      fontSize: "7rem",
                      letterSpacing: "0.05em",
                      lineHeight: 1,
                      color: countdown === 1 ? "#dc2626" : countdown === 2 ? "#ca8a04" : "#16a34a",
                      textShadow: `5px 5px 0px #000, 0 0 40px ${countdown === 1 ? "rgba(220,38,38,0.8)" : countdown === 2 ? "rgba(202,138,4,0.8)" : "rgba(22,163,74,0.8)"}`,
                    }}
                  >
                    {countdown > 0 ? countdown : "GO !"}
                  </motion.div>
                </AnimatePresence>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={FONT_FREDOKA}
                  className="text-white/60 text-sm"
                >
                  Prépare-toi...
                </motion.div>
              </motion.div>
            )}

            {/* ── PLAYING ── */}
            {phase === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                {/* Timer + compteur */}
                <div className="flex items-center justify-between">
                  <motion.div
                    className="px-3 py-1.5 rounded-xl border-[3px] border-black"
                    style={{ background: timerColor, boxShadow: "3px 3px 0px #000" }}
                    animate={urgency ? { scale: [1, 1.2, 1], boxShadow: ["3px 3px 0px #000", "5px 5px 0px #000, 0 0 15px rgba(220,38,38,0.6)", "3px 3px 0px #000"] } : {}}
                    transition={urgency ? { duration: 0.35, repeat: Infinity } : {}}
                  >
                    <span style={{ ...FONT_BANGERS, fontSize: "1.5rem", letterSpacing: "0.06em" }} className="text-white">{timeLeft}s</span>
                  </motion.div>
                  <div style={FONT_FREDOKA} className="text-white/60 text-sm">
                    {isRun ? `${taps} / ${RUN_TARGET}` : `${swipesCompleted} / ${HIDE_TARGET}`}
                  </div>
                </div>

                {/* Barre de progression améliorée */}
                <div className="relative h-8 rounded-full border-[3px] border-black overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: progress >= 100 ? "#16a34a" : urgency ? "linear-gradient(90deg, #dc2626, #f97316)" : "linear-gradient(90deg, #FFD700, #FF8C00)" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 250, damping: 20 }}
                  />
                  {/* Effet de brillance */}
                  <motion.div
                    className="absolute inset-y-0 w-8 bg-white/40 skew-x-[-20deg]"
                    animate={{ left: ["-10%", "110%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.3 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span style={{ ...FONT_BANGERS, fontSize: "0.9rem" }} className="text-black/80 mix-blend-overlay">{Math.round(progress)}%</span>
                  </div>
                </div>

                {isRun ? (
                  /* Zone de tap — mode ENFUIS-TOI */
                  <div
                    ref={gameAreaRef}
                    className="relative h-48 rounded-2xl border-[4px] border-black overflow-hidden select-none cursor-pointer"
                    style={{
                      background: urgency
                        ? "linear-gradient(135deg, #3a0a0a, #1a083d)"
                        : "linear-gradient(135deg, #1a083d, #0c1a4e)",
                      boxShadow: urgency ? "6px 6px 0px #000, 0 0 20px rgba(220,38,38,0.4)" : "6px 6px 0px #000",
                      touchAction: "none",
                      borderColor: urgency ? "#dc2626" : "#000",
                      transition: "all 0.3s",
                    }}
                    onClick={handleTap}
                    onTouchStart={(e) => { e.preventDefault(); handleTap(e); }}
                  >
                    {/* Ripples améliorés */}
                    {ripples.map((r) => (
                      <motion.div
                        key={r.id}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: r.big ? 7 : 5, opacity: 0 }}
                        transition={{ duration: r.big ? 0.7 : 0.5, ease: "easeOut" }}
                        className="absolute rounded-full"
                        style={{
                          left: r.x - (r.big ? 15 : 10),
                          top: r.y - (r.big ? 15 : 10),
                          width: r.big ? 30 : 20,
                          height: r.big ? 30 : 20,
                          border: `3px solid ${r.big ? "#FFD700" : "#fff"}`,
                          pointerEvents: "none",
                        }}
                      />
                    ))}
                    {/* Lumières clignotantes en urgence */}
                    {urgency && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-[4px] border-red-500"
                          animate={{ opacity: [0, 0.9, 0] }}
                          transition={{ duration: 0.25, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute inset-0"
                          animate={{ background: ["rgba(220,38,38,0)", "rgba(220,38,38,0.12)", "rgba(220,38,38,0)"] }}
                          transition={{ duration: 0.25, repeat: Infinity }}
                        />
                      </>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                      <motion.div
                        animate={{
                          scale: [1, 1.3, 1],
                          rotate: [-8, 8, -8],
                          y: [0, -8, 0],
                          filter: ["drop-shadow(0 4px 4px rgba(0,0,0,0.5))", "drop-shadow(0 12px 12px rgba(0,0,0,0.3))", "drop-shadow(0 4px 4px rgba(0,0,0,0.5))"],
                        }}
                        transition={{ duration: 0.4, repeat: Infinity }}
                      >
                        <img src={ticketImg} alt="" style={{ width: "3.5rem" }} />
                      </motion.div>
                      <motion.div
                        animate={{ scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 0.35, repeat: Infinity }}
                        style={{ ...FONT_BANGERS, fontSize: "1.5rem", letterSpacing: "0.1em" }}
                        className="text-yellow-400"
                      >
                        CLIQUE ICI !
                      </motion.div>
                      <div style={FONT_FREDOKA} className="text-white/40 text-xs">
                        ({taps} clics)
                      </div>
                    </div>
                    {/* Icône police en coin */}
                    <motion.div
                      className="absolute right-3 top-3 pointer-events-none"
                      animate={{ x: [0, -8, 0], opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={urgency ? "#ef4444" : "#3b82f6"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="10" width="22" height="11" rx="2" />
                        <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                        <circle cx="8" cy="16" r="1.5" fill={urgency ? "#ef4444" : "#3b82f6"} />
                        <circle cx="16" cy="16" r="1.5" fill={urgency ? "#ef4444" : "#3b82f6"} />
                      </svg>
                    </motion.div>
                  </div>
                ) : (
                  /* Zone de swipe/flèches — mode CACHE-TOI */
                  <div
                    className="h-48 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-4 select-none relative overflow-hidden"
                    style={{
                      background: urgency
                        ? "linear-gradient(135deg, #1a3a0a, #1a083d)"
                        : "linear-gradient(135deg, #064e3b, #1a083d)",
                      boxShadow: urgency ? "6px 6px 0px #000, 0 0 20px rgba(220,38,38,0.4)" : "6px 6px 0px #000",
                      touchAction: "none",
                      borderColor: urgency ? "#dc2626" : "#000",
                      transition: "all 0.3s",
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    {urgency && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-[4px] border-red-500"
                        animate={{ opacity: [0, 0.9, 0] }}
                        transition={{ duration: 0.25, repeat: Infinity }}
                      />
                    )}
                    <div className="flex gap-3 items-center relative z-10">
                      <Arrow dir="left" active={currentDir === "left"} correct={swipeResult !== null && currentDir === "left" ? swipeResult : undefined} onClick={() => handleArrowClick("left")} />
                      <div className="flex flex-col gap-3">
                        <Arrow dir="up" active={currentDir === "up"} correct={swipeResult !== null && currentDir === "up" ? swipeResult : undefined} onClick={() => handleArrowClick("up")} />
                        <Arrow dir="down" active={currentDir === "down"} correct={swipeResult !== null && currentDir === "down" ? swipeResult : undefined} onClick={() => handleArrowClick("down")} />
                      </div>
                      <Arrow dir="right" active={currentDir === "right"} correct={swipeResult !== null && currentDir === "right" ? swipeResult : undefined} onClick={() => handleArrowClick("right")} />
                    </div>
                    <div style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.06em" }} className="text-white/50 relative z-10">
                      CLIQUE LA BONNE FLÈCHE
                    </div>
                  </div>
                )}

                {/* Message d'encouragement */}
                <motion.div
                  key={Math.floor(taps / 8) + Math.floor(swipesCompleted / 4)}
                  initial={{ opacity: 0, y: -10, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="text-center"
                >
                  <span style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.05em" }} className={urgency ? "text-red-400" : "text-yellow-400/70"}>
                    {urgency ? "⚠️ DÉPÊCHE-TOI !" : progress < 25 ? "🚀 PLUS VITE !" : progress < 50 ? "💪 CONTINUE !" : progress < 75 ? "🔥 PRESQUE !" : progress < 90 ? "⚡ ENCORE UN PEU !" : "🎯 TU Y ES PRESQUE !"}
                  </span>
                </motion.div>
              </motion.div>
            )}

            {/* ── RESULT ── */}
            {phase === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.6, y: 40, rotate: success ? -8 : 8 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-5"
              >
                {/* Icône résultat animée */}
                <motion.div
                  animate={success
                    ? { rotate: [0, 20, -20, 12, -12, 0], scale: [1, 1.25, 1], y: [0, -8, 0] }
                    : { rotate: [0, -10, 10, -6, 6, 0], scale: [1, 0.85, 1], y: [0, 4, 0] }
                  }
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-28 h-28 rounded-3xl border-[5px] border-black flex items-center justify-center"
                  style={{
                    background: success
                      ? "linear-gradient(135deg, #16a34a, #22c55e)"
                      : "linear-gradient(135deg, #DC2626, #ef4444)",
                    boxShadow: success
                      ? "8px 8px 0px #000, 0 0 40px rgba(22,163,74,0.6)"
                      : "8px 8px 0px #000, 0 0 40px rgba(220,38,38,0.6)",
                  }}
                >
                  {success
                    ? <Trophy className="w-14 h-14 text-white" />
                    : <AlertTriangle className="w-14 h-14 text-white" />
                  }
                </motion.div>

                {/* Titre résultat */}
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.1 }}
                  style={{
                    ...FONT_BANGERS,
                    fontSize: "2.8rem",
                    letterSpacing: "0.1em",
                    textShadow: success
                      ? "4px 4px 0px #000, 0 0 30px rgba(22,163,74,0.6)"
                      : "4px 4px 0px #000, 0 0 30px rgba(220,38,38,0.6)",
                  }}
                  className={success ? "text-green-400" : "text-red-400"}
                >
                  {success ? "🏆 RÉUSSI !" : "🚨 ATTRAPÉ !"}
                </motion.div>

                {/* Montant */}
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.25, type: "spring", stiffness: 280 }}
                  className="w-full px-5 py-4 rounded-2xl border-[4px] border-black text-center"
                  style={{
                    background: success ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)",
                    borderColor: success ? "#16a34a" : "#dc2626",
                    boxShadow: success ? "4px 4px 0px #000" : "4px 4px 0px #000",
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ delay: 0.4, duration: 1.5, repeat: Infinity }}
                    style={{ ...FONT_BANGERS, fontSize: "2.2rem", letterSpacing: "0.06em" }}
                    className={success ? "text-green-300" : "text-red-300"}
                  >
                    {success ? `-${REWARD_AMOUNT.toLocaleString("fr-CA")}$` : `+${PENALTY_AMOUNT.toLocaleString("fr-CA")}$`}
                  </motion.div>
                  <p style={FONT_FREDOKA} className="text-white/60 text-sm mt-1">
                    {success ? "🎉 Réduction de ta dette !" : "😱 Ticket ajouté à ta dette..."}
                  </p>
                </motion.div>

                {/* Bouton continuer */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05, y: -3, boxShadow: "8px 8px 0px #000" } as any}
                  whileTap={{ scale: 0.93, y: 3 } as any}
                  onClick={() => onComplete(success, success ? REWARD_AMOUNT : PENALTY_AMOUNT)}
                  className="w-full py-4 bg-yellow-400 border-[4px] border-black rounded-2xl relative overflow-hidden"
                  style={{ ...FONT_BANGERS, fontSize: "1.4rem", letterSpacing: "0.1em", boxShadow: "6px 6px 0px #000" }}
                >
                  <motion.div
                    className="absolute inset-0 w-1/3 bg-white/30 skew-x-[-20deg]"
                    animate={{ x: ["-100%", "400%"] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 }}
                  />
                  <span className="relative z-10 text-black flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    CONTINUER LA PARTIE
                  </span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
// rollMiniGame est dans @/game/utils/miniGameUtils pour éviter les conflits Fast Refresh

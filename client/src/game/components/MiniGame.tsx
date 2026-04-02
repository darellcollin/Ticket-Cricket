/**
 * MiniGame — Mini-jeu surprise qui se déclenche rarement en début de tour.
 * Deux modes :
 *  - "run"  : Tap-tap rapide pour s'enfuir de la police (10 sec)
 *  - "hide" : Swipe dans les directions indiquées (10 sec)
 *
 * Résultat :
 *  - Succès  → réduction de 1000$ de dette
 *  - Échec   → ticket de 1000$ de dette
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

const GAME_DURATION = 10; // secondes
const PENALTY_AMOUNT = 1000;
const REWARD_AMOUNT = 1000;

// Seuils de progression (taps ou swipes requis)
const RUN_TARGET = 40;  // taps en 10 sec (difficile)
const HIDE_DIRECTIONS: Array<"left" | "right" | "up" | "down"> = ["left", "right", "up", "down"];

import type { MiniGameMode } from "@/game/utils/miniGameUtils";
type MiniGamePhase = "intro" | "playing" | "result";
type SwipeDir = "left" | "right" | "up" | "down";

interface MiniGameProps {
  mode: MiniGameMode;
  onComplete: (success: boolean, amount: number) => void;
}

// ── Flèche directionnelle ──────────────────────────────────────
function Arrow({ dir, active, correct }: { dir: SwipeDir; active: boolean; correct?: boolean }) {
  const arrows = { left: "←", right: "→", up: "↑", down: "↓" };
  return (
    <motion.div
      animate={active ? { scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] } : { scale: 1, opacity: 0.25 }}
      transition={active ? { duration: 0.5, repeat: Infinity } : {}}
      className="w-14 h-14 rounded-xl border-[3px] border-black flex items-center justify-center"
      style={{
        background: correct === true ? "#16a34a" : correct === false ? "#dc2626" : active ? "#FFD700" : "rgba(255,255,255,0.1)",
        boxShadow: active ? "4px 4px 0px #000" : "2px 2px 0px rgba(0,0,0,0.3)",
        fontSize: "1.8rem",
      }}
    >
      {arrows[dir]}
    </motion.div>
  );
}

// ── Composant principal ────────────────────────────────────────
export function MiniGame({ mode, onComplete }: MiniGameProps) {
  const [phase, setPhase] = useState<MiniGamePhase>("intro");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [progress, setProgress] = useState(0); // 0-100
  const [taps, setTaps] = useState(0);
  const [success, setSuccess] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);

  // Pour le mode hide
  const [currentDir, setCurrentDir] = useState<SwipeDir>("right");
  const [swipeResult, setSwipeResult] = useState<boolean | null>(null);
  const [swipesCompleted, setSwipesCompleted] = useState(0);
  const HIDE_TARGET = 12; // swipes en 10 sec
  const swipeTouchStart = useRef<{ x: number; y: number } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Générer une direction aléatoire différente de la précédente
  const nextDir = useCallback((prev: SwipeDir): SwipeDir => {
    const dirs = HIDE_DIRECTIONS.filter((d) => d !== prev);
    return dirs[Math.floor(Math.random() * dirs.length)];
  }, []);

  // Démarrer le jeu
  const startGame = useCallback(() => {
    setPhase("playing");
    setTimeLeft(GAME_DURATION);
    setProgress(0);
    setTaps(0);
    setSwipesCompleted(0);
    setCurrentDir(HIDE_DIRECTIONS[Math.floor(Math.random() * HIDE_DIRECTIONS.length)]);
    setSwipeResult(null);
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Fin du temps
  useEffect(() => {
    if (phase !== "playing" || timeLeft > 0) return;
    const won = progress >= 100;
    setSuccess(won);
    setPhase("result");
  }, [timeLeft, phase, progress]);

  // Tap handler (mode run)
  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== "playing" || mode !== "run") return;

    // Ripple
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (rect) {
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : (e as React.MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : (e as React.MouseEvent).clientY;
      const id = ++rippleId.current;
      setRipples((r) => [...r.slice(-8), { id, x: clientX - rect.left, y: clientY - rect.top }]);
      setTimeout(() => setRipples((r) => r.filter((rr) => rr.id !== id)), 600);
    }

    setTaps((t) => {
      const newTaps = t + 1;
      const newProgress = Math.min(100, (newTaps / RUN_TARGET) * 100);
      setProgress(newProgress);
      if (newProgress >= 100 && phase === "playing") {
        // Victoire immédiate
        clearInterval(timerRef.current!);
        setSuccess(true);
        setPhase("result");
      }
      return newTaps;
    });
  }, [phase, mode]);

  // Swipe touch handlers (mode hide)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (phase !== "playing" || mode !== "hide") return;
    swipeTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, [phase, mode]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (phase !== "playing" || mode !== "hide" || !swipeTouchStart.current) return;
    const dx = e.changedTouches[0].clientX - swipeTouchStart.current.x;
    const dy = e.changedTouches[0].clientY - swipeTouchStart.current.y;
    swipeTouchStart.current = null;

    let detected: SwipeDir | null = null;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) detected = dx > 0 ? "right" : "left";
    } else {
      if (Math.abs(dy) > 30) detected = dy > 0 ? "down" : "up";
    }
    if (!detected) return;

    const correct = detected === currentDir;
    setSwipeResult(correct);
    setTimeout(() => setSwipeResult(null), 300);

    if (correct) {
      setSwipesCompleted((s) => {
        const newS = s + 1;
        const newProgress = Math.min(100, (newS / HIDE_TARGET) * 100);
        setProgress(newProgress);
        if (newProgress >= 100 && phase === "playing") {
          clearInterval(timerRef.current!);
          setSuccess(true);
          setPhase("result");
        }
        return newS;
      });
      setCurrentDir((d) => nextDir(d));
    }
  }, [phase, mode, currentDir, nextDir]);

  // Swipe clavier (desktop) pour mode hide
  useEffect(() => {
    if (phase !== "playing" || mode !== "hide") return;
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, SwipeDir> = {
        ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
      };
      const dir = map[e.key];
      if (!dir) return;
      const correct = dir === currentDir;
      setSwipeResult(correct);
      setTimeout(() => setSwipeResult(null), 300);
      if (correct) {
        setSwipesCompleted((s) => {
          const newS = s + 1;
          const newProgress = Math.min(100, (newS / HIDE_TARGET) * 100);
          setProgress(newProgress);
          if (newProgress >= 100) {
            clearInterval(timerRef.current!);
            setSuccess(true);
            setPhase("result");
          }
          return newS;
        });
        setCurrentDir((d) => nextDir(d));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, mode, currentDir, nextDir]);

  const isRun = mode === "run";
  const timerPct = (timeLeft / GAME_DURATION) * 100;
  const timerColor = timerPct > 50 ? "#16a34a" : timerPct > 25 ? "#ca8a04" : "#dc2626";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)" }}
    >
      <motion.div
        initial={{ scale: 0.7, rotate: -4 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="w-full max-w-sm rounded-3xl border-[5px] border-black overflow-hidden"
        style={{
          background: isRun
            ? "linear-gradient(160deg, #0c1a4e 0%, #1a083d 100%)"
            : "linear-gradient(160deg, #064e3b 0%, #1a083d 100%)",
          boxShadow: "10px 10px 0px #000",
        }}
      >
        {/* ── Header ── */}
        <div
          className="px-5 py-3 border-b-4 border-black flex items-center justify-between"
          style={{ background: isRun ? "#DC2626" : "#065F46" }}
        >
          <div style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.06em" }} className="text-white">
            MINI-JEU SURPRISE
          </div>
          <div
            className="px-3 py-1 rounded-xl border-[2px] border-black"
            style={{ background: "rgba(0,0,0,0.3)" }}
          >
            <span style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-yellow-400">
              {timerColor === "#dc2626" ? "URGENCE" : "EN COURS"}
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <AnimatePresence mode="wait">

            {/* ── INTRO ── */}
            {phase === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-5"
              >
                {/* Alerte clignotante */}
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-20 h-20 rounded-2xl border-[4px] border-black flex items-center justify-center"
                  style={{ background: isRun ? "#DC2626" : "#065F46", boxShadow: "5px 5px 0px #000" }}
                >
                  <span style={{ fontSize: "2.5rem" }}>{isRun ? "🚨" : "🫣"}</span>
                </motion.div>

                <div style={{ ...FONT_BANGERS, fontSize: "1.8rem", letterSpacing: "0.06em" }} className="text-yellow-400 text-center leading-tight">
                  {isRun ? "ENFUIS-TOI DE LA POLICE !" : "CACHE-TOI DE LA POLICE !"}
                </div>

                <div
                  className="w-full px-4 py-3 rounded-2xl border-[3px] border-black"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <p style={FONT_FREDOKA} className="text-white/80 text-sm text-center leading-snug">
                    {isRun
                      ? `Tape l'écran le plus vite possible pendant ${GAME_DURATION} secondes pour atteindre la barre de progression !`
                      : `Glisse dans la direction indiquée le plus vite possible pendant ${GAME_DURATION} secondes !`}
                  </p>
                </div>

                {/* Enjeux */}
                <div className="flex gap-3 w-full">
                  <div
                    className="flex-1 px-3 py-2.5 rounded-xl border-[3px] border-black flex flex-col items-center gap-1"
                    style={{ background: "rgba(220,38,38,0.2)", borderColor: "#dc2626" }}
                  >
                    <span style={{ ...FONT_BANGERS, fontSize: "1.2rem" }} className="text-red-400">ÉCHEC</span>
                    <span style={FONT_FREDOKA} className="text-red-300 text-xs text-center">+{PENALTY_AMOUNT.toLocaleString("fr-CA")}$ de dette</span>
                  </div>
                  <div
                    className="flex-1 px-3 py-2.5 rounded-xl border-[3px] border-black flex flex-col items-center gap-1"
                    style={{ background: "rgba(22,163,74,0.2)", borderColor: "#16a34a" }}
                  >
                    <span style={{ ...FONT_BANGERS, fontSize: "1.2rem" }} className="text-green-400">SUCCÈS</span>
                    <span style={FONT_FREDOKA} className="text-green-300 text-xs text-center">-{REWARD_AMOUNT.toLocaleString("fr-CA")}$ de dette</span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="w-full py-4 bg-yellow-400 border-[4px] border-black rounded-2xl relative overflow-hidden"
                  style={{ ...FONT_BANGERS, fontSize: "1.5rem", letterSpacing: "0.1em", boxShadow: "5px 5px 0px #000" }}
                >
                  <motion.div
                    className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg]"
                    animate={{ x: ["-100%", "400%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                  />
                  <span className="relative z-10 text-black">COMMENCER !</span>
                </motion.button>
              </motion.div>
            )}

            {/* ── PLAYING ── */}
            {phase === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                {/* Timer + compteur */}
                <div className="flex items-center justify-between">
                  <div
                    className="px-3 py-1.5 rounded-xl border-[3px] border-black"
                    style={{ background: timerColor, boxShadow: "3px 3px 0px #000" }}
                  >
                    <span style={{ ...FONT_BANGERS, fontSize: "1.4rem", letterSpacing: "0.06em" }} className="text-white">
                      {timeLeft}s
                    </span>
                  </div>
                  <div style={FONT_FREDOKA} className="text-white/60 text-sm">
                    {isRun ? `${taps} / ${RUN_TARGET} taps` : `${swipesCompleted} / ${HIDE_TARGET} swipes`}
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="relative h-6 rounded-full border-[3px] border-black overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: progress >= 100 ? "#16a34a" : "#FFD700" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  />
                  {/* Ligne cible */}
                  <div className="absolute inset-y-0 right-0 w-1 bg-white/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span style={{ ...FONT_BANGERS, fontSize: "0.8rem" }} className="text-black/70 mix-blend-overlay">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>

                {/* Zone de jeu */}
                {isRun ? (
                  // MODE RUN : zone de tap
                  <div
                    ref={gameAreaRef}
                    className="relative h-44 rounded-2xl border-[4px] border-black overflow-hidden select-none cursor-pointer active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #1a083d, #0c1a4e)",
                      boxShadow: "5px 5px 0px #000",
                      touchAction: "none",
                    }}
                    onClick={handleTap}
                    onTouchStart={(e) => { e.preventDefault(); handleTap(e); }}
                  >
                    {/* Ripples */}
                    {ripples.map((r) => (
                      <motion.div
                        key={r.id}
                        initial={{ scale: 0, opacity: 0.8 }}
                        animate={{ scale: 4, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute w-12 h-12 rounded-full border-[3px] border-yellow-400"
                        style={{ left: r.x - 24, top: r.y - 24, pointerEvents: "none" }}
                      />
                    ))}
                    {/* Texte central */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], rotate: [-3, 3, -3] }}
                        transition={{ duration: 0.4, repeat: Infinity }}
                        style={{ fontSize: "3rem" }}
                      >
                        🏃
                      </motion.div>
                      <div style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.08em" }} className="text-yellow-400">
                        TAPE ICI !
                      </div>
                    </div>
                    {/* Police qui poursuit */}
                    <motion.div
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      animate={{ x: [0, -8, 0], rotate: [-5, 5, -5] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      style={{ fontSize: "2.5rem", opacity: 0.6 }}
                    >
                      🚔
                    </motion.div>
                  </div>
                ) : (
                  // MODE HIDE : zone de swipe avec flèches
                  <div
                    className="h-44 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-4 select-none"
                    style={{
                      background: "linear-gradient(135deg, #064e3b, #1a083d)",
                      boxShadow: "5px 5px 0px #000",
                      touchAction: "none",
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Flèches directionnelles */}
                    <div className="flex gap-2 items-center">
                      <Arrow dir="left" active={currentDir === "left"} correct={swipeResult !== null && currentDir === "left" ? swipeResult : undefined} />
                      <div className="flex flex-col gap-2">
                        <Arrow dir="up" active={currentDir === "up"} correct={swipeResult !== null && currentDir === "up" ? swipeResult : undefined} />
                        <Arrow dir="down" active={currentDir === "down"} correct={swipeResult !== null && currentDir === "down" ? swipeResult : undefined} />
                      </div>
                      <Arrow dir="right" active={currentDir === "right"} correct={swipeResult !== null && currentDir === "right" ? swipeResult : undefined} />
                    </div>
                    <div style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.06em" }} className="text-white/50">
                      GLISSE DANS LA DIRECTION
                    </div>
                    {/* Indication clavier desktop */}
                    <div style={FONT_FREDOKA} className="text-white/25 text-xs">
                      (ou touches fléchées)
                    </div>
                  </div>
                )}

                {/* Texte d'encouragement */}
                <motion.div
                  key={Math.floor(taps / 5) + Math.floor(swipesCompleted / 3)}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <span style={{ ...FONT_BANGERS, fontSize: "0.95rem", letterSpacing: "0.05em" }} className="text-yellow-400/60">
                    {progress < 30 ? "PLUS VITE !" : progress < 60 ? "CONTINUE !" : progress < 90 ? "PRESQUE !" : "ENCORE UN PEU !"}
                  </span>
                </motion.div>
              </motion.div>
            )}

            {/* ── RESULT ── */}
            {phase === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 20 }}
                className="flex flex-col items-center gap-5"
              >
                {/* Icône résultat */}
                <motion.div
                  animate={{ rotate: success ? [0, 10, -10, 0] : [0, -5, 5, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-24 h-24 rounded-2xl border-[4px] border-black flex items-center justify-center"
                  style={{
                    background: success ? "#16a34a" : "#DC2626",
                    boxShadow: "6px 6px 0px #000",
                  }}
                >
                  <span style={{ fontSize: "3rem" }}>{success ? "🏆" : "🚨"}</span>
                </motion.div>

                <div style={{ ...FONT_BANGERS, fontSize: "2rem", letterSpacing: "0.08em" }} className={success ? "text-green-400" : "text-red-400"}>
                  {success ? "RÉUSSI !" : "ATTRAPÉ !"}
                </div>

                <div
                  className="w-full px-5 py-4 rounded-2xl border-[3px] border-black text-center"
                  style={{ background: success ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)" }}
                >
                  <div style={{ ...FONT_BANGERS, fontSize: "1.8rem", letterSpacing: "0.06em" }} className={success ? "text-green-300" : "text-red-300"}>
                    {success ? `-${REWARD_AMOUNT.toLocaleString("fr-CA")}$` : `+${PENALTY_AMOUNT.toLocaleString("fr-CA")}$`}
                  </div>
                  <p style={FONT_FREDOKA} className="text-white/60 text-sm mt-1">
                    {success ? "Réduction de ta dette" : "Ticket ajouté à ta dette"}
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onComplete(success, success ? REWARD_AMOUNT : PENALTY_AMOUNT)}
                  className="w-full py-4 bg-yellow-400 border-[4px] border-black rounded-2xl"
                  style={{ ...FONT_BANGERS, fontSize: "1.4rem", letterSpacing: "0.1em", boxShadow: "5px 5px 0px #000" }}
                >
                  CONTINUER LA PARTIE
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
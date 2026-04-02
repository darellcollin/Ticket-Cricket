/**
 * MiniGame — Mini-jeu surprise qui se déclenche rarement en début de tour.
 * Deux modes :
 *  - "run"  : Clics/taps rapides pour s'enfuir de la police (10 sec)
 *  - "hide" : Clics sur flèches / swipe / touches clavier dans les directions indiquées (10 sec)
 *
 * Props :
 *  - mode            : "run" | "hide"
 *  - onComplete      : callback avec (success, amount) — appelé uniquement si isSpectator=false
 *  - isSpectator     : si true, affiche une version "en cours" sans interaction
 *  - triggeredByName : nom du joueur qui joue (affiché en mode spectateur)
 *
 * Résultat :
 *  - Succès  → réduction de 1000$ de dette
 *  - Échec   → ticket de 1000$ de dette
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

const GAME_DURATION = 10;
const PENALTY_AMOUNT = 1000;
const REWARD_AMOUNT = 1000;
const RUN_TARGET = 60;
const HIDE_TARGET = 20;
const HIDE_DIRECTIONS: Array<"left" | "right" | "up" | "down"> = ["left", "right", "up", "down"];

import type { MiniGameMode } from "@/game/utils/miniGameUtils";
type MiniGamePhase = "intro" | "playing" | "result";
type SwipeDir = "left" | "right" | "up" | "down";

interface MiniGameProps {
  mode: MiniGameMode;
  onComplete: (success: boolean, amount: number) => void;
  isSpectator?: boolean;
  triggeredByName?: string;
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
  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={active ? { scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] } : { scale: 1, opacity: 0.25 }}
      transition={active ? { duration: 0.5, repeat: Infinity } : {}}
      className="w-14 h-14 rounded-xl border-[3px] border-black flex items-center justify-center"
      style={{
        background: correct === true ? "#16a34a" : correct === false ? "#dc2626" : active ? "#FFD700" : "rgba(255,255,255,0.1)",
        boxShadow: active ? "4px 4px 0px #000" : "2px 2px 0px rgba(0,0,0,0.3)",
        fontSize: "1.8rem",
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
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [progress, setProgress] = useState(0);
  const [taps, setTaps] = useState(0);
  const [success, setSuccess] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);

  const [currentDir, setCurrentDir] = useState<SwipeDir>("right");
  const [swipeResult, setSwipeResult] = useState<boolean | null>(null);
  const [swipesCompleted, setSwipesCompleted] = useState(0);
  const swipeTouchStart = useRef<{ x: number; y: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const nextDir = useCallback((prev: SwipeDir): SwipeDir => {
    const dirs = HIDE_DIRECTIONS.filter((d) => d !== prev);
    return dirs[Math.floor(Math.random() * dirs.length)];
  }, []);

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
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Fin du temps
  useEffect(() => {
    if (phase !== "playing" || timeLeft > 0) return;
    setSuccess(progress >= 100);
    setPhase("result");
  }, [timeLeft, phase, progress]);

  // Tap/clic handler (mode run)
  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== "playing" || mode !== "run") return;
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
        clearInterval(timerRef.current!);
        setSuccess(true);
        setPhase("result");
      }
      return newTaps;
    });
  }, [phase, mode]);

  // Logique commune pour un input directionnel (swipe, clic ou clavier)
  const processHideInput = useCallback((dir: SwipeDir) => {
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
    swipeTouchStart.current = null;
    let detected: SwipeDir | null = null;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) detected = dx > 0 ? "right" : "left";
    } else {
      if (Math.abs(dy) > 30) detected = dy > 0 ? "down" : "up";
    }
    if (detected) processHideInput(detected);
  }, [phase, mode, processHideInput]);

  // Clic sur flèche (PC, mode hide)
  const handleArrowClick = useCallback((dir: SwipeDir) => {
    if (phase !== "playing" || mode !== "hide") return;
    processHideInput(dir);
  }, [phase, mode, processHideInput]);

  // Touches clavier (desktop, mode hide)
  useEffect(() => {
    if (phase !== "playing" || mode !== "hide") return;
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, SwipeDir> = {
        ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
      };
      const dir = map[e.key];
      if (dir) processHideInput(dir);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, mode, processHideInput]);

  const isRun = mode === "run";
  const timerPct = (timeLeft / GAME_DURATION) * 100;
  const timerColor = timerPct > 50 ? "#16a34a" : timerPct > 25 ? "#ca8a04" : "#dc2626";

  // ── Mode spectateur ────────────────────────────────────────
  if (isSpectator) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.85)" }}
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
          <div
            className="px-5 py-3 border-b-4 border-black flex items-center justify-between"
            style={{ background: isRun ? "#DC2626" : "#065F46" }}
          >
            <div style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.06em" }} className="text-white">
              MINI-JEU EN COURS
            </div>
            <div className="px-3 py-1 rounded-xl border-[2px] border-black" style={{ background: "rgba(0,0,0,0.3)" }}>
              <span style={{ ...FONT_BANGERS, fontSize: "1.1rem" }} className="text-yellow-400">
                {isRun ? "🏃 ENFUIS-TOI" : "🫣 CACHE-TOI"}
              </span>
            </div>
          </div>
          <div className="p-5 flex flex-col items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [-5, 5, -5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontSize: "4rem" }}
            >
              {isRun ? "🏃" : "🫣"}
            </motion.div>
            <div style={{ ...FONT_BANGERS, fontSize: "1.5rem", letterSpacing: "0.06em" }} className="text-yellow-400 text-center">
              {triggeredByName ? `${triggeredByName} joue !` : "Un joueur joue !"}
            </div>
            <p style={FONT_FREDOKA} className="text-white/60 text-sm text-center">
              {isRun
                ? "Il doit cliquer le plus vite possible pour s'enfuir de la police !"
                : "Il doit cliquer les bonnes flèches pour se cacher !"}
            </p>
            <div className="flex gap-3 w-full">
              <div className="flex-1 px-3 py-2.5 rounded-xl border-[3px] border-black flex flex-col items-center gap-1" style={{ background: "rgba(220,38,38,0.2)", borderColor: "#dc2626" }}>
                <span style={{ ...FONT_BANGERS, fontSize: "1.1rem" }} className="text-red-400">ÉCHEC</span>
                <span style={FONT_FREDOKA} className="text-red-300 text-xs text-center">+{PENALTY_AMOUNT.toLocaleString("fr-CA")}$ de dette</span>
              </div>
              <div className="flex-1 px-3 py-2.5 rounded-xl border-[3px] border-black flex flex-col items-center gap-1" style={{ background: "rgba(22,163,74,0.2)", borderColor: "#16a34a" }}>
                <span style={{ ...FONT_BANGERS, fontSize: "1.1rem" }} className="text-green-400">SUCCÈS</span>
                <span style={FONT_FREDOKA} className="text-green-300 text-xs text-center">-{REWARD_AMOUNT.toLocaleString("fr-CA")}$ de dette</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-yellow-400"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
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
          <div className="px-3 py-1 rounded-xl border-[2px] border-black" style={{ background: "rgba(0,0,0,0.3)" }}>
            <span style={{ ...FONT_BANGERS, fontSize: "1.1rem" }} className="text-yellow-400">
              {isRun ? "🏃 ENFUIS-TOI" : "🫣 CACHE-TOI"}
            </span>
          </div>
        </div>

        {/* ── Corps ── */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* ── INTRO ── */}
            {phase === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col gap-4"
              >
                <motion.div
                  animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-center"
                  style={{ fontSize: "4rem" }}
                >
                  {isRun ? "🏃" : "🫣"}
                </motion.div>
                <div style={{ ...FONT_BANGERS, fontSize: "1.8rem", letterSpacing: "0.06em" }} className="text-yellow-400 text-center leading-tight">
                  {isRun ? "ENFUIS-TOI DE LA POLICE !" : "CACHE-TOI DE LA POLICE !"}
                </div>
                <div className="w-full px-4 py-3 rounded-2xl border-[3px] border-black" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <p style={FONT_FREDOKA} className="text-white/80 text-sm text-center leading-snug">
                    {isRun
                      ? `Clique / tape le plus vite possible pendant ${GAME_DURATION} secondes !`
                      : `Clique la bonne flèche (ou swipe / touches ←↑↓→) le plus vite possible pendant ${GAME_DURATION} secondes !`}
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
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1.5 rounded-xl border-[3px] border-black" style={{ background: timerColor, boxShadow: "3px 3px 0px #000" }}>
                    <span style={{ ...FONT_BANGERS, fontSize: "1.4rem", letterSpacing: "0.06em" }} className="text-white">{timeLeft}s</span>
                  </div>
                  <div style={FONT_FREDOKA} className="text-white/60 text-sm">
                    {isRun ? `${taps} / ${RUN_TARGET} clics` : `${swipesCompleted} / ${HIDE_TARGET} flèches`}
                  </div>
                </div>
                <div className="relative h-6 rounded-full border-[3px] border-black overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: progress >= 100 ? "#16a34a" : "#FFD700" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  />
                  <div className="absolute inset-y-0 right-0 w-1 bg-white/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span style={{ ...FONT_BANGERS, fontSize: "0.8rem" }} className="text-black/70 mix-blend-overlay">{Math.round(progress)}%</span>
                  </div>
                </div>

                {isRun ? (
                  <div
                    ref={gameAreaRef}
                    className="relative h-44 rounded-2xl border-[4px] border-black overflow-hidden select-none cursor-pointer active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, #1a083d, #0c1a4e)", boxShadow: "5px 5px 0px #000", touchAction: "none" }}
                    onClick={handleTap}
                    onTouchStart={(e) => { e.preventDefault(); handleTap(e); }}
                  >
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], rotate: [-3, 3, -3] }}
                        transition={{ duration: 0.4, repeat: Infinity }}
                        style={{ fontSize: "3rem" }}
                      >
                        🏃
                      </motion.div>
                      <div style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.08em" }} className="text-yellow-400">
                        CLIQUE ICI !
                      </div>
                    </div>
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
                  <div
                    className="h-44 rounded-2xl border-[4px] border-black flex flex-col items-center justify-center gap-4 select-none"
                    style={{ background: "linear-gradient(135deg, #064e3b, #1a083d)", boxShadow: "5px 5px 0px #000", touchAction: "none" }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className="flex gap-2 items-center">
                      <Arrow dir="left" active={currentDir === "left"} correct={swipeResult !== null && currentDir === "left" ? swipeResult : undefined} onClick={() => handleArrowClick("left")} />
                      <div className="flex flex-col gap-2">
                        <Arrow dir="up" active={currentDir === "up"} correct={swipeResult !== null && currentDir === "up" ? swipeResult : undefined} onClick={() => handleArrowClick("up")} />
                        <Arrow dir="down" active={currentDir === "down"} correct={swipeResult !== null && currentDir === "down" ? swipeResult : undefined} onClick={() => handleArrowClick("down")} />
                      </div>
                      <Arrow dir="right" active={currentDir === "right"} correct={swipeResult !== null && currentDir === "right" ? swipeResult : undefined} onClick={() => handleArrowClick("right")} />
                    </div>
                    <div style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.06em" }} className="text-white/50">
                      CLIQUE LA BONNE FLÈCHE
                    </div>
                    <div style={FONT_FREDOKA} className="text-white/25 text-xs">
                      (ou swipe / touches ←↑↓→)
                    </div>
                  </div>
                )}

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
                <motion.div
                  animate={{ rotate: success ? [0, 10, -10, 0] : [0, -5, 5, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-24 h-24 rounded-2xl border-[4px] border-black flex items-center justify-center"
                  style={{ background: success ? "#16a34a" : "#DC2626", boxShadow: "6px 6px 0px #000" }}
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

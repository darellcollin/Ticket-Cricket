/**
 * LobbyScreen — Salle d'attente multijoueur.
 * Design: Arcade Urbaine
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Home, Copy, Check, Users, Crown, X, AlertTriangle } from "lucide-react";
import { getSession, toggleReady, startGame, leaveSession, mpStorage, type Session } from "@/game/utils/sessionApi";
import { PoliceTape } from "@/game/ui/PoliceUI";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };
const POLL_INTERVAL = 2000;

export default function LobbyScreen() {
  const [, navigate] = useLocation();
  const mpData = mpStorage.load();
  const { code, playerId, playerName, isHost } = mpData;
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [togglingReady, setTogglingReady] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const fetchSession = useCallback(async () => {
    if (!code) return;
    try {
      const { session: s } = await getSession(code);
      setSession(s);
      setError("");
      if (s.state === "playing") {
        navigate("/multiplayer");
      } else if (s.state === "finished") {
        navigate("/");
      }
    } catch (e: any) {
      setError(e.message || "Erreur de connexion");
    }
  }, [code, navigate]);

  useEffect(() => {
    if (!code) { navigate("/"); return; }
    fetchSession();
    pollRef.current = setInterval(fetchSession, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [code, fetchSession, navigate]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = async () => {
    if (togglingReady) return;
    setTogglingReady(true);
    try {
      const { session: s } = await toggleReady(code, playerId);
      setSession(s);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTogglingReady(false);
    }
  };

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const { session: s } = await startGame(code, playerId);
      setSession(s);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setStarting(false);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveSession(code, playerId);
      mpStorage.clear();
      navigate("/");
    } catch {
      mpStorage.clear();
      navigate("/");
    }
  };

  const players = session?.players ?? [];
  const allReady = players.length >= 2 && players.every((p) => p.ready);
  const myPlayer = players.find((p) => p.id === playerId);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={handleLeave} className="text-slate-400 hover:text-white">
            <Home size={24} />
          </button>
          <h1 className="text-2xl text-yellow-400 flex-1" style={FONT_BANGERS}>
            SALLE D'ATTENTE
          </h1>
          <div className="flex items-center gap-1 text-slate-400">
            <Users size={18} />
            <span style={FONT_FREDOKA}>{players.length}</span>
          </div>
        </div>
      </div>

      <PoliceTape>
        <span className="text-sm tracking-widest">PRÉPARATION DE LA PARTIE</span>
      </PoliceTape>

      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Session code */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-2xl bg-slate-900 border border-slate-700 p-6 text-center"
        >
          <p className="text-sm text-slate-400 mb-2" style={FONT_FREDOKA}>Code de la partie</p>
          <div className="flex items-center justify-center gap-3">
            <span
              className="text-5xl tracking-[0.3em] text-yellow-400"
              style={FONT_BANGERS}
            >
              {code}
            </span>
            <button
              onClick={handleCopy}
              className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:text-white transition-colors"
            >
              {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2" style={FONT_FREDOKA}>
            Partagez ce code avec vos amis
          </p>
        </motion.div>

        {/* Players list */}
        <div className="space-y-2">
          <h3 className="text-lg text-yellow-400" style={FONT_BANGERS}>JOUEURS</h3>
          <AnimatePresence>
            {players.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 rounded-xl p-4 ${
                  p.id === playerId ? "bg-slate-800 border border-yellow-500/30" : "bg-slate-900 border border-slate-800"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg">
                  {p.id === session?.hostId ? (
                    <Crown size={20} className="text-yellow-400" />
                  ) : (
                    <span>{p.name[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold" style={FONT_FREDOKA}>
                    {p.name}
                    {p.id === playerId && <span className="text-xs text-slate-500 ml-2">(vous)</span>}
                  </div>
                  {p.id === session?.hostId && (
                    <span className="text-xs text-yellow-400">Hôte</span>
                  )}
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    p.ready ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"
                  }`}
                  style={FONT_FREDOKA}
                >
                  {p.ready ? "PRÊT" : "EN ATTENTE"}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {isHost ? (
            <button
              onClick={handleStart}
              disabled={!allReady || starting}
              className="w-full rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 px-8 py-4 text-2xl font-bold text-black shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={FONT_BANGERS}
            >
              {starting ? "LANCEMENT..." : "COMMENCER"}
            </button>
          ) : (
            <button
              onClick={handleToggleReady}
              disabled={togglingReady}
              className={`w-full rounded-2xl px-8 py-4 text-2xl font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${
                myPlayer?.ready
                  ? "bg-slate-700 text-slate-300"
                  : "bg-emerald-500 text-white shadow-emerald-500/20"
              }`}
              style={FONT_BANGERS}
            >
              {myPlayer?.ready ? "ANNULER" : "PRÊT !"}
            </button>
          )}

          {!allReady && players.length < 2 && (
            <p className="text-center text-sm text-slate-500" style={FONT_FREDOKA}>
              En attente d'au moins 2 joueurs...
            </p>
          )}

          <button
            onClick={handleLeave}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            style={FONT_FREDOKA}
          >
            Quitter la partie
          </button>
        </div>
      </div>
    </div>
  );
}

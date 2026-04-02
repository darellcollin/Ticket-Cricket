/**
 * Salle d'attente multijoueur.
 * - Affiche le code de session à partager
 * - Liste les joueurs et leur statut "Prêt"
 * - Host : bouton "COMMENCER" (actif si tous prêts + ≥ 2 joueurs)
 * - Invités : bouton "PRÊT !"
 * - Poll toutes les 2 secondes
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "wouter";
import { Home, Copy, Check, Users, Crown, X, AlertTriangle } from "lucide-react";
import { getSession, toggleReady, startGame, leaveSession, mpStorage, type Session } from "@/game/utils/sessionApi";
import { PoliceTape } from "@/game/ui/PoliceUI";
import ticketImg from "@/game/utils/ticketImg";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

const POLL_INTERVAL = 2000;

export function LobbyScreen() {
  const [, navigate] = useLocation();
  const { code, playerId, playerName, isHost } = mpStorage.load();

  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [togglingReady, setTogglingReady] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigatedRef = useRef(false);

  // ── Redirection si pas de session en mémoire ────────────────
  useEffect(() => {
    if (!code || !playerId) {
      navigate("/");
    }
  }, []);

  // ── Polling ─────────────────────────────────────────────────
  const fetchSession = useCallback(async () => {
    if (!code) return;
    try {
      const { session: s } = await getSession(code);
      setSession(s);
      setError("");

      // Si la partie a démarré → aller sur l'écran de jeu
      if (s.state === "playing" && !navigatedRef.current) {
        navigatedRef.current = true;
        navigate("/multiplayer");
      }
      // Session supprimée (host parti)
      if (s.state === "finished") {
        navigate("/");
      }
    } catch (e: any) {
      if (e.message?.includes("introuvable") || e.message?.includes("expirée")) {
        navigate("/");
      } else {
        setError("Connexion perdue, nouvelle tentative...");
      }
    }
  }, [code, navigate]);

  useEffect(() => {
    fetchSession();
    pollRef.current = setInterval(fetchSession, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchSession]);

  // ── Copier le code ───────────────────────────────────────────
  const copyCode = () => {
    // Méthode moderne
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopy(code));
    } else {
      fallbackCopy(code);
    }
  };

  const fallbackCopy = (text: string) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* impossible de copier */ }
    document.body.removeChild(ta);
  };

  // ── Prêt ─────────────────────────────────────────────────────
  const handleReady = async () => {
    if (togglingReady || isHost) return;
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

  // ── Démarrer ─────────────────────────────────────────────────
  const handleStart = async () => {
    if (starting || !session) return;
    setStarting(true);
    try {
      const { session: s } = await startGame(code, playerId);
      setSession(s);
      navigate("/multiplayer");
    } catch (e: any) {
      setError(e.message);
      setStarting(false);
    }
  };

  // ── Quitter ───────────────────────────────────────────────────
  const handleLeave = async () => {
    try {
      await leaveSession(code, playerId);
    } catch {}
    mpStorage.clear();
    navigate("/");
  };

  if (!session) {
    return (
      <div
        className="h-[100dvh] max-w-md md:max-w-lg lg:max-w-xl mx-auto flex flex-col items-center justify-center gap-4 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)" }}
      >
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <img src={ticketImg} alt="" style={{ width: "4rem" }} />
        </motion.div>
        <span style={FONT_FREDOKA} className="text-yellow-400/70 text-sm">
          Connexion au lobby...
        </span>
        {error && (
          <span style={FONT_FREDOKA} className="text-red-400 text-xs text-center px-6">
            {error}
          </span>
        )}
      </div>
    );
  }

  const allReady = session.players.every((p) => p.ready);
  const canStart = allReady && session.players.length >= 2;
  const myPlayer = session.players.find((p) => p.id === playerId);
  const amReady = myPlayer?.ready ?? false;

  return (
    <div
      className="h-[100dvh] max-w-md md:max-w-lg lg:max-w-xl mx-auto flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)" }}
    >
      {/* Header */}
      <div className="w-full bg-[#111] border-b-4 border-yellow-400 flex items-center px-4 py-3 z-10 flex-shrink-0">
        <div className="flex-1 flex items-center justify-center">
          <span style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.08em" }} className="text-yellow-400">
            SALLE D'ATTENTE
          </span>
        </div>
      </div>

      <PoliceTape />

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">

        {/* ── Code de session ── */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-yellow-400 border-[4px] border-black rounded-2xl p-3 text-center"
          style={{ boxShadow: "5px 5px 0px #000" }}
        >
          <div style={FONT_FREDOKA} className="text-black/60 text-xs mb-0.5 uppercase tracking-widest">
            Code de la partie
          </div>
          <div
            style={{ ...FONT_BANGERS, fontSize: "2.6rem", letterSpacing: "0.2em", lineHeight: 1 }}
            className="text-black"
          >
            {code}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={copyCode}
            className="mt-1.5 flex items-center gap-1.5 mx-auto bg-black/10 rounded-lg px-3 py-1 border border-black/20"
          >
            {copied
              ? <Check className="w-4 h-4 text-black" />
              : <Copy className="w-4 h-4 text-black" />
            }
            <span style={FONT_FREDOKA} className="text-black text-sm">
              {copied ? "Copié !" : "Copier"}
            </span>
          </motion.button>
          <div style={FONT_FREDOKA} className="text-black/50 text-xs mt-1">
            Partage ce code à tes amis
          </div>
        </motion.div>

        {/* ── Liste des joueurs ── */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 px-1">
            <Users className="w-4 h-4 text-yellow-400/70" />
            <span style={FONT_FREDOKA} className="text-yellow-400/70 text-sm">
              Joueurs ({session.players.length}/10)
            </span>
          </div>

          <AnimatePresence>
            {session.players.map((player, idx) => (
              <motion.div
                key={player.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center justify-between px-4 py-2 rounded-xl border-[3px] border-black ${
                  player.id === playerId ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent" : ""
                }`}
                style={{
                  background: player.ready
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(255,255,255,0.06)",
                  boxShadow: "3px 3px 0px #000",
                }}
              >
                <div className="flex items-center gap-2">
                  {player.id === session.hostId && (
                    <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  )}
                  <span style={FONT_FREDOKA} className="text-white font-medium">
                    {player.name}
                    {player.id === playerId && (
                      <span className="text-yellow-400/60 text-xs ml-1">(vous)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {player.id === session.hostId ? (
                    <span style={FONT_FREDOKA} className="text-yellow-400 text-xs bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/30">
                      Host ✓
                    </span>
                  ) : player.ready ? (
                    <span style={FONT_FREDOKA} className="text-green-400 text-xs bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/30">
                      ✓ Prêt
                    </span>
                  ) : (
                    <span style={FONT_FREDOKA} className="text-white/40 text-xs bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      En attente…
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ── Message si 1 seul joueur ── */}
        {session.players.length < 2 && (
          <div style={FONT_FREDOKA} className="text-center text-white/40 text-sm px-4 py-2">
            En attente d'un autre joueur…
          </div>
        )}

        {/* ── Erreur ── */}
        {error && (
          <div style={{ ...FONT_FREDOKA, background: "#FF3B30" }} className="text-white text-sm text-center px-3 py-2 rounded-xl border-[2px] border-black">
            {error}
          </div>
        )}

        {/* ── Bouton HOST : Commencer ── */}
        {isHost && (
          <motion.button
            whileHover={canStart ? { scale: 1.04, y: -2 } as any : {}}
            whileTap={canStart ? { scale: 0.96 } as any : {}}
            onClick={handleStart}
            disabled={!canStart || starting}
            className={`w-full py-4 border-[5px] border-black rounded-2xl text-black relative overflow-hidden transition-opacity ${
              canStart ? "bg-yellow-400" : "bg-yellow-400/30 cursor-not-allowed"
            }`}
            style={{
              ...FONT_BANGERS,
              fontSize: "1.45rem",
              letterSpacing: "0.08em",
              boxShadow: canStart ? "6px 6px 0px #000" : "3px 3px 0px #000",
            }}
          >
            {canStart && (
              <motion.div
                className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg]"
                animate={{ x: ["-100%", "400%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
              />
            )}
            {starting
              ? "DÉMARRAGE..."
              : canStart
              ? "COMMENCER LE JEU"
              : session.players.length < 2
              ? "ATTENTE DE JOUEURS"
              : "ATTENTE DES JOUEURS"}
          </motion.button>
        )}

        {/* ── Bouton HOST : Annuler la création ── */}
        {isHost && (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setShowConfirmCancel(true)}
            className="w-full py-2.5 bg-red-900/30 border-[3px] border-red-500/50 rounded-2xl text-red-400 flex items-center justify-center gap-2"
            style={FONT_FREDOKA}
          >
            <X className="w-4 h-4" />
            Annuler la création de partie
          </motion.button>
        )}

        {/* ── Bouton INVITÉ : Prêt ── */}
        {!isHost && (
          <motion.button
            whileHover={{ scale: 1.04, y: -2 } as any}
            whileTap={{ scale: 0.96 } as any}
            onClick={handleReady}
            disabled={togglingReady}
            className="w-full py-4 border-[5px] border-black rounded-2xl text-white relative overflow-hidden"
            style={{
              ...FONT_BANGERS,
              fontSize: "1.45rem",
              letterSpacing: "0.08em",
              background: amReady ? "#22c55e" : "#1565C0",
              boxShadow: "6px 6px 0px #000",
            }}
          >
            {amReady ? "JE SUIS PRÊT !" : "PRÊT ?"}
          </motion.button>
        )}

        {/* ── Quitter (invités seulement) ── */}
        {!isHost && (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setShowConfirmLeave(true)}
            className="w-full py-2.5 bg-transparent border-[3px] border-white/20 rounded-2xl text-white/40 flex items-center justify-center gap-2"
            style={FONT_FREDOKA}
          >
            <Home className="w-4 h-4" />
            Quitter la partie
          </motion.button>
        )}

      </div>

      <div className="w-full bg-[#111] py-1 text-center flex-shrink-0" style={{ paddingBottom: "calc(0.25rem + env(safe-area-inset-bottom, 0px))" }}>
        <span style={FONT_FREDOKA} className="text-yellow-400/50 text-[0.65rem] tracking-widest">
          © TICKET CRICKET 2026
        </span>
      </div>

      {/* ── Modal confirmation ANNULER CRÉATION (host) ── */}
      <AnimatePresence>
        {showConfirmCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-[90] flex items-center justify-center p-6"
            onClick={() => setShowConfirmCancel(false)}
          >
            <motion.div
              initial={{ scale: 0.82, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.82, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="bg-[#111] border-[5px] border-red-500 rounded-3xl p-7 flex flex-col items-center gap-5 w-full max-w-sm"
              style={{ boxShadow: "8px 8px 0px #000" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-16 h-16 bg-red-600 border-[4px] border-black rounded-2xl flex items-center justify-center"
                style={{ boxShadow: "4px 4px 0px #000" }}
              >
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.06em" }} className="text-red-400 text-center leading-tight">
                ANNULER LA PARTIE ?
              </div>
              <div className="bg-red-900/30 border-[2px] border-red-500/40 rounded-xl px-4 py-3 flex flex-col gap-1">
                <p style={FONT_FREDOKA} className="text-red-300 text-sm text-center">
                  En tant que host, annuler la partie va
                </p>
                <p style={{ ...FONT_FREDOKA, fontWeight: "bold" }} className="text-white text-sm text-center">
                  supprimer la session et expulser tous les joueurs.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <motion.button
                  whileTap={{ scale: 0.93 } as any}
                  onClick={() => setShowConfirmCancel(false)}
                  className="flex-1 py-4 bg-white/10 border-[3px] border-white/20 rounded-2xl text-white/60"
                  style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.05em" }}
                >
                  RESTER
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.93 } as any}
                  onClick={handleLeave}
                  className="flex-1 py-4 bg-red-600 border-[3px] border-black rounded-2xl text-white flex items-center justify-center gap-2"
                  style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.05em", boxShadow: "4px 4px 0px #000" }}
                >
                  <X className="w-5 h-5" />
                  OUI, ANNULER
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal confirmation quitter (invités) ── */}
      <AnimatePresence>
        {showConfirmLeave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center p-6"
            onClick={() => setShowConfirmLeave(false)}
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
              <div
                className="w-16 h-16 bg-yellow-400 border-[4px] border-black rounded-2xl flex items-center justify-center"
                style={{ boxShadow: "4px 4px 0px #000" }}
              >
                <Home className="w-8 h-8 text-black" />
              </div>
              <div style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.06em" }} className="text-yellow-400 text-center leading-tight">
                QUITTER LA PARTIE ?
              </div>
              <p style={FONT_FREDOKA} className="text-white/50 text-sm text-center">
                Tu quitteras la salle d'attente et devras rejoindre avec un code pour revenir.
              </p>
              <div className="flex gap-3 w-full">
                <motion.button
                  whileTap={{ scale: 0.93 } as any}
                  onClick={() => setShowConfirmLeave(false)}
                  className="flex-1 py-4 bg-white/10 border-[3px] border-white/20 rounded-2xl text-white/60"
                  style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.05em" }}
                >
                  NON
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.93 } as any}
                  onClick={handleLeave}
                  className="flex-1 py-4 bg-red-600 border-[3px] border-black rounded-2xl text-white flex items-center justify-center gap-2"
                  style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.05em", boxShadow: "4px 4px 0px #000" }}
                >
                  <X className="w-5 h-5" />
                  OUI
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
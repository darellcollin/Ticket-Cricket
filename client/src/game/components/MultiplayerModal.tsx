/**
 * Modal multijoueur — Créer / Rejoindre une session, ou lancer le solo.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { X, Users, Plus, LogIn, Gamepad2, ChevronLeft } from "lucide-react";
import { createSession, joinSession, mpStorage } from "../utils/sessionApi";
import { getCardConfig, ALL_CARD_IDS } from "../utils/cardConfig";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

export const SOLO_DIFFICULTY_KEY = "solo_difficulty";
export const SOLO_NO_CONTRIBUABLE_KEY = "solo_no_contribuable";

export const DIFFICULTIES = [
  { label: "Facile", threshold: 20000, emoji: "😊" },
  { label: "Normal", threshold: 10000, emoji: "😐" },
  { label: "Difficile", threshold: 5000, emoji: "😈" },
];

type View = "menu" | "create" | "join" | "solo";

interface MultiplayerModalProps {
  open: boolean;
  onClose: () => void;
}

function computeAllowedCardIds(noContribuable: boolean): number[] {
  return ALL_CARD_IDS.filter((id) => {
    const cfg = getCardConfig(id);
    if (noContribuable && cfg.cardType === 2) return false;
    return true;
  });
}

export function MultiplayerModal({ open, onClose }: MultiplayerModalProps) {
  const [, navigate] = useLocation();
  const [view, setView] = useState<View>("menu");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState(1); // Normal
  const [noContribuable, setNoContribuable] = useState(false);

  const reset = () => {
    setView("menu");
    setName("");
    setCode("");
    setError("");
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    if (!name.trim()) { setError("Entrez votre nom"); return; }
    setLoading(true);
    setError("");
    try {
      const threshold = DIFFICULTIES[difficulty].threshold;
      const allowedCardIds = computeAllowedCardIds(noContribuable);
      const disabledCardTypes = noContribuable ? [2] : [];
      const res = await createSession(name.trim(), threshold, allowedCardIds, disabledCardTypes);
      mpStorage.save(res.code, res.playerId, name.trim(), true);
      handleClose();
      navigate("/lobby");
    } catch (e: any) {
      setError(e.message || "Erreur de création");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) { setError("Entrez votre nom"); return; }
    if (!code.trim()) { setError("Entrez le code"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await joinSession(code.trim(), name.trim());
      mpStorage.save(code.trim().toUpperCase(), res.playerId, name.trim(), false);
      handleClose();
      navigate("/lobby");
    } catch (e: any) {
      setError(e.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleSoloStart = () => {
    sessionStorage.setItem(SOLO_DIFFICULTY_KEY, String(difficulty));
    sessionStorage.setItem(SOLO_NO_CONTRIBUABLE_KEY, noContribuable ? "1" : "0");
    handleClose();
    navigate("/game");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 30 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              {view !== "menu" && (
                <button onClick={() => { setView("menu"); setError(""); }} className="text-slate-400 hover:text-white">
                  <ChevronLeft size={24} />
                </button>
              )}
              <h2 className="text-2xl text-yellow-400 flex-1 text-center" style={FONT_BANGERS}>
                {view === "menu" && "MODE DE JEU"}
                {view === "create" && "CRÉER UNE PARTIE"}
                {view === "join" && "REJOINDRE"}
                {view === "solo" && "MODE SOLO"}
              </h2>
              <button onClick={handleClose} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Menu view */}
            {view === "menu" && (
              <div className="space-y-3">
                <button
                  onClick={() => setView("solo")}
                  className="w-full flex items-center gap-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-4 text-white font-bold transition-colors"
                  style={FONT_FREDOKA}
                >
                  <Gamepad2 size={24} />
                  <span className="text-lg">JOUER SOLO</span>
                </button>
                <button
                  onClick={() => setView("create")}
                  className="w-full flex items-center gap-3 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-4 text-white font-bold transition-colors"
                  style={FONT_FREDOKA}
                >
                  <Plus size={24} />
                  <span className="text-lg">CRÉER UNE PARTIE</span>
                </button>
                <button
                  onClick={() => setView("join")}
                  className="w-full flex items-center gap-3 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-4 text-white font-bold transition-colors"
                  style={FONT_FREDOKA}
                >
                  <LogIn size={24} />
                  <span className="text-lg">REJOINDRE</span>
                </button>
              </div>
            )}

            {/* Solo view */}
            {view === "solo" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block" style={FONT_FREDOKA}>Difficulté</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DIFFICULTIES.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setDifficulty(i)}
                        className={`rounded-lg py-3 text-center font-bold transition-all ${
                          difficulty === i
                            ? "bg-yellow-400 text-black scale-105"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                        style={FONT_FREDOKA}
                      >
                        <div className="text-xl">{d.emoji}</div>
                        <div className="text-xs">{d.label}</div>
                        <div className="text-[10px] opacity-70">{(d.threshold).toLocaleString()}$</div>
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noContribuable}
                    onChange={(e) => setNoContribuable(e.target.checked)}
                    className="rounded"
                  />
                  <span style={FONT_FREDOKA}>Sans cartes Contribuable</span>
                </label>
                <button
                  onClick={handleSoloStart}
                  className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 py-4 text-xl font-bold text-white transition-colors"
                  style={FONT_BANGERS}
                >
                  COMMENCER !
                </button>
              </div>
            )}

            {/* Create view */}
            {view === "create" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block" style={FONT_FREDOKA}>Votre nom</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Entrez votre nom..."
                    className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block" style={FONT_FREDOKA}>Difficulté</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DIFFICULTIES.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setDifficulty(i)}
                        className={`rounded-lg py-2 text-center font-bold transition-all text-sm ${
                          difficulty === i
                            ? "bg-yellow-400 text-black scale-105"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                        style={FONT_FREDOKA}
                      >
                        <div>{d.emoji} {d.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noContribuable}
                    onChange={(e) => setNoContribuable(e.target.checked)}
                    className="rounded"
                  />
                  <span style={FONT_FREDOKA}>Sans cartes Contribuable</span>
                </label>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 py-4 text-xl font-bold text-white transition-colors"
                  style={FONT_BANGERS}
                >
                  {loading ? "CRÉATION..." : "CRÉER LA PARTIE"}
                </button>
              </div>
            )}

            {/* Join view */}
            {view === "join" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block" style={FONT_FREDOKA}>Votre nom</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Entrez votre nom..."
                    className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block" style={FONT_FREDOKA}>Code de la partie</label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ABCD"
                    className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-3 text-white text-center text-2xl tracking-[0.3em] placeholder-slate-500 focus:border-purple-400 focus:outline-none uppercase"
                    style={FONT_BANGERS}
                    maxLength={6}
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="w-full rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-50 py-4 text-xl font-bold text-white transition-colors"
                  style={FONT_BANGERS}
                >
                  {loading ? "CONNEXION..." : "REJOINDRE"}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAuth } from "@/hooks/useGameAuth";

const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };
const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };

type View = "login" | "register";

interface AccountModalProps {
  onClose: () => void;
}

export function AccountModal({ onClose }: AccountModalProps) {
  const { login, register, loginLoading, registerLoading } = useGameAuth();
  const [view, setView] = useState<View>("login");
  const [error, setError] = useState<string | null>(null);

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [regPseudo, setRegPseudo] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const handleLogin = async () => {
    setError(null);
    if (!loginIdentifier.trim() || !loginPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    const result = await login(loginIdentifier.trim(), loginPassword);
    if (!result.success) {
      setError(result.error || "Erreur de connexion");
    } else {
      onClose();
    }
  };

  const handleRegister = async () => {
    setError(null);
    if (!regPseudo.trim() || !regEmail.trim() || !regPassword || !regConfirm) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    if (regPassword !== regConfirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (regPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    const result = await register(regPseudo.trim(), regEmail.trim(), regPassword);
    if (!result.success) {
      setError(result.error || "Erreur lors de l'inscription");
    } else {
      onClose();
    }
  };

  const isLoading = loginLoading || registerLoading;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        className="relative w-[90%] max-w-[380px] rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)",
          border: "3px solid rgba(255,215,0,0.4)",
          boxShadow: "0 0 40px rgba(255,215,0,0.15), 0 20px 60px rgba(0,0,0,0.5)",
        }}
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-3">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="text-white text-lg leading-none">&times;</span>
          </button>

          <h2
            style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.05em" }}
            className="text-yellow-400 text-center"
          >
            {view === "login" ? "CONNEXION" : "INSCRIPTION"}
          </h2>

          {/* Tabs */}
          <div className="flex mt-3 rounded-xl overflow-hidden border-2 border-white/20">
            <button
              className={`flex-1 py-2 text-sm transition-colors ${
                view === "login"
                  ? "bg-yellow-400 text-black"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
              style={FONT_FREDOKA}
              onClick={() => { setView("login"); setError(null); }}
            >
              Connexion
            </button>
            <button
              className={`flex-1 py-2 text-sm transition-colors ${
                view === "register"
                  ? "bg-yellow-400 text-black"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
              style={FONT_FREDOKA}
              onClick={() => { setView("register"); setError(null); }}
            >
              Inscription
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pb-5">
          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-3 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/40"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <span className="text-red-300 text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {view === "login" ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-white/60 text-xs mb-1 block" style={FONT_FREDOKA}>
                  Pseudo ou Courriel
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Entrez votre pseudo ou courriel"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder:text-white/30 focus:border-yellow-400/60 focus:outline-none transition-colors text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block" style={FONT_FREDOKA}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder:text-white/30 focus:border-yellow-400/60 focus:outline-none transition-colors text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  disabled={isLoading}
                />
              </div>

              <motion.button
                className="w-full py-3 mt-1 bg-yellow-400 border-[3px] border-black rounded-xl text-black relative overflow-hidden"
                style={{ ...FONT_FREDOKA, fontSize: "1.1rem", boxShadow: "4px 4px 0px #000" }}
                whileHover={{ scale: 1.03, y: -2 } as any}
                whileTap={{ scale: 0.97, y: 1 } as any}
                onClick={handleLogin}
                disabled={isLoading}
              >
                <motion.div
                  className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg]"
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                />
                {isLoading ? "Connexion..." : "SE CONNECTER"}
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-white/60 text-xs mb-1 block" style={FONT_FREDOKA}>
                  Pseudo
                </label>
                <input
                  type="text"
                  value={regPseudo}
                  onChange={(e) => setRegPseudo(e.target.value)}
                  placeholder="Choisissez un pseudo"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder:text-white/30 focus:border-yellow-400/60 focus:outline-none transition-colors text-sm"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block" style={FONT_FREDOKA}>
                  Courriel
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Entrez votre courriel"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder:text-white/30 focus:border-yellow-400/60 focus:outline-none transition-colors text-sm"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block" style={FONT_FREDOKA}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder:text-white/30 focus:border-yellow-400/60 focus:outline-none transition-colors text-sm"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block" style={FONT_FREDOKA}>
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder:text-white/30 focus:border-yellow-400/60 focus:outline-none transition-colors text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  disabled={isLoading}
                />
              </div>

              <motion.button
                className="w-full py-3 mt-1 bg-green-500 border-[3px] border-black rounded-xl text-black relative overflow-hidden"
                style={{ ...FONT_FREDOKA, fontSize: "1.1rem", boxShadow: "4px 4px 0px #000" }}
                whileHover={{ scale: 1.03, y: -2 } as any}
                whileTap={{ scale: 0.97, y: 1 } as any}
                onClick={handleRegister}
                disabled={isLoading}
              >
                <motion.div
                  className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg]"
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                />
                {isLoading ? "Inscription..." : "S'INSCRIRE"}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

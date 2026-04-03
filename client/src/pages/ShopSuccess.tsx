/**
 * ShopSuccess — Page de confirmation après un paiement Stripe réussi.
 * Affichée quand Stripe redirige vers /shop/success?session_id=...
 * Invalide le cache des skins/extensions pour que le joueur voie ses achats immédiatement.
 */
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useLocation } from "wouter";
import { CheckCircle, Home, ShoppingBag, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive", letterSpacing: "0.06em" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

export default function ShopSuccess() {
  const [, navigate] = useLocation();
  const [countdown, setCountdown] = useState(5);
  const utils = trpc.useUtils();

  // Invalider le cache pour que les achats soient visibles immédiatement
  useEffect(() => {
    utils.skins.listOwnedSkins.invalidate();
    utils.skins.getActiveSkin.invalidate();
    utils.shop.listExpansionPacks.invalidate();
    utils.shop.listPurchases.invalidate();
    utils.customCards.count.invalidate();
  }, [utils]);

  // Compte à rebours avant redirection automatique
  useEffect(() => {
    if (countdown <= 0) {
      navigate("/");
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)" }}
    >
      {/* Confettis animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10%`,
              width: `${8 + Math.random() * 8}px`,
              height: `${8 + Math.random() * 8}px`,
              borderRadius: Math.random() > 0.5 ? "50%" : "0",
              background: ["#FFD700", "#FF3B30", "#34C759", "#007AFF", "#AF52DE", "#FF6B00"][i % 6],
            }}
            animate={{
              y: ["0vh", "110vh"],
              x: [0, (Math.random() - 0.5) * 200],
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              delay: Math.random() * 2,
              ease: "easeIn",
            }}
          />
        ))}
      </div>

      {/* Contenu principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative z-10 flex flex-col items-center gap-6 max-w-sm w-full"
      >
        {/* Icône succès */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-24 h-24 rounded-full flex items-center justify-center border-[4px] border-black"
          style={{ background: "#34C759", boxShadow: "6px 6px 0px #000" }}
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>

        {/* Titre */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ ...FONT_BANGERS, fontSize: "2.5rem", lineHeight: 1 }}
            className="text-white"
          >
            ACHAT RÉUSSI !
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            style={FONT_FREDOKA}
            className="text-white/70 text-base mt-2"
          >
            Vos achats ont été activés dans votre compte.
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={FONT_FREDOKA}
            className="text-white/40 text-sm mt-1"
          >
            Skins, extensions et packs sont disponibles immédiatement.
          </motion.div>
        </div>

        {/* Boutons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-3 w-full"
        >
          {/* Bouton retour accueil */}
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96, y: 1 }}
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-2xl border-[4px] border-black flex items-center justify-center gap-2"
            style={{
              background: "#FFD700",
              boxShadow: "5px 5px 0px #000",
              ...FONT_BANGERS,
              fontSize: "1.4rem",
              color: "#000",
              letterSpacing: "0.06em",
            }}
          >
            <Home className="w-5 h-5" />
            RETOUR AU JEU
          </motion.button>

          {/* Bouton ouvrir boutique */}
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96, y: 1 }}
            onClick={() => navigate("/?shop=open")}
            className="w-full py-3 rounded-2xl border-[3px] border-black flex items-center justify-center gap-2"
            style={{
              background: "rgba(255,255,255,0.10)",
              boxShadow: "3px 3px 0px #000",
              ...FONT_BANGERS,
              fontSize: "1.2rem",
              color: "#fff",
              letterSpacing: "0.06em",
            }}
          >
            <ShoppingBag className="w-4 h-4" />
            VOIR LA BOUTIQUE
          </motion.button>
        </motion.div>

        {/* Compte à rebours */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={FONT_FREDOKA}
          className="text-white/30 text-sm flex items-center gap-1.5"
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          Redirection automatique dans {countdown}s…
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * ShareScore — Boutons de partage sur les réseaux sociaux.
 * Affiche des boutons pour partager le score sur X, Facebook, WhatsApp et copier le lien.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Share2, Check, Copy, X } from "lucide-react";

const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };
const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };

interface ShareScoreProps {
  /** Nom du joueur ou gagnant */
  playerName: string;
  /** Dette finale en dollars */
  totalDebt: number;
  /** Mode de jeu */
  mode: "solo" | "multi";
  /** Vrai si le joueur local a gagné */
  isWinner: boolean;
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n);
}

function buildShareText(playerName: string, totalDebt: number, mode: "solo" | "multi", isWinner: boolean): string {
  const price = formatPrice(totalDebt);
  const url = "https://ticketcrkt-gai8r2qd.manus.space";

  if (mode === "solo") {
    return `🎫 J'ai survécu à tout le deck de Ticket Cricket avec ${price} de dette ! Peux-tu faire mieux ? ${url} #TicketCricket`;
  }
  if (isWinner) {
    return `🏆 J'ai gagné une partie de Ticket Cricket avec seulement ${price} de dette ! Viens jouer contre moi ! ${url} #TicketCricket`;
  }
  return `🎫 ${playerName} a gagné notre partie de Ticket Cricket avec ${price} de dette. Revanche ? ${url} #TicketCricket`;
}

interface ShareButtonProps {
  label: string;
  color: string;
  border: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function ShareButton({ label, color, border, icon, onClick }: ShareButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.06, y: -2 } as any}
      whileTap={{ scale: 0.94, y: 1 } as any}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl border-[3px] flex-1"
      style={{
        background: color,
        borderColor: border,
        boxShadow: `3px 3px 0px ${border}`,
        minWidth: 0,
      }}
    >
      <div className="w-7 h-7 flex items-center justify-center">{icon}</div>
      <span style={{ ...FONT_FREDOKA, fontSize: "0.65rem", lineHeight: 1 }} className="text-white text-center">
        {label}
      </span>
    </motion.button>
  );
}

export function ShareScore({ playerName, totalDebt, mode, isWinner }: ShareScoreProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const text = buildShareText(playerName, totalDebt, mode, isWinner);
  const url = "https://ticketcrkt-gai8r2qd.manus.space";
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  const shareX = () => window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, "_blank");
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, "_blank");
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback pour les navigateurs sans clipboard API
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Essayer l'API Web Share native si disponible (mobile)
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Ticket Cricket", text, url });
        return;
      } catch {
        // Annulé par l'utilisateur ou non supporté — on affiche les boutons
      }
    }
    setExpanded(true);
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {/* Bouton principal "Partager" */}
      {!expanded && (
        <motion.button
          whileHover={{ scale: 1.04, y: -2 } as any}
          whileTap={{ scale: 0.96, y: 1 } as any}
          onClick={nativeShare}
          className="w-full py-3 rounded-2xl border-[4px] border-black flex items-center justify-center gap-2 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #007AFF 0%, #5856D6 100%)",
            boxShadow: "5px 5px 0px #000",
            ...FONT_BANGERS,
            fontSize: "1.2rem",
            letterSpacing: "0.08em",
            color: "#fff",
            textShadow: "1px 1px 0px rgba(0,0,0,0.4)",
          }}
        >
          <motion.div
            className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg]"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          />
          <Share2 className="w-5 h-5 relative z-10" />
          <span className="relative z-10">PARTAGER MON SCORE</span>
        </motion.button>
      )}

      {/* Boutons réseaux sociaux (expanded ou si Web Share non dispo) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="w-full flex flex-col gap-2"
          >
            {/* Label */}
            <div className="flex items-center justify-between">
              <span style={{ ...FONT_FREDOKA, fontSize: "0.75rem" }} className="text-white/50 uppercase tracking-widest">
                Partager sur
              </span>
              <button
                onClick={() => setExpanded(false)}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Boutons réseaux */}
            <div className="flex gap-2 w-full">
              {/* X (Twitter) */}
              <ShareButton
                label="X / Twitter"
                color="#000"
                border="#333"
                icon={
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                }
                onClick={shareX}
              />

              {/* Facebook */}
              <ShareButton
                label="Facebook"
                color="#1877F2"
                border="#0d5dbf"
                icon={
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                }
                onClick={shareFacebook}
              />

              {/* WhatsApp */}
              <ShareButton
                label="WhatsApp"
                color="#25D366"
                border="#128C7E"
                icon={
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                }
                onClick={shareWhatsApp}
              />

              {/* Copier */}
              <ShareButton
                label={copied ? "Copié !" : "Copier"}
                color={copied ? "#34C759" : "#3A3A3C"}
                border={copied ? "#248A3D" : "#1C1C1E"}
                icon={
                  copied
                    ? <Check className="w-5 h-5 text-white" />
                    : <Copy className="w-5 h-5 text-white" />
                }
                onClick={copyLink}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

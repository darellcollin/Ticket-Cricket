/**
 * GameInfoModal — Histoire et origine de Ticket Cricket.
 * Accessible via le bouton "Infos" en haut à gauche de l'accueil.
 */
import { motion, AnimatePresence } from "motion/react";
import { X, Heart } from "lucide-react";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

interface GameInfoModalProps {
  open: boolean;
  onClose: () => void;
  onOpenShop?: () => void;
}

export function GameInfoModal({ open, onClose, onOpenShop }: GameInfoModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="relative w-full max-w-lg max-h-[88dvh] overflow-hidden rounded-3xl border-[4px] border-black flex flex-col"
            style={{
              background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)",
              boxShadow: "8px 8px 0px #000",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b-[3px] border-black"
              style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
            >
              <span
                style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.08em", color: "#000" }}
              >
                L'HISTOIRE DU JEU
              </span>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl border-[3px] border-black bg-black/20 flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* ── Contenu scrollable ── */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4" style={{ scrollbarWidth: "thin" }}>
              {[
                "Ticket Cricket est né d'un rêve.",
                "Un nom sorti directement de ce rêve… et dont le sens reste encore aujourd'hui un mystère total.\nAlors ne me posez pas la question. Sérieusement. J'en ai aucune idée.\nMais c'est drôle… et honnêtement, c'est déjà suffisant.",
                "Cette nuit-là, je me retrouvais entouré d'amis, une pile de contraventions entre les mains.\nPas des vraies, non.\nDes infractions complètement absurdes, satiriques, presque débiles… quelque part entre le génie et le ridicule.",
                "Le principe ? Simple.\nTu piges une contravention… et t'assumes.\nLe tout dans une soirée où le sérieux n'existe plus vraiment.",
                "Au réveil, j'ai compris un truc.\nPas un petit \"ah tiens, idée sympa\"… non.\nUne évidence.\n\nJe devais créer ce jeu. Pour vrai.",
                "Quand j'en ai parlé autour de moi, ça a d'abord ri.\nPuis ça a intrigué.\nPuis ça a encouragé.\n\nCe qui était une blague est devenu un projet.\nEt après quelques tests, l'humour noir, le ridicule assumé… tout ça a fini par accrocher tout le monde.",
                "Le truc, c'est que je savais pas coder.\nGenre, pas du tout.\n\nMais j'ai plongé quand même.\nJ'ai appris, testé, recommencé… encore et encore.\nEt en quelques semaines, Ticket Cricket existait pour vrai.",
                "Aujourd'hui, c'est un projet 100 % québécois, rempli de références culturelles un peu absurdes, un peu niaiseuses… mais assumées à 100 %.",
                "Et dans le fond, je le sens : ce jeu-là mérite plus.\nUne vraie version physique. Un jeu de société.\nQuelque chose qu'on sort entre amis et qui devient une tradition.\nPeut-être même… quelque chose d'iconique.",
                "C'est pour ça que je fais appel à vous.\n\nLes dons vont servir à pousser le projet plus loin : créer une version physique, continuer à développer le jeu en ligne, ajouter du contenu… et peut-être un jour, l'amener sur Android et iOS.",
                "Si t'as envie de soutenir un projet un peu fou, un peu différent…\nt'es exactement à la bonne place.\n\nEncourage le projet.\n\nEt surtout…\nviens jouer.",
              ].map((paragraph, i) => (
                <p
                  key={i}
                  style={{ ...FONT_FREDOKA, whiteSpace: "pre-line" }}
                  className="text-white/85 text-[0.95rem] leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}

              {/* Bouton don */}
              <div className="pt-2 pb-1 flex justify-center">
                <motion.div
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { onClose(); onOpenShop?.(); }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl border-[3px] border-black cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #FF3B30 0%, #FF6B6B 100%)",
                      boxShadow: "4px 4px 0px #000",
                    }}
                  >
                    <Heart className="w-5 h-5 text-white" fill="white" />
                    <span style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.06em", color: "#fff" }}>
                      SOUTENIR LE PROJET
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

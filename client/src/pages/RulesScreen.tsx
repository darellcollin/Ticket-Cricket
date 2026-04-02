/**
 * RulesScreen — Règles du jeu Ticket Cricket.
 * Design: Arcade Urbaine
 */
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Home, ChevronRight } from "lucide-react";
import { PoliceTape } from "@/game/ui/PoliceUI";
import { CATEGORY_INFO, TYPE_INFO } from "@/game/utils/cardConfig";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

const RULES = [
  {
    title: "Objectif",
    emoji: "🎯",
    content: "Survivre le plus longtemps possible sans atteindre le seuil d'élimination (10 000$ par défaut). Le dernier joueur debout gagne !",
  },
  {
    title: "Tour de jeu",
    emoji: "🔄",
    content: "À chaque tour, le joueur actif pioche une carte du deck. La carte révélée affecte sa dette selon son type.",
  },
  {
    title: "Type 1 — Contravention",
    emoji: "🚨",
    content: "Le ticket + les frais sont AJOUTÉS à votre dette. Plus le montant est élevé, plus vous êtes en danger !",
    color: "#DC2626",
  },
  {
    title: "Type 2 — Contribuable",
    emoji: "📋",
    content: "Les impôts RÉDUISENT votre dette. Une bouffée d'air frais dans ce monde d'amendes !",
    color: "#16A34A",
  },
  {
    title: "Type 3 — Investisseur (Multijoueur)",
    emoji: "💼",
    content: "Le ticket est TRANSFÉRÉ au joueur suivant, et la taxe réduit votre propre dette. Stratégique !",
    color: "#7C3AED",
  },
  {
    title: "Élimination",
    emoji: "💀",
    content: "Si votre dette totale atteint ou dépasse le seuil, vous êtes éliminé ! En multijoueur, vous devenez spectateur.",
  },
  {
    title: "Mode Solo",
    emoji: "🎮",
    content: "Jouez seul avec les cartes T1 et T2. Pas de cartes T3 (investisseur). Survivez le plus longtemps possible !",
  },
  {
    title: "Mode Multijoueur",
    emoji: "👥",
    content: "Créez ou rejoignez une partie avec un code. Tour par tour, le dernier survivant gagne. Les cartes T3 ajoutent une dimension stratégique.",
  },
];

export default function RulesScreen() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={() => navigate("/")} className="text-slate-400 hover:text-white">
            <Home size={24} />
          </button>
          <h1 className="text-2xl text-yellow-400" style={FONT_BANGERS}>
            RÈGLES DU JEU
          </h1>
        </div>
      </div>

      <PoliceTape>
        <span className="text-sm tracking-widest">COMMENT JOUER</span>
      </PoliceTape>

      {/* Rules list */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {RULES.map((rule, i) => (
          <motion.div
            key={i}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl bg-slate-900 border border-slate-800 p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{rule.emoji}</span>
              <h3
                className="text-xl"
                style={{
                  ...FONT_BANGERS,
                  color: rule.color || "#FBBF24",
                }}
              >
                {rule.title}
              </h3>
            </div>
            <p className="text-slate-300 leading-relaxed" style={FONT_FREDOKA}>
              {rule.content}
            </p>
          </motion.div>
        ))}

        {/* Card categories summary */}
        <div className="mt-8">
          <h2 className="text-2xl text-yellow-400 mb-4" style={FONT_BANGERS}>
            CATÉGORIES DE CARTES
          </h2>
          <div className="grid gap-3">
            {(["contravention", "contribuable", "investisseur"] as const).map((cat) => {
              const info = CATEGORY_INFO[cat];
              return (
                <div
                  key={cat}
                  className="flex items-center gap-4 rounded-xl p-4"
                  style={{ backgroundColor: info.color + "20", borderLeft: `4px solid ${info.color}` }}
                >
                  <span className="text-3xl">{info.emoji}</span>
                  <div>
                    <div className="font-bold text-lg" style={{ color: info.color, ...FONT_BANGERS }}>
                      {info.label}
                    </div>
                    <div className="text-sm text-slate-400">
                      Cartes #{cat === "contravention" ? "1–108" : cat === "contribuable" ? "109–216" : "217–324"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card types summary */}
        <div className="mt-8">
          <h2 className="text-2xl text-yellow-400 mb-4" style={FONT_BANGERS}>
            TYPES DE CARTES
          </h2>
          <div className="grid gap-3">
            {([1, 2, 3] as const).map((t) => {
              const info = TYPE_INFO[t];
              return (
                <div
                  key={t}
                  className="flex items-center gap-4 rounded-xl p-4"
                  style={{ backgroundColor: info.color + "20", borderLeft: `4px solid ${info.color}` }}
                >
                  <span className="text-2xl">{info.emoji}</span>
                  <div>
                    <div className="font-bold" style={{ color: info.color, ...FONT_BANGERS }}>
                      {info.label}
                    </div>
                    <div className="text-sm text-slate-400" style={FONT_FREDOKA}>
                      {info.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

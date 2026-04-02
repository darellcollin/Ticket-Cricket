import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "wouter";
import {
  Home,
  AlertTriangle,
  TrendingDown,
  Zap,
  Hand,
  Skull,
  ChevronDown,
  ChevronUp,
  BarChart2,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Search,
  MousePointerClick,
  MoveHorizontal,
  Timer,
  Users,
} from "lucide-react";
import { PoliceTape } from "@/game/ui/PoliceUI";

const FONT_BANGERS: React.CSSProperties  = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties  = { fontFamily: "'Fredoka One', cursive" };

// ─── Types des sections ───────────────────────────────────────
type Section = "cards" | "mechanics" | "levels" | "goal";

const NAV_ITEMS: { id: Section; label: string }[] = [
  { id: "cards",     label: "Les cartes"   },
  { id: "mechanics", label: "Mécaniques"   },
  { id: "levels",    label: "Les niveaux"  },
  { id: "goal",      label: "Objectif"     },
];

// ─── Badge type de carte ─────────────────────────────────────
function CardTypeBadge({
  icon, label, color, bg, border,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-[3px] ${border}`}
      style={{ background: bg }}
    >
      <span className={color}>{icon}</span>
      <span style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.06em" }} className={color}>
        {label}
      </span>
    </div>
  );
}

// ─── Bloc de règle avec icône ─────────────────────────────────
function RuleBlock({
  icon, title, color, bg, border, children, delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  bg: string;
  border: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`rounded-2xl border-[4px] ${border} overflow-hidden`}
      style={{ background: bg, boxShadow: "4px 4px 0px #000" }}
    >
      {/* Titre */}
      <div className={`px-4 py-2.5 flex items-center gap-2.5 border-b-[3px] ${border}`}
           style={{ background: "rgba(0,0,0,0.25)" }}>
        <span className={color}>{icon}</span>
        <span style={{ ...FONT_BANGERS, fontSize: "1.15rem", letterSpacing: "0.06em" }} className={color}>
          {title}
        </span>
      </div>
      {/* Contenu */}
      <div className="px-4 py-3 flex flex-col gap-2">
        {children}
      </div>
    </motion.div>
  );
}

// ─── Ligne d'info ────────────────────────────────────────────
function InfoLine({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
      <p style={FONT_FREDOKA} className="text-white/85 text-sm leading-snug">
        {text}
      </p>
    </div>
  );
}

// ─── Pill niveau avec montant ────────────────────────────────
function LevelPill({ n, color }: { n: number; color: string }) {
  const amounts = [0, 10, 20, 30, 40, 50];
  const amount = amounts[n - 1];
  return (
    <div
      className={`flex flex-col items-center px-2.5 py-1.5 rounded-xl border-[2px] border-black flex-shrink-0 ${color}`}
      style={{ boxShadow: "2px 2px 0px #000", minWidth: "3rem" }}
    >
      <span style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.04em" }} className="text-black leading-none">
        {n}
      </span>
      <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: "0.6rem" }} className="text-black/70 leading-none mt-0.5">
        {amount}$
      </span>
    </div>
  );
}

// ─── Section Cartes ───────────────────────────────────────────
function SectionCards() {
  return (
    <div className="flex flex-col gap-3">
      {/* Intro */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-2"
      >
        <p style={FONT_FREDOKA} className="text-yellow-400/80 text-sm">
          Il y a <span className="text-yellow-400 font-bold">3 types de cartes</span> dans le jeu.
          Chaque type a un rôle bien précis !
        </p>
      </motion.div>

      {/* CONTRAVENTIONS */}
      <RuleBlock
        icon={<AlertTriangle className="w-5 h-5" />}
        title="CONTRAVENTIONS"
        color="text-red-300"
        bg="rgba(127,29,29,0.55)"
        border="border-red-700"
        delay={0.05}
      >
        <InfoLine
          icon={<AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5" />}
          text="Les tickets que tu accumules pour tes méfaits. Mauvaise nouvelle — chaque carte Contravention augmente ton total de tickets !"
        />
        <InfoLine
          icon={<ArrowRight className="w-3.5 h-3.5 text-red-400/70 mt-0.5" />}
          text="Le montant du ticket est affiché sur la carte, sous l'explication du méfait. Les montants se calculent automatiquement."
        />
        <div className="mt-1 px-3 py-2 rounded-xl border-[2px] border-red-700/60 flex items-center justify-center"
             style={{ background: "rgba(0,0,0,0.3)" }}>
          <span style={FONT_FREDOKA} className="text-red-400/80 text-sm">s'ajoute à ta dette</span>
        </div>
      </RuleBlock>

      {/* CONTRIBUABLES */}
      <RuleBlock
        icon={<TrendingDown className="w-5 h-5" />}
        title="CONTRIBUABLES"
        color="text-green-300"
        bg="rgba(20,83,45,0.55)"
        border="border-green-700"
        delay={0.1}
      >
        <InfoLine
          icon={<CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5" />}
          text="Bonne nouvelle ! Tu es sauvé d'un ticket. Ce sont tes récompenses pour tes bonnes actions."
        />
        <InfoLine
          icon={<ArrowLeft className="w-3.5 h-3.5 text-green-400/70 mt-0.5" />}
          text="Tu peux même recevoir un retour d'impôt qui vient baisser ton taux de tickets total — ça fait du bien !"
        />
        <div className="mt-1 px-3 py-2 rounded-xl border-[2px] border-green-700/60 flex items-center justify-center"
             style={{ background: "rgba(0,0,0,0.3)" }}>
          <span style={FONT_FREDOKA} className="text-green-400/80 text-sm">réduit ta dette</span>
        </div>
      </RuleBlock>

      {/* INVESTISSEURS */}
      <RuleBlock
        icon={<Zap className="w-5 h-5" />}
        title="INVESTISSEURS"
        color="text-yellow-300"
        bg="rgba(91,33,182,0.45)"
        border="border-purple-600"
        delay={0.15}
      >
        <InfoLine
          icon={<ArrowRight className="w-3.5 h-3.5 text-yellow-400 mt-0.5" />}
          text="Un montant de ticket est envoyé au joueur suivant — mauvaise nouvelle pour lui !"
        />
        <InfoLine
          icon={<Zap className="w-3.5 h-3.5 text-yellow-400/70 mt-0.5" />}
          text="Tu peux lui charger une taxe supplémentaire. Cette taxe s'affiche sur la carte. Elle lui coûte plus cher… mais elle réduit ta propre dette !"
        />
        <div className="mt-1 flex gap-2">
          <div className="flex-1 px-2 py-1.5 rounded-xl border-[2px] border-purple-600/60 text-center"
               style={{ background: "rgba(0,0,0,0.3)" }}>
            <span style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-purple-300">
              + $ pour lui
            </span>
          </div>
          <div className="flex-1 px-2 py-1.5 rounded-xl border-[2px] border-yellow-600/60 text-center"
               style={{ background: "rgba(0,0,0,0.3)" }}>
            <span style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-yellow-300">
              - $ pour toi
            </span>
          </div>
        </div>
      </RuleBlock>
    </div>
  );
}

// ─── Section Mécaniques ───────────────────────────────────────
function SectionMechanics() {
  return (
    <div className="flex flex-col gap-3">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center px-2">
        <p style={FONT_FREDOKA} className="text-yellow-400/80 text-sm">
          Comment fonctionne le jeu à chaque tour ?
        </p>
      </motion.div>

      {/* Piocher */}
      <RuleBlock
        icon={<Hand className="w-5 h-5" />}
        title="PIOCHER UNE CARTE"
        color="text-yellow-300"
        bg="rgba(30,58,138,0.55)"
        border="border-blue-700"
        delay={0.05}
      >
        <InfoLine
          icon={<ArrowRight className="w-3.5 h-3.5 text-yellow-400/70 mt-0.5" />}
          text="En mode multijoueur, seul le joueur dont c'est le tour peut piocher. Appuie sur RECEVOIR UN TICKET pour piocher."
        />
        <InfoLine
          icon={<ArrowRight className="w-3.5 h-3.5 text-yellow-400/70 mt-0.5" />}
          text="En mode solo, tu pioches à ton propre rythme jusqu'à ce que tu sois éliminé ou que le deck soit vide."
        />
      </RuleBlock>

      {/* Mes tickets */}
      <RuleBlock
        icon={<Hand className="w-5 h-5" />}
        title="VOIR SES TICKETS"
        color="text-green-300"
        bg="rgba(20,83,45,0.45)"
        border="border-green-700"
        delay={0.1}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500 border-[3px] border-black rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ boxShadow: "3px 3px 0px #000" }}>
            <Hand className="w-6 h-6 text-white" />
          </div>
          <p style={FONT_FREDOKA} className="text-white/85 text-sm leading-snug">
            Le <span className="text-green-300 font-bold">symbole de main</span> en bas de l'écran te permet de visualiser ton montant de ticket total et tous les tickets que tu as reçus.
          </p>
        </div>
      </RuleBlock>

      {/* Perquisitions */}
      <RuleBlock
        icon={<Search className="w-5 h-5" />}
        title="PERQUISITIONS"
        color="text-red-300"
        bg="rgba(127,29,29,0.45)"
        border="border-red-700"
        delay={0.15}
      >
        <InfoLine
          icon={<AlertTriangle className="w-3.5 h-3.5 text-red-400/80 mt-0.5" />}
          text="Une Perquisition peut se déclencher aléatoirement (2% de chance) quand un joueur pioche une carte. Elle s'active pour TOUS les joueurs simultanément."
        />
        <InfoLine
          icon={<AlertTriangle className="w-3.5 h-3.5 text-red-400/80 mt-0.5" />}
          text="Le joueur qui déclenche la Perquisition ne pioche pas de carte ce tour-là. La Perquisition remplace son tour."
        />
        <div className="mt-2 flex flex-col gap-2">
          <p style={FONT_FREDOKA} className="text-yellow-300 text-xs uppercase tracking-wider">
            Deux types de Perquisitions :
          </p>
          <div className="flex items-start gap-3 bg-black/30 rounded-xl p-2.5 border border-red-800/50">
            <div className="w-9 h-9 bg-red-600 border-[2px] border-black rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ boxShadow: "2px 2px 0px #000" }}>
              <MousePointerClick className="w-5 h-5 text-white" />
            </div>
            <div>
              <p style={FONT_FREDOKA} className="text-red-300 text-sm font-bold">ENFUIS-TOI !</p>
              <p style={FONT_FREDOKA} className="text-white/80 text-xs leading-snug">
                Clique (ou tape) le plus vite possible sur la zone centrale. Atteins le seuil de clics avant la fin du compte à rebours de 10 secondes pour t'en sortir.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-black/30 rounded-xl p-2.5 border border-blue-800/50">
            <div className="w-9 h-9 bg-blue-600 border-[2px] border-black rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ boxShadow: "2px 2px 0px #000" }}>
              <MoveHorizontal className="w-5 h-5 text-white" />
            </div>
            <div>
              <p style={FONT_FREDOKA} className="text-blue-300 text-sm font-bold">CACHE-TOI !</p>
              <p style={FONT_FREDOKA} className="text-white/80 text-xs leading-snug">
                Fais glisser (ou clique sur les flèches) dans la bonne direction indiquée. Enchaîne les bons mouvements avant la fin du compte à rebours de 10 secondes.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 mt-1">
            <Timer className="w-4 h-4 text-yellow-400/70 mt-0.5 flex-shrink-0" />
            <p style={FONT_FREDOKA} className="text-white/70 text-xs leading-snug">
              <span className="text-green-400">Réussite :</span> tu t'échappes sans conséquence.  <span className="text-red-400">Échec :</span> tu reçois une amende supplémentaire. Le résultat s'applique à chaque joueur individuellement.
            </p>
          </div>
        </div>
      </RuleBlock>

      {/* Multijoueur */}
      <RuleBlock
        icon={<Users className="w-5 h-5" />}
        title="MULTIJOUEUR"
        color="text-purple-300"
        bg="rgba(88,28,135,0.45)"
        border="border-purple-700"
        delay={0.2}
      >
        <InfoLine
          icon={<ArrowRight className="w-3.5 h-3.5 text-purple-400/70 mt-0.5" />}
          text="Jusqu'à 10 joueurs. Crée une partie et partage le code à tes amis. Chacun doit marquer Prêt avant que le host puisse lancer."
        />
        <InfoLine
          icon={<ArrowRight className="w-3.5 h-3.5 text-purple-400/70 mt-0.5" />}
          text="Les tours s'enchainent automatiquement. Un indicateur montre toujours de qui c'est le tour."
        />
        <InfoLine
          icon={<ArrowRight className="w-3.5 h-3.5 text-purple-400/70 mt-0.5" />}
          text="Quand un joueur est éliminé, la partie continue avec les joueurs restants jusqu'à ce qu'il n'en reste qu'un."
        />
      </RuleBlock>

    </div>
  );
}

// ─── Section Niveaux ──────────────────────────────────────────
function SectionLevels() {
  const levels = [1, 2, 3, 4, 5, 6];
  return (
    <div className="flex flex-col gap-3">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center px-2">
        <p style={FONT_FREDOKA} className="text-yellow-400/80 text-sm">
          Chaque type de carte a <span className="text-yellow-400 font-bold">6 niveaux</span> de montant différents.
          Plus le niveau est élevé, plus l'effet est intense !
        </p>
      </motion.div>

      {/* Niveaux Contraventions */}
      <RuleBlock
        icon={<AlertTriangle className="w-5 h-5" />}
        title="FRAIS SUPPLÉMENTAIRES"
        color="text-red-300"
        bg="rgba(127,29,29,0.5)"
        border="border-red-700"
        delay={0.05}
      >
        <p style={FONT_FREDOKA} className="text-white/75 text-xs mb-2">
          Des frais de service s'applique au ticket.
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {levels.map(n => (
            <LevelPill key={n} n={n} color="bg-red-400" />
          ))}
        </div>
        <p style={FONT_FREDOKA} className="text-red-400/70 text-xs mt-1">
          Niveau 1 = frais léger · Niveau 6 = frais maximum
        </p>
      </RuleBlock>

      {/* Niveaux Investisseurs */}
      <RuleBlock
        icon={<Zap className="w-5 h-5" />}
        title="TAXES D'INVESTISSEUR"
        color="text-yellow-300"
        bg="rgba(91,33,182,0.4)"
        border="border-purple-600"
        delay={0.1}
      >
        <p style={FONT_FREDOKA} className="text-white/75 text-xs mb-2">
          Montants de taxe chargés au joueur suivant :
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {levels.map(n => (
            <LevelPill key={n} n={n} color="bg-yellow-400" />
          ))}
        </div>
        <p style={FONT_FREDOKA} className="text-yellow-400/70 text-xs mt-1">
          Niveau 1 = taxe légère · Niveau 6 = taxe maximale
        </p>
      </RuleBlock>

      {/* Niveaux Contribuables */}
      <RuleBlock
        icon={<TrendingDown className="w-5 h-5" />}
        title="RETOURS D'IMPÔT"
        color="text-green-300"
        bg="rgba(20,83,45,0.5)"
        border="border-green-700"
        delay={0.15}
      >
        <p style={FONT_FREDOKA} className="text-white/75 text-xs mb-2">
          Crédit d'impôt qui réduisent ta dette.
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {levels.map(n => (
            <LevelPill key={n} n={n} color="bg-green-400" />
          ))}
        </div>
        <p style={FONT_FREDOKA} className="text-green-400/70 text-xs mt-1">
          Niveau 1 = petit retour · Niveau 6 = remboursement maximum
        </p>
      </RuleBlock>

      {/* Comment ces montants fonctionnent */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border-[3px] border-white/20 px-4 py-3"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <BarChart2 className="w-4 h-4 text-yellow-400/70" />
          <span style={{ ...FONT_BANGERS, fontSize: "0.9rem", letterSpacing: "0.06em" }} className="text-yellow-400/80">
            COMMENT ÇA SE CALCULE ?
          </span>
        </div>
        <p style={FONT_FREDOKA} className="text-white/70 text-xs leading-relaxed">
          Ces montants s'additionnent ou se soustraient automatiquement de ton total de tickets. Tout est calculé en temps réel — tu n'as rien à faire à la main !
        </p>
      </motion.div>
    </div>
  );
}

// ─── Section Objectif ─────────────────────────────────────────
function SectionGoal() {
  return (
    <div className="flex flex-col gap-3">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center px-2">
        <p style={FONT_FREDOKA} className="text-yellow-400/80 text-sm">
          Qui gagne ? Qui perd ? Voici les règles finales !
        </p>
      </motion.div>

      {/* Limite & Élimination */}
      <RuleBlock
        icon={<Skull className="w-5 h-5" />}
        title="LIMITE & ÉLIMINATION"
        color="text-red-300"
        bg="rgba(127,29,29,0.55)"
        border="border-red-700"
        delay={0.05}
      >
        <InfoLine
          icon={<AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5" />}
          text="Quand un joueur atteint la limite de tickets, il est éliminé. Sa partie est terminée — il devient spectateur."
        />
        <InfoLine
          icon={<Skull className="w-3.5 h-3.5 text-red-400/70 mt-0.5" />}
          text="En multijoueur, le jeu continue pour les autres joueurs même si tu es éliminé."
        />
        <InfoLine
          icon={<AlertTriangle className="w-3.5 h-3.5 text-yellow-400/70 mt-0.5" />}
          text="Tu peux choisir la difficulté dans le menu : Bandit, Délinquant ou Criminel. On augmente tout simplement la limite de tickets."
        />
        <div className="mt-1 px-3 py-2 rounded-xl border-[2px] border-red-700/60 flex items-center justify-center gap-2"
             style={{ background: "rgba(0,0,0,0.35)" }}>
          <Skull className="w-4 h-4 text-red-400" />
          <span style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.06em" }} className="text-red-300">
            TROP DE TICKETS = PRISON !
          </span>
        </div>
      </RuleBlock>

      {/* Solo */}
      <RuleBlock
        icon={<Hand className="w-5 h-5" />}
        title="MODE SOLO"
        color="text-yellow-300"
        bg="rgba(30,58,138,0.5)"
        border="border-blue-700"
        delay={0.1}
      >
        <InfoLine
          icon={<ArrowRight className="w-3.5 h-3.5 text-yellow-400/70 mt-0.5" />}
          text="Pioches autant de cartes que possible sans atteindre la limite. Essaie de vider tout le deck sans aller en prison !"
        />
        <InfoLine
          icon={<CheckCircle className="w-3.5 h-3.5 text-green-400/70 mt-0.5" />}
          text="Tu peux choisir la difficulté dans le menu : Bandit, Délinquant ou Criminel. On augmente tout simplement la limite de tickets."
        />
      </RuleBlock>

      {/* Multi */}
      <RuleBlock
        icon={<Zap className="w-5 h-5" />}
        title="MODE MULTIJOUEUR"
        color="text-purple-300"
        bg="rgba(91,33,182,0.4)"
        border="border-purple-600"
        delay={0.15}
      >
        <InfoLine
          icon={<ArrowRight className="w-3.5 h-3.5 text-purple-400/70 mt-0.5" />}
          text="Jusqu'à 10 joueurs. Les tours s'enchaînent à tour de rôle."
        />
      </RuleBlock>

      {/* Astuce finale */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 260, damping: 22 }}
        className="rounded-2xl border-[4px] border-yellow-400 px-4 py-3 text-center"
        style={{ background: "rgba(255,215,0,0.1)", boxShadow: "4px 4px 0px #000" }}
      >
        <span style={{ ...FONT_BANGERS, fontSize: "1.2rem", letterSpacing: "0.06em" }} className="text-yellow-400">
          !! ASTUCE !!
        </span>
        <p style={FONT_FREDOKA} className="text-white/80 text-sm mt-1 leading-snug">
          Garde un oeil sur la barre de progression en haut de l'écran. Elle te montre combien de cartes il reste dans le deck !
        </p>
      </motion.div>
    </div>
  );
}

// ─── Écran principal ──────────────────────────────────────────
export function RulesScreen() {
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState<Section>("cards");

  const sectionIndex    = NAV_ITEMS.findIndex(n => n.id === activeSection);
  const canPrev         = sectionIndex > 0;
  const canNext         = sectionIndex < NAV_ITEMS.length - 1;

  return (
    <div
      className="h-[100dvh] max-w-md md:max-w-lg lg:max-w-xl mx-auto flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)" }}
    >
      {/* ── Header ── */}
      <div className="w-full bg-[#111] border-b-4 border-yellow-400 flex items-center px-4 py-2.5 z-10 flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 flex-1 justify-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/")}
            className="w-10 h-10 bg-yellow-400 border-[3px] border-black rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: "3px 3px 0px #000" }}
          >
            <Home className="w-5 h-5 text-black" />
          </motion.button>
          <div className="flex-1 flex justify-center">
            <span style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.14em" }} className="text-yellow-400">
              RÈGLES DU JEU
            </span>
          </div>
          {/* Espace symétrique */}
          <div className="w-10 flex-shrink-0" />
        </div>
      </div>

      <PoliceTape />

      {/* ── Nav onglets ── */}
      <div className="flex gap-1.5 px-3 py-2 flex-shrink-0">
        {NAV_ITEMS.map(item => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => setActiveSection(item.id)}
            className={`flex-1 py-1.5 rounded-xl border-[3px] border-black transition-colors`}
            style={{
              ...FONT_BANGERS,
              fontSize: "0.7rem",
              letterSpacing: "0.05em",
              background: activeSection === item.id ? "#FFD700" : "rgba(255,255,255,0.08)",
              color: activeSection === item.id ? "#000" : "rgba(255,255,255,0.5)",
              boxShadow: activeSection === item.id ? "3px 3px 0px #000" : "2px 2px 0px #000",
            }}
          >
            {item.label}
          </motion.button>
        ))}
      </div>

      {/* ── Contenu scrollable ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeSection === "cards"     && <SectionCards />}
            {activeSection === "mechanics" && <SectionMechanics />}
            {activeSection === "levels"    && <SectionLevels />}
            {activeSection === "goal"      && <SectionGoal />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation précédent / suivant ── */}
      <div className="flex gap-2 px-3 pb-2 pt-1 flex-shrink-0">
        <motion.button
          whileTap={{ scale: 0.93 }}
          disabled={!canPrev}
          onClick={() => canPrev && setActiveSection(NAV_ITEMS[sectionIndex - 1].id)}
          className="flex-1 py-2 rounded-xl border-[3px] border-black flex items-center justify-center gap-1.5 disabled:opacity-30"
          style={{
            background: canPrev ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
            boxShadow: "3px 3px 0px #000",
          }}
        >
          <ChevronDown className="w-4 h-4 text-white/60 rotate-90" />
          <span style={FONT_FREDOKA} className="text-white/60 text-sm">
            {canPrev ? NAV_ITEMS[sectionIndex - 1].label : "—"}
          </span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.93 }}
          disabled={!canNext}
          onClick={() => canNext && setActiveSection(NAV_ITEMS[sectionIndex + 1].id)}
          className="flex-1 py-2 rounded-xl border-[3px] border-black flex items-center justify-center gap-1.5 disabled:opacity-30"
          style={{
            background: canNext ? "#FFD700" : "rgba(255,255,255,0.04)",
            color: canNext ? "#000" : "rgba(255,255,255,0.3)",
            boxShadow: canNext ? "3px 3px 0px #000" : "2px 2px 0px rgba(0,0,0,0.5)",
          }}
        >
          <span style={FONT_FREDOKA} className="text-sm">
            {canNext ? NAV_ITEMS[sectionIndex + 1].label : "—"}
          </span>
          <ChevronUp className="w-4 h-4 rotate-90" />
        </motion.button>
      </div>

      {/* ── Footer ── */}
      <div
        className="w-full bg-[#111] py-1 text-center flex-shrink-0"
        style={{ paddingBottom: "calc(0.25rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <span style={FONT_FREDOKA} className="text-yellow-400/40 text-[0.65rem] tracking-widest">
          © TICKET CRICKET 2026
        </span>
      </div>
    </div>
  );
}
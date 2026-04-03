/**
 * Modal multijoueur — affiché quand on clique sur JOUER.
 * 3 options : Jouer seul / Créer une partie / Rejoindre.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Plus, Users, Gamepad2, ChevronRight, Coins, Crosshair, Skull,
  Check, AlertTriangle, FileText, User, TrendingUp, CloudUpload, Play,
} from "lucide-react";
import { createSession, joinSession, mpStorage } from "@/game/utils/sessionApi";
import { MINI_GAME_LEVELS, type MiniGameLevel } from "@/game/utils/miniGameUtils";
import { useLocation } from "wouter";
import { ALL_CARD_IDS, getCardConfig, CATEGORY_INFO, CATEGORY_ORDER } from "@/game/utils/cardConfig";
import ticketImg from "@/game/utils/ticketImg";
import { trpc } from "@/lib/trpc";
import { useGameAuth } from "@/hooks/useGameAuth";
import { Sparkles, BookmarkPlus, Bookmark, Trash2 } from "lucide-react";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

// ── Clés localStorage ─────────────────────────────────────────
export const SOLO_DIFFICULTY_KEY            = "ticket_cricket_difficulty";
export const SOLO_NO_CONTRIBUABLE_KEY       = "ticket_cricket_no_contribuable";
export const SOLO_NO_INVESTISSEUR_KEY       = "ticket_cricket_no_investisseur";
export const SOLO_CUSTOM_CARDS_ENABLED_KEY  = "ticket_cricket_custom_cards_enabled";
export const SOLO_CUSTOM_CARDS_DATA_KEY     = "ticket_cricket_custom_cards_data";
export const SOLO_MINI_GAME_LEVEL_KEY       = "ticket_cricket_mini_game_level";
export const SOLO_PLUS_PACK_KEY        = "ticket_cricket_plus_pack";

// ── Niveaux de difficulté ──────────────────────────────────────
export const DIFFICULTIES = [
  {
    key: "bandit",
    label: "BANDIT",
    subtitle: "Mode rapide",
    desc: "Limite faible — Pour ceux qui veulent aller en prison rapidement",
    threshold: 5_000,
    color: "#16A34A",
    border: "#15803D",
    Icon: Coins,
  },
  {
    key: "delinquant",
    label: "DÉLINQUANT",
    subtitle: "Mode normal",
    desc: "Limite classique — Pour ceux qui veulent éviter la prison facilement",
    threshold: 10_000,
    color: "#CA8A04",
    border: "#A16207",
    Icon: Crosshair,
  },
  {
    key: "criminel",
    label: "CRIMINEL",
    subtitle: "Mode difficile",
    desc: "Limite élevée — Pour ceux qui veulent s'enfuir de prison",
    threshold: 20_000,
    color: "#DC2626",
    border: "#991B1B",
    Icon: Skull,
  },
] as const;

type DifficultyKey = (typeof DIFFICULTIES)[number]["key"];
type View = "menu" | "create" | "join" | "difficulty-solo";

interface Props {
  onClose: () => void;
}

// ── Utilitaires deck ──────────────────────────────────────────
function computeAllowedCardIds(disableT2: boolean, disableT3: boolean): number[] {
  return ALL_CARD_IDS.filter((id) => {
    const cfg = getCardConfig(id);
    if (disableT2 && cfg.cardType === 2) return false;
    if (disableT3 && cfg.cardType === 3) return false;
    return true;
  });
}

// ── DifficultySelector ────────────────────────────────────────
function DifficultySelector({
  selected,
  onChange,
}: {
  selected: DifficultyKey;
  onChange: (k: DifficultyKey) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label style={FONT_FREDOKA} className="text-white/70 text-sm">
        Limite de tickets avant élimination
      </label>
      {DIFFICULTIES.map((d) => {
        const isActive = selected === d.key;
        return (
          <motion.button
            key={d.key}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(d.key)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-[3px] text-left transition-colors"
            style={{
              borderColor: isActive ? d.color : "rgba(255,255,255,0.15)",
              background: isActive ? d.color + "22" : "rgba(255,255,255,0.05)",
              boxShadow: isActive ? `3px 3px 0px #000` : "2px 2px 0px rgba(0,0,0,0.3)",
            }}
          >
            <div
              className="w-10 h-10 rounded-lg border-[2px] border-black flex items-center justify-center flex-shrink-0"
              style={{ background: isActive ? d.color : "rgba(255,255,255,0.08)", boxShadow: "2px 2px 0px #000" }}
            >
              <d.Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.06em" }}
                  className={isActive ? "text-white" : "text-white/50"}
                >
                  {d.label}
                </span>
                <span
                  style={FONT_FREDOKA}
                  className={`text-xs ${isActive ? "text-white/70" : "text-white/30"}`}
                >
                  {d.subtitle}
                </span>
              </div>
              <div style={FONT_FREDOKA} className={`text-xs leading-none mt-0.5 ${isActive ? "text-white/60" : "text-white/25"}`}>
                {d.desc}
              </div>
            </div>
            <div
              className="flex-shrink-0 px-2 py-1 rounded-lg border-[2px] border-black"
              style={{ background: isActive ? d.color : "rgba(255,255,255,0.08)", boxShadow: "2px 2px 0px #000" }}
            >
              <span style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.04em" }} className="text-white">
                {d.threshold.toLocaleString("fr-CA")}$
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── MiniGameLevelSelector — sélecteur de taux de perquisition ──
function MiniGameLevelSelector({
  selected,
  onChange,
}: {
  selected: MiniGameLevel;
  onChange: (l: MiniGameLevel) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label style={FONT_FREDOKA} className="text-white/70 text-sm">
        Taux de perquisition
      </label>
      <div className="grid grid-cols-5 gap-1.5">
        {MINI_GAME_LEVELS.map((lvl) => {
          const isActive = selected === lvl.level;
          return (
            <motion.button
              key={lvl.level}
              whileTap={{ scale: 0.94 }}
              onClick={() => onChange(lvl.level as MiniGameLevel)}
              className="flex flex-col items-center gap-1 py-2 rounded-xl border-[2.5px] transition-colors"
              style={{
                borderColor: isActive ? lvl.color : "rgba(255,255,255,0.15)",
                background: isActive ? lvl.color + "22" : "rgba(255,255,255,0.04)",
                boxShadow: isActive ? `2px 2px 0px #000` : "1px 1px 0px rgba(0,0,0,0.3)",
              }}
            >
              <span
                style={{ ...FONT_BANGERS, fontSize: "1.4rem", lineHeight: 1, color: isActive ? lvl.color : "rgba(255,255,255,0.35)" }}
              >
                {lvl.level}
              </span>
            </motion.button>
          );
        })}
      </div>
      {/* Description du niveau sélectionné */}
      {(() => {
        const lvl = MINI_GAME_LEVELS.find(l => l.level === selected)!;
        return (
          <div
            className="px-3 py-2 rounded-xl border-[2px]"
            style={{ borderColor: lvl.color + "55", background: lvl.color + "11" }}
          >
            <div style={{ ...FONT_BANGERS, fontSize: "0.95rem", color: lvl.color, letterSpacing: "0.04em" }}>
              {lvl.desc}
            </div>
            <div style={FONT_FREDOKA} className="text-white/50 text-xs mt-0.5 italic">
              « {lvl.flavor} »
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── CardFilterToggle — bascule individuelle avec confirmation ──
interface FilterToggleProps {
  label: string;
  sublabel: string;
  confirmMsg: string;
  active: boolean;
  color: string;
  Icon: React.ElementType;
  onConfirm: (val: boolean) => void;
}
function CardFilterToggle({ label, sublabel, confirmMsg, active, color, Icon, onConfirm }: FilterToggleProps) {
  // "idle" | "confirm-on" | "confirm-off"
  const [pendingState, setPendingState] = useState<"idle" | "confirm-on" | "confirm-off">("idle");

  const handleClick = () => {
    if (active) {
      // Pas de confirmation pour réactiver — action immédiate
      onConfirm(false);
    } else {
      setPendingState("confirm-on");
    }
  };

  const handleYes = () => {
    onConfirm(true);
    setPendingState("idle");
  };

  const handleNo = () => {
    setPendingState("idle");
  };

  // INCLUSES (active=false) → bulle colorée ; RETIRÉES (active=true) → bulle simple grise
  const isIncluded = !active;

  return (
    <div className="flex flex-col gap-1">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleClick}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-[3px] text-left transition-colors"
        style={{
          borderColor: isIncluded ? color : "rgba(255,255,255,0.15)",
          background: isIncluded ? color + "33" : "rgba(255,255,255,0.05)",
          boxShadow: isIncluded ? "3px 3px 0px #000" : "2px 2px 0px rgba(0,0,0,0.3)",
        }}
      >
        {/* Icône */}
        <div
          className="w-10 h-10 rounded-lg border-[2px] border-black flex items-center justify-center flex-shrink-0 relative"
          style={{ background: isIncluded ? color : "rgba(255,255,255,0.08)", boxShadow: "2px 2px 0px #000" }}
        >
          <Icon className="w-5 h-5 text-white" />
          {!isIncluded && (
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 border-[2px] border-black rounded-full flex items-center justify-center">
              <X className="w-2 h-2 text-white" />
            </div>
          )}
        </div>

        {/* Texte */}
        <div className="flex-1 min-w-0">
          <div style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.05em" }} className={isIncluded ? "text-white" : "text-white/50"}>
            {label}
          </div>
          <div style={FONT_FREDOKA} className={`text-xs leading-none mt-0.5 ${isIncluded ? "text-white/70" : "text-white/25"}`}>
            {sublabel}
          </div>
        </div>

        {/* Badge état */}
        <div
          className="flex-shrink-0 px-2.5 py-1 rounded-lg border-[2px] border-black"
          style={{
            background: isIncluded ? color : "rgba(255,255,255,0.08)",
            boxShadow: "2px 2px 0px #000",
          }}
        >
          <span style={{ ...FONT_BANGERS, fontSize: "0.85rem", letterSpacing: "0.04em" }} className={isIncluded ? "text-white" : "text-red-400"}>
            {isIncluded ? "INCLUSES" : "RETIRÉES"}
          </span>
        </div>
      </motion.button>

      {/* Zone de confirmation inline */}
      <AnimatePresence>
        {pendingState === "confirm-on" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="flex flex-col gap-2 px-4 py-3 rounded-xl border-[3px] border-yellow-500"
              style={{ background: "rgba(202,138,4,0.18)", boxShadow: "2px 2px 0px #000" }}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p style={FONT_FREDOKA} className="text-yellow-300 text-sm leading-snug">
                  {confirmMsg}
                </p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleYes}
                  className="flex-1 py-2 rounded-xl border-[3px] border-black flex items-center justify-center gap-1.5"
                  style={{ background: "#DC2626", boxShadow: "3px 3px 0px #000" }}
                >
                  <Check className="w-4 h-4 text-white" />
                  <span style={{ ...FONT_BANGERS, fontSize: "0.95rem", letterSpacing: "0.05em" }} className="text-white">
                    OUI, RETIRER
                  </span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNo}
                  className="flex-1 py-2 rounded-xl border-[3px] border-black flex items-center justify-center gap-1.5"
                  style={{ background: "rgba(255,255,255,0.12)", boxShadow: "3px 3px 0px #000" }}
                >
                  <X className="w-4 h-4 text-white/70" />
                  <span style={{ ...FONT_BANGERS, fontSize: "0.95rem", letterSpacing: "0.05em" }} className="text-white/70">
                    NON, GARDER
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── CardFiltersSection ─────────────────────────────────────────
function CardFiltersSection({
  disableT2, disableT3,
  onChangeT2, onChangeT3,
  showT3 = true,
}: {
  disableT2: boolean;
  disableT3?: boolean;
  onChangeT2: (v: boolean) => void;
  onChangeT3?: (v: boolean) => void;
  showT3?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label style={FONT_FREDOKA} className="text-white/70 text-sm">
        Types de cartes dans la partie
      </label>

      {/* Contraventions — toujours obligatoires */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border-[3px]"
        style={{ borderColor: "rgba(255,165,0,0.4)", background: "rgba(255,165,0,0.07)", boxShadow: "2px 2px 0px rgba(0,0,0,0.3)" }}
      >
        <div
          className="w-10 h-10 rounded-lg border-[2px] border-black flex items-center justify-center flex-shrink-0"
          style={{ background: "#C2410C", boxShadow: "2px 2px 0px #000" }}
        >
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.05em" }} className="text-orange-300">
            CONTRAVENTIONS
          </div>
          <div style={FONT_FREDOKA} className="text-orange-400/50 text-xs leading-none mt-0.5">
            Toujours incluses — obligatoires
          </div>
        </div>
        <div
          className="flex-shrink-0 px-2.5 py-1 rounded-lg border-[2px] border-black"
          style={{ background: "#C2410C", boxShadow: "2px 2px 0px #000" }}
        >
          <span style={{ ...FONT_BANGERS, fontSize: "0.85rem", letterSpacing: "0.04em" }} className="text-white">
            OBLIGATOIRE
          </span>
        </div>
      </div>

      {/* Contribuables — optionnel */}
      <CardFilterToggle
        label="CONTRIBUABLES"
        sublabel="Cartes qui réduisent ta dette"
        confirmMsg="Voulez-vous vraiment retirer les contribuables de la partie ? Vous ne recevrez plus de cartes de réduction de dette."
        active={disableT2}
        color="#16A34A"
        Icon={User}
        onConfirm={onChangeT2}
      />

      {/* Investisseurs — optionnel, seulement en multi */}
      {showT3 && onChangeT3 && (
        <CardFilterToggle
          label="INVESTISSEURS"
          sublabel="Cartes qui transfèrent de la dette"
          confirmMsg="Voulez-vous vraiment retirer les investisseurs de la partie ? Il n'y aura plus de transferts de dette entre joueurs."
          active={disableT3 ?? false}
          color="#7C3AED"
          Icon={TrendingUp}
          onConfirm={onChangeT3}
        />
      )}
    </div>
  );
}

// ── Résumé du deck filtré ──────────────────────────────────────────────────────────
function DeckBreakdown({
  disableT2,
  disableT3,
  isSolo = false,
  customCards = [],
  customEnabled = false,
}: {
  disableT2: boolean;
  disableT3?: boolean;
  isSolo?: boolean;
  customCards?: Array<{ category: string }>;
  customEnabled?: boolean;
}) {
  const effectiveDisableT3 = isSolo ? true : (disableT3 ?? false);

  // Calculer les stats par catégorie
  type CatStats = { total: number; custom: number };
  const stats: Record<string, CatStats> = {};
  for (const cat of CATEGORY_ORDER) {
    stats[cat] = { total: 0, custom: 0 };
  }

  // Cartes standards
  for (const id of ALL_CARD_IDS) {
    const cfg = getCardConfig(id);
    if (disableT2 && cfg.cardType === 2) continue;
    if (effectiveDisableT3 && cfg.cardType === 3) continue;
    const s = stats[cfg.category];
    if (!s) continue;
    s.total++;
  }

  // Cartes personnalisées
  let totalCustom = 0;
  if (customEnabled) {
    for (const c of customCards) {
      if (disableT2 && c.category === "contribuable") continue;
      if (effectiveDisableT3 && c.category === "investisseur") continue;
      const s = stats[c.category];
      if (s) { s.custom++; s.total++; totalCustom++; }
    }
  }

  const grandTotal = Object.values(stats).reduce((acc, s) => acc + s.total, 0);

  // Catégories visibles (non vides)
  const visibleCats = CATEGORY_ORDER.filter(cat => {
    if (cat === "contribuable" && disableT2) return false;
    if (cat === "investisseur" && effectiveDisableT3) return false;
    return true;
  });

  return (
    <div
      className="rounded-xl border-[2px] border-black/30 overflow-hidden"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      {/* En-tête total */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/8">
        <span style={FONT_FREDOKA} className="text-white/50 text-xs">
          Deck actuel{totalCustom > 0 ? ` (dont ${totalCustom} perso)` : ""}
        </span>
        <span style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.06em" }} className="text-yellow-400">
          {grandTotal} cartes
        </span>
      </div>
      {/* Détail par catégorie */}
      <div className="flex flex-col">
        {visibleCats.map((cat, idx) => {
          const s = stats[cat];
          const info = CATEGORY_INFO[cat];
          return (
            <div
              key={cat}
              className={`flex items-center gap-3 px-4 py-2 ${idx < visibleCats.length - 1 ? "border-b border-white/5" : ""}`}
            >
              {/* Pastille couleur */}
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: info.color }} />
              {/* Nom catégorie */}
              <span style={FONT_FREDOKA} className="text-white/70 text-xs flex-1">{info.label}</span>
              {/* Badge perso si applicable */}
              {s.custom > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded text-[0.6rem]"
                  style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)", fontFamily: "'Bangers', cursive", letterSpacing: "0.04em" }}
                >
                  +{s.custom} perso
                </span>
              )}
              {/* Total catégorie */}
              <span style={{ ...FONT_BANGERS, fontSize: "0.85rem", letterSpacing: "0.04em" }} className="text-white/40 flex-shrink-0 w-6 text-right">
                {s.total}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MultiplayerModal({ onClose }: Props) {
  const [, navigate] = useLocation();

  // Pré-remplir le code si l'URL contient ?join=CODE (scan QR)
  const joinCodeFromUrl = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("join") ?? "";
    } catch {
      return "";
    }
  })();

  const [view, setView] = useState<View>(joinCodeFromUrl ? "join" : "menu");
  const [name, setName] = useState("");
  const [code, setCode] = useState(joinCodeFromUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyKey>("delinquant");
  const [miniGameLevel, setMiniGameLevel] = useState<MiniGameLevel>(1);
  // Filtres solo
  const [soloDisableT2, setSoloDisableT2] = useState(false);
  const [soloCustomEnabled, setSoloCustomEnabled] = useState(false);
  // Filtres multi (création)
  const [mpDisableT2, setMpDisableT2] = useState(false);
  const [mpDisableT3, setMpDisableT3] = useState(false);
  const [mpCustomEnabled, setMpCustomEnabled] = useState(false);

  const resetError = () => setError("");

  // ─ Auth ─
  const { isAuthenticated } = useGameAuth();

  const selectedDiff = DIFFICULTIES.find((d) => d.key === difficulty) ?? DIFFICULTIES[1];

  // Mutation pour publier les cartes personnalisées en session multijoueur
  const publishSessionCards = trpc.sessionCustomCards.publish.useMutation();

  // Cartes personnalisées du joueur connecté
  const { data: customCardsData } = trpc.customCards.list.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const customCards = customCardsData ?? [];
  const hasCustomCards = customCards.length > 0;
  const { data: saveData } = trpc.savedGames.loadGame.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const hasSave = saveData?.hasSave === true;

  // ─ Configurations sauvegardées ─
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveConfigName, setSaveConfigName] = useState("");
  const [saveConfigFor, setSaveConfigFor] = useState<"solo" | "multi">("solo");
  const [showConfigs, setShowConfigs] = useState(false);

  const { data: savedConfigs, refetch: refetchConfigs } = trpc.gameConfigs.list.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const saveConfigMutation = trpc.gameConfigs.save.useMutation({
    onSuccess: () => { refetchConfigs(); setShowSaveModal(false); setSaveConfigName(""); },
  });
  const deleteConfigMutation = trpc.gameConfigs.delete.useMutation({
    onSuccess: () => refetchConfigs(),
  });

  const handleSaveConfig = () => {
    if (!saveConfigName.trim()) return;
    const isMulti = saveConfigFor === "multi";
    saveConfigMutation.mutate({
      name: saveConfigName.trim(),
      difficulty,
      disableT2: isMulti ? mpDisableT2 : soloDisableT2,
      disableT3: isMulti ? mpDisableT3 : false,
      includeCustom: isMulti ? mpCustomEnabled : soloCustomEnabled,
    });
  };

  const handleLoadConfig = (cfg: { difficulty: string; disableT2: boolean; disableT3: boolean; includeCustom: boolean }) => {
    const key = cfg.difficulty as DifficultyKey;
    if (DIFFICULTIES.find(d => d.key === key)) setDifficulty(key);
    if (saveConfigFor === "multi") {
      setMpDisableT2(cfg.disableT2);
      setMpDisableT3(cfg.disableT3);
      setMpCustomEnabled(cfg.includeCustom);
    } else {
      setSoloDisableT2(cfg.disableT2);
      setSoloCustomEnabled(cfg.includeCustom);
    }
    setShowConfigs(false);
  };

  // Reprendre la partie sauvegardée
  const handleResume = () => {
    if (!saveData || !saveData.hasSave) return;
    try {
      const { deck, drawn } = JSON.parse(saveData.gameState);
      const threshold = Number(saveData.difficulty);
      localStorage.setItem(SOLO_DIFFICULTY_KEY, String(threshold));
      localStorage.setItem(SOLO_NO_CONTRIBUABLE_KEY, "0");
      // Clés utilisées par GameScreen (v1)
      localStorage.setItem("ticket_cricket_deck_v1", JSON.stringify(deck));
      localStorage.setItem("ticket_cricket_drawn_v1", JSON.stringify(drawn));
    } catch {}
    navigate("/game");
  };

  //  // ── CREATE ─────────────────────────────────────────────
  const handleCreate = async () => {
    if (!name.trim()) { setError("Entre ton prénom !"); return; }
    setLoading(true);
    setError("");
    try {
      // Calculer les IDs standards autorisés
      const standardAllowedIds = computeAllowedCardIds(mpDisableT2, mpDisableT3);
      const disabledCardTypes: number[] = [
        ...(mpDisableT2 ? [2] : []),
        ...(mpDisableT3 ? [3] : []),
      ];

      // Filtrer et préparer les cartes personnalisées
      let filteredCustomCards: typeof customCards = [];
      if (mpCustomEnabled && customCards.length > 0) {
        filteredCustomCards = customCards.filter((c: any) => {
          if (mpDisableT2 && c.category === "contribuable") return false;
          if (mpDisableT3 && c.category === "investisseur") return false;
          return true;
        });
      }

      // Inclure les IDs négatifs des cartes perso dans le deck Supabase
      const customNegativeIds = filteredCustomCards.map((c: any) => -c.id);
      const allowedCardIds = [...standardAllowedIds, ...customNegativeIds];

      const { code: sessionCode, playerId } = await createSession(
        name.trim(),
        selectedDiff.threshold,
        allowedCardIds,
        disabledCardTypes,
        miniGameLevel,
      );
      mpStorage.save(sessionCode, playerId, name.trim(), true);

      // Publier les cartes personnalisées dans la DB pour que tous les joueurs
      // puissent charger les configs (texte, prix, etc.)
      if (filteredCustomCards.length > 0) {
        try {
          await publishSessionCards.mutateAsync({
            sessionCode,
            cards: filteredCustomCards.map((c: any) => ({
              id: c.id,
              category: c.category,
              mefait: c.mefait ?? null,
              ticketPrice: c.ticketPrice ?? 0,
              frais: c.frais ?? 0,
              impots: c.impots ?? 0,
              taxe: c.taxe ?? 0,
            })),
          });
        } catch {
          // Non-bloquant : la partie continue sans cartes personnalisées
        }
      }

      navigate("/lobby");
    } catch (e: any) {
      setError(e.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  // ── JOIN ─────────────────────────────────────────────────────
  const handleJoin = async () => {
    if (!code.trim()) { setError("Entre le code de la partie !"); return; }
    if (!name.trim()) { setError("Entre ton prénom !"); return; }
    setLoading(true);
    setError("");
    try {
      const { playerId } = await joinSession(code.trim().toUpperCase(), name.trim());
      mpStorage.save(code.trim().toUpperCase(), playerId, name.trim(), false);
      navigate("/lobby");
    } catch (e: any) {
      setError(e.message || "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  //  // ── SOLO : sauvegarder les préfs et naviguer ─────────────
  const handlePlaySolo = () => {
    try {
      localStorage.setItem(SOLO_DIFFICULTY_KEY, String(selectedDiff.threshold));
      localStorage.setItem(SOLO_NO_CONTRIBUABLE_KEY, soloDisableT2 ? "1" : "0");
      localStorage.setItem(SOLO_CUSTOM_CARDS_ENABLED_KEY, soloCustomEnabled ? "1" : "0");
      localStorage.setItem(SOLO_MINI_GAME_LEVEL_KEY, String(miniGameLevel));
      if (soloCustomEnabled && customCards.length > 0) {
        localStorage.setItem(SOLO_CUSTOM_CARDS_DATA_KEY, JSON.stringify(customCards));
      } else {
        localStorage.removeItem(SOLO_CUSTOM_CARDS_DATA_KEY);
      }
    } catch {}
    navigate("/game");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: "100%", scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="w-full max-w-md rounded-t-3xl border-t-4 border-x-4 border-black overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 100%)", boxShadow: "0 -6px 0 #000" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#111] border-b-4 border-yellow-400 flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <img src={ticketImg} alt="" style={{ width: "1.8rem" }} />
            <span style={{ ...FONT_BANGERS, fontSize: "1.4rem", letterSpacing: "0.08em" }} className="text-yellow-400">
              MODE DE JEU
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onClose}
            className="w-9 h-9 bg-red-500 border-[3px] border-black rounded-full flex items-center justify-center"
            style={{ boxShadow: "3px 3px 0px #000" }}
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        <div className="px-5 py-5 overflow-y-auto" style={{ maxHeight: "82dvh" }}>
          <AnimatePresence mode="wait">

            {/* ── MENU ── */}
            {view === "menu" && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-3"
              >
                {/* REPRENDRE MA PARTIE — seulement si connecté et sauvegarde existante */}
                {isAuthenticated && hasSave && saveData && saveData.hasSave && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col gap-1"
                  >
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleResume}
                      className="w-full py-4 border-[4px] border-black rounded-2xl flex items-center gap-3 px-5 relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)", boxShadow: "5px 5px 0px #000" }}
                    >
                      <motion.div
                        className="absolute inset-0 w-1/3 bg-white/10 skew-x-[-20deg]"
                        animate={{ x: ["-100%", "400%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                      />
                      <CloudUpload className="w-7 h-7 text-white flex-shrink-0" />
                      <div className="text-left flex-1">
                        <div style={{ ...FONT_BANGERS, fontSize: "1.35rem", letterSpacing: "0.06em" }} className="text-white leading-none">
                          REPRENDRE MA PARTIE
                        </div>
                        <div style={FONT_FREDOKA} className="text-white/70 text-xs mt-0.5">
                          {saveData.cardsDrawn} cartes piochées — {Number(saveData.difficulty).toLocaleString("fr-CA")}$ limite
                        </div>
                      </div>
                      <Play className="w-5 h-5 text-white/80 flex-shrink-0" />
                    </motion.button>
                    <div style={FONT_FREDOKA} className="text-white/30 text-xs text-center">
                      Sauvegardée le {new Date(saveData.savedAt).toLocaleDateString("fr-CA")}
                    </div>
                  </motion.div>
                )}

                {/* JOUER SEUL */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setView("difficulty-solo"); resetError(); }}
                  className="w-full py-4 bg-yellow-400 border-[4px] border-black rounded-2xl flex items-center gap-3 px-5"
                  style={{ boxShadow: "5px 5px 0px #000" }}
                >
                  <Gamepad2 className="w-7 h-7 text-black flex-shrink-0" />
                  <div className="text-left flex-1">
                    <div style={{ ...FONT_BANGERS, fontSize: "1.35rem", letterSpacing: "0.06em" }} className="text-black leading-none">
                      JOUER SEUL
                    </div>
                    <div style={FONT_FREDOKA} className="text-black/60 text-xs mt-0.5">
                      Nouvelle partie solo
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-black/60 flex-shrink-0" />
                </motion.button>

                {/* CRÉER UNE PARTIE */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setView("create"); resetError(); }}
                  className="w-full py-4 bg-[#1565C0] border-[4px] border-black rounded-2xl flex items-center gap-3 px-5"
                  style={{ boxShadow: "5px 5px 0px #000" }}
                >
                  <Plus className="w-7 h-7 text-white flex-shrink-0" />
                  <div className="text-left flex-1">
                    <div style={{ ...FONT_BANGERS, fontSize: "1.35rem", letterSpacing: "0.06em" }} className="text-white leading-none">
                      CRÉER UNE PARTIE
                    </div>
                    <div style={FONT_FREDOKA} className="text-white/60 text-xs mt-0.5">
                      Inviter jusqu'à 9 criminels
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/60 flex-shrink-0" />
                </motion.button>

                {/* REJOINDRE */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setView("join"); resetError(); }}
                  className="w-full py-4 border-[4px] border-black rounded-2xl flex items-center gap-3 px-5"
                  style={{ background: "#9C27B0", boxShadow: "5px 5px 0px #000" }}
                >
                  <Users className="w-7 h-7 text-white flex-shrink-0" />
                  <div className="text-left flex-1">
                    <div style={{ ...FONT_BANGERS, fontSize: "1.35rem", letterSpacing: "0.06em" }} className="text-white leading-none">
                      REJOINDRE
                    </div>
                    <div style={FONT_FREDOKA} className="text-white/60 text-xs mt-0.5">
                      Entrer le code d'une partie
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/60 flex-shrink-0" />
                </motion.button>
              </motion.div>
            )}

            {/* ── DIFFICULTÉ SOLO ── */}
            {view === "difficulty-solo" && (
              <motion.div
                key="difficulty-solo"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <button
                  onClick={() => { setView("menu"); resetError(); }}
                  style={FONT_FREDOKA}
                  className="text-yellow-400/70 text-sm text-left hover:text-yellow-400 transition-colors"
                >
                  ← Retour
                </button>

                <div style={{ ...FONT_BANGERS, fontSize: "1.5rem", letterSpacing: "0.06em" }} className="text-yellow-400 text-center">
                  CHOISIR LA DIFFICULTÉ
                </div>

                <DifficultySelector selected={difficulty} onChange={setDifficulty} />

                {/* Séparateur */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/15" />
                  <span style={FONT_FREDOKA} className="text-white/40 text-xs">Perquisitions</span>
                  <div className="h-px flex-1 bg-white/15" />
                </div>

                <MiniGameLevelSelector selected={miniGameLevel} onChange={setMiniGameLevel} />

                {/* Séparateur */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/15" />
                  <span style={FONT_FREDOKA} className="text-white/40 text-xs">Types de cartes</span>
                  <div className="h-px flex-1 bg-white/15" />
                </div>

                {/* Filtre cartes solo : seulement T2 (T3 déjà exclu du solo) */}
                <CardFiltersSection
                  disableT2={soloDisableT2}
                  onChangeT2={setSoloDisableT2}
                  showT3={false}
                />

                {/* Cartes personnalisées (solo) — toujours visible */}
                <motion.button
                  whileTap={{ scale: isAuthenticated && hasCustomCards ? 0.97 : 1 }}
                  onClick={() => isAuthenticated && hasCustomCards && setSoloCustomEnabled(!soloCustomEnabled)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-[3px] text-left transition-colors"
                  style={{
                    borderColor: soloCustomEnabled && hasCustomCards ? "#FF4081" : "rgba(255,255,255,0.15)",
                    background: soloCustomEnabled && hasCustomCards ? "rgba(255,64,129,0.2)" : "rgba(255,255,255,0.05)",
                    boxShadow: soloCustomEnabled && hasCustomCards ? "3px 3px 0px #000" : "2px 2px 0px rgba(0,0,0,0.3)",
                    cursor: isAuthenticated && hasCustomCards ? "pointer" : "default",
                    opacity: isAuthenticated ? 1 : 0.6,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg border-[2px] border-black flex items-center justify-center flex-shrink-0"
                    style={{ background: soloCustomEnabled && hasCustomCards ? "#FF4081" : "rgba(255,255,255,0.08)", boxShadow: "2px 2px 0px #000" }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.05em" }} className={soloCustomEnabled && hasCustomCards ? "text-white" : "text-white/50"}>
                      CARTES PERSONNALISÉES
                    </div>
                    <div style={FONT_FREDOKA} className="text-xs leading-none mt-0.5 text-white/30">
                      {!isAuthenticated
                        ? "Connexion requise pour utiliser vos cartes"
                        : !hasCustomCards
                        ? "Aucune carte créée — Créez-en dans Personnalisation"
                        : `${customCards.length} carte${customCards.length > 1 ? "s" : ""} créée${customCards.length > 1 ? "s" : ""} — désactivées par défaut`
                      }
                    </div>
                  </div>
                  <div
                    className="flex-shrink-0 px-2.5 py-1 rounded-lg border-[2px] border-black"
                    style={{
                      background: soloCustomEnabled && hasCustomCards ? "#FF4081" : "rgba(255,255,255,0.08)",
                      boxShadow: "2px 2px 0px #000",
                    }}
                  >
                    <span style={{ ...FONT_BANGERS, fontSize: "0.85rem", letterSpacing: "0.04em" }} className={soloCustomEnabled && hasCustomCards ? "text-white" : "text-white/40"}>
                      {!isAuthenticated ? "N/A" : !hasCustomCards ? "VIDE" : soloCustomEnabled ? "INCLUSES" : "EXCLUES"}
                    </span>
                  </div>
                </motion.button>

                <DeckBreakdown disableT2={soloDisableT2} disableT3={false} isSolo={true} customCards={customCards} customEnabled={soloCustomEnabled && hasCustomCards} />

                {/* ─ Configurations sauvegardées (solo) ─ */}
                {isAuthenticated && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSaveConfigFor("solo"); setShowConfigs(!showConfigs || saveConfigFor !== "solo"); setSaveConfigFor("solo"); }}
                        className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border-[2px] border-white/20 hover:border-yellow-400/60 transition-colors"
                        style={{ background: "rgba(255,255,255,0.05)", ...FONT_FREDOKA }}
                      >
                        <Bookmark className="w-4 h-4 text-yellow-400/70" />
                        <span className="text-white/60 text-sm">
                          {savedConfigs && savedConfigs.length > 0 ? `${savedConfigs.length} config${savedConfigs.length > 1 ? "s" : ""} sauvegardée${savedConfigs.length > 1 ? "s" : ""}` : "Configs sauvegardées"}
                        </span>
                      </button>
                      <button
                        onClick={() => { setSaveConfigFor("solo"); setShowSaveModal(true); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-[2px] border-yellow-400/40 hover:border-yellow-400 transition-colors"
                        style={{ background: "rgba(255,215,0,0.1)", ...FONT_FREDOKA }}
                        title="Sauvegarder cette configuration"
                      >
                        <BookmarkPlus className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm">Sauvegarder</span>
                      </button>
                    </div>

                    {/* Liste des configs sauvegardées */}
                    {showConfigs && saveConfigFor === "solo" && savedConfigs && savedConfigs.length > 0 && (
                      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                        {savedConfigs.map((cfg) => (
                          <div
                            key={cfg.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border-[2px] border-white/15"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            <button
                              onClick={() => handleLoadConfig(cfg)}
                              className="flex-1 text-left"
                            >
                              <div style={{ ...FONT_BANGERS, fontSize: "0.95rem", letterSpacing: "0.04em" }} className="text-white">{cfg.name}</div>
                              <div style={FONT_FREDOKA} className="text-white/40 text-xs">
                                {DIFFICULTIES.find(d => d.key === cfg.difficulty)?.label ?? cfg.difficulty}
                                {cfg.disableT2 ? " · sans contribuable" : ""}
                                {cfg.includeCustom ? " · cartes perso" : ""}
                              </div>
                            </button>
                            <button
                              onClick={() => deleteConfigMutation.mutate({ id: cfg.id })}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400/70 hover:text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {showConfigs && saveConfigFor === "solo" && (!savedConfigs || savedConfigs.length === 0) && (
                      <div style={FONT_FREDOKA} className="text-white/30 text-sm text-center py-2">Aucune configuration sauvegardée</div>
                    )}
                  </div>
                )}

                <div className="relative w-full">
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-[#34C759] -z-10"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2, boxShadow: "7px 7px 0px #000" } as any}
                    whileTap={{ scale: 0.96, y: 2, boxShadow: "3px 3px 0px #000" } as any}
                    onClick={handlePlaySolo}
                    className="w-full py-4 bg-[#34C759] border-[4px] border-black rounded-2xl flex items-center justify-center gap-3 text-white relative overflow-hidden"
                    style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.10em", boxShadow: "5px 5px 0px #000", textShadow: "2px 2px 0px rgba(0,0,0,0.4)" }}
                  >
                    <motion.div
                      className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg]"
                      animate={{ x: ["-100%", "400%"] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
                    />
                    <span className="relative z-10 flex items-center gap-3">
                      <img src={ticketImg} alt="" style={{ width: "1.8rem", filter: "drop-shadow(1px 1px 0px rgba(0,0,0,0.4))" }} />
                      JOUER — {selectedDiff.threshold.toLocaleString("fr-CA")} $
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── CREATE ── */}
            {view === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <button
                  onClick={() => { setView("menu"); resetError(); }}
                  style={FONT_FREDOKA}
                  className="text-yellow-400/70 text-sm text-left hover:text-yellow-400 transition-colors"
                >
                  ← Retour
                </button>

                <div style={{ ...FONT_BANGERS, fontSize: "1.5rem", letterSpacing: "0.06em" }} className="text-yellow-400 text-center">
                  CRÉER UNE PARTIE
                </div>

                {/* Difficulté */}
                <DifficultySelector selected={difficulty} onChange={setDifficulty} />

                {/* Séparateur */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/15" />
                  <span style={FONT_FREDOKA} className="text-white/40 text-xs">Perquisitions</span>
                  <div className="h-px flex-1 bg-white/15" />
                </div>

                <MiniGameLevelSelector selected={miniGameLevel} onChange={setMiniGameLevel} />

                {/* Séparateur */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/15" />
                  <span style={FONT_FREDOKA} className="text-white/40 text-xs">Types de cartes</span>
                  <div className="h-px flex-1 bg-white/15" />
                </div>

                {/* Filtres cartes multi : T2 et T3 */}
                <CardFiltersSection
                  disableT2={mpDisableT2}
                  disableT3={mpDisableT3}
                  onChangeT2={setMpDisableT2}
                  onChangeT3={setMpDisableT3}
                  showT3={true}
                />

                {/* Cartes personnalisées (multi host) — toujours visible */}
                <motion.button
                  whileTap={{ scale: isAuthenticated && hasCustomCards ? 0.97 : 1 }}
                  onClick={() => isAuthenticated && hasCustomCards && setMpCustomEnabled(!mpCustomEnabled)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-[3px] text-left transition-colors"
                  style={{
                    borderColor: mpCustomEnabled && hasCustomCards ? "#FF4081" : "rgba(255,255,255,0.15)",
                    background: mpCustomEnabled && hasCustomCards ? "rgba(255,64,129,0.2)" : "rgba(255,255,255,0.05)",
                    boxShadow: mpCustomEnabled && hasCustomCards ? "3px 3px 0px #000" : "2px 2px 0px rgba(0,0,0,0.3)",
                    cursor: isAuthenticated && hasCustomCards ? "pointer" : "default",
                    opacity: isAuthenticated ? 1 : 0.6,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg border-[2px] border-black flex items-center justify-center flex-shrink-0"
                    style={{ background: mpCustomEnabled && hasCustomCards ? "#FF4081" : "rgba(255,255,255,0.08)", boxShadow: "2px 2px 0px #000" }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ ...FONT_BANGERS, fontSize: "1rem", letterSpacing: "0.05em" }} className={mpCustomEnabled && hasCustomCards ? "text-white" : "text-white/50"}>
                      CARTES PERSONNALISÉES
                    </div>
                    <div style={FONT_FREDOKA} className="text-xs leading-none mt-0.5 text-white/30">
                      {!isAuthenticated
                        ? "Connexion requise pour utiliser vos cartes"
                        : !hasCustomCards
                        ? "Aucune carte créée — Créez-en dans Personnalisation"
                        : `${customCards.length} carte${customCards.length > 1 ? "s" : ""} (host) — partagées avec tous les joueurs`
                      }
                    </div>
                  </div>
                  <div
                    className="flex-shrink-0 px-2.5 py-1 rounded-lg border-[2px] border-black"
                    style={{
                      background: mpCustomEnabled && hasCustomCards ? "#FF4081" : "rgba(255,255,255,0.08)",
                      boxShadow: "2px 2px 0px #000",
                    }}
                  >
                    <span style={{ ...FONT_BANGERS, fontSize: "0.85rem", letterSpacing: "0.04em" }} className={mpCustomEnabled && hasCustomCards ? "text-white" : "text-white/40"}>
                      {!isAuthenticated ? "N/A" : !hasCustomCards ? "VIDE" : mpCustomEnabled ? "INCLUSES" : "EXCLUES"}
                    </span>
                  </div>
                </motion.button>

                <DeckBreakdown disableT2={mpDisableT2} disableT3={mpDisableT3} isSolo={false} customCards={customCards} customEnabled={mpCustomEnabled && hasCustomCards} />

                {/* ─ Configurations sauvegardées (multi) ─ */}
                {isAuthenticated && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSaveConfigFor("multi"); setShowConfigs(!showConfigs || saveConfigFor !== "multi"); }}
                        className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border-[2px] border-white/20 hover:border-yellow-400/60 transition-colors"
                        style={{ background: "rgba(255,255,255,0.05)", ...FONT_FREDOKA }}
                      >
                        <Bookmark className="w-4 h-4 text-yellow-400/70" />
                        <span className="text-white/60 text-sm">
                          {savedConfigs && savedConfigs.length > 0 ? `${savedConfigs.length} config${savedConfigs.length > 1 ? "s" : ""} sauvegardée${savedConfigs.length > 1 ? "s" : ""}` : "Configs sauvegardées"}
                        </span>
                      </button>
                      <button
                        onClick={() => { setSaveConfigFor("multi"); setShowSaveModal(true); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-[2px] border-yellow-400/40 hover:border-yellow-400 transition-colors"
                        style={{ background: "rgba(255,215,0,0.1)", ...FONT_FREDOKA }}
                        title="Sauvegarder cette configuration"
                      >
                        <BookmarkPlus className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm">Sauvegarder</span>
                      </button>
                    </div>

                    {showConfigs && saveConfigFor === "multi" && savedConfigs && savedConfigs.length > 0 && (
                      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                        {savedConfigs.map((cfg) => (
                          <div
                            key={cfg.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border-[2px] border-white/15"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            <button
                              onClick={() => handleLoadConfig(cfg)}
                              className="flex-1 text-left"
                            >
                              <div style={{ ...FONT_BANGERS, fontSize: "0.95rem", letterSpacing: "0.04em" }} className="text-white">{cfg.name}</div>
                              <div style={FONT_FREDOKA} className="text-white/40 text-xs">
                                {DIFFICULTIES.find(d => d.key === cfg.difficulty)?.label ?? cfg.difficulty}
                                {cfg.disableT2 ? " · sans contribuable" : ""}
                                {cfg.disableT3 ? " · sans investisseur" : ""}
                                {cfg.includeCustom ? " · cartes perso" : ""}
                              </div>
                            </button>
                            <button
                              onClick={() => deleteConfigMutation.mutate({ id: cfg.id })}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400/70 hover:text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {showConfigs && saveConfigFor === "multi" && (!savedConfigs || savedConfigs.length === 0) && (
                      <div style={FONT_FREDOKA} className="text-white/30 text-sm text-center py-2">Aucune configuration sauvegardée</div>
                    )}
                  </div>
                )}

                {/* Prénom */}
                <div className="flex flex-col gap-1">
                  <label style={FONT_FREDOKA} className="text-white/70 text-sm">Ton prénom</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 16))}
                    placeholder="Ex: Alice"
                    maxLength={16}
                    className="w-full px-4 py-3 rounded-xl border-[3px] border-black text-black text-lg outline-none"
                    style={{ ...FONT_FREDOKA, boxShadow: "3px 3px 0px #000", background: "#fffbe6" }}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                </div>

                {error && (
                  <div style={{ ...FONT_FREDOKA, background: "#FF3B30" }} className="text-white text-sm text-center px-3 py-2 rounded-xl border-[2px] border-black">
                    {error}
                  </div>
                )}

                <div className="relative w-full">
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-[#007AFF] -z-10"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2, boxShadow: "7px 7px 0px #000" } as any}
                    whileTap={{ scale: 0.96, y: 2, boxShadow: "3px 3px 0px #000" } as any}
                    onClick={handleCreate}
                    disabled={loading}
                    className="w-full py-4 bg-[#007AFF] border-[4px] border-black rounded-2xl text-white disabled:opacity-50 relative overflow-hidden"
                    style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.10em", boxShadow: "5px 5px 0px #000", textShadow: "2px 2px 0px rgba(0,0,0,0.4)" }}
                  >
                    <motion.div
                      className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg]"
                      animate={{ x: ["-100%", "400%"] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
                    />
                    <span className="relative z-10">
                      {loading ? "CRÉATION..." : "CRÉER LA PARTIE"}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── JOIN ── */}
            {view === "join" && (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
              >
                <button
                  onClick={() => { setView("menu"); resetError(); }}
                  style={FONT_FREDOKA}
                  className="text-yellow-400/70 text-sm text-left hover:text-yellow-400 transition-colors"
                >
                  ← Retour
                </button>

                <div style={{ ...FONT_BANGERS, fontSize: "1.5rem", letterSpacing: "0.06em" }} className="text-yellow-400 text-center">
                  REJOINDRE
                </div>

                <div className="flex flex-col gap-1">
                  <label style={FONT_FREDOKA} className="text-white/70 text-sm">Code de la partie</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="Ex: ABC123"
                    maxLength={6}
                    className="w-full px-4 py-3 rounded-xl border-[3px] border-black text-black text-2xl text-center outline-none tracking-widest uppercase"
                    style={{ ...FONT_BANGERS, boxShadow: "3px 3px 0px #000", background: "#fffbe6" }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label style={FONT_FREDOKA} className="text-white/70 text-sm">Ton prénom</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 16))}
                    placeholder="Ex: Bob"
                    maxLength={16}
                    className="w-full px-4 py-3 rounded-xl border-[3px] border-black text-black text-lg outline-none"
                    style={{ ...FONT_FREDOKA, boxShadow: "3px 3px 0px #000", background: "#fffbe6" }}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  />
                </div>

                {error && (
                  <div style={{ ...FONT_FREDOKA, background: "#FF3B30" }} className="text-white text-sm text-center px-3 py-2 rounded-xl border-[2px] border-black">
                    {error}
                  </div>
                )}

                <div className="relative w-full">
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-[#AF52DE] -z-10"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.04, y: -2, boxShadow: "7px 7px 0px #000" } as any}
                    whileTap={{ scale: 0.96, y: 2, boxShadow: "3px 3px 0px #000" } as any}
                    onClick={handleJoin}
                    disabled={loading}
                    className="w-full py-4 border-[4px] border-black rounded-2xl text-white disabled:opacity-50 relative overflow-hidden"
                    style={{ ...FONT_BANGERS, fontSize: "1.6rem", letterSpacing: "0.10em", background: "#9C27B0", boxShadow: "5px 5px 0px #000", textShadow: "2px 2px 0px rgba(0,0,0,0.4)" }}
                  >
                    <motion.div
                      className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg]"
                      animate={{ x: ["-100%", "400%"] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
                    />
                    <span className="relative z-10">
                      {loading ? "CONNEXION..." : "REJOINDRE"}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Bottom spacing pour safe area */}
        <div className="h-4" />
      </motion.div>

      {/* ─ Modal de sauvegarde de configuration ─ */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={(e) => e.target === e.currentTarget && setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border-[4px] border-black p-5 flex flex-col gap-4"
              style={{ background: "#1a1a2e", boxShadow: "6px 6px 0px #000" }}
            >
              <div style={{ ...FONT_BANGERS, fontSize: "1.3rem", letterSpacing: "0.06em" }} className="text-yellow-400 text-center">
                SAUVEGARDER LA CONFIG
              </div>
              <div style={FONT_FREDOKA} className="text-white/50 text-xs text-center">
                Mode {saveConfigFor === "solo" ? "Solo" : "Multijoueur"} · {selectedDiff.label}
              </div>
              <input
                type="text"
                value={saveConfigName}
                onChange={(e) => setSaveConfigName(e.target.value.slice(0, 30))}
                placeholder="Nom de la configuration..."
                maxLength={30}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border-[3px] border-black text-black text-base outline-none"
                style={{ ...FONT_FREDOKA, boxShadow: "3px 3px 0px #000", background: "#fffbe6" }}
                onKeyDown={(e) => e.key === "Enter" && handleSaveConfig()}
              />
              {saveConfigMutation.error && (
                <div style={{ ...FONT_FREDOKA, background: "#FF3B30" }} className="text-white text-sm text-center px-3 py-2 rounded-xl border-[2px] border-black">
                  {saveConfigMutation.error.message}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-3 rounded-xl border-[3px] border-white/20 text-white/60 hover:border-white/40 transition-colors"
                  style={{ ...FONT_FREDOKA, background: "rgba(255,255,255,0.05)" }}
                >
                  Annuler
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSaveConfig}
                  disabled={!saveConfigName.trim() || saveConfigMutation.isPending}
                  className="flex-1 py-3 rounded-xl border-[3px] border-black text-black disabled:opacity-50"
                  style={{ ...FONT_BANGERS, fontSize: "1.1rem", letterSpacing: "0.05em", background: "#FFD700", boxShadow: "3px 3px 0px #000" }}
                >
                  {saveConfigMutation.isPending ? "SAUVEGARDE..." : "SAUVEGARDER"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
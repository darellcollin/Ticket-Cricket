/**
 * CardConfigEditor — Éditeur visuel carte par carte
 * Route : /config-cartes
 *
 * Flux :
 *  1. L'utilisateur voit la carte en grand + son numéro
 *  2. Il choisit T1 / T2 / T3 avec de gros boutons
 *  3. Il entre les prix (champs adaptés au type)
 *  4. Il clique "Suivant →"
 *  5. À la fin, "Générer le code" → bloc CARD_DATA prêt à coller
 *
 * Sauvegarde automatique dans localStorage (travail en cours uniquement).
 * Le résultat final est collé dans cardConfig.ts par le développeur.
 */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Home, Copy, Check, RotateCcw, Code } from "lucide-react";
import { getCardConfig } from "@/game/utils/cardConfig";
import { GeneratedCard } from "@/game/components/GeneratedCard";

// ─── Types locaux ────────────────────────────────────────────────────────────

type CardTypeNum = 1 | 2 | 3;

interface EntryDraft {
  cardType:    CardTypeNum;
  ticketPrice: string; // string pour l'input
  frais:       string;
  impots:      string;
  taxe:        string;
}

type SavedData = Record<number, EntryDraft>;

const STORAGE_KEY = "tc2026_card_config_editor";
const TOTAL       = 324;

const DEFAULT_DRAFT: EntryDraft = {
  cardType: 1, ticketPrice: "", frais: "", impots: "", taxe: "",
};

// ─── Persistance locale ───────────────────────────────────────────────────────

function loadSaved(): SavedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveToDisk(data: SavedData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ─── Génération du code ───────────────────────────────────────────────────────

function category(id: number): string {
  if (id <= 108)  return "contravention";
  if (id <= 216)  return "contribuable";
  return "investisseur";
}

function generateCode(data: SavedData): string {
  const lines: string[] = [];
  for (let id = 1; id <= TOTAL; id++) {
    const d = data[id];
    if (!d) continue;
    const cat = category(id);
    let line = `  ${id}: { category:"${cat}", cardType:${d.cardType}, ticketPrice:${d.ticketPrice || 0}`;
    if (d.cardType === 1 && d.frais)  line += `, frais:${d.frais}`;
    if (d.cardType === 2 && d.impots) line += `, impots:${d.impots}`;
    if (d.cardType === 3 && d.taxe)   line += `, taxe:${d.taxe}`;
    line += " },";
    lines.push(line);
  }
  return lines.join("\n");
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function CardConfigEditor() {
  const [, navigate] = useLocation();

  const [saved,     setSaved]   = useState<SavedData>(() => loadSaved());
  const [cardNum,   setCardNum] = useState(1);
  const [draft,     setDraft]   = useState<EntryDraft>(() => loadSaved()[1] ?? { ...DEFAULT_DRAFT });
  const [showCode,  setShowCode]  = useState(false);
  const [copied,    setCopied]    = useState(false);
  const [skipBlank, setSkipBlank] = useState(false);

  const cardCfg    = getCardConfig(cardNum);
  const configured = saved[cardNum] !== undefined;
  const doneCount  = Object.keys(saved).length;
  const progress   = Math.round((doneCount / TOTAL) * 100);

  // Charge le brouillon quand on change de carte
  useEffect(() => {
    setDraft(saved[cardNum] ?? { ...DEFAULT_DRAFT });
  }, [cardNum]);

  // ── Actions ────────────────────────────────────────────────────────────────

  function updateDraft(field: keyof EntryDraft, value: string | CardTypeNum) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function saveAndGo(direction: 1 | -1) {
    // Sauvegarde carte courante
    const newSaved = { ...saved, [cardNum]: { ...draft } };
    setSaved(newSaved);
    saveToDisk(newSaved);

    // Navigue
    let next = cardNum + direction;
    if (skipBlank && direction === 1) {
      while (next <= TOTAL && newSaved[next]) next++;
    }
    next = Math.max(1, Math.min(TOTAL, next));
    setCardNum(next);
  }

  function skipCard() {
    let next = cardNum + 1;
    if (skipBlank) {
      while (next <= TOTAL && saved[next]) next++;
    }
    next = Math.min(TOTAL, next);
    setCardNum(next);
  }

  function resetCard() {
    const newSaved = { ...saved };
    delete newSaved[cardNum];
    setSaved(newSaved);
    saveToDisk(newSaved);
    setDraft({ ...DEFAULT_DRAFT });
  }

  function copyCode() {
    const code = generateCode(saved);
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  // ── Mise en page ───────────────────────────────────────────────────────────

  const typeColors: Record<CardTypeNum, { bg: string; border: string; text: string }> = {
    1: { bg: "#DC2626", border: "#991B1B", text: "#fff" },
    2: { bg: "#16A34A", border: "#14532D", text: "#fff" },
    3: { bg: "#7C3AED", border: "#4C1D95", text: "#fff" },
  };
  const typeLabels: Record<CardTypeNum, { icon: string; title: string; desc: string }> = {
    1: { icon: "📈", title: "T1 — Ticket",    desc: "Ticket + frais optionnel → dette du piocheur" },
    2: { icon: "📉", title: "T2 — Impôts",    desc: "Réduit la dette du piocheur" },
    3: { icon: "➡️", title: "T3 — Transfert", desc: "Ticket → joueur suivant | Taxe → réduit le piocheur" },
  };

  const catColor = cardNum <= 108 ? "#DC2626" : cardNum <= 216 ? "#D97706" : "#7C3AED";
  const catLabel = cardNum <= 108 ? "🚨 Contravention" : cardNum <= 216 ? "📋 Contribuable" : "💼 Investisseur";

  // ── Rendu ──────────────────────────────────────────────────────────────────

  if (showCode) {
    const code = generateCode(saved);
    return (
      <div
        className="min-h-[100dvh] max-w-md mx-auto flex flex-col"
        style={{ background: "#0a0a0a" }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b-[3px] border-yellow-400 bg-black flex-shrink-0">
          <button
            onClick={() => setShowCode(false)}
            className="w-10 h-10 bg-yellow-400 border-[3px] border-black rounded-xl flex items-center justify-center"
            style={{ boxShadow: "3px 3px 0 #000" }}
          >
            <ChevronLeft className="w-5 h-5 text-black" />
          </button>
          <div className="flex-1 text-center">
            <div className="text-yellow-400 font-black text-lg" style={{ fontFamily: "'Bangers', cursive", letterSpacing: "0.05em" }}>
              CODE GÉNÉRÉ
            </div>
            <div className="text-white/40 text-xs" style={{ fontFamily: "'Fredoka One', cursive" }}>
              {doneCount} cartes configurées
            </div>
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border-[3px] border-black"
            style={{
              background: copied ? "#22c55e" : "#FFD700",
              boxShadow: "3px 3px 0 #000",
              fontFamily: "'Bangers', cursive",
            }}
          >
            {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-black" />}
            <span className={`text-sm font-black ${copied ? "text-white" : "text-black"}`}>
              {copied ? "COPIÉ !" : "COPIER"}
            </span>
          </button>
        </div>

        {/* Instruction */}
        <div className="px-4 py-3 bg-blue-900/30 border-b border-blue-400/20 flex-shrink-0">
          <p className="text-blue-300 text-xs text-center leading-relaxed" style={{ fontFamily: "'Fredoka One', cursive" }}>
            📋 Copie ce code et envoie-le au développeur.<br />
            Il remplacera le contenu de <code className="text-yellow-400">CARD_DATA</code> dans <code className="text-yellow-400">cardConfig.ts</code>
          </p>
        </div>

        {/* Code block */}
        <div className="flex-1 overflow-y-auto p-4">
          <pre
            className="text-green-400 text-xs leading-relaxed break-all whitespace-pre-wrap rounded-xl border border-green-400/20 p-4"
            style={{ background: "rgba(0,255,100,0.04)", fontFamily: "monospace", fontSize: "0.62rem" }}
          >
            {code || "// Aucune carte configurée pour l'instant"}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] max-w-md mx-auto flex flex-col"
      style={{ background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 100%)" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b-[3px] border-yellow-400 bg-black/40 flex-shrink-0">
        <button
          onClick={() => window.history.back()}
          className="w-9 h-9 bg-yellow-400 border-[3px] border-black rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: "3px 3px 0 #000" }}
        >
          <Home className="w-4 h-4 text-black" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-yellow-400 font-black leading-none" style={{ fontFamily: "'Bangers', cursive", fontSize: "1rem", letterSpacing: "0.05em" }}>
            CONFIGURER LES CARTES
          </div>
          <div className="text-white/40 text-xs leading-none mt-0.5" style={{ fontFamily: "'Fredoka One', cursive" }}>
            {doneCount}/{TOTAL} configurées
          </div>
        </div>

        {/* Bouton code */}
        <button
          onClick={() => setShowCode(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-[3px] border-black bg-white/10"
          style={{ boxShadow: "3px 3px 0 #000", fontFamily: "'Bangers', cursive" }}
        >
          <Code className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm">CODE</span>
        </button>
      </div>

      {/* ── Barre de progression ── */}
      <div className="h-2 bg-white/10 flex-shrink-0">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg, #DC2626, #22c55e)" }}
        />
      </div>

      {/* ── Corps scrollable ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

        {/* Numéro + catégorie */}
        <div className="flex items-center justify-between">
          <div>
            <span
              className="text-white font-black"
              style={{ fontFamily: "'Bangers', cursive", fontSize: "2.5rem", letterSpacing: "0.05em", lineHeight: 1 }}
            >
              #{String(cardNum).padStart(3, "0")}
            </span>
            <div
              className="inline-block ml-2 px-2 py-0.5 rounded-full border-[2px] border-black text-white text-xs font-bold"
              style={{ fontFamily: "'Bangers', cursive", background: catColor, fontSize: "0.7rem", letterSpacing: "0.03em" }}
            >
              {catLabel}
            </div>
          </div>
          {configured && (
            <span className="text-green-400 text-xl">✅</span>
          )}
        </div>

        {/* ── Image de la carte ── */}
        <div className="flex justify-center">
          <div
            className="rounded-2xl border-4 overflow-hidden"
            style={{
              width: "160px",
              aspectRatio: "5/7",
              borderColor: catColor,
              background: "#111827",
              boxShadow: "5px 5px 0 #000",
            }}
          >
            <GeneratedCard card={cardCfg} size="sm" style={{ width: '100%', height: '100%' }} />
          </div>
        </div>

        {/* ── Sélecteur de type ── */}
        <div className="flex flex-col gap-2">
          <span className="text-white/50 text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Type de carte
          </span>
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 3] as CardTypeNum[]).map((t) => {
              const col = typeColors[t];
              const lab = typeLabels[t];
              const sel = draft.cardType === t;
              return (
                <button
                  key={t}
                  onClick={() => updateDraft("cardType", t)}
                  className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-[3px] transition-transform active:scale-95"
                  style={{
                    borderColor: sel ? col.border : "rgba(255,255,255,0.1)",
                    background:  sel ? col.bg     : "rgba(255,255,255,0.05)",
                    boxShadow:   sel ? "3px 3px 0 #000" : "none",
                  }}
                >
                  <span className="text-xl">{lab.icon}</span>
                  <span className="text-white font-black text-sm leading-none" style={{ fontFamily: "'Bangers', cursive", letterSpacing: "0.04em" }}>
                    {t === 1 ? "T1" : t === 2 ? "T2" : "T3"}
                  </span>
                  <span className="text-white/60 text-center leading-tight" style={{ fontFamily: "'Fredoka One', cursive", fontSize: "0.55rem" }}>
                    {lab.title.split("—")[1]?.trim()}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Description du type sélectionné */}
          <div
            className="rounded-xl border-[2px] px-3 py-2"
            style={{
              borderColor: typeColors[draft.cardType].bg + "66",
              background:  typeColors[draft.cardType].bg + "15",
            }}
          >
            <p className="text-white/70 text-xs text-center" style={{ fontFamily: "'Fredoka One', cursive" }}>
              {typeLabels[draft.cardType].desc}
            </p>
          </div>
        </div>

        {/* ── Champs de prix (adaptatifs) ── */}
        <div className="flex flex-col gap-3">
          <span className="text-white/50 text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Montants ($)
          </span>

          {/* T1 : ticket + frais optionnel */}
          {draft.cardType === 1 && (
            <div className="flex flex-col gap-2">
              <PriceInput
                label="💵 Ticket (dette du piocheur)"
                value={draft.ticketPrice}
                onChange={(v) => updateDraft("ticketPrice", v)}
                placeholder="ex: 150"
                color="#DC2626"
                required
              />
              <PriceInput
                label="📄 Frais additionnels (optionnel)"
                value={draft.frais}
                onChange={(v) => updateDraft("frais", v)}
                placeholder="ex: 50 — laisser vide si aucun"
                color="#0891B2"
              />
            </div>
          )}

          {/* T2 : impôts optionnel */}
          {draft.cardType === 2 && (
            <div className="flex flex-col gap-2">
              <PriceInput
                label="📉 Impôts = réduction de dette (optionnel)"
                value={draft.impots}
                onChange={(v) => updateDraft("impots", v)}
                placeholder="ex: 75 — laisser vide si aucun"
                color="#16A34A"
              />
              <p className="text-white/30 text-xs text-center" style={{ fontFamily: "'Fredoka One', cursive" }}>
                T2 sans impôts = carte "effet neutre"
              </p>
            </div>
          )}

          {/* T3 : ticket (suivant) + taxe optionnelle (réduction piocheur) */}
          {draft.cardType === 3 && (
            <div className="flex flex-col gap-2">
              <PriceInput
                label="➡️ Ticket du joueur SUIVANT"
                value={draft.ticketPrice}
                onChange={(v) => updateDraft("ticketPrice", v)}
                placeholder="ex: 500"
                color="#7C3AED"
                required
              />
              <PriceInput
                label="✅ Taxe = réduction du PIOCHEUR (optionnel)"
                value={draft.taxe}
                onChange={(v) => updateDraft("taxe", v)}
                placeholder="ex: 100 — laisser vide si aucune"
                color="#16A34A"
              />
            </div>
          )}
        </div>

        {/* ── Option passer les configurées ── */}
        <button
          onClick={() => setSkipBlank((v) => !v)}
          className="flex items-center gap-2 self-start"
        >
          <div
            className="w-5 h-5 rounded border-[2px] border-white/20 flex items-center justify-center"
            style={{ background: skipBlank ? "#22c55e" : "transparent" }}
          >
            {skipBlank && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className="text-white/50 text-xs" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Passer automatiquement les cartes déjà configurées
          </span>
        </button>
      </div>

      {/* ── Barre d'actions (fixe en bas) ── */}
      <div className="px-4 py-3 border-t-[3px] border-white/10 bg-black/30 flex flex-col gap-2 flex-shrink-0">
        {/* Ligne 1 : Précédent / Passer / Réinitialiser */}
        <div className="flex gap-2">
          <button
            onClick={() => { const n = Math.max(1, cardNum - 1); setCardNum(n); }}
            disabled={cardNum === 1}
            className="px-3 py-2 rounded-xl border-[3px] border-black bg-white/10 disabled:opacity-30 flex items-center gap-1"
            style={{ boxShadow: "3px 3px 0 #000", fontFamily: "'Bangers', cursive" }}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
            <span className="text-white text-sm">Préc.</span>
          </button>

          <button
            onClick={skipCard}
            disabled={cardNum === TOTAL}
            className="flex-1 py-2 rounded-xl border-[3px] border-black bg-white/10 disabled:opacity-30"
            style={{ boxShadow: "3px 3px 0 #000", fontFamily: "'Bangers', cursive" }}
          >
            <span className="text-white/60 text-sm">⏭ Passer sans sauvegarder</span>
          </button>

          <button
            onClick={resetCard}
            className="w-10 h-10 rounded-xl border-[3px] border-black bg-red-600/20 flex items-center justify-center"
            style={{ boxShadow: "3px 3px 0 #000" }}
            title="Réinitialiser cette carte"
          >
            <RotateCcw className="w-4 h-4 text-red-400" />
          </button>
        </div>

        {/* Ligne 2 : Sauvegarder + Suivant (gros bouton principal) */}
        <div className="flex gap-2">
          {/* Navigation directe */}
          <div className="flex items-center gap-1 px-2 rounded-xl border-[2px] border-white/10 bg-white/5">
            <span className="text-white/30 text-xs" style={{ fontFamily: "'Fredoka One', cursive" }}>#</span>
            <input
              type="number"
              min={1}
              max={TOTAL}
              value={cardNum}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (v >= 1 && v <= TOTAL) setCardNum(v);
              }}
              className="w-14 text-center text-yellow-400 font-black text-base bg-transparent border-none outline-none"
              style={{ fontFamily: "'Bangers', cursive" }}
            />
            <span className="text-white/20 text-xs" style={{ fontFamily: "'Fredoka One', cursive" }}>/{TOTAL}</span>
          </div>

          <button
            onClick={() => saveAndGo(1)}
            className="flex-1 py-3 rounded-xl border-[3px] border-black flex items-center justify-center gap-2"
            style={{
              background: "#22c55e",
              boxShadow: "4px 4px 0 #000",
              fontFamily: "'Bangers', cursive",
            }}
          >
            <span className="text-white text-lg tracking-wide">
              {cardNum === TOTAL ? "💾 SAUVEGARDER" : "✅ SAUVEGARDER & SUIVANT"}
            </span>
            {cardNum < TOTAL && <ChevronRight className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Composant champ de prix ────────────────────────────────────────────────────

function PriceInput({
  label, value, onChange, placeholder, color, required,
}: {
  label:       string;
  value:       string;
  onChange:    (v: string) => void;
  placeholder: string;
  color:       string;
  required?:   boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-white/70 text-xs" style={{ fontFamily: "'Fredoka One', cursive" }}>
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="flex items-center gap-2">
        <div
          className="flex-1 flex items-center rounded-xl border-[3px] overflow-hidden"
          style={{ borderColor: value ? color : "rgba(255,255,255,0.15)", background: value ? color + "15" : "rgba(255,255,255,0.05)", boxShadow: "3px 3px 0 #000" }}
        >
          <span className="px-3 text-white/40 text-sm font-mono">$</span>
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-white text-base font-bold py-3 pr-3 outline-none placeholder:text-white/20"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          />
        </div>
        {value && (
          <button
            onClick={() => onChange("")}
            className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white/40 text-sm"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

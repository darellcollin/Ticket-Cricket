/**
 * Écran de vérification de l'ordre des cartes.
 * Affiche une carte à la fois ou en grille pour confirmer que
 * Carte #N dans l'app = "Cartes (N)" sur l'ordinateur.
 */
import { useState } from "react";
import { ChevronLeft, ChevronRight, Home, Grid, Maximize } from "lucide-react";
import { useLocation } from "wouter";
import { getCardAssetUrl } from "@/game/utils/cardAssets";

const TOTAL = 324;

// ── Vue unique (une carte à la fois) ────────────────────────────────────────
function SingleView({ num, setNum }: { num: number; setNum: (n: number) => void }) {
  const imgUrl = getCardAssetUrl(num);

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-4 flex-1">
      {/* Numéro + nom fichier */}
      <div className="text-center">
        <div className="text-5xl font-black text-yellow-400" style={{ fontFamily: "'Bangers', cursive", letterSpacing: "0.05em" }}>
          #{num}
        </div>
        <div className="text-white/60 text-sm mt-1" style={{ fontFamily: "'Fredoka One', cursive" }}>
          = fichier <span className="text-yellow-300 font-bold">"Cartes ({num})"</span> sur ton ordi
        </div>
      </div>

      {/* Image grande */}
      <div
        className="w-full max-w-[240px] rounded-2xl border-4 border-yellow-400 overflow-hidden"
        style={{ aspectRatio: "5/7", background: "#111827", boxShadow: "4px 4px 0 #000" }}
      >
        {imgUrl
          ? <img src={imgUrl} alt={`Carte ${num}`} className="w-full h-full object-contain" />
          : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/20 text-4xl">?</span>
            </div>
          )
        }
      </div>

      {/* Navigation gauche/droite */}
      <div className="flex items-center gap-4 w-full max-w-[280px]">
        <button
          onClick={() => setNum(Math.max(1, num - 1))}
          disabled={num === 1}
          className="flex-1 py-3 rounded-xl border-[3px] border-black bg-white/10 disabled:opacity-30 active:scale-95 transition-transform flex items-center justify-center gap-2"
          style={{ boxShadow: "3px 3px 0 #000" }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
          <span className="text-white font-bold" style={{ fontFamily: "'Bangers', cursive" }}>PRÉC.</span>
        </button>

        {/* Input direct */}
        <input
          type="number"
          min={1}
          max={TOTAL}
          value={num}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (v >= 1 && v <= TOTAL) setNum(v);
          }}
          className="w-20 text-center text-yellow-400 font-black text-xl rounded-xl border-[3px] border-yellow-400 bg-black/40 py-2"
          style={{ fontFamily: "'Bangers', cursive", outline: "none" }}
        />

        <button
          onClick={() => setNum(Math.min(TOTAL, num + 1))}
          disabled={num === TOTAL}
          className="flex-1 py-3 rounded-xl border-[3px] border-black bg-yellow-400 disabled:opacity-30 active:scale-95 transition-transform flex items-center justify-center gap-2"
          style={{ boxShadow: "3px 3px 0 #000" }}
        >
          <span className="text-black font-bold" style={{ fontFamily: "'Bangers', cursive" }}>SUIV.</span>
          <ChevronRight className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Barre de progression */}
      <div className="w-full max-w-[280px]">
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all"
            style={{ width: `${(num / TOTAL) * 100}%` }}
          />
        </div>
        <div className="text-center text-white/30 text-xs mt-1" style={{ fontFamily: "'Fredoka One', cursive" }}>
          {num} / {TOTAL}
        </div>
      </div>

      {/* Rappel format */}
      <div className="w-full max-w-[280px] rounded-xl border-[2px] border-white/10 bg-white/5 p-3">
        <p className="text-white/50 text-xs text-center leading-relaxed" style={{ fontFamily: "'Fredoka One', cursive" }}>
          📝 Pour m'envoyer les infos de cette carte :
        </p>
        <p className="text-green-400 text-xs text-center mt-1 font-mono">
          {num} | T1 | 150 | frais:50<br />
          {num} | T2 | impots:75<br />
          {num} | T3 | 500 | taxe:100
        </p>
      </div>
    </div>
  );
}

// ── Vue grille (20 cartes) ───────────────────────────────────────────────────
const GRID_PAGE = 20;

function GridView({ onSelectCard }: { onSelectCard: (n: number) => void }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(TOTAL / GRID_PAGE);
  const start = page * GRID_PAGE + 1;
  const end   = Math.min(start + GRID_PAGE - 1, TOTAL);
  const cards = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Navigation de lot */}
      <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-3 py-1.5 rounded-lg border-[2px] border-black bg-white/10 disabled:opacity-30 text-white text-sm"
          style={{ fontFamily: "'Bangers', cursive", boxShadow: "2px 2px 0 #000" }}
        >
          ◀ LOT PRÉC.
        </button>

        <div className="flex-1 text-center">
          <span className="text-yellow-400 font-bold text-sm" style={{ fontFamily: "'Bangers', cursive" }}>
            Lot {page + 1}/{totalPages} — Cartes ({start}) à ({end})
          </span>
        </div>

        <button
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page === totalPages - 1}
          className="px-3 py-1.5 rounded-lg border-[2px] border-black bg-yellow-400 disabled:opacity-30 text-black text-sm"
          style={{ fontFamily: "'Bangers', cursive", boxShadow: "2px 2px 0 #000" }}
        >
          LOT SUIV. ▶
        </button>
      </div>

      {/* Grille */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="grid grid-cols-4 gap-2">
          {cards.map((num) => {
            const imgUrl = getCardAssetUrl(num);
            return (
              <button
                key={num}
                onClick={() => onSelectCard(num)}
                className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
              >
                <div
                  className="w-full rounded-xl border-[2px] border-white/20 overflow-hidden"
                  style={{ aspectRatio: "5/7", background: "#111827", boxShadow: "2px 2px 0 #000" }}
                >
                  {imgUrl
                    ? <img src={imgUrl} alt={`Carte ${num}`} className="w-full h-full object-contain" />
                    : <div className="w-full h-full flex items-center justify-center"><span className="text-white/20 text-xs">?</span></div>
                  }
                </div>
                <span className="text-yellow-400 text-xs font-bold leading-none" style={{ fontFamily: "'Bangers', cursive" }}>
                  #{num}
                </span>
                <span className="text-white/30 text-[0.5rem] leading-none" style={{ fontFamily: "'Fredoka One', cursive" }}>
                  Cartes ({num})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Écran principal ──────────────────────────────────────────────────────────
export function TestCarteScreen() {
  const [, navigate] = useLocation();
  const [mode, setMode]   = useState<"single" | "grid">("single");
  const [cardNum, setCardNum] = useState(1);

  return (
    <div
      className="min-h-[100dvh] max-w-md mx-auto flex flex-col"
      style={{ background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b-[3px] border-yellow-400 bg-black/30 flex-shrink-0">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 bg-yellow-400 border-[3px] border-black rounded-xl flex items-center justify-center"
          style={{ boxShadow: "3px 3px 0 #000" }}
        >
          <Home className="w-5 h-5 text-black" />
        </button>

        <div className="flex-1 text-center">
          <div className="text-yellow-400 leading-none" style={{ fontFamily: "'Bangers', cursive", fontSize: "1.1rem", letterSpacing: "0.05em" }}>
            VÉRIFICATION DES CARTES
          </div>
          <div className="text-white/40 text-xs leading-none mt-0.5" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Carte #N dans l'app = "Cartes (N)" sur ton ordi
          </div>
        </div>

        {/* Toggle vue */}
        <div className="flex gap-1">
          <button
            onClick={() => setMode("single")}
            className="w-10 h-10 rounded-xl border-[2px] border-black flex items-center justify-center"
            style={{
              background: mode === "single" ? "#FFD700" : "rgba(255,255,255,0.1)",
              boxShadow: "2px 2px 0 #000",
            }}
          >
            <Maximize className={`w-5 h-5 ${mode === "single" ? "text-black" : "text-white/50"}`} />
          </button>
          <button
            onClick={() => setMode("grid")}
            className="w-10 h-10 rounded-xl border-[2px] border-black flex items-center justify-center"
            style={{
              background: mode === "grid" ? "#FFD700" : "rgba(255,255,255,0.1)",
              boxShadow: "2px 2px 0 #000",
            }}
          >
            <Grid className={`w-5 h-5 ${mode === "grid" ? "text-black" : "text-white/50"}`} />
          </button>
        </div>
      </div>

      {/* Bannière explicative */}
      <div className="px-4 py-2 bg-green-900/40 border-b border-green-400/20 flex-shrink-0">
        <p className="text-green-300 text-xs text-center" style={{ fontFamily: "'Fredoka One', cursive" }}>
          ✅ Mapping déjà en place — Vérifie juste que l'image #1 = ton fichier "Cartes (1)"
        </p>
      </div>

      {/* Contenu selon le mode */}
      {mode === "single"
        ? <SingleView num={cardNum} setNum={setCardNum} />
        : <GridView onSelectCard={(n) => { setCardNum(n); setMode("single"); }} />
      }

      {/* Footer — format de saisie */}
      <div className="px-4 py-3 bg-black/30 border-t border-white/10 flex-shrink-0">
        <p className="text-white/40 text-xs text-center" style={{ fontFamily: "'Fredoka One', cursive" }}>
          Format à m'envoyer (par numéro) :
        </p>
        <p className="text-green-400 text-xs text-center font-mono mt-1">
          1 | T1 | 150 | frais:50 &nbsp;•&nbsp; 2 | T2 | impots:75 &nbsp;•&nbsp; 3 | T3 | 500 | taxe:100
        </p>
      </div>
    </div>
  );
}

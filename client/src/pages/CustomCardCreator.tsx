/**
 * CustomCardCreator — Création et gestion des cartes personnalisées.
 * Accessible depuis le catalogue des cartes (bouton "Mes cartes").
 * Requiert un compte de jeu connecté.
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "wouter";
import {
  Plus, Trash2, ArrowLeft, ChevronRight,
  Lock, CheckCircle2, AlertCircle, Sparkles,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useGameAuth } from "@/hooks/useGameAuth";
import { GeneratedCard } from "@/game/components/GeneratedCard";
import { AccountModal } from "@/game/components/AccountModal";
import type { CardConfig, CardCategory } from "@/game/utils/cardConfig";

const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive", letterSpacing: "0.06em" };
const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };

const CATEGORY_LABELS: Record<CardCategory, string> = {
  contravention: "Contravention",
  contribuable: "Contribuable",
  investisseur: "Investisseur",
};

const CATEGORY_COLORS: Record<CardCategory, { bg: string; text: string; border: string }> = {
  contravention: { bg: "#FFD700", text: "#000", border: "#FF8C00" },
  contribuable:  { bg: "#00E676", text: "#000", border: "#009624" },
  investisseur:  { bg: "#FF4081", text: "#fff", border: "#C2185B" },
};

const FEE_OPTIONS = [0, 10, 20, 30, 40, 50] as const;
type FeeOption = typeof FEE_OPTIONS[number];

const MAX_CARDS = 100;

// ─── Convertir une carte DB en CardConfig pour la prévisualisation ───────────
function dbCardToConfig(card: {
  id: number;
  category: CardCategory;
  ticketPrice: number;
  frais: number;
  impots: number;
  taxe: number;
  mefait?: string | null;
}): CardConfig {
  if (card.category === "contravention") {
    return { id: card.id, category: "contravention", cardType: 1, ticketPrice: card.ticketPrice, frais: card.frais || undefined };
  } else if (card.category === "contribuable") {
    return { id: card.id, category: "contribuable", cardType: 2, ticketPrice: 0, impots: card.impots || undefined };
  } else {
    return { id: card.id, category: "investisseur", cardType: 3, ticketPrice: card.ticketPrice, taxe: card.taxe || undefined };
  }
}

// ─── Construire un CardConfig de prévisualisation depuis le formulaire ────────
function buildPreviewCard(
  category: CardCategory,
  ticketPrice: number,
  frais: FeeOption,
  impots: FeeOption,
  taxe: FeeOption,
): CardConfig {
  if (category === "contravention") {
    return { id: 9999, category: "contravention", cardType: 1, ticketPrice, frais: frais || undefined };
  } else if (category === "contribuable") {
    return { id: 9999, category: "contribuable", cardType: 2, ticketPrice: 0, impots: impots || undefined };
  } else {
    return { id: 9999, category: "investisseur", cardType: 3, ticketPrice, taxe: taxe || undefined };
  }
}

// ─── Injecter le méfait dans le rendu de la carte via override ───────────────
// On utilise un patch temporaire de getCardMefait via un module override
// En pratique, GeneratedCard appelle getCardMefait(card.id). Pour la preview,
// La prévisualisation utilise un overlay pour afficher le méfait personnalisé
// (GeneratedCard retourne undefined pour id=9999, l'overlay prend le relais)

// ─── Composant prévisualisation avec méfait personnalisé ─────────────────────
function PreviewCard({
  cardConfig,
  mefait,
}: {
  cardConfig: CardConfig;
  mefait: string;
}) {
  // On utilise GeneratedCard mais on override le méfait via CSS/overlay
  // En réalité, GeneratedCard appelle getCardMefait(card.id) qui retourne undefined pour id=9999
  // On va donc créer un wrapper qui affiche la carte et superpose le texte du méfait

  return (
    <div className="relative" style={{ display: "inline-block" }}>
      <GeneratedCard card={cardConfig} size="lg" />
      {/* Overlay du méfait personnalisé */}
      {(cardConfig.category === "contravention" || cardConfig.category === "contribuable") && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: "28%",
            left: "5%",
            right: "5%",
            bottom: "22%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px 6px",
          }}
        >
          <span
            style={{
              fontFamily: "'Fredoka One', cursive",
              fontSize: "1.05rem",
              color: cardConfig.category === "contravention" ? "#5D2E00" : "#00401A",
              textAlign: "center",
              lineHeight: 1.3,
              wordBreak: "break-word",
              overflowWrap: "break-word",
              display: "block",
              width: "100%",
            }}
          >
            {mefait || <span style={{ opacity: 0.35, fontStyle: "italic" }}>Votre texte ici…</span>}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function CustomCardCreator() {
  const [, navigate] = useLocation();
  const { profile, isAuthenticated } = useGameAuth();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [view, setView] = useState<"list" | "create">("list");

  // Formulaire
  const [category, setCategory] = useState<CardCategory>("contravention");
  const [mefait, setMefait] = useState("");
  const [ticketPrice, setTicketPrice] = useState<string>("100");
  const [frais, setFrais] = useState<FeeOption>(0);
  const [impots, setImpots] = useState<FeeOption>(0);
  const [taxe, setTaxe] = useState<FeeOption>(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // tRPC
  const utils = trpc.useUtils();
  const { data: cards = [], isLoading } = trpc.customCards.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: countData } = trpc.customCards.count.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const createMutation = trpc.customCards.create.useMutation({
    onSuccess: () => {
      utils.customCards.list.invalidate();
      utils.customCards.count.invalidate();
      setView("list");
      resetForm();
    },
    onError: (err) => setFormError(err.message),
  });
  const deleteMutation = trpc.customCards.delete.useMutation({
    onSuccess: () => {
      utils.customCards.list.invalidate();
      utils.customCards.count.invalidate();
      setDeleteConfirm(null);
    },
  });

  // Prévisualisation
  const parsedPrice = parseInt(ticketPrice) || 0;
  const previewCard = useMemo(
    () => buildPreviewCard(category, parsedPrice, frais, impots, taxe),
    [category, parsedPrice, frais, impots, taxe]
  );

  function resetForm() {
    setCategory("contravention");
    setMefait("");
    setTicketPrice("100");
    setFrais(0);
    setImpots(0);
    setTaxe(0);
    setFormError(null);
  }

  function handleSubmit() {
    setFormError(null);
    const price = parseInt(ticketPrice);

    if (category === "contravention") {
      if (!mefait.trim()) return setFormError("Le texte du méfait est requis.");
      if (mefait.length > 150) return setFormError("Maximum 150 caractères.");
      if (isNaN(price) || price < 10 || price > 4000)
        return setFormError("Le prix du ticket doit être entre 10 $ et 4 000 $.");
      createMutation.mutate({ category: "contravention", mefait: mefait.trim(), ticketPrice: price, frais });
    } else if (category === "contribuable") {
      if (!mefait.trim()) return setFormError("Le texte du méfait est requis.");
      if (mefait.length > 150) return setFormError("Maximum 150 caractères.");
      createMutation.mutate({ category: "contribuable", mefait: mefait.trim(), impots });
    } else {
      if (isNaN(price) || price < 10 || price > 4000)
        return setFormError("Le prix du ticket doit être entre 10 $ et 4 000 $.");
      createMutation.mutate({ category: "investisseur", ticketPrice: price, taxe });
    }
  }

  const cardCount = countData?.count ?? cards.length;
  const atLimit = cardCount >= MAX_CARDS;

  // ── Mur d'authentification ──
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 max-w-sm w-full"
        >
          <Lock className="w-16 h-16 text-yellow-400" />
          <div style={{ ...FONT_BANGERS, fontSize: "2rem" }} className="text-yellow-400 text-center">
            CONNEXION REQUISE
          </div>
          <p style={FONT_FREDOKA} className="text-white/70 text-center text-sm">
            Crée un compte ou connecte-toi pour créer et gérer tes cartes personnalisées.
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowAccountModal(true)}
            className="w-full py-3 bg-yellow-400 border-[3px] border-black rounded-xl text-black"
            style={{ ...FONT_BANGERS, fontSize: "1.3rem", boxShadow: "4px 4px 0px #000" }}
          >
            SE CONNECTER / S'INSCRIRE
          </motion.button>
          <button
            onClick={() => navigate("/catalog")}
            style={FONT_FREDOKA}
            className="text-white/50 text-sm hover:text-white/80 transition-colors"
          >
            ← Retour au catalogue
          </button>
        </motion.div>
        {showAccountModal && <AccountModal onClose={() => setShowAccountModal(false)} />}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)" }}
    >
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-30 bg-[#0c1a4e]/95 backdrop-blur border-b-4 border-yellow-400 px-4 py-3 flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => view === "create" ? (setView("list"), resetForm()) : navigate("/catalog")}
          className="w-9 h-9 bg-white/10 border-2 border-white/20 rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </motion.button>
        <div className="flex-1">
          <div style={{ ...FONT_BANGERS, fontSize: "1.4rem" }} className="text-yellow-400 leading-none">
            {view === "create" ? "NOUVELLE CARTE" : "MES CARTES"}
          </div>
          <div style={FONT_FREDOKA} className="text-white/50 text-xs">
            {view === "list"
              ? `${cardCount} / ${MAX_CARDS} cartes — ${profile?.pseudo ?? ""}`
              : "Personnalise ta carte"}
          </div>
        </div>
        {view === "list" && !atLimit && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setView("create")}
            className="flex items-center gap-1.5 px-3 py-2 bg-yellow-400 border-[3px] border-black rounded-xl text-black"
            style={{ ...FONT_BANGERS, fontSize: "1rem", boxShadow: "3px 3px 0px #000" }}
          >
            <Plus className="w-4 h-4" />
            CRÉER
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ── VUE LISTE ── */}
        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 px-4 py-6"
          >
            {/* Barre de progression */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <span style={FONT_FREDOKA} className="text-white/60 text-xs">Cartes créées</span>
                <span style={FONT_FREDOKA} className="text-white/60 text-xs">{cardCount} / {MAX_CARDS}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(cardCount / MAX_CARDS) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>

            {atLimit && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-3 bg-red-500/20 border-2 border-red-500/50 rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span style={FONT_FREDOKA} className="text-red-300 text-sm">
                  Limite de {MAX_CARDS} cartes atteinte. Supprime des cartes pour en créer de nouvelles.
                </span>
              </motion.div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full"
                />
              </div>
            ) : cards.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4 py-16 text-center"
              >
                <Sparkles className="w-16 h-16 text-yellow-400/40" />
                <div style={{ ...FONT_BANGERS, fontSize: "1.5rem" }} className="text-white/50">
                  AUCUNE CARTE
                </div>
                <p style={FONT_FREDOKA} className="text-white/40 text-sm max-w-xs">
                  Crée ta première carte personnalisée et ajoute-la à ton deck !
                </p>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setView("create")}
                  className="flex items-center gap-2 px-5 py-3 bg-yellow-400 border-[3px] border-black rounded-xl text-black"
                  style={{ ...FONT_BANGERS, fontSize: "1.1rem", boxShadow: "4px 4px 0px #000" }}
                >
                  <Plus className="w-5 h-5" />
                  CRÉER MA PREMIÈRE CARTE
                </motion.button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                <AnimatePresence>
                  {cards.map((card, i) => {
                    const config = dbCardToConfig(card as any);
                    const catColor = CATEGORY_COLORS[card.category as CardCategory];
                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="relative">
                          <GeneratedCard card={config} size="sm" />
                          {/* Overlay méfait */}
                          {(card.category === "contravention" || card.category === "contribuable") && card.mefait && (
                            <div
                              className="absolute pointer-events-none"
                              style={{
                                top: "28%",
                                left: "5%",
                                right: "5%",
                                bottom: "22%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "2px 3px",
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "'Fredoka One', cursive",
                                  fontSize: "0.52rem",
                                  color: card.category === "contravention" ? "#5D2E00" : "#00401A",
                                  textAlign: "center",
                                  lineHeight: 1.2,
                                  wordBreak: "break-word",
                                  display: "block",
                                  width: "100%",
                                }}
                              >
                                {card.mefait}
                              </span>
                            </div>
                          )}
                          {/* Badge catégorie */}
                          <div
                            className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full border-2 border-black text-[0.5rem]"
                            style={{ background: catColor.bg, color: catColor.text, fontFamily: "'Bangers', cursive" }}
                          >
                            {card.category === "contravention" ? "T1" : card.category === "contribuable" ? "T2" : "T3"}
                          </div>
                        </div>

                        {/* Bouton supprimer */}
                        {deleteConfirm === card.id ? (
                          <div className="flex gap-1">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteMutation.mutate({ id: card.id })}
                              disabled={deleteMutation.isPending}
                              className="px-2 py-1 bg-red-500 border-2 border-black rounded-lg text-white text-xs"
                              style={FONT_FREDOKA}
                            >
                              Oui
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 bg-white/20 border-2 border-white/30 rounded-lg text-white text-xs"
                              style={FONT_FREDOKA}
                            >
                              Non
                            </motion.button>
                          </div>
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setDeleteConfirm(card.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-xs hover:bg-red-500/30 transition-colors"
                            style={FONT_FREDOKA}
                          >
                            <Trash2 className="w-3 h-3" />
                            Supprimer
                          </motion.button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* ── VUE CRÉATION ── */}
        {view === "create" && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col lg:flex-row gap-6 px-4 py-6 max-w-5xl mx-auto w-full"
          >
            {/* ── FORMULAIRE ── */}
            <div className="flex-1 flex flex-col gap-5">

              {/* Catégorie */}
              <div>
                <label style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-yellow-400 block mb-2">
                  CATÉGORIE
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["contravention", "contribuable", "investisseur"] as CardCategory[]).map((cat) => {
                    const col = CATEGORY_COLORS[cat];
                    const active = category === cat;
                    return (
                      <motion.button
                        key={cat}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setCategory(cat); setFormError(null); }}
                        className="py-2.5 rounded-xl border-[3px] text-center transition-all"
                        style={{
                          borderColor: active ? col.border : "rgba(255,255,255,0.15)",
                          background: active ? col.bg : "rgba(255,255,255,0.05)",
                          color: active ? col.text : "rgba(255,255,255,0.6)",
                          boxShadow: active ? `3px 3px 0px ${col.border}` : "none",
                          fontFamily: "'Bangers', cursive",
                          fontSize: "0.9rem",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {CATEGORY_LABELS[cat]}
                      </motion.button>
                    );
                  })}
                </div>
                <div style={FONT_FREDOKA} className="text-white/40 text-xs mt-1.5">
                  {category === "contravention" && "T1 — Ticket + frais optionnels ajoutés à ta dette"}
                  {category === "contribuable" && "T2 — Remboursement d'impôts déduit de ta dette"}
                  {category === "investisseur" && "T3 — Ticket transféré au joueur suivant, taxe déduite pour toi"}
                </div>
              </div>

              {/* Méfait (contravention + contribuable) */}
              {(category === "contravention" || category === "contribuable") && (
                <div>
                  <label style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-yellow-400 block mb-2">
                    DESCRIPTION {category === "contravention" ? "DE L'INFRACTION" : "DU REMBOURSEMENT"}
                  </label>
                  <div className="relative">
                    <textarea
                      value={mefait}
                      onChange={(e) => setMefait(e.target.value.slice(0, 150))}
                      placeholder={
                        category === "contravention"
                          ? "Ex : Tu as grillé un feu rouge en chantant…"
                          : "Ex : Tu as déclaré tes dépenses de café au bureau…"
                      }
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/30 resize-none focus:outline-none focus:border-yellow-400/60 transition-colors"
                      style={FONT_FREDOKA}
                    />
                    <div
                      className="absolute bottom-2 right-3 text-xs"
                      style={{
                        ...FONT_FREDOKA,
                        color: mefait.length > 130 ? "#FF6B6B" : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {mefait.length}/150
                    </div>
                  </div>
                </div>
              )}

              {/* Prix du ticket (contravention + investisseur) */}
              {(category === "contravention" || category === "investisseur") && (
                <div>
                  <label style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-yellow-400 block mb-2">
                    PRIX DU TICKET (10 $ – 4 000 $)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      max={4000}
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/60 transition-colors"
                      style={FONT_FREDOKA}
                      placeholder="100"
                    />
                    <span
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                      style={FONT_FREDOKA}
                    >
                      $
                    </span>
                  </div>
                </div>
              )}

              {/* Frais (contravention) */}
              {category === "contravention" && (
                <div>
                  <label style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-yellow-400 block mb-2">
                    FRAIS ADDITIONNELS
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {FEE_OPTIONS.map((v) => (
                      <motion.button
                        key={v}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFrais(v)}
                        className="py-2 rounded-xl border-[2px] text-center text-sm transition-all"
                        style={{
                          borderColor: frais === v ? "#FF8C00" : "rgba(255,255,255,0.15)",
                          background: frais === v ? "#FFD700" : "rgba(255,255,255,0.05)",
                          color: frais === v ? "#000" : "rgba(255,255,255,0.6)",
                          fontFamily: "'Fredoka One', cursive",
                          boxShadow: frais === v ? "2px 2px 0px #FF8C00" : "none",
                        }}
                      >
                        {v === 0 ? "Aucun" : `${v} $`}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Impôts (contribuable) */}
              {category === "contribuable" && (
                <div>
                  <label style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-yellow-400 block mb-2">
                    REMBOURSEMENT D'IMPÔTS
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {FEE_OPTIONS.map((v) => (
                      <motion.button
                        key={v}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setImpots(v)}
                        className="py-2 rounded-xl border-[2px] text-center text-sm transition-all"
                        style={{
                          borderColor: impots === v ? "#009624" : "rgba(255,255,255,0.15)",
                          background: impots === v ? "#00E676" : "rgba(255,255,255,0.05)",
                          color: impots === v ? "#000" : "rgba(255,255,255,0.6)",
                          fontFamily: "'Fredoka One', cursive",
                          boxShadow: impots === v ? "2px 2px 0px #009624" : "none",
                        }}
                      >
                        {v === 0 ? "Aucun" : `${v} $`}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Taxe (investisseur) */}
              {category === "investisseur" && (
                <div>
                  <label style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-yellow-400 block mb-2">
                    TAXE DE RÉDUCTION (pour toi)
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {FEE_OPTIONS.map((v) => (
                      <motion.button
                        key={v}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setTaxe(v)}
                        className="py-2 rounded-xl border-[2px] text-center text-sm transition-all"
                        style={{
                          borderColor: taxe === v ? "#C2185B" : "rgba(255,255,255,0.15)",
                          background: taxe === v ? "#FF4081" : "rgba(255,255,255,0.05)",
                          color: taxe === v ? "#fff" : "rgba(255,255,255,0.6)",
                          fontFamily: "'Fredoka One', cursive",
                          boxShadow: taxe === v ? "2px 2px 0px #C2185B" : "none",
                        }}
                      >
                        {v === 0 ? "Aucune" : `${v} $`}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Erreur */}
              <AnimatePresence>
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2 p-3 bg-red-500/20 border-2 border-red-500/50 rounded-xl"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span style={FONT_FREDOKA} className="text-red-300 text-sm">{formError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bouton créer */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="w-full py-4 bg-yellow-400 border-[4px] border-black rounded-2xl flex items-center justify-center gap-2 text-black relative overflow-hidden disabled:opacity-60"
                style={{ ...FONT_BANGERS, fontSize: "1.4rem", boxShadow: "5px 5px 0px #000" }}
              >
                {!createMutation.isPending && (
                  <motion.div
                    className="absolute inset-0 w-1/3 bg-white/20 skew-x-[-20deg]"
                    animate={{ x: ["-100%", "400%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {createMutation.isPending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-3 border-black border-t-transparent rounded-full"
                      />
                      Création…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      SAUVEGARDER LA CARTE
                    </>
                  )}
                </span>
              </motion.button>
            </div>

            {/* ── PRÉVISUALISATION ── */}
            <div className="flex flex-col items-center gap-4 lg:sticky lg:top-24 lg:self-start">
              <div style={{ ...FONT_BANGERS, fontSize: "1rem" }} className="text-white/50">
                PRÉVISUALISATION
              </div>
              <motion.div
                key={`${category}-${parsedPrice}-${frais}-${impots}-${taxe}`}
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <PreviewCard cardConfig={previewCard} mefait={mefait} />
              </motion.div>
              <div style={FONT_FREDOKA} className="text-white/30 text-xs text-center max-w-[200px]">
                La carte apparaîtra dans ton deck avec ce design
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

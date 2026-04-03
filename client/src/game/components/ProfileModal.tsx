import React from "react";
import { motion } from "motion/react";
import { Layers, Heart, ShoppingBag, ExternalLink, Sparkles, Check, Flame, Snowflake, Crown, Trees, Cog, Gem, Zap, Globe, Wand2, Ghost, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { SKIN_CATALOG } from "@/game/utils/skinConfig";
import type { CardSkinId } from "@/game/utils/skinConfig";

// Map des icônes par skin
const SKIN_ICON_MAP: Record<CardSkinId, React.ComponentType<{ className?: string }>> = {
  classique: Star,
  neon: Zap,
  retro: Cog,
  glace: Snowflake,
  feu: Flame,
  royal: Crown,
  foret: Trees,
  metal: Gem,
  prestige: Sparkles,
  cosmic: Globe,
  magique: Wand2,
  negatif: Ghost,
  bonbon: Heart,
  glitch: Zap,
  pastel: Star,
};

const FONT_FREDOKA: React.CSSProperties = { fontFamily: "'Fredoka One', cursive" };
const FONT_BANGERS: React.CSSProperties = { fontFamily: "'Bangers', cursive", letterSpacing: "0.05em" };

interface ProfileModalProps {
  profile: { pseudo?: string; email?: string; id?: number } | null;
  onClose: () => void;
  onLogout: () => void;
  onOpenShop: () => void;
}

function formatDate(ts: number | Date | null | undefined): string {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("fr-CA", { year: "numeric", month: "short", day: "numeric" });
}

function formatAmount(cents: number, currency: string): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: currency.toUpperCase() }).format(amount);
}

function getPurchaseIcon(productId: string) {
  if (productId.startsWith("pack_") || productId.startsWith("card_pack_")) return <Layers className="w-4 h-4 text-white" />;
  if (productId === "don_libre") return <Heart className="w-4 h-4 text-white" />;
  if (productId.startsWith("skin_") || productId === "bundle_all_skins") return <Sparkles className="w-4 h-4 text-white" />;
  return <ShoppingBag className="w-4 h-4 text-white" />;
}

function getPurchaseColor(productId: string): string {
  if (productId === "card_pack_35") return "#34C759";
  if (productId === "card_pack_55") return "#007AFF";
  if (productId === "card_pack_85") return "#AF52DE";
  if (productId === "don_libre") return "#EF4444";
  if (productId.startsWith("skin_") || productId === "bundle_all_skins") return "#FFD700";
  return "#FFD700";
}

export function ProfileModal({ profile, onClose, onLogout, onOpenShop }: ProfileModalProps) {
  const [activeTab, setActiveTab] = React.useState<"achats" | "skins">("skins");

  const { data: purchases, isLoading: purchasesLoading } = trpc.shop.listPurchases.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: ownedSkins, isLoading: skinsLoading } = trpc.skins.listOwnedSkins.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: activeSkinData } = trpc.skins.getActiveSkin.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Calculer le total de cartes débloquées
  const totalExtraCards = purchases
    ? purchases.filter(p => p.productId.startsWith("card_pack_") || p.productId.startsWith("pack_")).reduce((sum, p) => sum + (p.cardsUnlocked ?? 0), 0)
    : 0;

  const ownedSkinIds = new Set((ownedSkins ?? []) as string[]);
  const activeSkinId = (activeSkinData as string | null | undefined) ?? "classique";

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
        className="relative w-[92%] max-w-[420px] rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)",
          border: "3px solid rgba(255,215,0,0.4)",
          boxShadow: "0 0 40px rgba(255,215,0,0.15), 0 20px 60px rgba(0,0,0,0.5)",
          maxHeight: "88dvh",
          display: "flex",
          flexDirection: "column",
        }}
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="text-white text-lg leading-none">&times;</span>
          </button>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-full bg-yellow-400 border-[3px] border-black flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: "4px 4px 0px #000" }}
            >
              <span style={{ ...FONT_FREDOKA, fontSize: "1.6rem", color: "#000" }}>
                {profile?.pseudo?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>

            {/* Nom + email + quota */}
            <div className="flex-1 min-w-0">
              <h3 style={{ ...FONT_BANGERS, fontSize: "1.4rem" }} className="text-yellow-400 leading-none">
                {profile?.pseudo}
              </h3>
              <p className="text-white/50 text-xs mt-0.5 truncate">{profile?.email}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Layers className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                <span style={{ ...FONT_FREDOKA, fontSize: "0.72rem" }} className="text-white/70">
                  {15 + totalExtraCards} cartes perso disponibles
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex mx-5 mb-0 border-b-2 border-white/10 flex-shrink-0">
          <button
            onClick={() => setActiveTab("skins")}
            className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${activeTab === "skins" ? "border-b-2 border-yellow-400 -mb-[2px]" : "opacity-50"}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span style={{ ...FONT_BANGERS, fontSize: "0.95rem" }} className="text-yellow-400">SKINS</span>
          </button>
          <button
            onClick={() => setActiveTab("achats")}
            className={`flex-1 py-2 flex items-center justify-center gap-1.5 transition-colors ${activeTab === "achats" ? "border-b-2 border-yellow-400 -mb-[2px]" : "opacity-50"}`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-yellow-400" />
            <span style={{ ...FONT_BANGERS, fontSize: "0.95rem" }} className="text-yellow-400">ACHATS</span>
          </button>
        </div>

        {/* Contenu — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* ── Onglet Skins ── */}
          {activeTab === "skins" && (
            <div className="space-y-2">
              {skinsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-6 h-6 border-2 border-yellow-400/40 border-t-yellow-400 rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Skin classique toujours inclus */}
                  {SKIN_CATALOG.map((skin) => {
                    const isOwned = skin.id === "classique" || ownedSkinIds.has(skin.id);
                    const isActive = activeSkinId === skin.id;
                    return (
                      <motion.div
                        key={skin.id}
                        className="flex items-center gap-3 p-3 rounded-xl border-2"
                        style={{
                          background: isActive ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.03)",
                          borderColor: isActive ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.1)",
                        }}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        {/* Icône + couleur du skin */}
                        {(() => {
                          const Icon = SKIN_ICON_MAP[skin.id as CardSkinId] ?? Star;
                          return (
                            <div
                              className="w-9 h-9 rounded-lg border-2 border-black flex-shrink-0 flex items-center justify-center"
                              style={{ background: skin.color, boxShadow: "2px 2px 0px #000" }}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                          );
                        })()}

                        {/* Nom + statut */}
                        <div className="flex-1 min-w-0">
                          <div style={{ ...FONT_BANGERS, fontSize: "0.95rem" }} className="text-white leading-none">
                            {skin.name}
                          </div>
                          <div style={{ ...FONT_FREDOKA, fontSize: "0.68rem" }} className={isOwned ? "text-green-400 mt-0.5" : "text-white/35 mt-0.5"}>
                            {skin.id === "classique" ? "Gratuit — inclus" : isOwned ? "Débloqué" : "Verrouillé"}
                          </div>
                        </div>

                        {/* Badge actif / verrouillé */}
                        {isActive ? (
                          <div
                            className="flex-shrink-0 px-2 py-0.5 rounded-lg border border-yellow-400/50"
                            style={{ background: "rgba(255,215,0,0.15)", ...FONT_BANGERS, fontSize: "0.75rem", color: "#FFD700" }}
                          >
                            ACTIF
                          </div>
                        ) : !isOwned ? (
                          <button
                            onClick={onOpenShop}
                            className="flex-shrink-0 px-2 py-0.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
                            style={{ background: "rgba(255,255,255,0.05)", ...FONT_BANGERS, fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}
                          >
                            ACHETER
                          </button>
                        ) : null}
                      </motion.div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* ── Onglet Achats ── */}
          {activeTab === "achats" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-yellow-400" />
                  <span style={{ ...FONT_BANGERS, fontSize: "1.05rem" }} className="text-yellow-400">
                    MES ACHATS
                  </span>
                </div>
                <button
                  onClick={onOpenShop}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-400/15 border border-yellow-400/30 hover:bg-yellow-400/25 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-yellow-400" />
                  <span style={{ ...FONT_FREDOKA, fontSize: "0.7rem" }} className="text-yellow-400">Boutique</span>
                </button>
              </div>

              {purchasesLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-6 h-6 border-2 border-yellow-400/40 border-t-yellow-400 rounded-full animate-spin" />
                </div>
              ) : !purchases || purchases.length === 0 ? (
                <div
                  className="p-4 rounded-xl border-2 border-white/10 text-center"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <ShoppingBag className="w-8 h-8 text-white/20 mx-auto mb-2" />
                  <p style={{ ...FONT_FREDOKA, fontSize: "0.85rem" }} className="text-white/40">
                    Aucun achat pour l'instant
                  </p>
                  <button
                    onClick={onOpenShop}
                    className="mt-2 px-3 py-1.5 rounded-lg border-2 border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                    style={{ ...FONT_FREDOKA, fontSize: "0.75rem" }}
                  >
                    Visiter la boutique
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {purchases.map((purchase) => (
                    <motion.div
                      key={purchase.id}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 border-white/10"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {/* Icône */}
                      <div
                        className="w-9 h-9 rounded-lg border-2 border-black flex items-center justify-center flex-shrink-0"
                        style={{ background: getPurchaseColor(purchase.productId), boxShadow: "2px 2px 0px #000" }}
                      >
                        {getPurchaseIcon(purchase.productId)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div style={{ ...FONT_BANGERS, fontSize: "0.9rem" }} className="text-white leading-none truncate">
                          {purchase.productName}
                        </div>
                        {purchase.cardsUnlocked > 0 && (
                          <div style={{ ...FONT_FREDOKA, fontSize: "0.68rem" }} className="text-green-400 mt-0.5">
                            +{purchase.cardsUnlocked} cartes débloquées
                          </div>
                        )}
                        <div style={{ ...FONT_FREDOKA, fontSize: "0.65rem" }} className="text-white/35 mt-0.5">
                          {formatDate(purchase.createdAt)}
                        </div>
                      </div>

                      {/* Montant */}
                      <div
                        className="flex-shrink-0 px-2 py-0.5 rounded-lg border border-white/20"
                        style={{ background: "rgba(255,255,255,0.06)", ...FONT_BANGERS, fontSize: "0.85rem", color: getPurchaseColor(purchase.productId) }}
                      >
                        {formatAmount(purchase.amountCents, purchase.currency)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — bouton déconnexion */}
        <div className="px-5 pb-5 pt-3 flex-shrink-0 border-t-[2px] border-white/10">
          <motion.button
            className="w-full py-2.5 bg-red-500 border-[3px] border-black rounded-xl text-white"
            style={{ ...FONT_FREDOKA, fontSize: "0.95rem", boxShadow: "4px 4px 0px #000" }}
            whileHover={{ scale: 1.03 } as any}
            whileTap={{ scale: 0.97 } as any}
            onClick={onLogout}
          >
            SE DÉCONNECTER
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

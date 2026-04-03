import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Layers, Heart, ShoppingBag, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";

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
  if (productId.startsWith("pack_")) return <Layers className="w-4 h-4 text-white" />;
  if (productId === "don_libre") return <Heart className="w-4 h-4 text-white" />;
  return <ShoppingBag className="w-4 h-4 text-white" />;
}

function getPurchaseColor(productId: string): string {
  if (productId === "pack_35") return "#34C759";
  if (productId === "pack_55") return "#007AFF";
  if (productId === "pack_85") return "#AF52DE";
  if (productId === "don_libre") return "#EF4444";
  return "#FFD700";
}

export function ProfileModal({ profile, onClose, onLogout, onOpenShop }: ProfileModalProps) {
  const { data: purchases, isLoading } = trpc.shop.listPurchases.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Calculer le total de cartes débloquées
  const totalExtraCards = purchases
    ? purchases.filter(p => p.productId.startsWith("pack_")).reduce((sum, p) => sum + (p.cardsUnlocked ?? 0), 0)
    : 0;

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
        className="relative w-[90%] max-w-[380px] rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #0c1a4e 0%, #1a083d 60%, #0c1a4e 100%)",
          border: "3px solid rgba(255,215,0,0.4)",
          boxShadow: "0 0 40px rgba(255,215,0,0.15), 0 20px 60px rgba(0,0,0,0.5)",
          maxHeight: "85dvh",
          display: "flex",
          flexDirection: "column",
        }}
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="text-white text-lg leading-none">&times;</span>
          </button>

          <div className="flex flex-col items-center gap-3">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-full bg-yellow-400 border-[3px] border-black flex items-center justify-center"
              style={{ boxShadow: "4px 4px 0px #000" }}
            >
              <span style={{ ...FONT_FREDOKA, fontSize: "1.8rem", color: "#000" }}>
                {profile?.pseudo?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>

            {/* Nom + email */}
            <div className="text-center">
              <h3 style={{ ...FONT_BANGERS, fontSize: "1.5rem" }} className="text-yellow-400">
                {profile?.pseudo}
              </h3>
              <p className="text-white/50 text-xs mt-0.5">{profile?.email}</p>
            </div>

            {/* Quota cartes */}
            <div
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-white/20"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <Layers className="w-3.5 h-3.5 text-yellow-400" />
              <span style={{ ...FONT_FREDOKA, fontSize: "0.8rem" }} className="text-white/80">
                {15 + totalExtraCards} cartes perso disponibles
              </span>
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t-[2px] border-white/10 mx-5" />

        {/* Section Mes Achats — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-yellow-400" />
              <span style={{ ...FONT_BANGERS, fontSize: "1.1rem" }} className="text-yellow-400">
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

          {isLoading ? (
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
                    <div style={{ ...FONT_BANGERS, fontSize: "0.9rem" }} className="text-white leading-none">
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

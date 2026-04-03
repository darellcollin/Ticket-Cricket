/**
 * Produits de la boutique Ticket Cricket.
 * Chaque produit a un priceId Stripe (à créer dans le dashboard Stripe)
 * et des métadonnées pour l'affichage dans la boutique.
 * 
 * Pour l'instant, les produits utilisent le mode "payment" (paiement unique).
 * Les priceId seront des prix créés dans le dashboard Stripe.
 */

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number; // en cents CAD
  currency: string;
  category: "skin" | "deck" | "pack" | "don";
  icon: string;
  color: string;
  available: boolean; // false = bientôt disponible
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  // ── DONS ──
  {
    id: "don_5",
    name: "Soutenir le projet",
    description: "Un petit coup de pouce pour faire avancer Ticket Cricket !",
    price: 500, // 5.00 CAD
    currency: "cad",
    category: "don",
    icon: "heart",
    color: "#FF3B30",
    available: true,
  },
  {
    id: "don_10",
    name: "Soutenir généreusement",
    description: "Merci ! Votre soutien aide à créer la version physique.",
    price: 1000, // 10.00 CAD
    currency: "cad",
    category: "don",
    icon: "heart",
    color: "#FF3B30",
    available: true,
  },
  {
    id: "don_25",
    name: "Grand soutien",
    description: "Vous êtes incroyable. Ce don va directement dans le développement.",
    price: 2500, // 25.00 CAD
    currency: "cad",
    category: "don",
    icon: "heart",
    color: "#FF3B30",
    available: true,
  },

  // ── SKINS DE CARTES (bientôt) ──
  {
    id: "skin_neon",
    name: "Skin Néon",
    description: "Des cartes qui brillent dans le noir. Style néon vibrant.",
    price: 299, // 2.99 CAD
    currency: "cad",
    category: "skin",
    icon: "sparkles",
    color: "#007AFF",
    available: false,
  },
  {
    id: "skin_gold",
    name: "Skin Or",
    description: "Cartes dorées pour les joueurs qui se prennent au sérieux.",
    price: 499,
    currency: "cad",
    category: "skin",
    icon: "star",
    color: "#FFD700",
    available: false,
  },

  // ── DECKS EXCLUSIFS (bientôt) ──
  {
    id: "deck_halloween",
    name: "Deck Halloween",
    description: "50 nouvelles contraventions spéciales Halloween.",
    price: 399,
    currency: "cad",
    category: "deck",
    icon: "ghost",
    color: "#FF9500",
    available: false,
  },
  {
    id: "deck_noel",
    name: "Deck Noël",
    description: "Des infractions dans l'esprit des fêtes. Ho ho ho.",
    price: 399,
    currency: "cad",
    category: "deck",
    icon: "gift",
    color: "#34C759",
    available: false,
  },

  // ── PACKS DE PERSONNALISATION (bientôt) ──
  {
    id: "pack_premium",
    name: "Pack Premium",
    description: "Skin Or + 2 Decks exclusifs. La totale.",
    price: 999,
    currency: "cad",
    category: "pack",
    icon: "crown",
    color: "#AF52DE",
    available: false,
  },
];

export const AVAILABLE_PRODUCTS = SHOP_PRODUCTS.filter(p => p.available);
export const COMING_SOON_PRODUCTS = SHOP_PRODUCTS.filter(p => !p.available);

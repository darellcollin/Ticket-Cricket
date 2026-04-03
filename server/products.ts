/**
 * Produits de la boutique Ticket Cricket.
 * Paiement unique et permanent via Stripe Checkout.
 *
 * Catégories :
 *  - "card_pack" : packs de cartes personnalisables (disponibles)
 *  - "don"       : don à montant libre (disponible)
 *  - "skin"      : skins de cartes (bientôt)
 *  - "deck"      : decks exclusifs (bientôt)
 *  - "pack"      : packs de personnalisation (bientôt)
 */

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number; // en cents CAD
  currency: string;
  category: "card_pack" | "skin" | "deck" | "pack" | "don";
  icon: string;
  color: string;
  available: boolean;
  /** Nombre de cartes supplémentaires accordées (pour card_pack uniquement) */
  extraCards?: number;
  /** ID du skin à débloquer (pour skin uniquement) */
  skinId?: string;
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  // ── PACKS DE CARTES PERSONNALISABLES (disponibles) ──
  {
    id: "card_pack_35",
    name: "Pack 35 cartes",
    description: "Débloquez 35 cartes personnalisables supplémentaires, de façon permanente.",
    price: 299, // 2.99 CAD
    currency: "cad",
    category: "card_pack",
    icon: "layers",
    color: "#34C759",
    available: true,
    extraCards: 35,
  },
  {
    id: "card_pack_55",
    name: "Pack 55 cartes",
    description: "Débloquez 55 cartes personnalisables supplémentaires, de façon permanente.",
    price: 699, // 6.99 CAD
    currency: "cad",
    category: "card_pack",
    icon: "layers",
    color: "#007AFF",
    available: true,
    extraCards: 55,
  },
  {
    id: "card_pack_85",
    name: "Pack 85 cartes",
    description: "Débloquez 85 cartes personnalisables supplémentaires, de façon permanente.",
    price: 999, // 9.99 CAD
    currency: "cad",
    category: "card_pack",
    icon: "layers",
    color: "#AF52DE",
    available: true,
    extraCards: 85,
  },

  // ── DON LIBRE (disponible) ──
  {
    id: "don_libre",
    name: "Faire un don",
    description: "Soutenir le développement de Ticket Cricket. Vous choisissez le montant.",
    price: 0, // montant libre — géré côté client
    currency: "cad",
    category: "don",
    icon: "heart",
    color: "#EF4444",
    available: true,
  },

  // ── SKINS DE CARTES (disponibles) ──
  {
    id: "skin_neon",
    name: "Skin Néon",
    description: "Cyberpunk sombre avec lueurs néon vives. Cartes lumineuses sur fond noir.",
    price: 299,
    currency: "cad",
    category: "skin",
    icon: "sparkles",
    color: "#00F5FF",
    available: true,
    skinId: "neon",
  },
  {
    id: "skin_retro",
    name: "Skin Rétro",
    description: "Dégradés pastel et typographie années 80. Nostalgie garantie.",
    price: 299,
    currency: "cad",
    category: "skin",
    icon: "star",
    color: "#FF6B9D",
    available: true,
    skinId: "retro",
  },
  {
    id: "skin_glace",
    name: "Skin Glace",
    description: "Tons bleus glacés et effet cristal. Froid comme la banquise.",
    price: 299,
    currency: "cad",
    category: "skin",
    icon: "snowflake",
    color: "#A8D8EA",
    available: true,
    skinId: "glace",
  },
  {
    id: "skin_feu",
    name: "Skin Feu",
    description: "Flammes et lave — rouge et orange intenses. Pour les joueurs qui brûlent.",
    price: 299,
    currency: "cad",
    category: "skin",
    icon: "flame",
    color: "#FF4500",
    available: true,
    skinId: "feu",
  },
  {
    id: "skin_royal",
    name: "Skin Royal",
    description: "Fond sombre, dorures et marbre luxueux. Pour les joueurs de prestige.",
    price: 299,
    currency: "cad",
    category: "skin",
    icon: "crown",
    color: "#C9A84C",
    available: true,
    skinId: "royal",
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

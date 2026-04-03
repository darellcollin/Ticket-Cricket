/**
 * Produits de la boutique Ticket Cricket.
 * Paiement unique et permanent via Stripe Checkout.
 *
 * Catégories :
 *  - "card_pack"      : packs de cartes personnalisables (disponibles)
 *  - "don"            : don à montant libre (disponible)
 *  - "skin"           : skins de cartes (disponibles)
 *  - "bundle"         : forfait groupé (tous les skins)
 *  - "expansion_pack" : packs d'extension — nouvelles cartes ajoutées au deck de base
 *  - "deck"           : decks exclusifs (bientôt)
 *  - "pack"           : packs de personnalisation (bientôt)
 */

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number; // en cents CAD
  currency: string;
  category: "card_pack" | "skin" | "deck" | "pack" | "don" | "bundle" | "expansion_pack";
  icon: string;
  color: string;
  available: boolean;
  /** Nombre de cartes supplémentaires accordées (pour card_pack uniquement) */
  extraCards?: number;
  /** ID du skin à débloquer (pour skin uniquement) */
  skinId?: string;
  /** IDs des skins inclus dans le forfait (pour bundle uniquement) */
  bundleSkinIds?: string[];
  /** Skin premium */
  premium?: boolean;
  /** Identifiant unique du pack d'extension (pour expansion_pack) */
  expansionPackId?: string;
  /** IDs des cartes d'extension incluses dans le pack (pour expansion_pack) */
  expansionCardIds?: number[];
}

// Tous les IDs de skins payants (hors classique qui est gratuit)
export const ALL_PAID_SKIN_IDS = [
  "neon", "retro", "glace", "feu", "royal",
  "cosmic", "magique", "foret", "metal", "prestige",
];

// IDs des cartes du Ticket Cricket Plus (325-352)
export const PLUS_PACK_CARD_IDS: number[] = Array.from({ length: 28 }, (_, i) => i + 325);

export const SHOP_PRODUCTS: ShopProduct[] = [
  // ── TICKET CRICKET PLUS (disponible — 2,99 $) ──
  {
    id: "expansion_plus",
    name: "Ticket Cricket Plus",
    description: "28 nouvelles cartes exclusives thème Halloween — 16 contraventions, 6 contribuables et 6 investisseurs. S'ajoutent automatiquement et définitivement à votre deck de 324 cartes.",
    price: 299, // 2.99 CAD
    currency: "cad",
    category: "expansion_pack",
    icon: "ghost",
    color: "#FF6B00",
    available: true,
    expansionPackId: "plus",
    expansionCardIds: PLUS_PACK_CARD_IDS,
  },

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

  // ── FORFAIT TOUS LES SKINS (15,99 $) ──
  {
    id: "bundle_all_skins",
    name: "Forfait Tous les Skins",
    description: "Débloquez les 10 skins en une seule fois. Économisez plus de 4 $.",
    price: 1599, // 15.99 CAD
    currency: "cad",
    category: "bundle",
    icon: "package",
    color: "#F59E0B",
    available: true,
    bundleSkinIds: ALL_PAID_SKIN_IDS,
  },

  // ── SKINS DE CARTES STANDARDS (1,99 $ chacun) ──
  {
    id: "skin_neon",
    name: "Skin Néon",
    description: "Cyberpunk sombre avec lueurs néon vives. Cartes lumineuses sur fond noir.",
    price: 199, // 1.99 CAD
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
    price: 199, // 1.99 CAD
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
    price: 199, // 1.99 CAD
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
    price: 199, // 1.99 CAD
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
    price: 199, // 1.99 CAD
    currency: "cad",
    category: "skin",
    icon: "crown",
    color: "#C9A84C",
    available: true,
    skinId: "royal",
  },

  // ── SKINS PREMIUM (1,99 $ — même prix que les standards) ──
  {
    id: "skin_cosmic",
    name: "Skin Cosmic",
    description: "Espace profond — étoiles, planètes et nébuleuses scintillantes.",
    price: 199, // 1.99 CAD
    currency: "cad",
    category: "skin",
    icon: "globe",
    color: "#7C3AED",
    available: true,
    skinId: "cosmic",
    premium: true,
  },
  {
    id: "skin_magique",
    name: "Skin Magique",
    description: "Holographique scintillant — reflets arc-en-ciel et effet magique.",
    price: 199, // 1.99 CAD
    currency: "cad",
    category: "skin",
    icon: "wand2",
    color: "#EC4899",
    available: true,
    skinId: "magique",
    premium: true,
  },
  {
    id: "skin_foret",
    name: "Skin Forêt",
    description: "Textures bois et mousse — vert forêt, brun et ocre. Nature sauvage.",
    price: 199, // 1.99 CAD
    currency: "cad",
    category: "skin",
    icon: "trees",
    color: "#4A7C59",
    available: true,
    skinId: "foret",
    premium: true,
  },
  {
    id: "skin_metal",
    name: "Skin Métal",
    description: "Acier brossé et chrome industriel. Texture métallique froide et précise.",
    price: 199, // 1.99 CAD
    currency: "cad",
    category: "skin",
    icon: "cog",
    color: "#8B9DB5",
    available: true,
    skinId: "metal",
    premium: true,
  },
  {
    id: "skin_prestige",
    name: "Skin Prestige",
    description: "Diamant glossy et reflets arc-en-ciel. Le summum du luxe absolu.",
    price: 199, // 1.99 CAD
    currency: "cad",
    category: "skin",
    icon: "gem",
    color: "#B388FF",
    available: true,
    skinId: "prestige",
    premium: true,
  },

  // ── DECKS EXCLUSIFS (bientôt) ──
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

/**
 * skinConfig.ts — Types, catalogue et tokens visuels des skins de cartes.
 * Séparé de GeneratedCard.tsx pour compatibilité avec Vite Fast Refresh.
 *
 * RÈGLE FONDAMENTALE : chaque skin respecte EXACTEMENT la même structure visuelle
 * que le skin Classique (mêmes zones, mêmes en-têtes, mêmes lignes graphiques).
 * Seules les couleurs changent — chaque skin doit être IMMÉDIATEMENT reconnaissable.
 *
 * Palette par skin :
 *   Classique  : Orange | Vert | Rose/Rouge
 *   Néon       : Cyan électrique | Magenta | Jaune néon
 *   Rétro      : Rose synthwave | Violet | Cyan
 *   Glace      : Bleu glacier | Cyan glacé | Lavande
 *   Feu        : Rouge lave | Orange brûlé | Bordeaux
 *   Royal      : Or royal | Vert émeraude | Bordeaux royal
 *   Forêt      : Vert forêt | Brun bois | Mousse (PREMIUM)
 *   Métal      : Acier | Chrome | Titane (PREMIUM)
 *   Prestige   : Diamant | Saphir | Améthyste (PREMIUM)
 */
import type { CardCategory } from "@/game/utils/cardConfig";

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES DE SKINS
// ─────────────────────────────────────────────────────────────────────────────
export type CardSkinId = "classique" | "neon" | "retro" | "glace" | "feu" | "royal" | "foret" | "metal" | "prestige" | "cosmic" | "magique";

export interface SkinMeta {
  id: CardSkinId;
  name: string;
  description: string;
  price: string;
  priceCents: number;
  productId: string;
  color: string;
  premium?: boolean;
}

export const SKIN_CATALOG: SkinMeta[] = [
  {
    id: "classique",
    name: "Classique",
    description: "Le design original de Ticket Cricket.",
    price: "Gratuit",
    priceCents: 0,
    productId: "skin_classique",
    color: "#FFD700",
  },
  {
    id: "neon",
    name: "Néon",
    description: "Cyberpunk — cyan, magenta et jaune électriques.",
    price: "1,99 $",
    priceCents: 199,
    productId: "skin_neon",
    color: "#00F5FF",
  },
  {
    id: "retro",
    name: "Rétro",
    description: "Arcade synthwave — rose, violet et cyan.",
    price: "1,99 $",
    priceCents: 199,
    productId: "skin_retro",
    color: "#FF6B9D",
  },
  {
    id: "glace",
    name: "Glace",
    description: "Tons bleus glacés et effet cristal.",
    price: "1,99 $",
    priceCents: 199,
    productId: "skin_glace",
    color: "#A8D8EA",
  },
  {
    id: "feu",
    name: "Feu",
    description: "Flammes et lave — rouge, orange et bordeaux.",
    price: "1,99 $",
    priceCents: 199,
    productId: "skin_feu",
    color: "#FF4500",
  },
  {
    id: "royal",
    name: "Royal",
    description: "Luxe — or, émeraude et bordeaux royal.",
    price: "1,99 $",
    priceCents: 199,
    productId: "skin_royal",
    color: "#C9A84C",
  },
  // ── SKINS PREMIUM ──
  {
    id: "cosmic",
    name: "Cosmic",
    description: "Espace profond — étoiles, planètes et nébuleuses scintillantes.",
    price: "1,99 $",
    priceCents: 199,
    productId: "skin_cosmic",
    color: "#7C3AED",
    premium: true,
  },
  {
    id: "magique",
    name: "Magique",
    description: "Holographique scintillant — reflets arc-en-ciel et effet magique.",
    price: "1,99 $",
    priceCents: 199,
    productId: "skin_magique",
    color: "#EC4899",
    premium: true,
  },
  {
    id: "foret",
    name: "Forêt",
    description: "Textures bois et mousse — vert forêt, brun et ocre.",
    price: "1,99 $",
    priceCents: 199,
    productId: "skin_foret",
    color: "#4A7C59",
    premium: true,
  },
  {
    id: "metal",
    name: "Métal",
    description: "Acier brossé et chrome — texture métallique industrielle.",
    price: "1,99 $",
    priceCents: 199,
    productId: "skin_metal",
    color: "#8B9DB5",
    premium: true,
  },
  {
    id: "prestige",
    name: "Prestige",
    description: "Diamant glossy et reflets arc-en-ciel — le summum du luxe.",
    price: "1,99 $",
    priceCents: 199,
    productId: "skin_prestige",
    color: "#B388FF",
    premium: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  TOKENS VISUELS PAR SKIN × CATÉGORIE
// ─────────────────────────────────────────────────────────────────────────────
export type CategoryStyle = {
  headerBg: string;
  headerText: string;
  bodyBg: string;
  bodyText: string;
  accentColor: string;
  accentDark: string;
  priceBg: string;
  priceText: string;
  stripColor1: string;
  stripColor2: string;
  glowColor: string;
  detailBg: string;
  detailBorder: string;
  badgeBg: string;
  badgeText: string;
  splatColor: string;
};

export type SkinStyles = Record<CardCategory, CategoryStyle>;

export const SKIN_STYLES: Record<CardSkinId, SkinStyles> = {
  // ── CLASSIQUE (design original — référence absolue) ──────────────────────
  // Contravention : Orange/Jaune | Contribuable : Vert | Investisseur : Rose/Rouge
  classique: {
    contravention: {
      headerBg: "linear-gradient(135deg, #FFD700 0%, #FFA500 60%, #FF6B00 100%)",
      headerText: "#000000",
      bodyBg: "#FFFDE7",
      bodyText: "#5D2E00",
      accentColor: "#FF8C00",
      accentDark: "#7B3800",
      priceBg: "linear-gradient(135deg, #FF6B00 0%, #FF8C00 50%, #FFD700 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#FFD700",
      stripColor2: "#000000",
      glowColor: "rgba(255,165,0,0.5)",
      detailBg: "rgba(255,165,0,0.12)",
      detailBorder: "rgba(255,140,0,0.35)",
      badgeBg: "#FF6B00",
      badgeText: "#FFFFFF",
      splatColor: "rgba(255,215,0,0.18)",
    },
    contribuable: {
      headerBg: "linear-gradient(135deg, #00E676 0%, #00C853 60%, #009624 100%)",
      headerText: "#000000",
      bodyBg: "#E8FFF0",
      bodyText: "#003D1A",
      accentColor: "#00C853",
      accentDark: "#004D20",
      priceBg: "linear-gradient(135deg, #009624 0%, #00C853 50%, #69F0AE 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#00E676",
      stripColor2: "#000000",
      glowColor: "rgba(0,200,83,0.5)",
      detailBg: "rgba(0,200,83,0.12)",
      detailBorder: "rgba(0,150,36,0.35)",
      badgeBg: "#009624",
      badgeText: "#FFFFFF",
      splatColor: "rgba(0,230,118,0.18)",
    },
    investisseur: {
      headerBg: "linear-gradient(135deg, #FF4081 0%, #E91E63 60%, #C2185B 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#FFF0F5",
      bodyText: "#6A0030",
      accentColor: "#E91E63",
      accentDark: "#880E4F",
      priceBg: "linear-gradient(135deg, #C2185B 0%, #E91E63 50%, #FF80AB 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#FF4081",
      stripColor2: "#000000",
      glowColor: "rgba(233,30,99,0.5)",
      detailBg: "rgba(233,30,99,0.12)",
      detailBorder: "rgba(194,24,91,0.35)",
      badgeBg: "#C2185B",
      badgeText: "#FFFFFF",
      splatColor: "rgba(255,64,129,0.18)",
    },
  },

  // ── NÉON (cyberpunk — cyan électrique | magenta | jaune néon) ─────────────
  neon: {
    contravention: {
      headerBg: "linear-gradient(135deg, #00F5FF 0%, #00BFFF 60%, #0080FF 100%)",
      headerText: "#000000",
      bodyBg: "#E8FFFE",
      bodyText: "#003344",
      accentColor: "#00F5FF",
      accentDark: "#0080FF",
      priceBg: "linear-gradient(135deg, #0060CC 0%, #0090FF 50%, #00F5FF 100%)",
      priceText: "#000000",
      stripColor1: "#00F5FF",
      stripColor2: "#000033",
      glowColor: "rgba(0,245,255,0.8)",
      detailBg: "rgba(0,245,255,0.12)",
      detailBorder: "rgba(0,191,255,0.40)",
      badgeBg: "#0080FF",
      badgeText: "#FFFFFF",
      splatColor: "rgba(0,245,255,0.22)",
    },
    contribuable: {
      headerBg: "linear-gradient(135deg, #FF00FF 0%, #CC00CC 60%, #990099 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#FFF0FF",
      bodyText: "#550055",
      accentColor: "#FF00FF",
      accentDark: "#990099",
      priceBg: "linear-gradient(135deg, #880088 0%, #CC00CC 50%, #FF00FF 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#FF00FF",
      stripColor2: "#000033",
      glowColor: "rgba(255,0,255,0.8)",
      detailBg: "rgba(255,0,255,0.10)",
      detailBorder: "rgba(204,0,204,0.40)",
      badgeBg: "#CC00CC",
      badgeText: "#FFFFFF",
      splatColor: "rgba(255,0,255,0.20)",
    },
    investisseur: {
      headerBg: "linear-gradient(135deg, #FFFF00 0%, #CCFF00 60%, #88FF00 100%)",
      headerText: "#000000",
      bodyBg: "#FFFFF0",
      bodyText: "#333300",
      accentColor: "#CCFF00",
      accentDark: "#556600",
      priceBg: "linear-gradient(135deg, #668800 0%, #AACC00 50%, #CCFF00 100%)",
      priceText: "#000000",
      stripColor1: "#FFFF00",
      stripColor2: "#000033",
      glowColor: "rgba(255,255,0,0.8)",
      detailBg: "rgba(204,255,0,0.12)",
      detailBorder: "rgba(170,204,0,0.40)",
      badgeBg: "#AACC00",
      badgeText: "#000000",
      splatColor: "rgba(255,255,0,0.22)",
    },
  },

  // ── RÉTRO (arcade synthwave — rose | violet | cyan) ────────────────────────
  retro: {
    contravention: {
      headerBg: "linear-gradient(135deg, #FF2D78 0%, #FF5599 60%, #FF88BB 100%)",
      headerText: "#000000",
      bodyBg: "#FFF0F6",
      bodyText: "#6A0030",
      accentColor: "#FF2D78",
      accentDark: "#CC0055",
      priceBg: "linear-gradient(135deg, #CC0055 0%, #FF2D78 50%, #FF5599 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#FF2D78",
      stripColor2: "#2D0040",
      glowColor: "rgba(255,45,120,0.7)",
      detailBg: "rgba(255,45,120,0.10)",
      detailBorder: "rgba(255,45,120,0.35)",
      badgeBg: "#FF2D78",
      badgeText: "#FFFFFF",
      splatColor: "rgba(255,45,120,0.18)",
    },
    contribuable: {
      headerBg: "linear-gradient(135deg, #9933FF 0%, #BB55FF 60%, #DD88FF 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#F8F0FF",
      bodyText: "#3D0070",
      accentColor: "#9933FF",
      accentDark: "#6600CC",
      priceBg: "linear-gradient(135deg, #7700CC 0%, #9933FF 50%, #BB55FF 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#BF5FFF",
      stripColor2: "#2D0040",
      glowColor: "rgba(153,51,255,0.7)",
      detailBg: "rgba(153,51,255,0.10)",
      detailBorder: "rgba(153,51,255,0.35)",
      badgeBg: "#9933FF",
      badgeText: "#FFFFFF",
      splatColor: "rgba(191,95,255,0.18)",
    },
    investisseur: {
      headerBg: "linear-gradient(135deg, #00C8FF 0%, #00E5FF 60%, #80F0FF 100%)",
      headerText: "#000000",
      bodyBg: "#F0FCFF",
      bodyText: "#003D4D",
      accentColor: "#00C8FF",
      accentDark: "#0088BB",
      priceBg: "linear-gradient(135deg, #0088BB 0%, #00A8CC 50%, #00C8FF 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#00F5FF",
      stripColor2: "#2D0040",
      glowColor: "rgba(0,245,255,0.7)",
      detailBg: "rgba(0,200,255,0.10)",
      detailBorder: "rgba(0,200,255,0.35)",
      badgeBg: "#00C8FF",
      badgeText: "#000000",
      splatColor: "rgba(0,245,255,0.20)",
    },
  },

  // ── GLACE (cristal et givre — bleu glacier | cyan glacé | lavande) ─────────
  glace: {
    contravention: {
      headerBg: "linear-gradient(135deg, #1565C0 0%, #1E88E5 60%, #42A5F5 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#E3F2FD",
      bodyText: "#0D47A1",
      accentColor: "#1E88E5",
      accentDark: "#0D47A1",
      priceBg: "linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1E88E5 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#42A5F5",
      stripColor2: "#0D47A1",
      glowColor: "rgba(30,136,229,0.6)",
      detailBg: "rgba(30,136,229,0.12)",
      detailBorder: "rgba(13,71,161,0.35)",
      badgeBg: "#0D47A1",
      badgeText: "#FFFFFF",
      splatColor: "rgba(144,202,249,0.35)",
    },
    contribuable: {
      headerBg: "linear-gradient(135deg, #00838F 0%, #00BCD4 60%, #4DD0E1 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#E0F7FA",
      bodyText: "#006064",
      accentColor: "#00BCD4",
      accentDark: "#006064",
      priceBg: "linear-gradient(135deg, #004D40 0%, #00838F 50%, #00BCD4 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#4DD0E1",
      stripColor2: "#006064",
      glowColor: "rgba(0,188,212,0.6)",
      detailBg: "rgba(0,188,212,0.12)",
      detailBorder: "rgba(0,131,143,0.35)",
      badgeBg: "#00838F",
      badgeText: "#FFFFFF",
      splatColor: "rgba(77,208,225,0.30)",
    },
    investisseur: {
      headerBg: "linear-gradient(135deg, #4527A0 0%, #7C4DFF 60%, #B39DDB 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#EDE7F6",
      bodyText: "#311B92",
      accentColor: "#7C4DFF",
      accentDark: "#311B92",
      priceBg: "linear-gradient(135deg, #311B92 0%, #4527A0 50%, #7C4DFF 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#B39DDB",
      stripColor2: "#311B92",
      glowColor: "rgba(124,77,255,0.6)",
      detailBg: "rgba(124,77,255,0.12)",
      detailBorder: "rgba(69,39,160,0.35)",
      badgeBg: "#4527A0",
      badgeText: "#FFFFFF",
      splatColor: "rgba(179,157,219,0.30)",
    },
  },

  // ── FEU (flammes et lave — rouge lave | orange brûlé | bordeaux) ──────────
  feu: {
    contravention: {
      headerBg: "linear-gradient(135deg, #FF1744 0%, #FF4081 60%, #FF6090 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#FFF0F2",
      bodyText: "#5D0010",
      accentColor: "#FF1744",
      accentDark: "#C62828",
      priceBg: "linear-gradient(135deg, #B71C1C 0%, #FF1744 50%, #FF4081 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#FF1744",
      stripColor2: "#3D0000",
      glowColor: "rgba(255,23,68,0.7)",
      detailBg: "rgba(255,23,68,0.10)",
      detailBorder: "rgba(198,40,40,0.35)",
      badgeBg: "#C62828",
      badgeText: "#FFFFFF",
      splatColor: "rgba(255,64,129,0.22)",
    },
    contribuable: {
      headerBg: "linear-gradient(135deg, #E65100 0%, #FF6D00 60%, #FF9100 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#FFF3E0",
      bodyText: "#5D2000",
      accentColor: "#FF6D00",
      accentDark: "#E65100",
      priceBg: "linear-gradient(135deg, #BF360C 0%, #E65100 50%, #FF6D00 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#FF9100",
      stripColor2: "#3D1000",
      glowColor: "rgba(255,109,0,0.7)",
      detailBg: "rgba(255,109,0,0.10)",
      detailBorder: "rgba(230,81,0,0.35)",
      badgeBg: "#E65100",
      badgeText: "#FFFFFF",
      splatColor: "rgba(255,145,0,0.22)",
    },
    investisseur: {
      headerBg: "linear-gradient(135deg, #880E4F 0%, #AD1457 60%, #E91E63 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#FCE4EC",
      bodyText: "#4A0020",
      accentColor: "#AD1457",
      accentDark: "#880E4F",
      priceBg: "linear-gradient(135deg, #560027 0%, #880E4F 50%, #AD1457 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#E91E63",
      stripColor2: "#3D0000",
      glowColor: "rgba(173,20,87,0.7)",
      detailBg: "rgba(173,20,87,0.10)",
      detailBorder: "rgba(136,14,79,0.35)",
      badgeBg: "#880E4F",
      badgeText: "#FFFFFF",
      splatColor: "rgba(233,30,99,0.22)",
    },
  },

  // ── ROYAL (luxe — or royal | vert émeraude | bordeaux royal) ─────────────
  royal: {
    contravention: {
      headerBg: "linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #FFD700 100%)",
      headerText: "#000000",
      bodyBg: "#FFFDE7",
      bodyText: "#3D2800",
      accentColor: "#C9A84C",
      accentDark: "#8B6914",
      priceBg: "linear-gradient(135deg, #5D4037 0%, #8B6914 50%, #C9A84C 100%)",
      priceText: "#FFD700",
      stripColor1: "#FFD700",
      stripColor2: "#1A0F00",
      glowColor: "rgba(201,168,76,0.7)",
      detailBg: "rgba(201,168,76,0.15)",
      detailBorder: "rgba(201,168,76,0.45)",
      badgeBg: "#8B6914",
      badgeText: "#FFD700",
      splatColor: "rgba(255,215,0,0.25)",
    },
    contribuable: {
      headerBg: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)",
      headerText: "#FFD700",
      bodyBg: "#E8F5E9",
      bodyText: "#1B3A1B",
      accentColor: "#2E7D32",
      accentDark: "#1B5E20",
      priceBg: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #C9A84C 100%)",
      priceText: "#FFD700",
      stripColor1: "#FFD700",
      stripColor2: "#1B5E20",
      glowColor: "rgba(46,125,50,0.7)",
      detailBg: "rgba(201,168,76,0.15)",
      detailBorder: "rgba(201,168,76,0.45)",
      badgeBg: "#1B5E20",
      badgeText: "#FFD700",
      splatColor: "rgba(255,215,0,0.22)",
    },
    investisseur: {
      headerBg: "linear-gradient(135deg, #4A0E35 0%, #6A1045 50%, #8B1A5A 100%)",
      headerText: "#FFD700",
      bodyBg: "#FFF5FA",
      bodyText: "#3D0028",
      accentColor: "#8B1A5A",
      accentDark: "#4A0E35",
      priceBg: "linear-gradient(135deg, #4A0E35 0%, #6A1045 50%, #C9A84C 100%)",
      priceText: "#FFD700",
      stripColor1: "#FFD700",
      stripColor2: "#4A0E35",
      glowColor: "rgba(138,26,90,0.7)",
      detailBg: "rgba(201,168,76,0.15)",
      detailBorder: "rgba(201,168,76,0.45)",
      badgeBg: "#4A0E35",
      badgeText: "#FFD700",
      splatColor: "rgba(255,215,0,0.22)",
    },
  },

  // ── FORÊT PREMIUM (bois et mousse — vert forêt | brun bois | ocre) ─────────
  // Palette naturelle et organique — textures bois et végétation
  foret: {
    contravention: {
      // Vert forêt profond
      headerBg: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)",
      headerText: "#F0E68C",
      bodyBg: "#F1F8F4",
      bodyText: "#1B3A2A",
      accentColor: "#2D6A4F",
      accentDark: "#1B4332",
      priceBg: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #52B788 100%)",
      priceText: "#F0E68C",
      // Bandes : vert forêt + brun sombre
      stripColor1: "#52B788",
      stripColor2: "#3B1F0A",
      glowColor: "rgba(45,106,79,0.7)",
      detailBg: "rgba(45,106,79,0.12)",
      detailBorder: "rgba(27,67,50,0.40)",
      badgeBg: "#1B4332",
      badgeText: "#F0E68C",
      splatColor: "rgba(82,183,136,0.22)",
    },
    contribuable: {
      // Brun bois chaleureux
      headerBg: "linear-gradient(135deg, #5C3317 0%, #8B4513 60%, #A0522D 100%)",
      headerText: "#F5DEB3",
      bodyBg: "#FDF5EC",
      bodyText: "#3D1A00",
      accentColor: "#8B4513",
      accentDark: "#5C3317",
      priceBg: "linear-gradient(135deg, #5C3317 0%, #8B4513 50%, #CD853F 100%)",
      priceText: "#F5DEB3",
      // Bandes : brun bois + vert sombre
      stripColor1: "#CD853F",
      stripColor2: "#1B4332",
      glowColor: "rgba(139,69,19,0.7)",
      detailBg: "rgba(139,69,19,0.12)",
      detailBorder: "rgba(92,51,23,0.40)",
      badgeBg: "#5C3317",
      badgeText: "#F5DEB3",
      splatColor: "rgba(205,133,63,0.22)",
    },
    investisseur: {
      // Ocre mousse et lichens
      headerBg: "linear-gradient(135deg, #6B6B2A 0%, #8B8B00 60%, #9ACD32 100%)",
      headerText: "#1A1A00",
      bodyBg: "#F5F5E0",
      bodyText: "#2A2A00",
      accentColor: "#8B8B00",
      accentDark: "#6B6B2A",
      priceBg: "linear-gradient(135deg, #4A4A00 0%, #6B6B2A 50%, #9ACD32 100%)",
      priceText: "#F5F5E0",
      // Bandes : ocre + vert forêt
      stripColor1: "#9ACD32",
      stripColor2: "#1B4332",
      glowColor: "rgba(139,139,0,0.7)",
      detailBg: "rgba(139,139,0,0.12)",
      detailBorder: "rgba(107,107,42,0.40)",
      badgeBg: "#6B6B2A",
      badgeText: "#F5F5E0",
      splatColor: "rgba(154,205,50,0.22)",
    },
  },

  // ── MÉTAL PREMIUM (acier et chrome — argent | acier | titane) ─────────────
  // Palette métallique industrielle — reflets froids et brillants
  metal: {
    contravention: {
      // Acier brossé froid
      headerBg: "linear-gradient(135deg, #37474F 0%, #546E7A 50%, #78909C 100%)",
      headerText: "#ECEFF1",
      bodyBg: "#ECEFF1",
      bodyText: "#1C2B33",
      accentColor: "#546E7A",
      accentDark: "#263238",
      priceBg: "linear-gradient(135deg, #263238 0%, #37474F 50%, #78909C 100%)",
      priceText: "#ECEFF1",
      // Bandes : chrome + acier sombre
      stripColor1: "#90A4AE",
      stripColor2: "#1C2B33",
      glowColor: "rgba(84,110,122,0.7)",
      detailBg: "rgba(84,110,122,0.15)",
      detailBorder: "rgba(55,71,79,0.45)",
      badgeBg: "#263238",
      badgeText: "#B0BEC5",
      splatColor: "rgba(144,164,174,0.30)",
    },
    contribuable: {
      // Chrome brillant et cuivre
      headerBg: "linear-gradient(135deg, #4E342E 0%, #6D4C41 50%, #8D6E63 100%)",
      headerText: "#EFEBE9",
      bodyBg: "#EFEBE9",
      bodyText: "#2C1810",
      accentColor: "#6D4C41",
      accentDark: "#3E2723",
      priceBg: "linear-gradient(135deg, #3E2723 0%, #4E342E 50%, #8D6E63 100%)",
      priceText: "#EFEBE9",
      // Bandes : cuivre + brun métal
      stripColor1: "#A1887F",
      stripColor2: "#1A0F0A",
      glowColor: "rgba(109,76,65,0.7)",
      detailBg: "rgba(109,76,65,0.15)",
      detailBorder: "rgba(78,52,46,0.45)",
      badgeBg: "#3E2723",
      badgeText: "#D7CCC8",
      splatColor: "rgba(161,136,127,0.30)",
    },
    investisseur: {
      // Titane et platine
      headerBg: "linear-gradient(135deg, #424242 0%, #616161 50%, #9E9E9E 100%)",
      headerText: "#F5F5F5",
      bodyBg: "#F5F5F5",
      bodyText: "#1A1A1A",
      accentColor: "#616161",
      accentDark: "#212121",
      priceBg: "linear-gradient(135deg, #212121 0%, #424242 50%, #9E9E9E 100%)",
      priceText: "#F5F5F5",
      // Bandes : gris titane + noir
      stripColor1: "#BDBDBD",
      stripColor2: "#1A1A1A",
      glowColor: "rgba(97,97,97,0.7)",
      detailBg: "rgba(97,97,97,0.15)",
      detailBorder: "rgba(66,66,66,0.45)",
      badgeBg: "#212121",
      badgeText: "#E0E0E0",
      splatColor: "rgba(189,189,189,0.30)",
    },
  },

  // ── COSMIC PREMIUM (étoiles et nébuleuses — violet espace | bleu nuit | cyan stellaire) ──
  // Palette espace profond — scintillant, lumineux, planètes et étoiles
  cosmic: {
    contravention: {
      // Violet espace profond
      headerBg: "linear-gradient(135deg, #0B0033 0%, #1A0050 30%, #3D1080 70%, #6B21A8 100%)",
      headerText: "#E9D5FF",
      bodyBg: "#0D0026",
      bodyText: "#E9D5FF",
      accentColor: "#7C3AED",
      accentDark: "#4C1D95",
      priceBg: "linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #A78BFA 100%)",
      priceText: "#F5F3FF",
      stripColor1: "#A78BFA",
      stripColor2: "#0B0033",
      glowColor: "rgba(124,58,237,0.9)",
      detailBg: "rgba(124,58,237,0.18)",
      detailBorder: "rgba(167,139,250,0.50)",
      badgeBg: "#4C1D95",
      badgeText: "#DDD6FE",
      splatColor: "rgba(167,139,250,0.35)",
    },
    contribuable: {
      // Bleu nuit galactique
      headerBg: "linear-gradient(135deg, #001233 0%, #023E8A 30%, #0077B6 70%, #00B4D8 100%)",
      headerText: "#CAF0F8",
      bodyBg: "#001233",
      bodyText: "#CAF0F8",
      accentColor: "#0077B6",
      accentDark: "#001233",
      priceBg: "linear-gradient(135deg, #001233 0%, #023E8A 50%, #00B4D8 100%)",
      priceText: "#CAF0F8",
      stripColor1: "#90E0EF",
      stripColor2: "#001233",
      glowColor: "rgba(0,119,182,0.9)",
      detailBg: "rgba(0,119,182,0.18)",
      detailBorder: "rgba(144,224,239,0.50)",
      badgeBg: "#001233",
      badgeText: "#ADE8F4",
      splatColor: "rgba(144,224,239,0.35)",
    },
    investisseur: {
      // Cyan stellaire — étoile à neutrons
      headerBg: "linear-gradient(135deg, #0A1628 0%, #0E4D6E 30%, #0891B2 70%, #22D3EE 100%)",
      headerText: "#ECFEFF",
      bodyBg: "#0A1628",
      bodyText: "#ECFEFF",
      accentColor: "#0891B2",
      accentDark: "#0A1628",
      priceBg: "linear-gradient(135deg, #0A1628 0%, #0E4D6E 50%, #22D3EE 100%)",
      priceText: "#ECFEFF",
      stripColor1: "#67E8F9",
      stripColor2: "#0A1628",
      glowColor: "rgba(8,145,178,0.9)",
      detailBg: "rgba(8,145,178,0.18)",
      detailBorder: "rgba(103,232,249,0.50)",
      badgeBg: "#0A1628",
      badgeText: "#A5F3FC",
      splatColor: "rgba(103,232,249,0.35)",
    },
  },
  // ── MAGIQUE PREMIUM (holographique — arc-en-ciel | rose | violet) ──────────
  // Palette holographique scintillante — effet magique et reflets iridescents
  magique: {
    contravention: {
      // Arc-en-ciel holographique rose
      headerBg: "linear-gradient(135deg, #FF006E 0%, #FB5607 20%, #FFBE0B 40%, #3A86FF 60%, #8338EC 80%, #FF006E 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#1A0030",
      bodyText: "#FFE8FF",
      accentColor: "#FF006E",
      accentDark: "#8338EC",
      priceBg: "linear-gradient(135deg, #8338EC 0%, #FF006E 50%, #FFBE0B 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#FF79C6",
      stripColor2: "#8338EC",
      glowColor: "rgba(255,0,110,0.9)",
      detailBg: "rgba(255,0,110,0.15)",
      detailBorder: "rgba(255,121,198,0.55)",
      badgeBg: "#8338EC",
      badgeText: "#FFD6FF",
      splatColor: "rgba(255,121,198,0.35)",
    },
    contribuable: {
      // Turquoise magique iridescent
      headerBg: "linear-gradient(135deg, #3A86FF 0%, #06D6A0 25%, #FFBE0B 50%, #FF006E 75%, #3A86FF 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#001A2C",
      bodyText: "#D0FFF8",
      accentColor: "#06D6A0",
      accentDark: "#003D2E",
      priceBg: "linear-gradient(135deg, #003D2E 0%, #06D6A0 50%, #3A86FF 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#5EFCE8",
      stripColor2: "#003D2E",
      glowColor: "rgba(6,214,160,0.9)",
      detailBg: "rgba(6,214,160,0.15)",
      detailBorder: "rgba(94,252,232,0.55)",
      badgeBg: "#003D2E",
      badgeText: "#ADFFF0",
      splatColor: "rgba(94,252,232,0.35)",
    },
    investisseur: {
      // Or magique et violet
      headerBg: "linear-gradient(135deg, #FFBE0B 0%, #FF006E 25%, #8338EC 50%, #3A86FF 75%, #FFBE0B 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#1A1000",
      bodyText: "#FFF8D6",
      accentColor: "#FFBE0B",
      accentDark: "#7A5800",
      priceBg: "linear-gradient(135deg, #7A5800 0%, #FFBE0B 50%, #FF006E 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#FFE566",
      stripColor2: "#7A5800",
      glowColor: "rgba(255,190,11,0.9)",
      detailBg: "rgba(255,190,11,0.15)",
      detailBorder: "rgba(255,229,102,0.55)",
      badgeBg: "#7A5800",
      badgeText: "#FFF3B0",
      splatColor: "rgba(255,229,102,0.35)",
    },
  },
  // ── PRESTIGE PREMIUM (diamant glossy — violet | saphir | améthyste) ────────
  // Palette luxe extrême — reflets arc-en-ciel et brillance diamant
  prestige: {
    contravention: {
      // Saphir royal profond
      headerBg: "linear-gradient(135deg, #0D47A1 0%, #1565C0 30%, #7B1FA2 70%, #4A148C 100%)",
      headerText: "#E8EAF6",
      bodyBg: "#EDE7F6",
      bodyText: "#1A0033",
      accentColor: "#7B1FA2",
      accentDark: "#4A148C",
      priceBg: "linear-gradient(135deg, #4A148C 0%, #7B1FA2 40%, #1565C0 100%)",
      priceText: "#E8EAF6",
      // Bandes : violet diamant + bleu profond
      stripColor1: "#CE93D8",
      stripColor2: "#0D47A1",
      glowColor: "rgba(123,31,162,0.8)",
      detailBg: "rgba(123,31,162,0.15)",
      detailBorder: "rgba(74,20,140,0.50)",
      badgeBg: "#4A148C",
      badgeText: "#E1BEE7",
      splatColor: "rgba(206,147,216,0.30)",
    },
    contribuable: {
      // Émeraude diamant
      headerBg: "linear-gradient(135deg, #004D40 0%, #00695C 30%, #00897B 70%, #26A69A 100%)",
      headerText: "#E0F2F1",
      bodyBg: "#E0F2F1",
      bodyText: "#00251A",
      accentColor: "#00897B",
      accentDark: "#004D40",
      priceBg: "linear-gradient(135deg, #004D40 0%, #00695C 40%, #26A69A 100%)",
      priceText: "#E0F2F1",
      // Bandes : turquoise diamant + vert profond
      stripColor1: "#80CBC4",
      stripColor2: "#004D40",
      glowColor: "rgba(0,137,123,0.8)",
      detailBg: "rgba(0,137,123,0.15)",
      detailBorder: "rgba(0,77,64,0.50)",
      badgeBg: "#004D40",
      badgeText: "#B2DFDB",
      splatColor: "rgba(128,203,196,0.30)",
    },
    investisseur: {
      // Améthyste rose diamant
      headerBg: "linear-gradient(135deg, #880E4F 0%, #AD1457 30%, #C2185B 60%, #E91E63 100%)",
      headerText: "#FCE4EC",
      bodyBg: "#FCE4EC",
      bodyText: "#3D0020",
      accentColor: "#C2185B",
      accentDark: "#880E4F",
      priceBg: "linear-gradient(135deg, #880E4F 0%, #C2185B 40%, #F06292 100%)",
      priceText: "#FCE4EC",
      // Bandes : rose diamant + bordeaux profond
      stripColor1: "#F48FB1",
      stripColor2: "#880E4F",
      glowColor: "rgba(194,24,91,0.8)",
      detailBg: "rgba(194,24,91,0.15)",
      detailBorder: "rgba(136,14,79,0.50)",
      badgeBg: "#880E4F",
      badgeText: "#F8BBD9",
      splatColor: "rgba(244,143,177,0.30)",
    },
  },
};

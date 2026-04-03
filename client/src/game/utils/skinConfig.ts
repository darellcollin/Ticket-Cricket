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
 */
import type { CardCategory } from "@/game/utils/cardConfig";

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES DE SKINS
// ─────────────────────────────────────────────────────────────────────────────
export type CardSkinId = "classique" | "neon" | "retro" | "glace" | "feu" | "royal";

export interface SkinMeta {
  id: CardSkinId;
  name: string;
  description: string;
  price: string;
  priceCents: number;
  productId: string;
  color: string;
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
    price: "2,99 $",
    priceCents: 299,
    productId: "skin_neon",
    color: "#00F5FF",
  },
  {
    id: "retro",
    name: "Rétro",
    description: "Arcade synthwave — rose, violet et cyan.",
    price: "2,99 $",
    priceCents: 299,
    productId: "skin_retro",
    color: "#FF6B9D",
  },
  {
    id: "glace",
    name: "Glace",
    description: "Tons bleus glacés et effet cristal.",
    price: "2,99 $",
    priceCents: 299,
    productId: "skin_glace",
    color: "#A8D8EA",
  },
  {
    id: "feu",
    name: "Feu",
    description: "Flammes et lave — rouge, orange et bordeaux.",
    price: "2,99 $",
    priceCents: 299,
    productId: "skin_feu",
    color: "#FF4500",
  },
  {
    id: "royal",
    name: "Royal",
    description: "Luxe — or, émeraude et bordeaux royal.",
    price: "2,99 $",
    priceCents: 299,
    productId: "skin_royal",
    color: "#C9A84C",
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
  // Radicalement différent du Classique : palette cyan/magenta/jaune
  neon: {
    contravention: {
      // Cyan électrique — totalement différent de l'orange classique
      headerBg: "linear-gradient(135deg, #00F5FF 0%, #00BFFF 60%, #0080FF 100%)",
      headerText: "#000000",
      bodyBg: "#E8FFFE",
      bodyText: "#003344",
      accentColor: "#00F5FF",
      accentDark: "#0080FF",
      priceBg: "linear-gradient(135deg, #0060CC 0%, #0090FF 50%, #00F5FF 100%)",
      priceText: "#000000",
      // Bandes : cyan + noir profond
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
      // Magenta vif — totalement différent du vert classique
      headerBg: "linear-gradient(135deg, #FF00FF 0%, #CC00CC 60%, #990099 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#FFF0FF",
      bodyText: "#550055",
      accentColor: "#FF00FF",
      accentDark: "#990099",
      priceBg: "linear-gradient(135deg, #880088 0%, #CC00CC 50%, #FF00FF 100%)",
      priceText: "#FFFFFF",
      // Bandes : magenta + noir profond
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
      // Jaune néon — totalement différent du rose classique
      headerBg: "linear-gradient(135deg, #FFFF00 0%, #CCFF00 60%, #88FF00 100%)",
      headerText: "#000000",
      bodyBg: "#FFFFF0",
      bodyText: "#333300",
      accentColor: "#CCFF00",
      accentDark: "#556600",
      priceBg: "linear-gradient(135deg, #668800 0%, #AACC00 50%, #CCFF00 100%)",
      priceText: "#000000",
      // Bandes : jaune néon + noir profond
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
  // Palette rose/violet/cyan — distinctif et reconnaissable
  retro: {
    contravention: {
      // Rose synthwave vif
      headerBg: "linear-gradient(135deg, #FF2D78 0%, #FF5599 60%, #FF88BB 100%)",
      headerText: "#000000",
      bodyBg: "#FFF0F6",
      bodyText: "#6A0030",
      accentColor: "#FF2D78",
      accentDark: "#CC0055",
      priceBg: "linear-gradient(135deg, #CC0055 0%, #FF2D78 50%, #FF5599 100%)",
      priceText: "#FFFFFF",
      // Bandes : rose vif + violet sombre
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
      // Violet synthwave
      headerBg: "linear-gradient(135deg, #9933FF 0%, #BB55FF 60%, #DD88FF 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#F8F0FF",
      bodyText: "#3D0070",
      accentColor: "#9933FF",
      accentDark: "#6600CC",
      priceBg: "linear-gradient(135deg, #7700CC 0%, #9933FF 50%, #BB55FF 100%)",
      priceText: "#FFFFFF",
      // Bandes : violet vif + violet sombre
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
      // Cyan synthwave
      headerBg: "linear-gradient(135deg, #00C8FF 0%, #00E5FF 60%, #80F0FF 100%)",
      headerText: "#000000",
      bodyBg: "#F0FCFF",
      bodyText: "#003D4D",
      accentColor: "#00C8FF",
      accentDark: "#0088BB",
      priceBg: "linear-gradient(135deg, #0088BB 0%, #00A8CC 50%, #00C8FF 100%)",
      priceText: "#FFFFFF",
      // Bandes : cyan vif + violet sombre
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
  // Palette bleue/glacée — froide et cristalline
  glace: {
    contravention: {
      // Bleu glacier profond
      headerBg: "linear-gradient(135deg, #1565C0 0%, #1E88E5 60%, #42A5F5 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#E3F2FD",
      bodyText: "#0D47A1",
      accentColor: "#1E88E5",
      accentDark: "#0D47A1",
      priceBg: "linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1E88E5 100%)",
      priceText: "#FFFFFF",
      // Bandes : bleu glacier + blanc givré
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
      // Cyan glacé
      headerBg: "linear-gradient(135deg, #00838F 0%, #00BCD4 60%, #4DD0E1 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#E0F7FA",
      bodyText: "#006064",
      accentColor: "#00BCD4",
      accentDark: "#006064",
      priceBg: "linear-gradient(135deg, #004D40 0%, #00838F 50%, #00BCD4 100%)",
      priceText: "#FFFFFF",
      // Bandes : cyan glacé + bleu marine
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
      // Lavande glacée
      headerBg: "linear-gradient(135deg, #4527A0 0%, #7C4DFF 60%, #B39DDB 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#EDE7F6",
      bodyText: "#311B92",
      accentColor: "#7C4DFF",
      accentDark: "#311B92",
      priceBg: "linear-gradient(135deg, #311B92 0%, #4527A0 50%, #7C4DFF 100%)",
      priceText: "#FFFFFF",
      // Bandes : lavande + bleu marine
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
  // Palette rouge/orange/bordeaux — chaude et intense
  feu: {
    contravention: {
      // Rouge lave vif
      headerBg: "linear-gradient(135deg, #FF1744 0%, #FF4081 60%, #FF6090 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#FFF0F2",
      bodyText: "#5D0010",
      accentColor: "#FF1744",
      accentDark: "#C62828",
      priceBg: "linear-gradient(135deg, #B71C1C 0%, #FF1744 50%, #FF4081 100%)",
      priceText: "#FFFFFF",
      // Bandes : rouge lave + brun sombre
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
      // Orange brûlé intense
      headerBg: "linear-gradient(135deg, #E65100 0%, #FF6D00 60%, #FF9100 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#FFF3E0",
      bodyText: "#5D2000",
      accentColor: "#FF6D00",
      accentDark: "#E65100",
      priceBg: "linear-gradient(135deg, #BF360C 0%, #E65100 50%, #FF6D00 100%)",
      priceText: "#FFFFFF",
      // Bandes : orange brûlé + brun sombre
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
      // Bordeaux profond
      headerBg: "linear-gradient(135deg, #880E4F 0%, #AD1457 60%, #E91E63 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#FCE4EC",
      bodyText: "#4A0020",
      accentColor: "#AD1457",
      accentDark: "#880E4F",
      priceBg: "linear-gradient(135deg, #560027 0%, #880E4F 50%, #AD1457 100%)",
      priceText: "#FFFFFF",
      // Bandes : bordeaux + brun sombre
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
  // Palette or/émeraude/bordeaux — luxueux et distinctif
  royal: {
    contravention: {
      // Or royal sombre et luxueux
      headerBg: "linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #FFD700 100%)",
      headerText: "#000000",
      bodyBg: "#FFFDE7",
      bodyText: "#3D2800",
      accentColor: "#C9A84C",
      accentDark: "#8B6914",
      priceBg: "linear-gradient(135deg, #5D4037 0%, #8B6914 50%, #C9A84C 100%)",
      priceText: "#FFD700",
      // Bandes : or vif + noir royal
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
      // Vert émeraude royal
      headerBg: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)",
      headerText: "#FFD700",
      bodyBg: "#E8F5E9",
      bodyText: "#1B3A1B",
      accentColor: "#2E7D32",
      accentDark: "#1B5E20",
      priceBg: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #C9A84C 100%)",
      priceText: "#FFD700",
      // Bandes : or vif + vert sombre
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
      // Bordeaux royal profond
      headerBg: "linear-gradient(135deg, #4A0E35 0%, #6A1045 50%, #8B1A5A 100%)",
      headerText: "#FFD700",
      bodyBg: "#FFF5FA",
      bodyText: "#3D0028",
      accentColor: "#8B1A5A",
      accentDark: "#4A0E35",
      priceBg: "linear-gradient(135deg, #4A0E35 0%, #6A1045 50%, #C9A84C 100%)",
      priceText: "#FFD700",
      // Bandes : or vif + bordeaux sombre
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
};

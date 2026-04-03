/**
 * skinConfig.ts — Types, catalogue et tokens visuels des skins de cartes.
 * Séparé de GeneratedCard.tsx pour compatibilité avec Vite Fast Refresh.
 *
 * RÈGLE FONDAMENTALE : chaque skin respecte EXACTEMENT la même structure visuelle
 * que le skin Classique :
 *   - Fond de corps CLAIR (teinté selon la palette du skin) pour lisibilité maximale
 *   - Bandes zébrées bicolores contrastées (couleur vive + couleur foncée)
 *   - Splat décoratif visible en arrière-plan
 *   - Header coloré avec dégradé vif
 *   - Texte du méfait foncé sur fond clair (contraste élevé)
 * Seules les couleurs changent — la structure est identique au Classique.
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
    description: "Cyberpunk sombre avec lueurs néon vives.",
    price: "2,99 $",
    priceCents: 299,
    productId: "skin_neon",
    color: "#00F5FF",
  },
  {
    id: "retro",
    name: "Rétro",
    description: "Arcade synthwave — violet, cyan et rose néon.",
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
    description: "Flammes et lave — rouge et orange intenses.",
    price: "2,99 $",
    priceCents: 299,
    productId: "skin_feu",
    color: "#FF4500",
  },
  {
    id: "royal",
    name: "Royal",
    description: "Fond sombre, dorures et marbre luxueux.",
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

  // ── NÉON (cyberpunk — fond de corps légèrement teinté mais CLAIR, bandes néon) ──
  // Fond crème teinté légèrement selon la couleur néon → lisibilité identique au classique
  neon: {
    contravention: {
      // Header : dégradé orange néon vif
      headerBg: "linear-gradient(135deg, #FF6600 0%, #FF8800 60%, #FFAA00 100%)",
      headerText: "#000000",
      // Corps : fond crème très légèrement teinté orange — lisible comme le classique
      bodyBg: "#FFF8F0",
      bodyText: "#5D2000",
      accentColor: "#FF6600",
      accentDark: "#CC4400",
      // Prix : dégradé orange néon vif
      priceBg: "linear-gradient(135deg, #FF4400 0%, #FF6600 50%, #FF8800 100%)",
      priceText: "#FFFFFF",
      // Bandes : orange néon + noir (contraste maximal)
      stripColor1: "#FF6600",
      stripColor2: "#000000",
      glowColor: "rgba(255,102,0,0.7)",
      detailBg: "rgba(255,102,0,0.10)",
      detailBorder: "rgba(255,102,0,0.35)",
      badgeBg: "#FF6600",
      badgeText: "#FFFFFF",
      splatColor: "rgba(255,136,0,0.20)",
    },
    contribuable: {
      headerBg: "linear-gradient(135deg, #00CC55 0%, #00EE66 60%, #00FF88 100%)",
      headerText: "#000000",
      // Corps : fond vert très pâle — lisible
      bodyBg: "#F0FFF6",
      bodyText: "#003D1A",
      accentColor: "#00CC55",
      accentDark: "#009940",
      priceBg: "linear-gradient(135deg, #009944 0%, #00CC55 50%, #00EE66 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#00FF88",
      stripColor2: "#000000",
      glowColor: "rgba(0,255,136,0.7)",
      detailBg: "rgba(0,204,85,0.10)",
      detailBorder: "rgba(0,204,85,0.35)",
      badgeBg: "#00CC55",
      badgeText: "#000000",
      splatColor: "rgba(0,255,136,0.20)",
    },
    investisseur: {
      headerBg: "linear-gradient(135deg, #CC0088 0%, #EE00AA 60%, #FF44CC 100%)",
      headerText: "#FFFFFF",
      // Corps : fond rose très pâle — lisible
      bodyBg: "#FFF0FA",
      bodyText: "#6A0030",
      accentColor: "#CC0088",
      accentDark: "#990066",
      priceBg: "linear-gradient(135deg, #AA0066 0%, #CC0088 50%, #EE00AA 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#FF00AA",
      stripColor2: "#000000",
      glowColor: "rgba(255,0,170,0.7)",
      detailBg: "rgba(204,0,136,0.10)",
      detailBorder: "rgba(204,0,136,0.35)",
      badgeBg: "#CC0088",
      badgeText: "#FFFFFF",
      splatColor: "rgba(255,0,170,0.20)",
    },
  },

  // ── RÉTRO (arcade synthwave — fond clair teinté, bandes rose/cyan/violet) ──
  retro: {
    contravention: {
      // Header : rose synthwave vif
      headerBg: "linear-gradient(135deg, #FF2D78 0%, #FF5599 60%, #FF88BB 100%)",
      headerText: "#000000",
      // Corps : fond rose très pâle teinté — lisible
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
      headerBg: "linear-gradient(135deg, #00C8FF 0%, #00E5FF 60%, #80F0FF 100%)",
      headerText: "#000000",
      // Corps : fond cyan très pâle — lisible
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
    investisseur: {
      headerBg: "linear-gradient(135deg, #9933FF 0%, #BB55FF 60%, #DD88FF 100%)",
      headerText: "#FFFFFF",
      // Corps : fond violet très pâle — lisible
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
  },

  // ── GLACE (cristal et givre — fond très clair, tons bleus glacés) ──
  glace: {
    contravention: {
      headerBg: "linear-gradient(135deg, #2196F3 0%, #42A5F5 60%, #90CAF9 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#E3F2FD",
      bodyText: "#0D47A1",
      accentColor: "#2196F3",
      accentDark: "#0D47A1",
      priceBg: "linear-gradient(135deg, #1565C0 0%, #2196F3 50%, #42A5F5 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#90CAF9",
      stripColor2: "#1565C0",
      glowColor: "rgba(33,150,243,0.5)",
      detailBg: "rgba(33,150,243,0.12)",
      detailBorder: "rgba(21,101,192,0.35)",
      badgeBg: "#1565C0",
      badgeText: "#FFFFFF",
      splatColor: "rgba(144,202,249,0.30)",
    },
    contribuable: {
      headerBg: "linear-gradient(135deg, #00BCD4 0%, #26C6DA 60%, #80DEEA 100%)",
      headerText: "#000000",
      bodyBg: "#E0F7FA",
      bodyText: "#006064",
      accentColor: "#00BCD4",
      accentDark: "#006064",
      priceBg: "linear-gradient(135deg, #00838F 0%, #00BCD4 50%, #26C6DA 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#80DEEA",
      stripColor2: "#00838F",
      glowColor: "rgba(0,188,212,0.5)",
      detailBg: "rgba(0,188,212,0.12)",
      detailBorder: "rgba(0,131,143,0.35)",
      badgeBg: "#00838F",
      badgeText: "#FFFFFF",
      splatColor: "rgba(128,222,234,0.30)",
    },
    investisseur: {
      headerBg: "linear-gradient(135deg, #7C4DFF 0%, #9575CD 60%, #CE93D8 100%)",
      headerText: "#FFFFFF",
      bodyBg: "#EDE7F6",
      bodyText: "#311B92",
      accentColor: "#7C4DFF",
      accentDark: "#311B92",
      priceBg: "linear-gradient(135deg, #4527A0 0%, #7C4DFF 50%, #9575CD 100%)",
      priceText: "#FFFFFF",
      stripColor1: "#CE93D8",
      stripColor2: "#4527A0",
      glowColor: "rgba(124,77,255,0.5)",
      detailBg: "rgba(124,77,255,0.12)",
      detailBorder: "rgba(69,39,160,0.35)",
      badgeBg: "#4527A0",
      badgeText: "#FFFFFF",
      splatColor: "rgba(206,147,216,0.30)",
    },
  },

  // ── FEU (flammes et lave — fond clair chaud, bandes feu vives) ──
  feu: {
    contravention: {
      headerBg: "linear-gradient(135deg, #FF6D00 0%, #FF8F00 60%, #FFB300 100%)",
      headerText: "#000000",
      // Corps : fond crème chaud très pâle — lisible comme le classique
      bodyBg: "#FFF8F0",
      bodyText: "#5D2000",
      accentColor: "#FF6D00",
      accentDark: "#E65100",
      priceBg: "linear-gradient(135deg, #E65100 0%, #FF6D00 50%, #FF8F00 100%)",
      priceText: "#FFFFFF",
      // Bandes : orange feu + brun sombre (contraste fort)
      stripColor1: "#FF6D00",
      stripColor2: "#3D1000",
      glowColor: "rgba(255,109,0,0.7)",
      detailBg: "rgba(255,109,0,0.10)",
      detailBorder: "rgba(230,81,0,0.35)",
      badgeBg: "#E65100",
      badgeText: "#FFFFFF",
      splatColor: "rgba(255,179,0,0.22)",
    },
    contribuable: {
      headerBg: "linear-gradient(135deg, #DD2C00 0%, #FF3D00 60%, #FF6E40 100%)",
      headerText: "#FFFFFF",
      // Corps : fond pêche très pâle — lisible
      bodyBg: "#FFF5F0",
      bodyText: "#5D1500",
      accentColor: "#FF3D00",
      accentDark: "#DD2C00",
      priceBg: "linear-gradient(135deg, #BF360C 0%, #DD2C00 50%, #FF3D00 100%)",
      priceText: "#FFFFFF",
      // Bandes : rouge feu + brun sombre
      stripColor1: "#FF3D00",
      stripColor2: "#3D1000",
      glowColor: "rgba(221,44,0,0.7)",
      detailBg: "rgba(255,61,0,0.10)",
      detailBorder: "rgba(191,54,12,0.35)",
      badgeBg: "#BF360C",
      badgeText: "#FFFFFF",
      splatColor: "rgba(255,110,64,0.22)",
    },
    investisseur: {
      headerBg: "linear-gradient(135deg, #B71C1C 0%, #D32F2F 60%, #EF5350 100%)",
      headerText: "#FFFFFF",
      // Corps : fond rose très pâle chaud — lisible
      bodyBg: "#FFF0F0",
      bodyText: "#5D0000",
      accentColor: "#D32F2F",
      accentDark: "#B71C1C",
      priceBg: "linear-gradient(135deg, #7F0000 0%, #B71C1C 50%, #D32F2F 100%)",
      priceText: "#FFFFFF",
      // Bandes : rouge sombre + orange feu
      stripColor1: "#EF5350",
      stripColor2: "#3D0000",
      glowColor: "rgba(183,28,28,0.7)",
      detailBg: "rgba(211,47,47,0.10)",
      detailBorder: "rgba(127,0,0,0.35)",
      badgeBg: "#7F0000",
      badgeText: "#FFFFFF",
      splatColor: "rgba(239,83,80,0.22)",
    },
  },

  // ── ROYAL (luxe, or et marbre — fond clair ivoire doré, dorures) ──
  royal: {
    contravention: {
      // Header : dégradé or luxueux
      headerBg: "linear-gradient(135deg, #F57F17 0%, #C9A84C 50%, #FFD700 100%)",
      headerText: "#000000",
      // Corps : fond ivoire doré très clair — lisible et luxueux
      bodyBg: "#FFFDE7",
      bodyText: "#3D2800",
      accentColor: "#C9A84C",
      accentDark: "#8B6914",
      priceBg: "linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #FFD700 100%)",
      priceText: "#000000",
      // Bandes : or vif + noir (contraste maximal, style luxe)
      stripColor1: "#FFD700",
      stripColor2: "#000000",
      glowColor: "rgba(201,168,76,0.6)",
      detailBg: "rgba(201,168,76,0.15)",
      detailBorder: "rgba(201,168,76,0.40)",
      badgeBg: "#C9A84C",
      badgeText: "#000000",
      splatColor: "rgba(255,215,0,0.22)",
    },
    contribuable: {
      headerBg: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #C9A84C 100%)",
      headerText: "#FFD700",
      // Corps : fond vert très pâle ivoire — lisible
      bodyBg: "#F5FFF5",
      bodyText: "#1B3A1B",
      accentColor: "#C9A84C",
      accentDark: "#8B6914",
      priceBg: "linear-gradient(135deg, #1B5E20 0%, #C9A84C 50%, #FFD700 100%)",
      priceText: "#000000",
      // Bandes : or vif + vert sombre
      stripColor1: "#FFD700",
      stripColor2: "#1B5E20",
      glowColor: "rgba(201,168,76,0.6)",
      detailBg: "rgba(201,168,76,0.15)",
      detailBorder: "rgba(201,168,76,0.40)",
      badgeBg: "#C9A84C",
      badgeText: "#000000",
      splatColor: "rgba(255,215,0,0.22)",
    },
    investisseur: {
      headerBg: "linear-gradient(135deg, #4A0E35 0%, #6A1045 50%, #C9A84C 100%)",
      headerText: "#FFD700",
      // Corps : fond rose ivoire très pâle — lisible
      bodyBg: "#FFF5FA",
      bodyText: "#3D0028",
      accentColor: "#C9A84C",
      accentDark: "#8B6914",
      priceBg: "linear-gradient(135deg, #4A0E35 0%, #C9A84C 50%, #FFD700 100%)",
      priceText: "#000000",
      // Bandes : or vif + bordeaux sombre
      stripColor1: "#FFD700",
      stripColor2: "#4A0E35",
      glowColor: "rgba(201,168,76,0.6)",
      detailBg: "rgba(201,168,76,0.15)",
      detailBorder: "rgba(201,168,76,0.40)",
      badgeBg: "#C9A84C",
      badgeText: "#000000",
      splatColor: "rgba(255,215,0,0.22)",
    },
  },
};

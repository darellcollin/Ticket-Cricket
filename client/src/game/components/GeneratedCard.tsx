import React from "react";
import {
  CardConfig,
  CardCategory,
  CATEGORY_INFO,
  TYPE_INFO,
  drawerNetAmount,
  nextPlayerAmount,
  formatPrice,
} from "@/game/utils/cardConfig";
import { getCardMefait } from "@/game/utils/cardMefaits";

// ─────────────────────────────────────────────────────────────────────────────
//  DESIGN TOKENS — Couleurs par catégorie
//    Jaune = Contravention | Vert = Contribuable | Rose = Investisseur
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<
  CardCategory,
  {
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
  }
> = {
  contravention: {
    headerBg: "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)",
    headerText: "#000000",
    bodyBg: "#FFFBEB",
    bodyText: "#78350F",
    accentColor: "#D97706",
    accentDark: "#92400E",
    priceBg: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)",
    priceText: "#000000",
    stripColor1: "#FBBF24",
    stripColor2: "#92400E",
    glowColor: "rgba(245,158,11,0.35)",
    detailBg: "rgba(245,158,11,0.08)",
    detailBorder: "rgba(245,158,11,0.25)",
  },
  contribuable: {
    headerBg: "linear-gradient(135deg, #22C55E 0%, #16A34A 50%, #15803D 100%)",
    headerText: "#FFFFFF",
    bodyBg: "#F0FDF4",
    bodyText: "#14532D",
    accentColor: "#16A34A",
    accentDark: "#14532D",
    priceBg: "linear-gradient(135deg, #4ADE80 0%, #22C55E 50%, #16A34A 100%)",
    priceText: "#FFFFFF",
    stripColor1: "#86EFAC",
    stripColor2: "#14532D",
    glowColor: "rgba(34,197,94,0.35)",
    detailBg: "rgba(34,197,94,0.08)",
    detailBorder: "rgba(34,197,94,0.25)",
  },
  investisseur: {
    headerBg: "linear-gradient(135deg, #EC4899 0%, #DB2777 50%, #BE185D 100%)",
    headerText: "#FFFFFF",
    bodyBg: "#FDF2F8",
    bodyText: "#831843",
    accentColor: "#DB2777",
    accentDark: "#831843",
    priceBg: "linear-gradient(135deg, #F472B6 0%, #EC4899 50%, #DB2777 100%)",
    priceText: "#FFFFFF",
    stripColor1: "#F9A8D4",
    stripColor2: "#831843",
    glowColor: "rgba(236,72,153,0.35)",
    detailBg: "rgba(236,72,153,0.08)",
    detailBorder: "rgba(236,72,153,0.25)",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

interface GeneratedCardProps {
  card: CardConfig;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

export function GeneratedCard({
  card,
  size = "md",
  className = "",
  style,
}: GeneratedCardProps) {
  const catInfo = CATEGORY_INFO[card.category];
  const typeInfo = TYPE_INFO[card.cardType];
  const catStyle = CATEGORY_STYLES[card.category];
  const mefait = getCardMefait(card.id);

  // ── Dimensions responsive ──
  const dims = {
    xs: {
      w: 80, h: 112,
      borderW: 2, stripH: 3, borderRadius: 6,
      // Header
      headerPadY: 2, headerPadX: 4,
      catFontSize: "0.4rem",
      numFontSize: "0.3rem",
      // Body — texte du méfait
      bodyPadX: 4, bodyPadY: 2,
      textFontSize: "0.38rem",
      textMaxLines: 3,
      // Détails financiers
      detailFontSize: "0.28rem",
      detailPadX: 3, detailPadY: 1,
      // Prix
      priceFontSize: "0.7rem",
      pricePadY: 3,
    },
    sm: {
      w: 160, h: 224,
      borderW: 3, stripH: 5, borderRadius: 10,
      headerPadY: 5, headerPadX: 8,
      catFontSize: "0.85rem",
      numFontSize: "0.6rem",
      bodyPadX: 8, bodyPadY: 4,
      textFontSize: "0.8rem",
      textMaxLines: 3,
      detailFontSize: "0.65rem",
      detailPadX: 8, detailPadY: 3,
      priceFontSize: "1.4rem",
      pricePadY: 6,
    },
    md: {
      w: 220, h: 310,
      borderW: 3.5, stripH: 6, borderRadius: 12,
      headerPadY: 6, headerPadX: 10,
      catFontSize: "1.05rem",
      numFontSize: "0.7rem",
      bodyPadX: 10, bodyPadY: 5,
      textFontSize: "1rem",
      textMaxLines: 3,
      detailFontSize: "0.8rem",
      detailPadX: 10, detailPadY: 4,
      priceFontSize: "1.9rem",
      pricePadY: 8,
    },
    lg: {
      w: 300, h: 420,
      borderW: 4, stripH: 7, borderRadius: 14,
      headerPadY: 8, headerPadX: 14,
      catFontSize: "1.3rem",
      numFontSize: "0.85rem",
      bodyPadX: 14, bodyPadY: 8,
      textFontSize: "1.2rem",
      textMaxLines: 4,
      detailFontSize: "1rem",
      detailPadX: 14, detailPadY: 5,
      priceFontSize: "2.4rem",
      pricePadY: 10,
    },
  }[size];

  // ── Calculs financiers ──
  const netAmount = drawerNetAmount(card);
  const transferAmount = card.cardType === 3 ? nextPlayerAmount(card) : 0;

  // ── Lignes de détail financier ──
  const detailLines: { label: string; value: string; bold?: boolean }[] = [];

  if (card.cardType === 1) {
    detailLines.push({ label: "Ticket", value: formatPrice(card.ticketPrice) });
    if (card.frais && card.frais > 0) {
      detailLines.push({ label: "Frais", value: formatPrice(card.frais) });
    }
    detailLines.push({ label: "TOTAL", value: `+ ${formatPrice(netAmount)}`, bold: true });
  } else if (card.cardType === 2) {
    if (card.impots && card.impots > 0) {
      detailLines.push({ label: "Remboursement", value: `- ${formatPrice(card.impots)}`, bold: true });
    } else {
      detailLines.push({ label: "Remboursement", value: "0 $", bold: true });
    }
  } else if (card.cardType === 3) {
    detailLines.push({ label: "Transfert", value: `+ ${formatPrice(transferAmount)}`, bold: true });
    if (card.taxe && card.taxe > 0) {
      detailLines.push({ label: "Taxe (vous)", value: `- ${formatPrice(card.taxe)}` });
    }
  }

  // ── Prix principal ──
  let mainPriceText: string;
  if (card.cardType === 1) {
    mainPriceText = `+ ${formatPrice(netAmount)}`;
  } else if (card.cardType === 2) {
    mainPriceText = card.impots && card.impots > 0 ? `- ${formatPrice(card.impots)}` : "0 $";
  } else {
    mainPriceText = `${formatPrice(transferAmount)}`;
  }

  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      style={{
        width: dims.w,
        height: dims.h,
        borderRadius: dims.borderRadius,
        border: `${dims.borderW}px solid #1a1a1a`,
        boxShadow: `5px 5px 0px #000, 0 0 20px ${catStyle.glowColor}`,
        fontFamily: "'Bangers', cursive",
        display: "flex",
        flexDirection: "column",
        background: catStyle.bodyBg,
        ...style,
      }}
    >
      {/* ── BANDE HAUT ── */}
      <div
        style={{
          position: "absolute",
          top: -1, left: -1, right: -1,
          height: dims.stripH,
          background: `repeating-linear-gradient(90deg, ${catStyle.stripColor1} 0px, ${catStyle.stripColor1} 8px, ${catStyle.stripColor2} 8px, ${catStyle.stripColor2} 16px)`,
          zIndex: 5,
        }}
      />

      {/* ── EN-TETE : CATEGORIE + NUMERO ── */}
      <div
        style={{
          background: catStyle.headerBg,
          padding: `${dims.headerPadY + dims.stripH}px ${dims.headerPadX}px ${dims.headerPadY}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        {/* Nom de la catégorie — GROS et visible */}
        <div
          style={{
            fontSize: dims.catFontSize,
            color: catStyle.headerText,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
            lineHeight: 1.1,
            fontFamily: "'Bangers', cursive",
          }}
        >
          {catInfo.label}
        </div>

        {/* Numéro de carte */}
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            borderRadius: 4,
            padding: "2px 6px",
            fontSize: dims.numFontSize,
            color: "#fff",
            fontWeight: 700,
            lineHeight: 1.2,
            flexShrink: 0,
            fontFamily: "'Bangers', cursive",
            letterSpacing: "0.05em",
          }}
        >
          #{card.id}
        </div>
      </div>

      {/* ── CORPS : TEXTE DU MEFAIT — ELEMENT CENTRAL ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: `${dims.bodyPadY}px ${dims.bodyPadX}px`,
          textAlign: "center",
          overflow: "hidden",
          position: "relative",
          minHeight: 0,
        }}
      >
        <p
          style={{
            fontSize: dims.textFontSize,
            color: catStyle.bodyText,
            fontFamily: "'Fredoka One', 'Arial', sans-serif",
            fontWeight: 600,
            lineHeight: 1.25,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: dims.textMaxLines,
            WebkitBoxOrient: "vertical" as const,
            position: "relative",
            zIndex: 1,
            letterSpacing: "0.01em",
          }}
        >
          {mefait}
        </p>
      </div>

      {/* ── DETAILS FINANCIERS ── */}
      {size !== "xs" && detailLines.length > 0 && (
        <div
          style={{
            padding: `${dims.detailPadY}px ${dims.detailPadX}px`,
            flexShrink: 0,
            background: catStyle.detailBg,
            borderTop: `2px solid ${catStyle.detailBorder}`,
            borderBottom: `2px solid ${catStyle.detailBorder}`,
          }}
        >
          {detailLines.map((line, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: dims.detailFontSize,
                color: line.bold ? catStyle.accentDark : catStyle.bodyText,
                fontWeight: line.bold ? 800 : 600,
                lineHeight: 1.6,
                fontFamily: "'Bangers', cursive",
                letterSpacing: "0.04em",
              }}
            >
              <span>{line.label}</span>
              <span style={{ fontWeight: 800 }}>{line.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── PRIX PRINCIPAL — GROS ET ATTRACTIF ── */}
      <div
        style={{
          background: catStyle.priceBg,
          padding: `${dims.pricePadY}px ${dims.bodyPadX}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <span
          style={{
            fontSize: dims.priceFontSize,
            color: catStyle.priceText,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textShadow: "2px 2px 0px rgba(0,0,0,0.35), 0 0 10px rgba(0,0,0,0.15)",
            lineHeight: 1.1,
            fontFamily: "'Bangers', cursive",
          }}
        >
          {mainPriceText}
        </span>
      </div>

      {/* ── BANDE BAS ── */}
      <div
        style={{
          position: "absolute",
          bottom: -1, left: -1, right: -1,
          height: dims.stripH,
          background: `repeating-linear-gradient(90deg, ${catStyle.stripColor1} 0px, ${catStyle.stripColor1} 8px, ${catStyle.stripColor2} 8px, ${catStyle.stripColor2} 16px)`,
          zIndex: 5,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DOS DE CARTE
// ─────────────────────────────────────────────────────────────────────────────

interface CardBackProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

export function CardBack({ size = "md", className = "", style }: CardBackProps) {
  const dims = {
    xs: { w: 80, h: 112, borderW: 2, borderRadius: 6, stripH: 3, logoSize: 0.12, titleSize: 0.07, yearSize: 0.03 },
    sm: { w: 160, h: 224, borderW: 3, borderRadius: 10, stripH: 5, logoSize: 0.14, titleSize: 0.09, yearSize: 0.035 },
    md: { w: 220, h: 310, borderW: 3.5, borderRadius: 12, stripH: 6, logoSize: 0.15, titleSize: 0.1, yearSize: 0.04 },
    lg: { w: 300, h: 420, borderW: 4, borderRadius: 14, stripH: 7, logoSize: 0.16, titleSize: 0.11, yearSize: 0.04 },
  }[size];

  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      style={{
        width: dims.w,
        height: dims.h,
        borderRadius: dims.borderRadius,
        border: `${dims.borderW}px solid #1a1a1a`,
        boxShadow: "5px 5px 0px #000, 0 0 12px rgba(0,0,0,0.3)",
        fontFamily: "'Bangers', cursive",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0c1a4e 0%, #1a083d 50%, #0c1a4e 100%)",
        ...style,
      }}
    >
      {/* Bandes haut et bas */}
      <div
        style={{
          position: "absolute", top: -1, left: -1, right: -1,
          height: dims.stripH + 2,
          background: "repeating-linear-gradient(90deg, #FBBF24 0px, #FBBF24 10px, #1a1a1a 10px, #1a1a1a 20px)",
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: "absolute", bottom: -1, left: -1, right: -1,
          height: dims.stripH + 2,
          background: "repeating-linear-gradient(90deg, #FBBF24 0px, #FBBF24 10px, #1a1a1a 10px, #1a1a1a 20px)",
          zIndex: 5,
        }}
      />

      {/* Motif de fond */}
      <div
        style={{
          position: "absolute", inset: 10,
          border: "2px dashed rgba(251,191,36,0.2)",
          borderRadius: 8, pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", inset: 18,
          border: "1px solid rgba(251,191,36,0.1)",
          borderRadius: 6, pointerEvents: "none",
        }}
      />

      {/* Titre */}
      <div
        style={{
          fontSize: dims.w * dims.titleSize,
          color: "#FBBF24",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textShadow: "2px 2px 0px rgba(0,0,0,0.5)",
          textAlign: "center",
          lineHeight: 1.2,
          fontFamily: "'Bangers', cursive",
        }}
      >
        TICKET
        <br />
        CRICKET
      </div>
      <div
        style={{
          fontSize: dims.w * dims.yearSize,
          color: "rgba(251,191,36,0.4)",
          letterSpacing: "0.2em",
          marginTop: 6,
          textTransform: "uppercase",
        }}
      >
        2026
      </div>
    </div>
  );
}

export default GeneratedCard;

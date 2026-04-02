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
//  DESIGN TOKENS — Couleurs par catégorie (demande utilisateur)
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
    priceBg: string;
    priceText: string;
    stripColor1: string;
    stripColor2: string;
    badgeIcon: string;
    glowColor: string;
  }
> = {
  contravention: {
    headerBg: "linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)",
    headerText: "#000000",
    bodyBg: "#FFFBEB",
    bodyText: "#78350F",
    accentColor: "#D97706",
    priceBg: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    priceText: "#000000",
    stripColor1: "#FBBF24",
    stripColor2: "#92400E",
    badgeIcon: "🚨",
    glowColor: "rgba(245,158,11,0.3)",
  },
  contribuable: {
    headerBg: "linear-gradient(135deg, #22C55E 0%, #16A34A 50%, #15803D 100%)",
    headerText: "#FFFFFF",
    bodyBg: "#F0FDF4",
    bodyText: "#14532D",
    accentColor: "#16A34A",
    priceBg: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
    priceText: "#FFFFFF",
    stripColor1: "#86EFAC",
    stripColor2: "#14532D",
    badgeIcon: "📋",
    glowColor: "rgba(34,197,94,0.3)",
  },
  investisseur: {
    headerBg: "linear-gradient(135deg, #EC4899 0%, #DB2777 50%, #BE185D 100%)",
    headerText: "#FFFFFF",
    bodyBg: "#FDF2F8",
    bodyText: "#831843",
    accentColor: "#DB2777",
    priceBg: "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)",
    priceText: "#FFFFFF",
    stripColor1: "#F9A8D4",
    stripColor2: "#831843",
    badgeIcon: "💼",
    glowColor: "rgba(236,72,153,0.3)",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

interface GeneratedCardProps {
  card: CardConfig;
  /** Taille de la carte — "xs" pour mini, "sm" pour catalogue, "md" pour jeu, "lg" pour détail */
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

  // ── Dimensions et tailles de police selon la taille ──
  const dims = {
    xs: {
      w: 80, h: 112,
      borderW: 2,
      stripH: 4,
      headerPadY: 2, headerPadX: 3,
      typeFontSize: "0.35rem",
      catFontSize: "0.32rem",
      numFontSize: "0.28rem",
      mefaitLabelSize: "0.24rem",
      mefaitTextSize: "0.28rem",
      mefaitMaxLines: 2,
      detailFontSize: "0.26rem",
      priceFontSize: "0.55rem",
      pricePadY: 3,
      bodyPadX: 4, bodyPadY: 2,
      detailPadX: 4, detailPadY: 1,
      borderRadius: 6,
    },
    sm: {
      w: 160, h: 224,
      borderW: 3,
      stripH: 5,
      headerPadY: 4, headerPadX: 8,
      typeFontSize: "0.65rem",
      catFontSize: "0.6rem",
      numFontSize: "0.5rem",
      mefaitLabelSize: "0.45rem",
      mefaitTextSize: "0.55rem",
      mefaitMaxLines: 3,
      detailFontSize: "0.55rem",
      priceFontSize: "1.1rem",
      pricePadY: 5,
      bodyPadX: 8, bodyPadY: 4,
      detailPadX: 8, detailPadY: 2,
      borderRadius: 10,
    },
    md: {
      w: 220, h: 310,
      borderW: 3.5,
      stripH: 6,
      headerPadY: 6, headerPadX: 10,
      typeFontSize: "0.8rem",
      catFontSize: "0.75rem",
      numFontSize: "0.6rem",
      mefaitLabelSize: "0.55rem",
      mefaitTextSize: "0.7rem",
      mefaitMaxLines: 3,
      detailFontSize: "0.7rem",
      priceFontSize: "1.5rem",
      pricePadY: 8,
      bodyPadX: 10, bodyPadY: 5,
      detailPadX: 10, detailPadY: 3,
      borderRadius: 12,
    },
    lg: {
      w: 300, h: 420,
      borderW: 4,
      stripH: 7,
      headerPadY: 8, headerPadX: 14,
      typeFontSize: "1rem",
      catFontSize: "0.95rem",
      numFontSize: "0.75rem",
      mefaitLabelSize: "0.7rem",
      mefaitTextSize: "0.85rem",
      mefaitMaxLines: 4,
      detailFontSize: "0.85rem",
      priceFontSize: "1.9rem",
      pricePadY: 10,
      bodyPadX: 14, bodyPadY: 8,
      detailPadX: 14, detailPadY: 4,
      borderRadius: 14,
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
    detailLines.push({ label: "Transféré", value: `+ ${formatPrice(transferAmount)}`, bold: true });
    if (card.taxe && card.taxe > 0) {
      detailLines.push({ label: "Taxe (vous)", value: `- ${formatPrice(card.taxe)}` });
    }
  }

  // ── Prix principal affiché en gros ──
  let mainPriceText: string;
  if (card.cardType === 1) {
    mainPriceText = `+ ${formatPrice(netAmount)}`;
  } else if (card.cardType === 2) {
    mainPriceText = card.impots && card.impots > 0 ? `- ${formatPrice(card.impots)}` : "0 $";
  } else {
    mainPriceText = `➡ ${formatPrice(transferAmount)}`;
  }

  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      style={{
        width: dims.w,
        height: dims.h,
        borderRadius: dims.borderRadius,
        border: `${dims.borderW}px solid #1a1a1a`,
        boxShadow: `4px 4px 0px #000, 0 0 16px ${catStyle.glowColor}`,
        fontFamily: "'Bangers', cursive",
        display: "flex",
        flexDirection: "column",
        background: catStyle.bodyBg,
        ...style,
      }}
    >
      {/* ── BANDE POLICE HAUT ── */}
      <div
        style={{
          position: "absolute",
          top: -1,
          left: -1,
          right: -1,
          height: dims.stripH,
          background: `repeating-linear-gradient(90deg, ${catStyle.stripColor1} 0px, ${catStyle.stripColor1} 8px, ${catStyle.stripColor2} 8px, ${catStyle.stripColor2} 16px)`,
          zIndex: 5,
        }}
      />

      {/* ── EN-TÊTE ── */}
      <div
        style={{
          background: catStyle.headerBg,
          padding: `${dims.headerPadY + dims.stripH}px ${dims.headerPadX}px ${dims.headerPadY}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          gap: 4,
        }}
      >
        {/* Badge type (T1/T2/T3) */}
        <div
          style={{
            background: "rgba(0,0,0,0.35)",
            borderRadius: 4,
            padding: "1px 5px",
            fontSize: dims.typeFontSize,
            color: "#fff",
            fontWeight: 700,
            letterSpacing: "0.08em",
            lineHeight: 1.3,
            flexShrink: 0,
            fontFamily: "'Bangers', cursive",
          }}
        >
          {typeInfo.shortLabel}
        </div>

        {/* Catégorie + emoji */}
        <div
          style={{
            fontSize: dims.catFontSize,
            color: catStyle.headerText,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
            lineHeight: 1.2,
            textAlign: "center",
            fontFamily: "'Bangers', cursive",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {catStyle.badgeIcon} {catInfo.label}
        </div>

        {/* Numéro */}
        <div
          style={{
            background: "rgba(255,255,255,0.25)",
            borderRadius: 4,
            padding: "1px 5px",
            fontSize: dims.numFontSize,
            color: catStyle.headerText,
            fontWeight: 700,
            lineHeight: 1.3,
            flexShrink: 0,
            fontFamily: "'Bangers', cursive",
          }}
        >
          #{card.id}
        </div>
      </div>

      {/* ── SÉPARATEUR ── */}
      <div
        style={{
          height: 3,
          background: `repeating-linear-gradient(90deg, ${catStyle.stripColor1} 0px, ${catStyle.stripColor1} 5px, ${catStyle.stripColor2} 5px, ${catStyle.stripColor2} 10px)`,
          flexShrink: 0,
        }}
      />

      {/* ── CORPS : MÉFAIT ── */}
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
        {/* Watermark */}
        {size !== "xs" && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: `${dims.w * 0.3}px`,
              opacity: 0.06,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {catStyle.badgeIcon}
          </div>
        )}

        {/* Label section */}
        {size !== "xs" && (
          <div
            style={{
              fontSize: dims.mefaitLabelSize,
              color: catStyle.accentColor,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: 3,
              opacity: 0.8,
              fontFamily: "'Bangers', cursive",
            }}
          >
            {card.cardType === 2 ? "REMBOURSEMENT" : card.cardType === 3 ? "INVESTISSEMENT" : "MÉFAIT"}
          </div>
        )}

        {/* Texte du méfait */}
        <p
          style={{
            fontSize: dims.mefaitTextSize,
            color: catStyle.bodyText,
            fontFamily: "'Fredoka One', 'Arial', sans-serif",
            fontWeight: 400,
            lineHeight: 1.3,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: dims.mefaitMaxLines,
            WebkitBoxOrient: "vertical" as const,
            position: "relative",
            zIndex: 1,
          }}
        >
          {mefait}
        </p>
      </div>

      {/* ── DÉTAILS FINANCIERS ── */}
      {size !== "xs" && detailLines.length > 0 && (
        <div
          style={{
            padding: `${dims.detailPadY}px ${dims.detailPadX}px`,
            flexShrink: 0,
            borderTop: `2px dashed ${catStyle.accentColor}30`,
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
                color: line.bold ? catStyle.accentColor : catStyle.bodyText,
                fontWeight: line.bold ? 700 : 500,
                lineHeight: 1.5,
                fontFamily: "'Bangers', cursive",
                letterSpacing: "0.03em",
              }}
            >
              <span>{line.label}</span>
              <span style={{ fontWeight: 700 }}>{line.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── PRIX PRINCIPAL EN GROS ── */}
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
        {/* Bande séparatrice */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `repeating-linear-gradient(90deg, ${catStyle.stripColor1} 0px, ${catStyle.stripColor1} 5px, ${catStyle.stripColor2} 5px, ${catStyle.stripColor2} 10px)`,
          }}
        />
        <span
          style={{
            fontSize: dims.priceFontSize,
            color: catStyle.priceText,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textShadow: "2px 2px 0px rgba(0,0,0,0.3)",
            lineHeight: 1.1,
            fontFamily: "'Bangers', cursive",
          }}
        >
          {mainPriceText}
        </span>
      </div>

      {/* ── BANDE POLICE BAS ── */}
      <div
        style={{
          position: "absolute",
          bottom: -1,
          left: -1,
          right: -1,
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
    xs: { w: 80, h: 112, borderW: 2, borderRadius: 6, stripH: 4, logoSize: 0.12, titleSize: 0.06, yearSize: 0.03 },
    sm: { w: 160, h: 224, borderW: 3, borderRadius: 10, stripH: 5, logoSize: 0.14, titleSize: 0.08, yearSize: 0.035 },
    md: { w: 220, h: 310, borderW: 3.5, borderRadius: 12, stripH: 6, logoSize: 0.15, titleSize: 0.09, yearSize: 0.04 },
    lg: { w: 300, h: 420, borderW: 4, borderRadius: 14, stripH: 7, logoSize: 0.16, titleSize: 0.1, yearSize: 0.04 },
  }[size];

  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      style={{
        width: dims.w,
        height: dims.h,
        borderRadius: dims.borderRadius,
        border: `${dims.borderW}px solid #1a1a1a`,
        boxShadow: "4px 4px 0px #000, 0 0 12px rgba(0,0,0,0.3)",
        fontFamily: "'Bangers', cursive",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0c1a4e 0%, #1a083d 50%, #0c1a4e 100%)",
        ...style,
      }}
    >
      {/* Bandes police haut et bas */}
      <div
        style={{
          position: "absolute",
          top: -1,
          left: -1,
          right: -1,
          height: dims.stripH + 2,
          background: "repeating-linear-gradient(90deg, #FBBF24 0px, #FBBF24 10px, #1a1a1a 10px, #1a1a1a 20px)",
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -1,
          left: -1,
          right: -1,
          height: dims.stripH + 2,
          background: "repeating-linear-gradient(90deg, #FBBF24 0px, #FBBF24 10px, #1a1a1a 10px, #1a1a1a 20px)",
          zIndex: 5,
        }}
      />

      {/* Motif de fond */}
      <div
        style={{
          position: "absolute",
          inset: 10,
          border: "2px dashed rgba(251,191,36,0.2)",
          borderRadius: 8,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 18,
          border: "1px solid rgba(251,191,36,0.1)",
          borderRadius: 6,
          pointerEvents: "none",
        }}
      />

      {/* Logo central */}
      <div style={{ fontSize: dims.w * dims.logoSize, marginBottom: 4, opacity: 0.9 }}>🎫</div>
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
        © 2026
      </div>
    </div>
  );
}

export default GeneratedCard;

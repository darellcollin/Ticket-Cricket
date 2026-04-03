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
import { CardSkinId, SkinMeta, SKIN_CATALOG, SKIN_STYLES } from "@/game/utils/skinConfig";
// Re-exports pour compatibilité avec les imports existants
export type { CardSkinId, SkinMeta };
export { SKIN_CATALOG };

// ─────────────────────────────────────────────────────────────────────────────
//  COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export interface GeneratedCardProps {
  card: CardConfig;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
  /** Texte de méfait à afficher à la place du registre statique (pour les cartes personnalisées) */
  mefaitOverride?: string;
  /** Skin visuel à appliquer. Défaut : "classique" */
  skinId?: CardSkinId;
}

export function GeneratedCard({
  card,
  size = "md",
  className = "",
  style,
  mefaitOverride,
  skinId = "classique",
}: GeneratedCardProps) {
  const catInfo = CATEGORY_INFO[card.category];
  const catStyle = SKIN_STYLES[skinId][card.category];
  // Pour les cartes personnalisées (IDs négatifs), utiliser le texte fourni
  const mefait = mefaitOverride ?? getCardMefait(card.id);

  // ── Dimensions responsive — polices plus grandes ──
  const dims = {
    xs: {
      w: 80, h: 112,
      borderW: 2.5, stripH: 4, borderRadius: 7,
      headerPadY: 3, headerPadX: 4,
      catFontSize: "0.45rem",
      numFontSize: "0.35rem",
      bodyPadX: 4, bodyPadY: 2,
      textFontSize: "0.38rem",
      textMaxLines: 5,
      detailFontSize: "0.32rem",
      detailPadX: 3, detailPadY: 1,
      priceFontSize: "0.85rem",
      pricePadY: 3,
    },
    sm: {
      w: 160, h: 224,
      borderW: 3.5, stripH: 6, borderRadius: 12,
      headerPadY: 6, headerPadX: 9,
      catFontSize: "1.0rem",
      numFontSize: "0.7rem",
      bodyPadX: 9, bodyPadY: 3,
      textFontSize: "0.78rem",
      textMaxLines: 5,
      detailFontSize: "0.75rem",
      detailPadX: 9, detailPadY: 3,
      priceFontSize: "1.7rem",
      pricePadY: 7,
    },
    md: {
      w: 220, h: 310,
      borderW: 4, stripH: 7, borderRadius: 14,
      headerPadY: 7, headerPadX: 11,
      catFontSize: "1.25rem",
      numFontSize: "0.85rem",
      bodyPadX: 11, bodyPadY: 4,
      textFontSize: "0.92rem",
      textMaxLines: 6,
      detailFontSize: "0.95rem",
      detailPadX: 11, detailPadY: 4,
      priceFontSize: "2.3rem",
      pricePadY: 9,
    },
    lg: {
      w: 300, h: 420,
      borderW: 5, stripH: 8, borderRadius: 16,
      headerPadY: 10, headerPadX: 15,
      catFontSize: "1.6rem",
      numFontSize: "1.05rem",
      bodyPadX: 15, bodyPadY: 6,
      textFontSize: "1.15rem",
      textMaxLines: 6,
      detailFontSize: "1.2rem",
      detailPadX: 15, detailPadY: 6,
      priceFontSize: "2.9rem",
      pricePadY: 12,
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
      detailLines.push({ label: "Remboursement d'impôt", value: `- ${formatPrice(card.impots)}`, bold: true });
    } else {
      detailLines.push({ label: "Remboursement d'impôt", value: "0 $", bold: true });
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

  // ── Rotation légèrement aléatoire basée sur l'ID de la carte (goofy) ──
  const tiltDeg = ((card.id * 7) % 7) - 3; // entre -3 et +3 degrés

  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      style={{
        width: dims.w,
        height: dims.h,
        borderRadius: dims.borderRadius,
        border: `${dims.borderW}px solid #000`,
        boxShadow: `${dims.borderW + 2}px ${dims.borderW + 2}px 0px #000, 0 0 24px ${catStyle.glowColor}`,
        fontFamily: "'Bangers', cursive",
        display: "flex",
        flexDirection: "column",
        background: catStyle.bodyBg,
        transform: size === "xs" ? undefined : `rotate(${tiltDeg * 0.3}deg)`,
        ...style,
      }}
    >
      {/* ── BANDE HAUT — motif zébré épais ── */}
      <div
        style={{
          position: "absolute",
          top: -1, left: -1, right: -1,
          height: dims.stripH + 2,
          background: `repeating-linear-gradient(90deg, ${catStyle.stripColor1} 0px, ${catStyle.stripColor1} 10px, ${catStyle.stripColor2} 10px, ${catStyle.stripColor2} 20px)`,
          zIndex: 5,
        }}
      />

      {/* ── SPLAT décoratif en arrière-plan ── */}
      {size !== "xs" && (
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: dims.w * 0.85,
            height: dims.w * 0.85,
            borderRadius: "50%",
            background: catStyle.splatColor,
            zIndex: 0,
          }}
        />
      )}

      {/* ── EN-TETE : CATEGORIE + NUMERO ── */}
      <div
        style={{
          background: catStyle.headerBg,
          padding: `${dims.headerPadY + dims.stripH + 2}px ${dims.headerPadX}px ${dims.headerPadY}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
          borderBottom: `${dims.borderW}px solid #000`,
        }}
      >
        {/* Nom de la catégorie */}
        <div
          style={{
            fontSize: dims.catFontSize,
            color: catStyle.headerText,
            fontWeight: 900,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textShadow: "2px 2px 0px rgba(0,0,0,0.4)",
            lineHeight: 1.0,
            fontFamily: "'Bangers', cursive",
          }}
        >
          {catInfo.label}
        </div>

        {/* Badge numéro de carte */}
        <div
          style={{
            background: catStyle.badgeBg,
            border: `${Math.max(1.5, dims.borderW * 0.6)}px solid #000`,
            borderRadius: dims.borderRadius * 0.5,
            padding: `1px ${dims.headerPadX * 0.5}px`,
            fontSize: dims.numFontSize,
            color: catStyle.badgeText,
            fontWeight: 900,
            lineHeight: 1.3,
            flexShrink: 0,
            fontFamily: "'Bangers', cursive",
            letterSpacing: "0.06em",
            boxShadow: "2px 2px 0px #000",
            transform: "rotate(-2deg)",
          }}
        >
          #{card.id < 0 ? `C${Math.abs(card.id)}` : card.id}
        </div>
      </div>

      {/* ── CORPS : TEXTE DU MEFAIT ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: `${dims.bodyPadY}px ${dims.bodyPadX}px`,
          textAlign: "center",
          overflow: "visible",
          position: "relative",
          minHeight: 0,
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontSize: dims.textFontSize,
            color: catStyle.bodyText,
            fontFamily: "'Fredoka One', 'Arial', sans-serif",
            fontWeight: 700,
            lineHeight: 1.25,
            margin: 0,
            overflow: "visible",
            position: "relative",
            zIndex: 1,
            letterSpacing: "0.01em",
            textShadow: "0px 1px 0px rgba(255,255,255,0.1)",
            wordBreak: "break-word",
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
            borderTop: `${Math.max(2, dims.borderW * 0.7)}px solid ${catStyle.detailBorder}`,
            borderBottom: `${Math.max(2, dims.borderW * 0.7)}px solid ${catStyle.detailBorder}`,
            position: "relative",
            zIndex: 2,
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
                fontWeight: line.bold ? 900 : 700,
                lineHeight: 1.5,
                fontFamily: "'Bangers', cursive",
                letterSpacing: "0.05em",
              }}
            >
              <span>{line.label}</span>
              <span
                style={{
                  fontWeight: 900,
                  background: line.bold ? catStyle.accentColor : "transparent",
                  color: line.bold ? catStyle.priceText : catStyle.accentDark,
                  padding: line.bold ? `0px ${dims.detailPadX * 0.4}px` : undefined,
                  borderRadius: line.bold ? 4 : undefined,
                  border: line.bold ? "1.5px solid #000" : undefined,
                }}
              >
                {line.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── PRIX PRINCIPAL ── */}
      <div
        style={{
          background: catStyle.priceBg,
          padding: `${dims.pricePadY}px ${dims.bodyPadX}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
          borderTop: `${dims.borderW}px solid #000`,
        }}
      >
        {size !== "xs" && (
          <span
            style={{
              position: "absolute",
              left: dims.bodyPadX * 0.5,
              fontSize: dims.priceFontSize,
              opacity: 0.20,
              fontFamily: "'Bangers', cursive",
              lineHeight: 1,
              color: "#000",
            }}
          >
            *
          </span>
        )}
        <span
          style={{
            fontSize: dims.priceFontSize,
            color: catStyle.priceText,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textShadow: "3px 3px 0px rgba(0,0,0,0.5), -1px -1px 0px rgba(255,255,255,0.2)",
            lineHeight: 1.0,
            fontFamily: "'Bangers', cursive",
            transform: "skewX(-4deg)",
            display: "inline-block",
          }}
        >
          {mainPriceText}
        </span>
        {size !== "xs" && (
          <span
            style={{
              position: "absolute",
              right: dims.bodyPadX * 0.5,
              fontSize: dims.priceFontSize,
              opacity: 0.20,
              fontFamily: "'Bangers', cursive",
              lineHeight: 1,
              color: "#000",
            }}
          >
            *
          </span>
        )}
      </div>

      {/* ── BANDE BAS — motif zébré épais ── */}
      <div
        style={{
          position: "absolute",
          bottom: -1, left: -1, right: -1,
          height: dims.stripH + 2,
          background: `repeating-linear-gradient(90deg, ${catStyle.stripColor1} 0px, ${catStyle.stripColor1} 10px, ${catStyle.stripColor2} 10px, ${catStyle.stripColor2} 20px)`,
          zIndex: 5,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DOS DE CARTE — Style goofy
// ─────────────────────────────────────────────────────────────────────────────

interface CardBackProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

export function CardBack({ size = "md", className = "", style }: CardBackProps) {
  const dims = {
    xs: { w: 80, h: 112, borderW: 2.5, borderRadius: 7, stripH: 4, logoSize: 0.12, titleSize: 0.07, yearSize: 0.03 },
    sm: { w: 160, h: 224, borderW: 3.5, borderRadius: 12, stripH: 6, logoSize: 0.14, titleSize: 0.09, yearSize: 0.035 },
    md: { w: 220, h: 310, borderW: 4, borderRadius: 14, stripH: 7, logoSize: 0.15, titleSize: 0.1, yearSize: 0.04 },
    lg: { w: 300, h: 420, borderW: 5, borderRadius: 16, stripH: 8, logoSize: 0.16, titleSize: 0.11, yearSize: 0.04 },
  }[size];

  const titleFontSize = dims.h * dims.titleSize;
  const yearFontSize = dims.h * dims.yearSize;

  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      style={{
        width: dims.w,
        height: dims.h,
        borderRadius: dims.borderRadius,
        border: `${dims.borderW}px solid #000`,
        boxShadow: `${dims.borderW + 2}px ${dims.borderW + 2}px 0px #000`,
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
          background: "repeating-linear-gradient(90deg, #FFD700 0px, #FFD700 10px, #000 10px, #000 20px)",
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: "absolute", bottom: -1, left: -1, right: -1,
          height: dims.stripH + 2,
          background: "repeating-linear-gradient(90deg, #FFD700 0px, #FFD700 10px, #000 10px, #000 20px)",
          zIndex: 5,
        }}
      />

      {/* Motif de fond — cercles concentriques */}
      {[0.9, 0.72, 0.54, 0.36].map((scale, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: dims.w * scale,
            height: dims.w * scale,
            borderRadius: "50%",
            border: `${dims.borderW * 0.6}px solid rgba(255,215,0,${0.08 + i * 0.04})`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* Titre */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: dims.h * 0.01,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: titleFontSize,
            color: "#FFD700",
            fontWeight: 900,
            letterSpacing: "0.1em",
            textShadow: "3px 3px 0px #000, -1px -1px 0px rgba(255,255,255,0.1)",
            lineHeight: 1.0,
            textAlign: "center",
            fontFamily: "'Bangers', cursive",
            transform: "skewX(-3deg)",
          }}
        >
          TICKET
        </div>
        <div
          style={{
            fontSize: titleFontSize * 0.7,
            color: "#FFFFFF",
            fontWeight: 900,
            letterSpacing: "0.15em",
            textShadow: "2px 2px 0px #000",
            lineHeight: 1.0,
            textAlign: "center",
            fontFamily: "'Bangers', cursive",
          }}
        >
          CRICKET
        </div>
        <div
          style={{
            fontSize: yearFontSize,
            color: "rgba(255,215,0,0.5)",
            letterSpacing: "0.2em",
            fontFamily: "'Bangers', cursive",
            marginTop: dims.h * 0.01,
          }}
        >
          2026
        </div>
      </div>
    </div>
  );
}

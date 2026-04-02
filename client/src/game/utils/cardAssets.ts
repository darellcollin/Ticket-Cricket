/**
 * Card assets — generates SVG placeholder card images.
 * The original code imported 324 images from Figma. 
 * Here we generate colored placeholder cards with the card number displayed.
 */
import { getCardConfig, CATEGORY_INFO, TYPE_INFO } from "./cardConfig";

const cardUrlCache = new Map<number, string>();

/**
 * Generates an SVG data URL for a card placeholder.
 */
function generateCardSvg(cardNumber: number): string {
  const cfg = getCardConfig(cardNumber);
  const catInfo = CATEGORY_INFO[cfg.category];
  const typeInfo = TYPE_INFO[cfg.cardType];
  
  const bgColor = catInfo.color;
  const borderColor = catInfo.border;
  const typeColor = typeInfo.color;
  const emoji = catInfo.emoji;
  const typeLabel = typeInfo.shortLabel;
  
  // Build price label
  let priceLabel = "";
  if (cfg.cardType === 1) {
    priceLabel = `${cfg.ticketPrice}$`;
    if (cfg.frais) priceLabel += ` +${cfg.frais}$`;
  } else if (cfg.cardType === 2) {
    priceLabel = cfg.impots ? `-${cfg.impots}$` : "0$";
  } else if (cfg.cardType === 3) {
    priceLabel = `→${cfg.ticketPrice}$`;
    if (cfg.taxe) priceLabel += ` -${cfg.taxe}$`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280">
    <defs>
      <linearGradient id="bg${cardNumber}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor};stop-opacity:0.9"/>
        <stop offset="100%" style="stop-color:${borderColor};stop-opacity:1"/>
      </linearGradient>
    </defs>
    <rect width="200" height="280" rx="16" fill="url(#bg${cardNumber})" stroke="${borderColor}" stroke-width="3"/>
    <rect x="10" y="10" width="180" height="260" rx="12" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    <text x="100" y="50" text-anchor="middle" font-size="14" font-weight="bold" fill="rgba(255,255,255,0.7)" font-family="sans-serif">#${cardNumber}</text>
    <text x="100" y="120" text-anchor="middle" font-size="48" font-family="sans-serif">${emoji}</text>
    <rect x="60" y="140" width="80" height="28" rx="14" fill="${typeColor}" opacity="0.9"/>
    <text x="100" y="160" text-anchor="middle" font-size="16" font-weight="bold" fill="white" font-family="sans-serif">${typeLabel}</text>
    <text x="100" y="200" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.8)" font-family="sans-serif">${catInfo.label}</text>
    <text x="100" y="240" text-anchor="middle" font-size="22" font-weight="bold" fill="white" font-family="sans-serif">${priceLabel}</text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Returns the URL of the image for a given card.
 * Uses cached SVG data URLs.
 */
export function getCardAssetUrl(cardNumber: number): string | null {
  if (cardNumber < 1 || cardNumber > 324) return null;
  
  if (cardUrlCache.has(cardNumber)) return cardUrlCache.get(cardNumber)!;
  
  const url = generateCardSvg(cardNumber);
  cardUrlCache.set(cardNumber, url);
  return url;
}

// Pre-generate is not needed — lazy generation on demand

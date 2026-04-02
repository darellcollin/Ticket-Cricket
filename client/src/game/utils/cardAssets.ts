/**
 * Mapping statique des images de cartes.
 * Les images Figma originales sont remplacées par des placeholders SVG.
 * Les vraies images sont stockées dans IndexedDB via imageDB.ts.
 */

// ─── Placeholder SVG generator ────────────────────────────────────────────────
function cardPlaceholder(n: number): string {
  const colors: Record<string, string> = {
    contravention: "#C2410C",
    contribuable: "#16A34A",
    investisseur: "#7C3AED",
  };
  const cat = n <= 108 ? "contravention" : n <= 216 ? "contribuable" : "investisseur";
  const bg = colors[cat];
  const label = cat.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280">
    <rect width="200" height="280" rx="12" fill="${bg}"/>
    <rect x="4" y="4" width="192" height="272" rx="10" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    <text x="100" y="120" text-anchor="middle" fill="white" font-size="72" font-family="Bangers,cursive" font-weight="bold">#${n}</text>
    <text x="100" y="180" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="20" font-family="Fredoka One,cursive">${label}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ─── Map numéro → URL ─────────────────────────────────────────────────────────
export const CARD_ASSETS: Partial<Record<number, string>> = {};
for (let i = 1; i <= 324; i++) {
  CARD_ASSETS[i] = cardPlaceholder(i);
}

/**
 * Retourne l'URL de l'image pour une carte donnée,
 * ou null si elle n'a pas encore été importée.
 */
export function getCardAssetUrl(cardNumber: number): string | null {
  return CARD_ASSETS[cardNumber] ?? null;
}

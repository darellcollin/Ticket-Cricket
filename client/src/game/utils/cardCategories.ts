/**
 * Ré-export des helpers de catégories — utilise cardConfig.ts comme source.
 */
export type { CardCategory } from "./cardConfig";
export {
  CATEGORY_INFO,
  CATEGORY_ORDER,
  formatPrice,
  getCardConfig,
  drawerNetAmount,
  nextPlayerAmount,
  computePlayerTotal,
  TYPE_INFO,
} from "./cardConfig";

import { getCardConfig, drawerNetAmount, computePlayerTotal, defaultCategory } from "./cardConfig";
import type { CardCategory } from "./cardConfig";

/** Retourne la catégorie d'affichage d'une carte (basée sur la config). */
export function getCardCategory(n: number): CardCategory {
  const cfg = getCardConfig(n);
  return cfg.category;
}

/** Montant net d'une carte pour le joueur qui pioche. */
export function getCardPrice(n: number): number {
  return drawerNetAmount(getCardConfig(n));
}

/** Total net des cartes d'un joueur. */
export function getTotalPrice(cards: number[]): number {
  return computePlayerTotal(cards);
}

/** Filtre une liste de cartes par catégorie. */
export function filterByCategory(cards: number[], cat: CardCategory): number[] {
  return cards.filter((n) => getCardConfig(n).category === cat);
}

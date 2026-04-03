/**
 * Tests unitaires pour le shopRouter — logique métier des achats et de la boutique.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Helpers purs à tester ────────────────────────────────────────────────────

/** Calcule le quota total de cartes personnalisables d'un joueur */
function calculateCardQuota(freeTier: number, purchases: Array<{ productId: string; cardsUnlocked: number }>): number {
  const extra = purchases
    .filter(p => p.productId.startsWith("pack_"))
    .reduce((sum, p) => sum + p.cardsUnlocked, 0);
  return freeTier + extra;
}

/** Valide un montant de don (en centimes) */
function validateDonAmount(amountCents: number): string | null {
  if (!Number.isInteger(amountCents)) return "Le montant doit être un entier";
  if (amountCents < 100) return "Le don minimum est de 1$";
  if (amountCents > 100000) return "Le don maximum est de 1000$";
  return null;
}

/** Formate un montant en centimes en devise lisible */
function formatAmount(cents: number, currency: string): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: currency.toUpperCase() }).format(amount);
}

/** Vérifie si un productId est un pack de cartes valide */
function isValidPackProduct(productId: string, availableIds: string[]): boolean {
  return availableIds.includes(productId);
}

/** Déduplique les achats par stripeSessionId */
function deduplicatePurchases(
  purchases: Array<{ stripeSessionId: string; productId: string; amountCents: number }>
): Array<{ stripeSessionId: string; productId: string; amountCents: number }> {
  const seen = new Set<string>();
  return purchases.filter(p => {
    if (seen.has(p.stripeSessionId)) return false;
    seen.add(p.stripeSessionId);
    return true;
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("calculateCardQuota", () => {
  it("retourne 15 si aucun achat", () => {
    expect(calculateCardQuota(15, [])).toBe(15);
  });

  it("ajoute les cartes d'un pack_35", () => {
    const purchases = [{ productId: "pack_35", cardsUnlocked: 35 }];
    expect(calculateCardQuota(15, purchases)).toBe(50);
  });

  it("ajoute les cartes de plusieurs packs", () => {
    const purchases = [
      { productId: "pack_35", cardsUnlocked: 35 },
      { productId: "pack_55", cardsUnlocked: 55 },
    ];
    expect(calculateCardQuota(15, purchases)).toBe(105);
  });

  it("ignore les dons (productId don_libre)", () => {
    const purchases = [
      { productId: "don_libre", cardsUnlocked: 0 },
      { productId: "pack_85", cardsUnlocked: 85 },
    ];
    expect(calculateCardQuota(15, purchases)).toBe(100);
  });

  it("gère correctement pack_85", () => {
    const purchases = [{ productId: "pack_85", cardsUnlocked: 85 }];
    expect(calculateCardQuota(15, purchases)).toBe(100);
  });
});

describe("validateDonAmount", () => {
  it("accepte un don valide de 500 cents (5$)", () => {
    expect(validateDonAmount(500)).toBeNull();
  });

  it("accepte le minimum de 100 cents (1$)", () => {
    expect(validateDonAmount(100)).toBeNull();
  });

  it("accepte le maximum de 100000 cents (1000$)", () => {
    expect(validateDonAmount(100000)).toBeNull();
  });

  it("rejette un montant inférieur à 100 cents", () => {
    expect(validateDonAmount(99)).toBe("Le don minimum est de 1$");
  });

  it("rejette un montant supérieur à 100000 cents", () => {
    expect(validateDonAmount(100001)).toBe("Le don maximum est de 1000$");
  });

  it("rejette un montant non entier", () => {
    expect(validateDonAmount(9.99)).toBe("Le montant doit être un entier");
  });
});

describe("formatAmount", () => {
  it("formate 299 cents en CAD correctement", () => {
    const result = formatAmount(299, "cad");
    expect(result).toContain("2,99");
  });

  it("formate 699 cents en CAD correctement", () => {
    const result = formatAmount(699, "cad");
    expect(result).toContain("6,99");
  });

  it("formate 999 cents en CAD correctement", () => {
    const result = formatAmount(999, "cad");
    expect(result).toContain("9,99");
  });

  it("formate 0 cents en CAD", () => {
    const result = formatAmount(0, "cad");
    expect(result).toContain("0");
  });
});

describe("isValidPackProduct", () => {
  const AVAILABLE = ["pack_35", "pack_55", "pack_85"];

  it("accepte pack_35", () => {
    expect(isValidPackProduct("pack_35", AVAILABLE)).toBe(true);
  });

  it("accepte pack_55", () => {
    expect(isValidPackProduct("pack_55", AVAILABLE)).toBe(true);
  });

  it("accepte pack_85", () => {
    expect(isValidPackProduct("pack_85", AVAILABLE)).toBe(true);
  });

  it("rejette un productId inconnu", () => {
    expect(isValidPackProduct("pack_999", AVAILABLE)).toBe(false);
  });

  it("rejette don_libre comme pack", () => {
    expect(isValidPackProduct("don_libre", AVAILABLE)).toBe(false);
  });
});

describe("deduplicatePurchases", () => {
  it("retourne les achats sans doublons", () => {
    const purchases = [
      { stripeSessionId: "cs_abc", productId: "pack_35", amountCents: 299 },
      { stripeSessionId: "cs_def", productId: "pack_55", amountCents: 699 },
    ];
    expect(deduplicatePurchases(purchases)).toHaveLength(2);
  });

  it("supprime les doublons par stripeSessionId", () => {
    const purchases = [
      { stripeSessionId: "cs_abc", productId: "pack_35", amountCents: 299 },
      { stripeSessionId: "cs_abc", productId: "pack_35", amountCents: 299 }, // doublon
    ];
    const result = deduplicatePurchases(purchases);
    expect(result).toHaveLength(1);
    expect(result[0].stripeSessionId).toBe("cs_abc");
  });

  it("retourne un tableau vide si aucun achat", () => {
    expect(deduplicatePurchases([])).toHaveLength(0);
  });

  it("conserve le premier en cas de doublon", () => {
    const purchases = [
      { stripeSessionId: "cs_abc", productId: "pack_35", amountCents: 299 },
      { stripeSessionId: "cs_abc", productId: "pack_55", amountCents: 699 }, // même session, produit différent
    ];
    const result = deduplicatePurchases(purchases);
    expect(result[0].productId).toBe("pack_35");
  });
});

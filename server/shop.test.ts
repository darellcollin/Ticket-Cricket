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

// ── Helpers panier ────────────────────────────────────────────────────────────

const SKIN_PRODUCTS = [
  { id: "skin_neon",     skinId: "neon",     price: 199, category: "skin" },
  { id: "skin_retro",   skinId: "retro",   price: 199, category: "skin" },
  { id: "skin_glace",   skinId: "glace",   price: 199, category: "skin" },
  { id: "skin_feu",     skinId: "feu",     price: 199, category: "skin" },
  { id: "skin_royal",   skinId: "royal",   price: 199, category: "skin" },
  { id: "skin_cosmic",  skinId: "cosmic",  price: 199, category: "skin" },
  { id: "skin_magique", skinId: "magique", price: 199, category: "skin" },
  { id: "skin_foret",   skinId: "foret",   price: 199, category: "skin" },
  { id: "skin_metal",   skinId: "metal",   price: 199, category: "skin" },
  { id: "skin_prestige",skinId: "prestige",price: 199, category: "skin" },
  { id: "bundle_all_skins", skinId: undefined, price: 1599, category: "bundle" },
];

function calculateCartTotal(productIds: string[]): number {
  return productIds.reduce((sum, id) => {
    const product = SKIN_PRODUCTS.find(p => p.id === id);
    return sum + (product?.price ?? 0);
  }, 0);
}

function validateCart(productIds: string[], availableIds: string[]): string | null {
  if (productIds.length === 0) return "Le panier est vide";
  if (productIds.length > 10) return "Maximum 10 articles par commande";
  for (const id of productIds) {
    if (!availableIds.includes(id)) return `Produit introuvable : ${id}`;
  }
  return null;
}

function extractSkinIdsFromCart(productIds: string[]): string[] {
  return productIds
    .map(id => SKIN_PRODUCTS.find(p => p.id === id)?.skinId)
    .filter((s): s is string => !!s);
}

describe("calculateCartTotal", () => {
  it("calcule le total d'un panier avec 1 skin à 1,99$", () => {
    expect(calculateCartTotal(["skin_neon"])).toBe(199);
  });

  it("calcule le total d'un panier avec skin_foret à 1,99$", () => {
    expect(calculateCartTotal(["skin_foret"])).toBe(199);
  });

  it("calcule le total d'un panier de 2 skins à 1,99$ chacun", () => {
    expect(calculateCartTotal(["skin_neon", "skin_foret"])).toBe(398);
  });

  it("retourne 0 pour un panier vide", () => {
    expect(calculateCartTotal([])).toBe(0);
  });

  it("calcule le total de 3 skins à 1,99$ chacun", () => {
    expect(calculateCartTotal(["skin_foret", "skin_metal", "skin_prestige"])).toBe(597);
  });

  it("calcule le total du forfait tous les skins à 15,99$", () => {
    expect(calculateCartTotal(["bundle_all_skins"])).toBe(1599);
  });

  it("calcule le total avec les nouveaux skins cosmic et magique", () => {
    expect(calculateCartTotal(["skin_cosmic", "skin_magique"])).toBe(398);
  });
});

describe("validateCart", () => {
  const AVAILABLE = SKIN_PRODUCTS.map(p => p.id);

  it("accepte un panier valide d'un seul skin", () => {
    expect(validateCart(["skin_neon"], AVAILABLE)).toBeNull();
  });

  it("accepte un panier de 3 skins", () => {
    expect(validateCart(["skin_neon", "skin_foret", "skin_prestige"], AVAILABLE)).toBeNull();
  });

  it("rejette un panier vide", () => {
    expect(validateCart([], AVAILABLE)).toBe("Le panier est vide");
  });

  it("rejette un panier de plus de 10 articles", () => {
    const tooMany = Array(11).fill("skin_neon");
    expect(validateCart(tooMany, AVAILABLE)).toBe("Maximum 10 articles par commande");
  });

  it("rejette un produit inconnu", () => {
    expect(validateCart(["skin_inconnu"], AVAILABLE)).toContain("Produit introuvable");
  });
});

describe("extractSkinIdsFromCart", () => {
  it("extrait les skinIds d'un panier de skins", () => {
    const result = extractSkinIdsFromCart(["skin_neon", "skin_foret"]);
    expect(result).toEqual(["neon", "foret"]);
  });

  it("retourne un tableau vide pour un panier vide", () => {
    expect(extractSkinIdsFromCart([])).toEqual([]);
  });

  it("inclut les skins foret, metal, prestige dans l'extraction", () => {
    const result = extractSkinIdsFromCart(["skin_foret", "skin_metal", "skin_prestige"]);
    expect(result).toContain("foret");
    expect(result).toContain("metal");
    expect(result).toContain("prestige");
  });

  it("extrait les nouveaux skins cosmic et magique", () => {
    const result = extractSkinIdsFromCart(["skin_cosmic", "skin_magique"]);
    expect(result).toContain("cosmic");
    expect(result).toContain("magique");
  });

  it("ignore le bundle_all_skins (skinId undefined) dans l'extraction", () => {
    const result = extractSkinIdsFromCart(["bundle_all_skins", "skin_neon"]);
    expect(result).not.toContain(undefined);
    expect(result).toContain("neon");
  });
});

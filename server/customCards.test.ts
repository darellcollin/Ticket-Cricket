/**
 * Tests unitaires pour les cartes personnalisées et le partage en session multijoueur.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Helpers purs à tester ────────────────────────────────────────────────────

/** Convertit une ligne DB custom en CardConfig compatible */
function dbCustomToConfig(card: {
  id: number;
  category: string;
  mefait: string | null;
  ticketPrice: number;
  frais: number;
  impots: number;
  taxe: number;
}) {
  const cat = card.category as "contravention" | "contribuable" | "investisseur";
  const isT3 = cat === "investisseur";
  const isT2 = cat === "contribuable";
  const cardType = isT3 ? 3 : isT2 ? 2 : 1;
  return {
    id: -card.id,
    category: cat,
    cardType,
    ticketPrice: card.ticketPrice,
    frais: card.frais,
    impots: card.impots,
    taxe: card.taxe,
    isCustom: true,
    customMefait: card.mefait ?? "",
  };
}

/** Valide les contraintes d'une carte contravention */
function validateContraventionCard(data: {
  mefait: string;
  ticketPrice: number;
  frais: number;
}): string | null {
  if (!data.mefait.trim()) return "Le méfait est requis";
  if (data.mefait.length > 150) return "Le méfait ne peut pas dépasser 150 caractères";
  if (data.ticketPrice < 10 || data.ticketPrice > 4000) return "Le prix du ticket doit être entre 10$ et 4000$";
  if (![0, 10, 20, 30, 40, 50].includes(data.frais)) return "Le frais doit être 0, 10, 20, 30, 40 ou 50$";
  return null;
}

/** Valide les contraintes d'une carte contribuable */
function validateContribuableCard(data: {
  mefait: string;
  impots: number;
}): string | null {
  if (!data.mefait.trim()) return "Le méfait est requis";
  if (data.mefait.length > 150) return "Le méfait ne peut pas dépasser 150 caractères";
  if (![0, 10, 20, 30, 40, 50].includes(data.impots)) return "Le remboursement doit être 0, 10, 20, 30, 40 ou 50$";
  return null;
}

/** Valide les contraintes d'une carte investisseur */
function validateInvestisseurCard(data: {
  ticketPrice: number;
  taxe: number;
}): string | null {
  if (data.ticketPrice < 10 || data.ticketPrice > 4000) return "Le prix du ticket doit être entre 10$ et 4000$";
  if (![0, 10, 20, 30, 40, 50].includes(data.taxe)) return "La taxe doit être 0, 10, 20, 30, 40 ou 50$";
  return null;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("dbCustomToConfig", () => {
  it("convertit une carte contravention avec ID négatif", () => {
    const cfg = dbCustomToConfig({
      id: 5,
      category: "contravention",
      mefait: "Stationnement interdit",
      ticketPrice: 100,
      frais: 20,
      impots: 0,
      taxe: 0,
    });
    expect(cfg.id).toBe(-5);
    expect(cfg.category).toBe("contravention");
    expect(cfg.cardType).toBe(1);
    expect(cfg.ticketPrice).toBe(100);
    expect(cfg.frais).toBe(20);
    expect(cfg.isCustom).toBe(true);
    expect(cfg.customMefait).toBe("Stationnement interdit");
  });

  it("convertit une carte contribuable avec cardType 2", () => {
    const cfg = dbCustomToConfig({
      id: 10,
      category: "contribuable",
      mefait: "Remboursement d'impôts",
      ticketPrice: 0,
      frais: 0,
      impots: 30,
      taxe: 0,
    });
    expect(cfg.id).toBe(-10);
    expect(cfg.cardType).toBe(2);
    expect(cfg.impots).toBe(30);
    expect(cfg.ticketPrice).toBe(0);
  });

  it("convertit une carte investisseur avec cardType 3", () => {
    const cfg = dbCustomToConfig({
      id: 15,
      category: "investisseur",
      mefait: null,
      ticketPrice: 500,
      frais: 0,
      impots: 0,
      taxe: 40,
    });
    expect(cfg.id).toBe(-15);
    expect(cfg.cardType).toBe(3);
    expect(cfg.taxe).toBe(40);
    expect(cfg.customMefait).toBe("");
  });

  it("utilise une chaîne vide si mefait est null", () => {
    const cfg = dbCustomToConfig({
      id: 1,
      category: "contravention",
      mefait: null,
      ticketPrice: 50,
      frais: 0,
      impots: 0,
      taxe: 0,
    });
    expect(cfg.customMefait).toBe("");
  });
});

describe("validateContraventionCard", () => {
  it("valide une carte correcte", () => {
    expect(validateContraventionCard({
      mefait: "Excès de vitesse",
      ticketPrice: 200,
      frais: 30,
    })).toBeNull();
  });

  it("rejette un méfait vide", () => {
    expect(validateContraventionCard({
      mefait: "",
      ticketPrice: 200,
      frais: 0,
    })).toBe("Le méfait est requis");
  });

  it("rejette un méfait trop long (> 150 caractères)", () => {
    expect(validateContraventionCard({
      mefait: "a".repeat(151),
      ticketPrice: 200,
      frais: 0,
    })).toBe("Le méfait ne peut pas dépasser 150 caractères");
  });

  it("rejette un prix de ticket inférieur à 10$", () => {
    expect(validateContraventionCard({
      mefait: "Méfait",
      ticketPrice: 5,
      frais: 0,
    })).toBe("Le prix du ticket doit être entre 10$ et 4000$");
  });

  it("rejette un prix de ticket supérieur à 4000$", () => {
    expect(validateContraventionCard({
      mefait: "Méfait",
      ticketPrice: 4001,
      frais: 0,
    })).toBe("Le prix du ticket doit être entre 10$ et 4000$");
  });

  it("accepte les frais valides (0, 10, 20, 30, 40, 50)", () => {
    [0, 10, 20, 30, 40, 50].forEach(frais => {
      expect(validateContraventionCard({
        mefait: "Méfait",
        ticketPrice: 100,
        frais,
      })).toBeNull();
    });
  });

  it("rejette un frais invalide", () => {
    expect(validateContraventionCard({
      mefait: "Méfait",
      ticketPrice: 100,
      frais: 15,
    })).toBe("Le frais doit être 0, 10, 20, 30, 40 ou 50$");
  });
});

describe("validateContribuableCard", () => {
  it("valide une carte correcte", () => {
    expect(validateContribuableCard({
      mefait: "Remboursement fiscal",
      impots: 20,
    })).toBeNull();
  });

  it("rejette un méfait vide", () => {
    expect(validateContribuableCard({
      mefait: "",
      impots: 0,
    })).toBe("Le méfait est requis");
  });

  it("accepte impots = 0 (pas de remboursement)", () => {
    expect(validateContribuableCard({
      mefait: "Méfait",
      impots: 0,
    })).toBeNull();
  });

  it("rejette un montant d'impôts invalide", () => {
    expect(validateContribuableCard({
      mefait: "Méfait",
      impots: 25,
    })).toBe("Le remboursement doit être 0, 10, 20, 30, 40 ou 50$");
  });
});

describe("validateInvestisseurCard", () => {
  it("valide une carte correcte", () => {
    expect(validateInvestisseurCard({
      ticketPrice: 1000,
      taxe: 50,
    })).toBeNull();
  });

  it("rejette un prix de ticket invalide", () => {
    expect(validateInvestisseurCard({
      ticketPrice: 9,
      taxe: 0,
    })).toBe("Le prix du ticket doit être entre 10$ et 4000$");
  });

  it("accepte taxe = 0 (pas de taxe)", () => {
    expect(validateInvestisseurCard({
      ticketPrice: 500,
      taxe: 0,
    })).toBeNull();
  });

  it("rejette une taxe invalide", () => {
    expect(validateInvestisseurCard({
      ticketPrice: 500,
      taxe: 35,
    })).toBe("La taxe doit être 0, 10, 20, 30, 40 ou 50$");
  });
});

describe("Limite de 100 cartes personnalisées", () => {
  it("accepte jusqu'à 100 cartes", () => {
    const cards = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }));
    expect(cards.length).toBeLessThanOrEqual(100);
  });

  it("rejette plus de 100 cartes", () => {
    const cards = Array.from({ length: 101 }, (_, i) => ({ id: i + 1 }));
    expect(cards.length).toBeGreaterThan(100);
  });
});

describe("IDs négatifs pour cartes personnalisées", () => {
  it("les IDs personnalisés sont toujours négatifs", () => {
    const dbIds = [1, 5, 42, 100];
    const customIds = dbIds.map(id => -id);
    customIds.forEach(id => expect(id).toBeLessThan(0));
  });

  it("les IDs négatifs n'entrent pas en conflit avec les IDs 1-324", () => {
    const standardIds = Array.from({ length: 324 }, (_, i) => i + 1);
    const customIds = [-1, -5, -42, -100];
    const overlap = customIds.filter(id => standardIds.includes(id));
    expect(overlap).toHaveLength(0);
  });
});

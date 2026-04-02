/**
 * ══════════════════════════════════════════════════════════════════
 *  TABLE DES PRIX — TICKET CRICKET 2026
 *  324 cartes — prix individuels à configurer
 * ══════════════════════════════════════════════════════════════════
 *
 *  Structure de chaque entrée CardData :
 *  ┌─────────────────┬─────────────────────────────────────────────┐
 *  │ basePrice       │ Montant principal en $ (positif OU négatif) │
 *  │ frais           │ Frais additionnels en $ (optionnel)         │
 *  │ isSubtraction   │ true → la carte ENLÈVE de l'argent         │
 *  │ type            │ "contravention" | "contribuable" |          │
 *  │                 │ "investisseur" | "frais_only" | "bonus"     │
 *  │ note            │ Description libre pour t'y retrouver        │
 *  └─────────────────┴─────────────────────────────────────────────┘
 *
 *  💡 Pour les cartes "frais_only" : elles n'ont pas de basePrice
 *     propre mais ajoutent des frais à la contravention précédente.
 *
 *  ⚠️  Toutes les valeurs sont en $ CAD.
 *  ⚠️  Cartes marquées "TODO" → prix NON CONFIRMÉ (valeur par défaut).
 *
 *  Répartition :
 *    Cartes   1–108 → Contraventions
 *    Cartes 109–216 → Contribuable
 *    Cartes 217–324 → Investisseur
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type CardMechanic =
  | "contravention"   // Ajoute basePrice (+frais si présent)
  | "contribuable"    // Mécanique contribuable
  | "investisseur"    // Mécanique investisseur
  | "frais_only"      // N'ajoute que des frais sur le ticket précédent
  | "bonus";          // Soustrait de l'argent au joueur (basePrice est positif, appliqué en -)

export interface CardData {
  id: number;
  mechanic: CardMechanic;
  basePrice: number;        // Montant principal (toujours positif — isSubtraction contrôle le signe)
  frais?: number;           // Frais additionnels en $
  isSubtraction?: boolean;  // true → enlève basePrice du total du joueur
  note?: string;            // Description libre
  confirmed?: boolean;      // true → prix confirmé, false/undefined → placeholder
}

// ── Valeurs par défaut en attendant la confirmation ───────────────────────────
const D = {
  contravention:  150,
  contribuable:   500,
  investisseur: 5_000,
};

// ── TABLE PRINCIPALE ──────────────────────────────────────────────────────────
// Format : [id, mechanic, basePrice, frais?, isSubtraction?, note?]
// ⚠️  Modifie les lignes ci-dessous une fois les prix identifiés.

const RAW: Array<[number, CardMechanic, number, number?, boolean?, string?]> = [

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  CONTRAVENTIONS  (cartes 1–108)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [   1, "contravention", D.contravention, undefined, false, "TODO" ],
  [   2, "contravention", D.contravention, undefined, false, "TODO" ],
  [   3, "contravention", D.contravention, undefined, false, "TODO" ],
  [   4, "contravention", D.contravention, undefined, false, "TODO" ],
  [   5, "contravention", D.contravention, undefined, false, "TODO" ],
  [   6, "contravention", D.contravention, undefined, false, "TODO" ],
  [   7, "contravention", D.contravention, undefined, false, "TODO" ],
  [   8, "contravention", D.contravention, undefined, false, "TODO" ],
  [   9, "contravention", D.contravention, undefined, false, "TODO" ],
  [  10, "contravention", D.contravention, undefined, false, "TODO" ],
  [  11, "contravention", D.contravention, undefined, false, "TODO" ],
  [  12, "contravention", D.contravention, undefined, false, "TODO" ],
  [  13, "contravention", D.contravention, undefined, false, "TODO" ],
  [  14, "contravention", D.contravention, undefined, false, "TODO" ],
  [  15, "contravention", D.contravention, undefined, false, "TODO" ],
  [  16, "contravention", D.contravention, undefined, false, "TODO" ],
  [  17, "contravention", D.contravention, undefined, false, "TODO" ],
  [  18, "contravention", D.contravention, undefined, false, "TODO" ],
  [  19, "contravention", D.contravention, undefined, false, "TODO" ],
  [  20, "contravention", D.contravention, undefined, false, "TODO" ],
  [  21, "contravention", D.contravention, undefined, false, "TODO" ],
  [  22, "contravention", D.contravention, undefined, false, "TODO" ],
  [  23, "contravention", D.contravention, undefined, false, "TODO" ],
  [  24, "contravention", D.contravention, undefined, false, "TODO" ],
  [  25, "contravention", D.contravention, undefined, false, "TODO" ],
  [  26, "contravention", D.contravention, undefined, false, "TODO" ],
  [  27, "contravention", D.contravention, undefined, false, "TODO" ],
  [  28, "contravention", D.contravention, undefined, false, "TODO" ],
  [  29, "contravention", D.contravention, undefined, false, "TODO" ],
  [  30, "contravention", D.contravention, undefined, false, "TODO" ],
  [  31, "contravention", D.contravention, undefined, false, "TODO" ],
  [  32, "contravention", D.contravention, undefined, false, "TODO" ],
  [  33, "contravention", D.contravention, undefined, false, "TODO" ],
  [  34, "contravention", D.contravention, undefined, false, "TODO" ],
  [  35, "contravention", D.contravention, undefined, false, "TODO" ],
  [  36, "contravention", D.contravention, undefined, false, "TODO" ],
  [  37, "contravention", D.contravention, undefined, false, "TODO" ],
  [  38, "contravention", D.contravention, undefined, false, "TODO" ],
  [  39, "contravention", D.contravention, undefined, false, "TODO" ],
  [  40, "contravention", D.contravention, undefined, false, "TODO" ],
  [  41, "contravention", D.contravention, undefined, false, "TODO" ],
  [  42, "contravention", D.contravention, undefined, false, "TODO" ],
  [  43, "contravention", D.contravention, undefined, false, "TODO" ],
  [  44, "contravention", D.contravention, undefined, false, "TODO" ],
  [  45, "contravention", D.contravention, undefined, false, "TODO" ],
  [  46, "contravention", D.contravention, undefined, false, "TODO" ],
  [  47, "contravention", D.contravention, undefined, false, "TODO" ],
  [  48, "contravention", D.contravention, undefined, false, "TODO" ],
  [  49, "contravention", D.contravention, undefined, false, "TODO" ],
  [  50, "contravention", D.contravention, undefined, false, "TODO" ],
  [  51, "contravention", D.contravention, undefined, false, "TODO" ],
  [  52, "contravention", D.contravention, undefined, false, "TODO" ],
  [  53, "contravention", D.contravention, undefined, false, "TODO" ],
  [  54, "contravention", D.contravention, undefined, false, "TODO" ],
  [  55, "contravention", D.contravention, undefined, false, "TODO" ],
  [  56, "contravention", D.contravention, undefined, false, "TODO" ],
  [  57, "contravention", D.contravention, undefined, false, "TODO" ],
  [  58, "contravention", D.contravention, undefined, false, "TODO" ],
  [  59, "contravention", D.contravention, undefined, false, "TODO" ],
  [  60, "contravention", D.contravention, undefined, false, "TODO" ],
  [  61, "contravention", D.contravention, undefined, false, "TODO" ],
  [  62, "contravention", D.contravention, undefined, false, "TODO" ],
  [  63, "contravention", D.contravention, undefined, false, "TODO" ],
  [  64, "contravention", D.contravention, undefined, false, "TODO" ],
  [  65, "contravention", D.contravention, undefined, false, "TODO" ],
  [  66, "contravention", D.contravention, undefined, false, "TODO" ],
  [  67, "contravention", D.contravention, undefined, false, "TODO" ],
  [  68, "contravention", D.contravention, undefined, false, "TODO" ],
  [  69, "contravention", D.contravention, undefined, false, "TODO" ],
  [  70, "contravention", D.contravention, undefined, false, "TODO" ],
  [  71, "contravention", D.contravention, undefined, false, "TODO" ],
  [  72, "contravention", D.contravention, undefined, false, "TODO" ],
  [  73, "contravention", D.contravention, undefined, false, "TODO" ],
  [  74, "contravention", D.contravention, undefined, false, "TODO" ],
  [  75, "contravention", D.contravention, undefined, false, "TODO" ],
  [  76, "contravention", D.contravention, undefined, false, "TODO" ],
  [  77, "contravention", D.contravention, undefined, false, "TODO" ],
  [  78, "contravention", D.contravention, undefined, false, "TODO" ],
  [  79, "contravention", D.contravention, undefined, false, "TODO" ],
  [  80, "contravention", D.contravention, undefined, false, "TODO" ],
  [  81, "contravention", D.contravention, undefined, false, "TODO" ],
  [  82, "contravention", D.contravention, undefined, false, "TODO" ],
  [  83, "contravention", D.contravention, undefined, false, "TODO" ],
  [  84, "contravention", D.contravention, undefined, false, "TODO" ],
  [  85, "contravention", D.contravention, undefined, false, "TODO" ],
  [  86, "contravention", D.contravention, undefined, false, "TODO" ],
  [  87, "contravention", D.contravention, undefined, false, "TODO" ],
  [  88, "contravention", D.contravention, undefined, false, "TODO" ],
  [  89, "contravention", D.contravention, undefined, false, "TODO" ],
  [  90, "contravention", D.contravention, undefined, false, "TODO" ],
  [  91, "contravention", D.contravention, undefined, false, "TODO" ],
  [  92, "contravention", D.contravention, undefined, false, "TODO" ],
  [  93, "contravention", D.contravention, undefined, false, "TODO" ],
  [  94, "contravention", D.contravention, undefined, false, "TODO" ],
  [  95, "contravention", D.contravention, undefined, false, "TODO" ],
  [  96, "contravention", D.contravention, undefined, false, "TODO" ],
  [  97, "contravention", D.contravention, undefined, false, "TODO" ],
  [  98, "contravention", D.contravention, undefined, false, "TODO" ],
  [  99, "contravention", D.contravention, undefined, false, "TODO" ],
  [ 100, "contravention", D.contravention, undefined, false, "TODO" ],
  [ 101, "contravention", D.contravention, undefined, false, "TODO" ],
  [ 102, "contravention", D.contravention, undefined, false, "TODO" ],
  [ 103, "contravention", D.contravention, undefined, false, "TODO" ],
  [ 104, "contravention", D.contravention, undefined, false, "TODO" ],
  [ 105, "contravention", D.contravention, undefined, false, "TODO" ],
  [ 106, "contravention", D.contravention, undefined, false, "TODO" ],
  [ 107, "contravention", D.contravention, undefined, false, "TODO" ],
  [ 108, "contravention", D.contravention, undefined, false, "TODO" ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  CONTRIBUABLE  (cartes 109–216)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [ 109, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 110, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 111, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 112, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 113, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 114, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 115, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 116, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 117, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 118, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 119, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 120, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 121, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 122, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 123, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 124, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 125, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 126, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 127, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 128, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 129, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 130, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 131, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 132, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 133, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 134, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 135, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 136, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 137, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 138, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 139, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 140, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 141, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 142, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 143, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 144, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 145, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 146, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 147, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 148, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 149, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 150, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 151, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 152, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 153, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 154, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 155, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 156, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 157, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 158, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 159, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 160, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 161, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 162, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 163, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 164, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 165, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 166, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 167, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 168, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 169, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 170, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 171, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 172, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 173, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 174, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 175, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 176, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 177, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 178, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 179, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 180, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 181, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 182, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 183, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 184, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 185, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 186, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 187, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 188, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 189, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 190, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 191, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 192, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 193, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 194, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 195, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 196, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 197, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 198, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 199, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 200, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 201, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 202, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 203, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 204, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 205, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 206, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 207, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 208, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 209, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 210, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 211, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 212, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 213, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 214, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 215, "contribuable", D.contribuable, undefined, false, "TODO" ],
  [ 216, "contribuable", D.contribuable, undefined, false, "TODO" ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  INVESTISSEUR  (cartes 217–324)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [ 217, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 218, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 219, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 220, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 221, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 222, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 223, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 224, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 225, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 226, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 227, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 228, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 229, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 230, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 231, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 232, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 233, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 234, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 235, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 236, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 237, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 238, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 239, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 240, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 241, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 242, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 243, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 244, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 245, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 246, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 247, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 248, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 249, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 250, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 251, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 252, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 253, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 254, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 255, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 256, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 257, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 258, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 259, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 260, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 261, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 262, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 263, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 264, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 265, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 266, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 267, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 268, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 269, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 270, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 271, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 272, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 273, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 274, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 275, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 276, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 277, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 278, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 279, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 280, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 281, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 282, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 283, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 284, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 285, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 286, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 287, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 288, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 289, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 290, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 291, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 292, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 293, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 294, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 295, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 296, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 297, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 298, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 299, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 300, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 301, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 302, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 303, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 304, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 305, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 306, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 307, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 308, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 309, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 310, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 311, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 312, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 313, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 314, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 315, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 316, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 317, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 318, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 319, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 320, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 321, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 322, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 323, "investisseur", D.investisseur, undefined, false, "TODO" ],
  [ 324, "investisseur", D.investisseur, undefined, false, "TODO" ],
];

// ── Construction de la Map ─────────────────────────────────────────────────────
export const CARD_PRICES: Map<number, CardData> = new Map(
  RAW.map(([id, mechanic, basePrice, frais, isSubtraction, note]) => [
    id as number,
    {
      id:             id as number,
      mechanic:       mechanic as CardMechanic,
      basePrice:      basePrice as number,
      frais:          frais as number | undefined,
      isSubtraction:  isSubtraction as boolean | undefined,
      note:           note as string | undefined,
      confirmed:      note !== "TODO",
    } satisfies CardData,
  ]),
);

// ── Helpers publics ────────────────────────────────────────────────────────────

/** Données complètes d'une carte. */
export function getCardData(n: number): CardData {
  return CARD_PRICES.get(n) ?? {
    id:         n,
    mechanic:   n <= 108 ? "contravention" : n <= 216 ? "contribuable" : "investisseur",
    basePrice:  n <= 108 ? D.contravention : n <= 216 ? D.contribuable : D.investisseur,
    confirmed:  false,
  };
}

/**
 * Montant net que cette carte ajoute (positif) ou retire (négatif) au total.
 * = isSubtraction ? -(basePrice + frais) : +(basePrice + frais)
 */
export function getCardNetAmount(n: number): number {
  const d      = getCardData(n);
  const total  = d.basePrice + (d.frais ?? 0);
  return d.isSubtraction ? -total : total;
}

/**
 * Calcule le solde total d'une liste de cartes.
 * (Tient compte des soustractions.)
 */
export function computeTotal(cards: number[]): number {
  return cards.reduce((sum, n) => sum + getCardNetAmount(n), 0);
}

/**
 * Retourne l'intitulé du mécanisme pour l'affichage.
 */
export const MECHANIC_LABELS: Record<CardMechanic, string> = {
  contravention: "Contravention",
  contribuable:  "Contribuable",
  investisseur:  "Investisseur",
  frais_only:    "Frais",
  bonus:         "Bonus",
};

export const MECHANIC_COLORS: Record<CardMechanic, string> = {
  contravention: "#DC2626",
  contribuable:  "#D97706",
  investisseur:  "#7C3AED",
  frais_only:    "#0891B2",
  bonus:         "#16A34A",
};

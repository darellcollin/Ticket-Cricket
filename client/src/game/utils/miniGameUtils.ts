/**
 * Utilitaires pour les Perquisitions.
 * Séparé du composant MiniGame pour permettre le Fast Refresh de Vite.
 */

export type MiniGameMode = "run" | "hide";

/**
 * Explication du taux de perquisition affichée dans le sélecteur de niveau.
 */
export const MINI_GAME_EXPLANATION =
  "Le taux de perquisition détermine la fréquence à laquelle la police peut débarquer pendant la partie. Plus le niveau est élevé, plus les perquisitions sont fréquentes et le jeu devient intense. Chaque perquisition déclenche un mini-jeu où tu dois fuir ou te cacher.";

/**
 * Niveaux de taux de perquisition disponibles.
 * Niveau 1 = 2% (faible), Niveau 5 = 16% (agressif).
 * Couleurs : vert 1 — bleu 2 — violet 3 — orange 4 — rouge 5
 */
export const MINI_GAME_LEVELS = [
  {
    level: 1 as const,
    rate: 0.02,
    label: "NIVEAU 1",
    desc: "Taux de perquisition faible",
    flavor: "Aucun dossier criminel à ton actif",
    color: "#16A34A", // vert
  },
  {
    level: 2 as const,
    rate: 0.06,
    label: "NIVEAU 2",
    desc: "Taux de perquisitions normal",
    flavor: "Tu n'es pas assez influent",
    color: "#2563EB", // bleu
  },
  {
    level: 3 as const,
    rate: 0.09,
    label: "NIVEAU 3",
    desc: "Taux de perquisition récurrent",
    flavor: "Tu commences à faire parler de toi",
    color: "#7C3AED", // violet
  },
  {
    level: 4 as const,
    rate: 0.12,
    label: "NIVEAU 4",
    desc: "Taux de perquisition intense",
    flavor: "Tu es recherché partout au pays",
    color: "#EA580C", // orange
  },
  {
    level: 5 as const,
    rate: 0.16,
    label: "NIVEAU 5",
    desc: "Taux de perquisition agressif",
    flavor: "Tu es le criminel qui marquera l'histoire",
    color: "#DC2626", // rouge
  },
];

export type MiniGameLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Retourne le taux de déclenchement pour un niveau donné.
 */
export function getMiniGameRate(level: MiniGameLevel = 1): number {
  return MINI_GAME_LEVELS.find(l => l.level === level)?.rate ?? 0.02;
}

/**
 * Retourne true avec la probabilité correspondant au niveau choisi.
 * Alterne aléatoirement entre "run" et "hide".
 */
export function rollMiniGame(level: MiniGameLevel = 1): { triggered: boolean; mode: MiniGameMode } {
  const rate = getMiniGameRate(level);
  const triggered = Math.random() < rate;
  const mode: MiniGameMode = Math.random() < 0.5 ? "run" : "hide";
  return { triggered, mode };
}

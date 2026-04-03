/**
 * Utilitaires pour les Perquisitions.
 * Séparé du composant MiniGame pour permettre le Fast Refresh de Vite.
 */

export type MiniGameMode = "run" | "hide";

/**
 * Niveaux de taux de perquisition disponibles.
 * Niveau 1 = 2% (faible), Niveau 5 = 16% (agressif).
 */
export const MINI_GAME_LEVELS = [
  {
    level: 1 as const,
    rate: 0.02,
    label: "NIVEAU 1",
    desc: "Taux de perquisition faible",
    flavor: "Aucun dossier criminel à ton actif",
    color: "#16A34A",
  },
  {
    level: 2 as const,
    rate: 0.06,
    label: "NIVEAU 2",
    desc: "Taux de perquisitions normal",
    flavor: "Tu n'es pas assez influent",
    color: "#CA8A04",
  },
  {
    level: 3 as const,
    rate: 0.09,
    label: "NIVEAU 3",
    desc: "Taux de perquisition récurrent",
    flavor: "Tu commences à faire parler de toi",
    color: "#EA580C",
  },
  {
    level: 4 as const,
    rate: 0.12,
    label: "NIVEAU 4",
    desc: "Taux de perquisition intense",
    flavor: "Tu es recherché partout au pays",
    color: "#DC2626",
  },
  {
    level: 5 as const,
    rate: 0.16,
    label: "NIVEAU 5",
    desc: "Taux de perquisition agressif",
    flavor: "Tu es le criminel qui marquera l'histoire",
    color: "#7C3AED",
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

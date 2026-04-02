/**
 * Utilitaires pour le mini-jeu surprise.
 * Séparé du composant MiniGame pour permettre le Fast Refresh de Vite.
 */

export type MiniGameMode = "run" | "hide";

/**
 * Retourne true avec une probabilité de ~8% (très rare).
 * Alterne aléatoirement entre "run" et "hide".
 */
export function rollMiniGame(): { triggered: boolean; mode: MiniGameMode } {
  const triggered = Math.random() < 0.08; // 8% de chance (très rare)
  const mode: MiniGameMode = Math.random() < 0.5 ? "run" : "hide";
  return { triggered, mode };
}

/**
 * Utilitaires pour le mini-jeu surprise.
 * Séparé du composant MiniGame pour permettre le Fast Refresh de Vite.
 */

export type MiniGameMode = "run" | "hide";

/**
 * Retourne true avec une probabilité de ~2% (extrêmement rare).
 * Alterne aléatoirement entre "run" et "hide".
 */
export function rollMiniGame(): { triggered: boolean; mode: MiniGameMode } {
  const triggered = Math.random() < 0.02; // 2% de chance (extrêmement rare)
  const mode: MiniGameMode = Math.random() < 0.5 ? "run" : "hide";
  return { triggered, mode };
}

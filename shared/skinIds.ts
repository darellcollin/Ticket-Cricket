/**
 * Liste exhaustive des IDs de skins de cartes.
 * Partagée entre le serveur et le client.
 */
export const SKIN_IDS = [
  "classique",
  "neon",
  "retro",
  "glace",
  "feu",
  "royal",
  "cosmic",
  "magique",
  "foret",
  "metal",
  "prestige",
  "negatif",
  "bonbon",
  "glitch",
  "pastel",
] as const;

export type SkinId = typeof SKIN_IDS[number];

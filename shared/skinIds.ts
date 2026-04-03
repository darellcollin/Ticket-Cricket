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
  "foret",
  "metal",
  "prestige",
] as const;

export type SkinId = typeof SKIN_IDS[number];

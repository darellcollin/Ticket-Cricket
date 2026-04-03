/**
 * Liste des pseudos VIP — accès permanent à tous les skins, packs et extensions.
 * Même si de nouveaux produits sont ajoutés, ces joueurs y ont toujours accès.
 */
export const VIP_PSEUDOS: string[] = ["Sandot1245"];

/** Vérifie si un pseudo est VIP */
export function isVipPseudo(pseudo: string): boolean {
  return VIP_PSEUDOS.some(vip => vip.toLowerCase() === pseudo.toLowerCase());
}

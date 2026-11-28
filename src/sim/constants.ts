/* Réglages de la simulation : gravité, canon, dégâts, points. */

export const GRAVITY = -11;
/**
 * Échelle du décor : les niveaux sont écrits à taille « modèle » puis agrandis d'autant (structures,
 * rochers, objets, relous), autour du début de la structure. Le canon et les amis gardent leur taille.
 */
export const SCALE = 1.3;
/** Vitesse de tir maximale (m/s) : assez pour atteindre le fond des niveaux agrandis. */
export const MAX_SPEED = 25.5;
/** Pivot du canon (m) et longueur du fût : l'ami sort par la bouche du canon. */
export const CANNON = { x: 0, y: 2 };
export const BARREL = 3;

/** Bouche du canon pour un tir dans la direction (vx, vy). */
export function muzzle(vx: number, vy: number) {
  const d = Math.hypot(vx, vy) || 1;
  return { x: CANNON.x + (vx / d) * BARREL, y: CANNON.y + (vy / d) * BARREL };
}
export const DT = 1 / 60;

/** Dégâts : impulsion minimale qui abîme (objets, relous), facteurs des amis et des relous. */
export const IMP_MIN = 2.2;
/** Vitesse relative (m/s) sous laquelle un contact est une charge posée, pas un choc. */
export const RESTING = 0.5;
export const IMP_MIN_ENEMY = 0.8;
export const DMG_K = 1.8;
export const FRIEND_DMG = 1.5;
export const ENEMY_MUL = 2.4;
export const KILL_SCORE = 5000;
export const FRIEND_BONUS = 10000;

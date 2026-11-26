/* Réglages de la simulation : gravité, canon, dégâts, points. */

export const GRAVITY = -11;
export const MAX_SPEED = 23;
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
export const IMP_MIN_ENEMY = 0.8;
export const DMG_K = 1.8;
export const FRIEND_DMG = 1.5;
export const ENEMY_MUL = 2.4;
export const KILL_SCORE = 5000;
export const FRIEND_BONUS = 10000;

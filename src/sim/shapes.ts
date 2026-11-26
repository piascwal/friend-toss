/* Formes physiques : boîte aux coins coupés (les piles tiennent mieux et l'aspect est arrondi). */
import { Polygon, Vec2 } from 'planck';

/** Boîte aux coins coupés (les piles tiennent mieux et roulent moins bizarrement). */
export function chamfered(w: number, h: number, c = 0.04) {
  const hw = w / 2;
  const hh = h / 2;
  const k = Math.min(c, hw * 0.3, hh * 0.3);
  return new Polygon([
    new Vec2(-hw + k, -hh),
    new Vec2(hw - k, -hh),
    new Vec2(hw, -hh + k),
    new Vec2(hw, hh - k),
    new Vec2(hw - k, hh),
    new Vec2(-hw + k, hh),
    new Vec2(-hw, hh - k),
    new Vec2(-hw, -hh + k),
  ]);
}

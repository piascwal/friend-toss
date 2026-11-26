/* Le canon en pixel art : fût en fonte cerclé de laiton, affût en bois, roues à rayons. */
import { canvas, px } from './pixels';

const CT = 24;
let cannonParts: { barrel: HTMLCanvasElement; carriage: HTMLCanvasElement; wheel: HTMLCanvasElement } | null =
  null;

/** Canon en pixel art : fût en fonte cerclé de laiton, affût en bois, roues à rayons. */
export function cannonArt() {
  if (cannonParts) return cannonParts;
  // fût : de -0.45 m (culasse) à +1.85 m (bouche), 0.8 m de haut
  const BW = Math.round(2.3 * CT);
  const BH = Math.round(0.8 * CT);
  const b = canvas(BW, BH);
  const g = b.ctx;
  const mid = BH / 2;
  for (let x = 0; x < BW; x++) {
    const t = x / BW;
    // le fût s'affine vers la bouche, la bouche s'évase
    let half = BH * (0.36 - t * 0.08);
    if (t > 0.9) half = BH * 0.42;
    if (t < 0.08) half = BH * 0.3 * Math.sqrt(Math.max(0, 1 - ((0.08 - t) / 0.08) ** 2)) + 1;
    const top = Math.round(mid - half);
    const bot = Math.round(mid + half);
    px(g, x, top, '#16181d', 1, bot - top);
    px(g, x, top + 1, '#3a3f4a', 1, Math.max(0, bot - top - 2));
    px(g, x, top + 2, '#6b7484', 1, Math.max(1, Math.round((bot - top) * 0.18)));
    px(g, x, Math.round(mid + half * 0.45), '#24272e', 1, Math.max(1, Math.round(half * 0.4)));
    const ring = (a: number) => t > a && t < a + 0.035;
    if (ring(0.12) || ring(0.45) || ring(0.86)) {
      px(g, x, top, '#5a3d0a', 1, bot - top);
      px(g, x, top + 1, '#d9a93a', 1, Math.max(0, bot - top - 2));
      px(g, x, top + 1, '#ffe08a', 1, 1);
    }
  }
  // bouche : intérieur sombre
  px(g, BW - 2, Math.round(mid - BH * 0.3), '#0b0b0e', 2, Math.round(BH * 0.6));
  // affût
  const CW = Math.round(1.7 * CT);
  const CH = Math.round(0.75 * CT);
  const a = canvas(CW, CH);
  const ac = a.ctx;
  for (let y = 0; y < CH; y++) {
    const inset = Math.round((1 - y / CH) * CW * 0.22);
    px(ac, inset, y, '#3d200c', CW - 2 * inset, 1);
    if (y > 0 && y < CH - 1)
      px(ac, inset + 1, y, y < 3 ? '#e0a868' : y % 6 === 0 ? '#8a5226' : '#b9773f', CW - 2 * inset - 2, 1);
  }
  for (const bx of [0.3, 0.7]) {
    px(ac, Math.round(CW * bx), Math.round(CH * 0.4), '#d8d8d8', 2, 2);
    px(ac, Math.round(CW * bx) + 1, Math.round(CH * 0.4) + 1, '#3b3b3b', 1, 1);
  }
  // roue
  const WD = Math.round(1 * CT);
  const w = canvas(WD, WD);
  const wc = w.ctx;
  const R = WD / 2;
  for (let y = 0; y < WD; y++)
    for (let x = 0; x < WD; x++) {
      const d = Math.hypot(x + 0.5 - R, y + 0.5 - R);
      const ang = Math.atan2(y + 0.5 - R, x + 0.5 - R);
      if (d > R) continue;
      let colr = '';
      if (d > R - 1.5) colr = '#16181d';
      else if (d > R - 3.5) colr = '#6b7484';
      else if (d > R - 5) colr = '#3d200c';
      else if (d < 3) colr = d < 2 ? '#d9a93a' : '#3d200c';
      else if (Math.abs(Math.sin(ang * 4)) < 0.22) colr = '#b9773f';
      if (colr) px(wc, x, y, colr);
    }
  cannonParts = { barrel: b.c, carriage: a.c, wheel: w.c };
  return cannonParts;
}

export const CANNON_TEX = CT;

let cannonUrl = '';

/** Image du canon (guide, titre) : le canon dessiné à plat, en grand. */
export function cannonImage(): string {
  if (cannonUrl) return cannonUrl;
  const { barrel, carriage, wheel } = cannonArt();
  const S = 4;
  const c = document.createElement('canvas');
  c.width = Math.round(2.9 * CT * S);
  c.height = Math.round(1.9 * CT * S);
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  const m = (v: number) => v * CT * S;
  g.drawImage(wheel, m(0.35), m(0.9), m(1), m(1));
  g.drawImage(carriage, m(0.45), m(0.85), m(1.7), m(0.75));
  g.save();
  g.translate(m(1.3), m(0.8));
  g.rotate(-0.45);
  g.drawImage(barrel, m(-0.45 - 0.2), m(-0.4), m(2.3), m(0.8));
  g.restore();
  g.drawImage(wheel, m(1.25), m(0.9), m(1), m(1));
  cannonUrl = c.toDataURL();
  return cannonUrl;
}

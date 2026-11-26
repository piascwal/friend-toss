/* Le canon en pixel art : fût en fonte cerclé de laiton, affût en bois, roues à rayons. */
import { canvas, px } from './pixels';

const CT = 20;

/** Dimensions du canon (m). Le fût va de BACK (culasse) à MOUTH (bouche) le long de son axe. */
export const CANNON_ART = {
  back: -0.9,
  mouth: 3.1,
  /** Hauteur du fût (la bouche s'évase un peu plus). */
  barrel: 1.5,
  /** Ouverture de la bouche : assez grande pour qu'une grosse tête en sorte. */
  bore: 1.3,
  wheel: 1.6,
  carriage: { w: 2.8, h: 1.25 },
};

let cannonParts: { barrel: HTMLCanvasElement; carriage: HTMLCanvasElement; wheel: HTMLCanvasElement } | null =
  null;

/** Canon en pixel art : fût en fonte cerclé de laiton, grande bouche ouverte, affût en bois, roues à rayons. */
export function cannonArt() {
  if (cannonParts) return cannonParts;
  const A = CANNON_ART;
  const BW = Math.round((A.mouth - A.back) * CT);
  const BH = Math.round(A.barrel * 1.12 * CT);
  const b = canvas(BW, BH);
  const g = b.ctx;
  const mid = BH / 2;
  const rimW = Math.round(0.3 * CT);
  for (let x = 0; x < BW - rimW / 2; x++) {
    const t = x / BW;
    // le fût s'affine légèrement puis s'évase en tulipe vers la bouche
    let half = BH * (0.4 - t * 0.06);
    if (t > 0.82) half = BH * (0.34 + (t - 0.82) * 0.9);
    if (t < 0.07) half = BH * 0.34 * Math.sqrt(Math.max(0, 1 - ((0.07 - t) / 0.07) ** 2)) + 1;
    const top = Math.round(mid - half);
    const bot = Math.round(mid + half);
    px(g, x, top, '#16181d', 1, bot - top);
    px(g, x, top + 1, '#3a3f4a', 1, Math.max(0, bot - top - 2));
    px(g, x, top + 2, '#6b7484', 1, Math.max(1, Math.round((bot - top) * 0.16)));
    px(g, x, top + 3, '#9aa5b2', 1, 1);
    px(g, x, Math.round(mid + half * 0.45), '#24272e', 1, Math.max(1, Math.round(half * 0.45)));
    const ring = (a: number) => t > a && t < a + 0.03;
    if (ring(0.12) || ring(0.42) || ring(0.72)) {
      px(g, x, top, '#5a3d0a', 1, bot - top);
      px(g, x, top + 1, '#d9a93a', 1, Math.max(0, bot - top - 2));
      px(g, x, top + 1, '#ffe08a', 1, 1);
    }
  }
  // la bouche vue de trois quarts : un ovale cerclé de laiton, sombre à l'intérieur
  const cx = BW - rimW / 2 - 1;
  const ry = (A.bore / 2) * CT + 2;
  for (let y = -ry - 2; y <= ry + 2; y++) {
    const k = Math.sqrt(Math.max(0, 1 - (y / (ry + 2)) ** 2));
    const w = Math.round((rimW / 2) * k);
    if (!w) continue;
    px(g, Math.round(cx - w), Math.round(mid + y), '#5a3d0a', w * 2 + 1, 1);
    const inner = Math.sqrt(Math.max(0, 1 - (y / ry) ** 2));
    const wi = Math.round((rimW / 2 - 2) * inner);
    if (wi > 0 && Math.abs(y) < ry) {
      px(g, Math.round(cx - wi), Math.round(mid + y), '#0b0b0e', wi * 2 + 1, 1);
      px(g, Math.round(cx - w), Math.round(mid + y), y < 0 ? '#ffe08a' : '#d9a93a', 1, 1);
    }
  }
  // affût
  const CW = Math.round(A.carriage.w * CT);
  const CH = Math.round(A.carriage.h * CT);
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
  const WD = Math.round(A.wheel * CT);
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
      else if (d > R - 4) colr = '#6b7484';
      else if (d > R - 6) colr = '#3d200c';
      else if (d < 4) colr = d < 2.5 ? '#d9a93a' : '#3d200c';
      else if (Math.abs(Math.sin(ang * 4)) < 0.2) colr = '#b9773f';
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
  const S = 3;
  const c = document.createElement('canvas');
  c.width = Math.round(5.2 * CT * S);
  c.height = Math.round(4 * CT * S);
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  // repère : pivot du canon à 1,8 m du bord gauche, sol en bas
  const m = (v: number) => v * CT * S;
  drawCannonParts(
    (img, x, y, w, h, angle) => {
      g.save();
      g.translate(m(1.8 + x), c.height - m(y));
      g.rotate(-angle);
      g.drawImage(img, -m(w) / 2, -m(h) / 2, m(w), m(h));
      g.restore();
    },
    0.5,
    0,
  );
  cannonUrl = c.toDataURL();
  return cannonUrl;
}

/** Hauteur du pivot du fût au-dessus du sol (m). */
export const PIVOT_Y = 2;

type Draw = (img: CanvasImageSource, x: number, y: number, w: number, h: number, angle: number) => void;

/**
 * Dessine le canon (roue arrière, affût, fût, roue avant) autour de son pivot en (0, PIVOT_Y), le fût
 * tourné de `angle` et reculé de `back` mètres. Partagé entre le jeu et l'image du guide.
 */
export function drawCannonParts(draw: Draw, angle: number, back: number) {
  const A = CANNON_ART;
  const art = cannonArt();
  const r = A.wheel / 2;
  draw(art.wheel, -1.05, r, A.wheel, A.wheel, 0);
  draw(art.carriage, -0.2, PIVOT_Y - A.carriage.h / 2 - 0.1, A.carriage.w, A.carriage.h, 0);
  const axis = (A.back + A.mouth) / 2 - back;
  const dir = { x: Math.cos(angle), y: Math.sin(angle) };
  draw(art.barrel, dir.x * axis, PIVOT_Y + dir.y * axis, A.mouth - A.back, A.barrel * 1.12, angle);
  draw(art.wheel, 0.75, r, A.wheel, A.wheel, 0);
}

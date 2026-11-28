/* Modules de construction (bois, glace, pierre, métal) en pixel art détaillé : deux fois plus de pixels
   que le reste du décor, coins bien arrondis, relief doux (lumière en haut à gauche), et la matière
   dessinée pour de vrai : planches, veines et nœuds du bois ; pierres taillées et joints ; glace
   translucide avec reflets et bulles ; plaques de métal brossé et rivets. */
import { FRAME, type Mat, type Shape } from '../sim/defs';
import { canvas, rgb, rng, TEX } from './pixels';
import { cracks, frost } from './textures';

/** Pixels par mètre des modules (plus fins que le décor). */
const BTEX = TEX * 2;

type RGB = [number, number, number];

interface Palette {
  base: string;
  light: string;
  dark: string;
  line: string;
  /** Veines, joints, rayures. */
  mark: string;
  alpha?: number;
}

const PALETTES: Partial<Record<Mat, Palette>> = {
  wood: { base: '#c4843f', light: '#f3c47e', dark: '#7a4520', line: '#3a1d0a', mark: '#9a5d2a' },
  ice: { base: '#9fe0f4', light: '#f4fdff', dark: '#4fa6cc', line: '#2a6f94', mark: '#d8f7ff', alpha: 0.86 },
  stone: { base: '#a29d94', light: '#dcd7cd', dark: '#625e57', line: '#2c2925', mark: '#7a756d' },
  metal: { base: '#95a1af', light: '#f0f4f9', dark: '#535d69', line: '#1e242b', mark: '#7c8794' },
};

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const cache = new Map<string, HTMLCanvasElement>();

/** Image d'un module de `w` × `h` mètres, usé selon `stage` (0 à 2), éventuellement gelé. */
export function blockTexture(
  mat: Mat,
  w: number,
  h: number,
  shape: Shape,
  stage: number,
  frozen: boolean,
): HTMLCanvasElement {
  const key = `${mat}|${w.toFixed(3)}|${h.toFixed(3)}|${shape}|${stage}|${frozen}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const W = Math.max(6, Math.round(w * BTEX));
  const H = Math.max(6, Math.round(h * BTEX));
  const { c, ctx } = canvas(W, H);
  const pal = PALETTES[mat] ?? PALETTES.wood!;
  const inside = shapeTest(shape, W, H);
  const r = rng(W * 31 + H * 17 + mat.length * 7 + shape.length);
  const tone = materialTone(mat, shape, W, H, pal, r);
  const light = rgb(pal.light);
  const dark = rgb(pal.dark);
  const line = mix(rgb(pal.line), rgb(pal.dark), 0.25);
  const alpha = Math.round((pal.alpha ?? 1) * 255);
  // largeur du relief : un biseau doux sur les bords
  const B = Math.max(2, Math.min(7, Math.round(Math.min(W, H) * 0.2)));
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!inside(x, y)) continue;
      const o = (y * W + x) * 4;
      if (!inside(x, y - 1) || !inside(x - 1, y) || !inside(x, y + 1) || !inside(x + 1, y)) {
        img.data.set([line[0], line[1], line[2], 255], o);
        continue;
      }
      let col = tone(x, y);
      const dist = (dx: number, dy: number) => {
        for (let k = 2; k <= B; k++) if (!inside(x + dx * k, y + dy * k)) return k - 1;
        return B + 1;
      };
      const ramp = (d: number) => (d > B ? 0 : 1 - (d - 1) / B);
      const lit = 0.42 * ramp(dist(0, -1)) + 0.22 * ramp(dist(-1, 0));
      const shadow = 0.4 * ramp(dist(0, 1)) + 0.25 * ramp(dist(1, 0));
      if (lit > shadow) col = mix(col, light, lit - shadow * 0.5);
      else if (shadow > 0) col = mix(col, dark, shadow - lit * 0.5);
      // grain très léger : la matière n'est jamais d'une seule couleur
      const n = 1 + (r() - 0.5) * 0.07;
      img.data.set([col[0] * n, col[1] * n, col[2] * n, alpha], o);
    }
  ctx.putImageData(img, 0, 0);
  details(ctx, mat, shape, W, H, inside, r);
  if (frozen) frost(ctx, W, H, r);
  if (stage > 0) cracks(ctx, W, H, stage, r);
  if (frozen || stage > 0) clip(ctx, W, H, inside);
  cache.set(key, c);
  return c;
}

/** Forme du module en pixels : rectangle aux coins bien arrondis, rond, triangle ou cadre creux. */
function shapeTest(shape: Shape, W: number, H: number) {
  const rad = Math.max(3, Math.round(Math.min(W, H) * 0.34));
  const t = Math.max(3, Math.round(Math.min(W, H) * FRAME));
  const rounded = (px: number, py: number, x0: number, y0: number, x1: number, y1: number, rr: number) => {
    const cx = Math.min(Math.max(px, x0 + rr), x1 - rr);
    const cy = Math.min(Math.max(py, y0 + rr), y1 - rr);
    return (px - cx) ** 2 + (py - cy) ** 2 <= rr * rr;
  };
  return (x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x >= W || y >= H) return false;
    const px = x + 0.5;
    const py = y + 0.5;
    if (shape === 'circle') return (px - W / 2) ** 2 / (W / 2) ** 2 + (py - H / 2) ** 2 / (H / 2) ** 2 <= 1;
    if (shape === 'triangle') return Math.abs(px - W / 2) <= (py / H) * (W / 2) + 0.3;
    if (shape === 'frame' && rounded(px, py, t, t, W - t, H - t, Math.max(1, rad - t))) return false;
    return rounded(px, py, 0, 0, W, H, rad);
  };
}

/** Couleur de la matière en chaque pixel, avant le relief. */
function materialTone(mat: Mat, shape: Shape, W: number, H: number, pal: Palette, r: () => number) {
  const base = rgb(pal.base);
  const mark = rgb(pal.mark);
  const light = rgb(pal.light);
  const dark = rgb(pal.dark);
  if (mat === 'wood') {
    if (shape === 'circle')
      return (x: number, y: number): RGB => {
        const d = Math.hypot(x + 0.5 - W / 2, y + 0.5 - H / 2);
        return Math.round(d + Math.sin(Math.atan2(y - H / 2, x - W / 2) * 5)) % 4 === 0 ? mark : base;
      };
    // planches dans le sens de la longueur, chacune de sa teinte, avec veines ondulées et nœuds
    const vertical = H > W * 1.2;
    const across = vertical ? W : H;
    const planks = Math.max(1, Math.round(across / 13));
    const plankW = across / planks;
    const tints = Array.from({ length: planks }, () => (r() - 0.5) * 0.18);
    const phase = Array.from({ length: planks }, () => r() * 10);
    const knots = Array.from({ length: Math.floor((W * H) / 900) }, () => ({
      x: r() * W,
      y: r() * H,
      s: 1.5 + r() * 2,
    }));
    return (x: number, y: number): RGB => {
      const u = vertical ? y : x;
      const v = vertical ? x : y;
      const p = Math.min(planks - 1, Math.floor(v / plankW));
      if (planks > 1 && p > 0 && Math.abs(v - p * plankW) < 0.6) return dark;
      let col = mix(base, tints[p]! > 0 ? light : dark, Math.abs(tints[p]!));
      const g = Math.sin(v * 1.25 + Math.sin(u * 0.07 + phase[p]!) * 2.2);
      if (g > 0.82) col = mix(col, mark, 0.8);
      else if (g < -0.9) col = mix(col, light, 0.25);
      for (const k of knots) {
        const d = Math.hypot((x - k.x) / 1.6, y - k.y);
        if (d < k.s) return d < k.s * 0.5 ? dark : mix(col, mark, 0.9);
      }
      return col;
    };
  }
  if (mat === 'stone') {
    // pierres taillées en rangées décalées, chacune de sa teinte, joints de mortier
    const rowH = Math.max(7, Math.min(14, Math.round(Math.min(W, H) * 0.5)));
    const cache = new Map<string, number>();
    const tint = (i: number, j: number) => {
      const k = `${i},${j}`;
      if (!cache.has(k)) cache.set(k, (r() - 0.5) * 0.3);
      return cache.get(k)!;
    };
    const lenOf = (row: number) => 14 + ((row * 7) % 9);
    return (x: number, y: number): RGB => {
      if (shape !== 'box' && shape !== 'frame') {
        const t = tint(Math.floor(x / 9), Math.floor(y / 9));
        return r() < 0.1 ? mark : mix(base, t > 0 ? light : dark, Math.abs(t));
      }
      const row = Math.floor(y / rowH);
      const len = lenOf(row);
      const off = (row % 2) * (len / 2);
      const col = Math.floor((x + off) / len);
      if (y % rowH === 0 || Math.floor((x + off) % len) === 0) return mark;
      const t = tint(row, col);
      let c = mix(base, t > 0 ? light : dark, Math.abs(t));
      if (r() < 0.06) c = mix(c, dark, 0.35);
      return c;
    };
  }
  if (mat === 'ice') {
    // plus clair en haut, reflets en biais, quelques bulles
    const bubbles = Array.from({ length: Math.floor((W * H) / 500) }, () => ({ x: r() * W, y: r() * H }));
    return (x: number, y: number): RGB => {
      let c = mix(base, light, Math.max(0, 0.35 - y / H) * 0.9);
      const d = (x + y * 0.8) % 23;
      if (d < 1.6) c = mix(c, light, 0.6);
      else if (d > 11 && d < 12) c = mix(c, mark, 0.5);
      for (const b of bubbles) if (Math.hypot(x - b.x, y - b.y) < 1.1) return light;
      return c;
    };
  }
  // métal brossé : rayures fines dans la longueur, bande claire en haut
  const vertical = H > W * 1.2;
  return (x: number, y: number): RGB => {
    const v = vertical ? x : y;
    const n = vertical ? W : H;
    let c = mix(base, light, Math.max(0, 0.3 - v / n) * 1.2);
    if ((vertical ? y : x) % 7 < 1 && r() < 0.5) c = mix(c, mark, 0.4);
    if (v % 3 === 0) c = mix(c, mark, 0.25);
    return c;
  };
}

/** Détails posés par-dessus : clous du bois, plaque et rivets du métal, reflet de la glace. */
function details(
  ctx: CanvasRenderingContext2D,
  mat: Mat,
  shape: Shape,
  W: number,
  H: number,
  inside: (x: number, y: number) => boolean,
  r: () => number,
) {
  const dot = (x: number, y: number, hi: string, lo: string, s = 2) => {
    if (!inside(x - 1, y - 1) || !inside(x + s, y + s)) return;
    ctx.fillStyle = lo;
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = hi;
    ctx.fillRect(x, y, 1, 1);
  };
  const m = Math.max(4, Math.round(Math.min(W, H) * 0.3));
  if (shape === 'box' && mat === 'wood') {
    // clous aux deux bouts de chaque planche
    const vertical = H > W * 1.2;
    const across = vertical ? W : H;
    const planks = Math.max(1, Math.round(across / 13));
    for (let p = 0; p < planks; p++) {
      const v = Math.round(((p + 0.5) * across) / planks) - 1;
      if (vertical) {
        dot(v, m, '#d9d2c7', '#3a3430');
        dot(v, H - m - 2, '#d9d2c7', '#3a3430');
      } else {
        dot(m, v, '#d9d2c7', '#3a3430');
        dot(W - m - 2, v, '#d9d2c7', '#3a3430');
      }
    }
  }
  if (shape === 'box' && mat === 'metal') {
    // plaque en creux et rivets
    const i = Math.max(3, Math.round(Math.min(W, H) * 0.18));
    if (W > 2 * i + 4 && H > 2 * i + 4) {
      ctx.fillStyle = 'rgba(30,36,43,0.35)';
      ctx.fillRect(i, i, W - 2 * i, 1);
      ctx.fillRect(i, i, 1, H - 2 * i);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(i, H - i, W - 2 * i, 1);
      ctx.fillRect(W - i, i, 1, H - 2 * i + 1);
    }
    const step = 22;
    const along = Math.max(W, H);
    for (let a = m; a <= along - m - 2; a += step) {
      if (W >= H) {
        dot(a, Math.max(2, i - 2), '#ffffff', '#4a5360', 3);
        dot(a, H - Math.max(2, i - 2) - 3, '#ffffff', '#4a5360', 3);
      } else {
        dot(Math.max(2, i - 2), a, '#ffffff', '#4a5360', 3);
        dot(W - Math.max(2, i - 2) - 3, a, '#ffffff', '#4a5360', 3);
      }
    }
  }
  if (mat === 'ice') {
    // reflet net en haut à gauche
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    const len = Math.min(W, H) * 0.6;
    for (let k = 0; k < len; k++) if (inside(4 + k, 3) && inside(4 + k, 4)) ctx.fillRect(4 + k, 3, 1, 1);
    for (let k = 0; k < len * 0.5; k++) if (inside(3, 5 + k)) ctx.fillRect(3, 5 + k, 1, 1);
  }
  if (mat === 'stone' && r() < 0.5) {
    // une petite fêlure de surface
    let x = Math.floor(W * (0.3 + r() * 0.4));
    let y = Math.floor(H * 0.3);
    ctx.fillStyle = 'rgba(40,36,32,0.45)';
    for (let k = 0; k < Math.min(W, H) * 0.4; k++) {
      if (inside(x, y)) ctx.fillRect(x, y, 1, 1);
      x += r() < 0.5 ? 1 : 0;
      y += 1;
    }
  }
}

/** Garde la forme du module après fissures et givre. */
function clip(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  inside: (x: number, y: number) => boolean,
) {
  const { c: mask, ctx: mc } = canvas(W, H);
  const md = mc.createImageData(W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) if (inside(x, y)) md.data[(y * W + x) * 4 + 3] = 255;
  mc.putImageData(md, 0, 0);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(mask, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}

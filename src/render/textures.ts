/* Textures dessinées par le jeu : modules (bois, glace, pierre, métal), TNT, fissures et givre, sol. */
import { FRAME, type Mat, type Shape } from '../sim/defs';
import type { Theme } from '../sim/level';
import { canvas, lighten, px, rgb, rng, TEX } from './pixels';
import { THEMES } from './themes';

const blockCache = new Map<string, HTMLCanvasElement>();

/** Couleurs d'un module : fond, clair, sombre, contour, motif. */
const BLOCK_COLORS: Record<
  string,
  { base: string; light: string; dark: string; line: string; mark: string; alpha?: number }
> = {
  wood: { base: '#c98a45', light: '#f2bd73', dark: '#8a5226', line: '#3d200c', mark: '#a86a32' },
  ice: { base: '#a8e6f7', light: '#ffffff', dark: '#5bb5d6', line: '#2f7ea3', mark: '#d6f6ff', alpha: 0.9 },
  stone: { base: '#a5a198', light: '#dad6cd', dark: '#6e6a63', line: '#34312d', mark: '#8c887f' },
  metal: { base: '#9aa5b2', light: '#eef3f8', dark: '#5d6773', line: '#252b33', mark: '#7d8794' },
};

/**
 * Module de construction (bloc, poutre, rond, triangle) en pixel art : coins arrondis, contour sombre,
 * biseau clair en haut à gauche et sombre en bas à droite, motif du matériau, usure (`stage`, 0 à 2).
 */
export function blockTexture(
  mat: Mat,
  w: number,
  h: number,
  shape: Shape,
  stage: number,
  frozen: boolean,
): HTMLCanvasElement {
  const key = `${mat}|${w}|${h}|${shape}|${stage}|${frozen}`;
  const hit = blockCache.get(key);
  if (hit) return hit;
  const W = Math.max(4, Math.round(w * TEX));
  const H = Math.max(4, Math.round(h * TEX));
  const { c, ctx } = canvas(W, H);
  const col = BLOCK_COLORS[mat] ?? BLOCK_COLORS.wood!;
  const rad = Math.max(2, Math.round(Math.min(W, H) * 0.3));
  const inside = (x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x >= W || y >= H) return false;
    const px = x + 0.5;
    const py = y + 0.5;
    if (shape === 'circle') return (px - W / 2) ** 2 / (W / 2) ** 2 + (py - H / 2) ** 2 / (H / 2) ** 2 <= 1;
    if (shape === 'triangle') return Math.abs(px - W / 2) <= (py / H) * (W / 2) + 0.3;
    // cadre : un carré vide, côtés épais d'un cinquième
    if (shape === 'frame') {
      const t = Math.max(2, Math.round(Math.min(W, H) * FRAME));
      if (px > t && px < W - t && py > t && py < H - t) return false;
    }
    const cx = Math.min(Math.max(px, rad), W - rad);
    const cy = Math.min(Math.max(py, rad), H - rad);
    return (px - cx) ** 2 + (py - cy) ** 2 <= rad * rad;
  };
  const r = rng(W * 31 + H * 17 + mat.length * 7 + shape.length);
  const img = ctx.createImageData(W, H);
  const base = rgb(col.base);
  const light = rgb(col.light);
  const dark = rgb(col.dark);
  const line = rgb(col.line);
  const mark = rgb(col.mark);
  const alpha = Math.round((col.alpha ?? 1) * 255);
  const vertical = H > W * 1.3;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!inside(x, y)) continue;
      let c3 = base;
      // motif du matériau
      if (mat === 'wood') {
        const t = vertical ? x : y;
        const n = vertical ? W : H;
        if (shape === 'circle') {
          const d = Math.hypot(x + 0.5 - W / 2, y + 0.5 - H / 2);
          if (Math.round(d) % 3 === 0) c3 = mark;
        } else if (n > 6 && t % 5 === 2) c3 = mark;
        else if (r() < 0.06) c3 = mark;
      } else if (mat === 'stone') {
        const v = r();
        if (v < 0.12) c3 = mark;
        else if (v < 0.17) c3 = light;
      } else if (mat === 'ice') {
        if ((x + y) % 9 === 0 || (x + y) % 9 === 1) c3 = mark;
      } else if (mat === 'metal') {
        if (y < H * 0.35) c3 = mark;
      }
      // biseau et contour (selon les voisins hors de la forme)
      const up = inside(x, y - 1);
      const left = inside(x - 1, y);
      const down = inside(x, y + 1);
      const right = inside(x + 1, y);
      if (!up || !left || !down || !right) c3 = line;
      else if (!inside(x, y - 2) || !inside(x - 2, y)) c3 = light;
      else if (!inside(x, y + 2) || !inside(x + 2, y)) c3 = dark;
      const o = (y * W + x) * 4;
      img.data[o] = c3[0];
      img.data[o + 1] = c3[1];
      img.data[o + 2] = c3[2];
      img.data[o + 3] = c3 === line ? 255 : alpha;
    }
  ctx.putImageData(img, 0, 0);
  // détails : clous du bois, rivets du métal, reflet de la glace
  const dot = (x: number, y: number, a: string, b: string) => {
    if (!inside(x, y) || !inside(x + 1, y + 1)) return;
    px(ctx, x, y, a);
    px(ctx, x + 1, y + 1, b);
  };
  if (shape === 'box' && (mat === 'wood' || mat === 'metal')) {
    const m = Math.max(2, Math.round(rad * 0.75));
    const [a, b] = mat === 'wood' ? ['#3b3b3b', '#d8d8d8'] : ['#eef3f8', '#3e4650'];
    dot(m, m, b, a);
    dot(W - m - 2, m, b, a);
    dot(m, H - m - 2, b, a);
    dot(W - m - 2, H - m - 2, b, a);
  }
  if (mat === 'ice') {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let k = 0; k < Math.min(W, H) * 0.5; k++) if (inside(3 + k, 2)) ctx.fillRect(3 + k, 2, 1, 1);
  }
  if (frozen) frost(ctx, W, H, r);
  if (stage > 0) cracks(ctx, W, H, stage, r);
  if (frozen || stage > 0) {
    // garde la forme arrondie après les fissures
    ctx.globalCompositeOperation = 'destination-in';
    const mask = document.createElement('canvas');
    mask.width = W;
    mask.height = H;
    const mc = mask.getContext('2d')!;
    const md = mc.createImageData(W, H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) if (inside(x, y)) md.data[(y * W + x) * 4 + 3] = 255;
    mc.putImageData(md, 0, 0);
    ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }
  blockCache.set(key, c);
  return c;
}

function frost(ctx: CanvasRenderingContext2D, W: number, H: number, r: () => number) {
  ctx.fillStyle = 'rgba(150,225,255,0.5)';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < (W * H) / 8; i++)
    px(ctx, Math.floor(r() * W), Math.floor(r() * H), 'rgba(255,255,255,0.85)');
  px(ctx, 0, 0, '#ffffff', W, 1);
}

function cracks(ctx: CanvasRenderingContext2D, W: number, H: number, stage: number, r: () => number) {
  const n = stage === 1 ? 2 : 5;
  for (let k = 0; k < n; k++) {
    let x = Math.floor(r() * W);
    let y = Math.floor(r() * H);
    const len = 4 + Math.floor(r() * (stage * 6));
    for (let i = 0; i < len; i++) {
      px(ctx, x, y, 'rgba(30,18,10,0.85)');
      x += r() < 0.5 ? 1 : -1;
      y += r() < 0.6 ? 1 : 0;
      if (x < 0 || y < 0 || x >= W || y >= H) break;
    }
  }
}

const crackCache = new Map<string, HTMLCanvasElement>();

/** Fissures (et givre) à poser sur l'image d'un objet. */
export function overlay(
  w: number,
  h: number,
  stage: number,
  frozen: boolean,
  seed: number,
): HTMLCanvasElement {
  const key = `${w}|${h}|${stage}|${frozen}|${seed % 7}`;
  const hit = crackCache.get(key);
  if (hit) return hit;
  const W = Math.max(3, Math.round(w * TEX * 1.5));
  const H = Math.max(3, Math.round(h * TEX * 1.5));
  const { c, ctx } = canvas(W, H);
  const r = rng(seed * 977 + W);
  if (frozen) {
    ctx.fillStyle = 'rgba(140,220,255,0.45)';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < (W * H) / 10; i++)
      px(ctx, Math.floor(r() * W), Math.floor(r() * H), 'rgba(255,255,255,0.8)');
  }
  if (stage > 0) cracks(ctx, W, H, stage, r);
  crackCache.set(key, c);
  return c;
}

const groundCache = new Map<string, HTMLCanvasElement>();

/** Motif du sol (tuile de 2 m) : bande du dessus + terre. */
export function groundTile(theme: Theme): HTMLCanvasElement {
  const hit = groundCache.get(theme);
  if (hit) return hit;
  const t = THEMES[theme];
  const S = TEX * 2;
  const { c, ctx } = canvas(S, S);
  const r = rng(theme.length * 99);
  px(ctx, 0, 0, t.dirt, S, S);
  for (let i = 0; i < S * S * 0.12; i++)
    px(ctx, Math.floor(r() * S), Math.floor(r() * S), r() < 0.6 ? t.dirtDark : lighten(t.dirt, 18));
  if (theme === 'ville') {
    for (let x = 0; x < S; x += 8) px(ctx, x, 0, '#2f2f38', 1, S);
    for (let y = 0; y < S; y += 8) px(ctx, 0, y, '#2f2f38', S, 1);
  }
  groundCache.set(theme, c);
  return c;
}

const tntCache = new Map<number, HTMLCanvasElement>();

/** Caisse de TNT : rouge vif, cerclée de noir, bandeau jaune marqué « TNT » (bien visible de loin). */
export function tntTexture(stage: number): HTMLCanvasElement {
  const hit = tntCache.get(stage);
  if (hit) return hit;
  const S = TEX * 2;
  const { c, ctx } = canvas(S, S);
  px(ctx, 0, 0, '#1a1030', S, S);
  px(ctx, 2, 2, '#d8312b', S - 4, S - 4);
  px(ctx, 2, 2, '#ff6a4d', S - 4, 2);
  px(ctx, 2, S - 4, '#8a1712', S - 4, 2);
  for (let y = 6; y < S - 4; y += 6) px(ctx, 2, y, '#b3241f', S - 4, 1);
  // bandeau et lettres
  const by = Math.round(S / 2 - 5);
  px(ctx, 2, by, '#ffd23f', S - 4, 11);
  px(ctx, 2, by, '#fff2a8', S - 4, 1);
  const glyphs: Record<string, string[]> = {
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  };
  let x0 = Math.round(S / 2 - 9);
  for (const ch of 'TNT') {
    glyphs[ch]!.forEach((row, j) =>
      [...row].forEach((b, i) => b === '1' && px(ctx, x0 + i, by + 2 + j, '#1a1030')),
    );
    x0 += 6;
  }
  for (const [x, y] of [
    [4, 4],
    [S - 6, 4],
    [4, S - 6],
    [S - 6, S - 6],
  ])
    px(ctx, x!, y!, '#3b3b3b', 2, 2);
  if (stage > 0) cracks(ctx, S, S, stage + 1, rng(stage * 31));
  tntCache.set(stage, c);
  return c;
}

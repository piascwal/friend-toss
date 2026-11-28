/* Textures dessinées par le jeu : TNT, fissures et givre, sol. (Les modules sont dans blocks.ts.) */
import type { Theme } from '../sim/level';
import { canvas, lighten, px, rng, TEX } from './pixels';
import { THEMES } from './themes';

export function frost(ctx: CanvasRenderingContext2D, W: number, H: number, r: () => number) {
  ctx.fillStyle = 'rgba(150,225,255,0.5)';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < (W * H) / 8; i++)
    px(ctx, Math.floor(r() * W), Math.floor(r() * H), 'rgba(255,255,255,0.85)');
  px(ctx, 0, 0, '#ffffff', W, 1);
}

export function cracks(ctx: CanvasRenderingContext2D, W: number, H: number, stage: number, r: () => number) {
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

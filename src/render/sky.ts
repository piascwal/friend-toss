/* Ciel et lointains de chaque monde, dessinés en pixels un peu gros dans un canevas réduit. */
import type { Theme } from '../sim/level';
import { px, rng } from './pixels';
import { THEMES } from './themes';

/** Le ciel est dessiné à 1/SKY_DIV de la résolution de l'écran, puis agrandi. */
export const SKY_DIV = 2;
/** Taille d'un « pixel de dessin » du ciel, en pixels du canevas réduit (garde les proportions). */
const U = 3 / SKY_DIV;

/**
 * Dessine le fond (ciel, soleil ou lune, collines, nuages) dans un petit canevas de w × h pixels,
 * décalé selon la caméra (`ox` en mètres) pour un léger effet de profondeur.
 */
export function drawSky(
  ctx: CanvasRenderingContext2D,
  theme: Theme,
  w: number,
  h: number,
  ox: number,
  time: number,
  horizon: number,
) {
  const t = THEMES[theme];
  const g = ctx.createLinearGradient(0, 0, 0, horizon);
  g.addColorStop(0, t.sky[0]);
  g.addColorStop(0.6, t.sky[1]);
  g.addColorStop(1, t.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const r = rng(42);
  if (t.night) {
    // peu d'étoiles, discrètes, en haut du ciel : elles ne gênent pas les points de visée
    for (let i = 0; i < 22; i++) {
      const x = Math.floor(r() * w);
      const y = Math.floor(r() * horizon * 0.45);
      px(ctx, x, y, 'rgba(220,215,255,0.35)');
    }
    disc(ctx, w * 0.8, h * 0.16, h * 0.07, '#fff6d8');
    disc(ctx, w * 0.8 + h * 0.03, h * 0.16 - h * 0.02, h * 0.06, t.sky[0]);
  } else if (theme === 'festival') {
    disc(ctx, w * 0.75, horizon * 0.72, h * 0.1, '#ffd27a');
    disc(ctx, w * 0.75, horizon * 0.72, h * 0.08, '#ffe9a8');
  } else {
    disc(ctx, w * 0.82, h * 0.15, h * 0.065, '#fff7c2');
    disc(ctx, w * 0.82, h * 0.15, h * 0.05, '#ffffff');
  }
  // nuages
  if (!t.night) {
    for (let i = 0; i < 6; i++) {
      const cx =
        ((((r() * w * 1.6 + time * (2 + i) - ox * 0.6) % (w * 1.6)) + w * 1.6) % (w * 1.6)) - w * 0.3;
      const cy = 8 * U + r() * horizon * 0.35;
      cloud(
        ctx,
        cx,
        cy,
        (10 + r() * 16) * U,
        theme === 'festival' ? 'rgba(255,200,220,0.8)' : 'rgba(255,255,255,0.92)',
      );
    }
  }
  // collines lointaines
  hills(
    ctx,
    w,
    horizon,
    ox * 0.15,
    t.far,
    0.75,
    11,
    theme === 'montagne' ? 'peaks' : theme === 'ville' ? 'city' : theme === 'plage' ? 'sea' : 'round',
  );
  hills(
    ctx,
    w,
    horizon,
    ox * 0.35,
    t.mid,
    0.45,
    23,
    theme === 'ville' ? 'city2' : theme === 'plage' ? 'dunes' : theme === 'montagne' ? 'peaks2' : 'trees',
  );
  if (theme === 'festival') lights(ctx, w, horizon, time);
  bumps(ctx, w, horizon, ox * 0.6, t.near, theme === 'ville');
}

/** Premier plan : une rangée de rondeurs (buissons, rochers, dunes) ou d'immeubles bas, juste derrière le sol. */
function bumps(
  ctx: CanvasRenderingContext2D,
  w: number,
  horizon: number,
  ox: number,
  col: string,
  city: boolean,
) {
  const step = Math.round(26 * U);
  const shift = Math.floor(ox * 8) % step;
  for (let x = -step - shift; x < w + step; x += step) {
    const k = Math.abs(Math.floor((x + Math.floor(ox * 8)) / step));
    const r = rng(k * 13 + 7);
    const size = (10 + r() * 14) * U;
    if (city) {
      ctx.fillStyle = col;
      ctx.fillRect(x, Math.round(horizon - size * 1.4), step - 3, Math.round(size * 1.4) + 2);
      for (let wy = horizon - size * 1.4 + 3; wy < horizon - 3; wy += 4)
        px(ctx, x + 3 + (k % 3) * 4, Math.round(wy), 'rgba(255,216,107,0.5)');
    } else {
      disc(ctx, x + step / 2, horizon + 2 * U, size, col);
      disc(ctx, x + step / 2 - size * 0.4, horizon - size * 0.35, size * 0.55, col);
    }
  }
}

function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, col: string) {
  ctx.fillStyle = col;
  for (let dy = -r; dy <= r; dy++) {
    const dx = Math.floor(Math.sqrt(r * r - dy * dy));
    ctx.fillRect(Math.round(x - dx), Math.round(y + dy), dx * 2, 1);
  }
}

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, col: string) {
  disc(ctx, x, y, s * 0.5, col);
  disc(ctx, x + s * 0.5, y - s * 0.15, s * 0.6, col);
  disc(ctx, x + s, y, s * 0.45, col);
  ctx.fillStyle = col;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(s), Math.round(s * 0.4));
}

function hills(
  ctx: CanvasRenderingContext2D,
  w: number,
  horizon: number,
  ox: number,
  col: string,
  height: number,
  seed: number,
  kind: string,
) {
  const r = rng(seed);
  const base = horizon;
  const amp = horizon * height;
  ctx.fillStyle = col;
  if (kind === 'sea') {
    ctx.fillRect(0, Math.round(base - amp * 0.35), w, Math.round(amp * 0.35) + 2);
    for (let x = 0; x < w; x += 6)
      px(
        ctx,
        x + (Math.floor(ox * 4) % 6),
        Math.round(base - amp * 0.35 + 3 + (x % 5)),
        'rgba(255,255,255,0.6)',
        3,
        1,
      );
    return;
  }
  if (kind === 'city' || kind === 'city2') {
    const bw = Math.round((kind === 'city' ? 14 : 20) * U);
    for (let x = -bw - (Math.floor(ox * 6) % bw); x < w + bw; x += bw) {
      const k = Math.abs(Math.floor((x + Math.floor(ox * 6)) / bw));
      const hh = amp * (0.35 + rng(k * 31 + seed)() * 0.9);
      ctx.fillStyle = col;
      ctx.fillRect(x, Math.round(base - hh), bw - 2, Math.round(hh) + 1);
      const rr = rng(k * 17 + seed);
      for (let wy = base - hh + 3; wy < base - 3; wy += 4)
        for (let wx = x + 2; wx < x + bw - 4; wx += 3)
          // fenêtres allumées, atténuées : elles ne se confondent pas avec les points de visée
          if (rr() < 0.2)
            px(ctx, wx, Math.round(wy), kind === 'city' ? 'rgba(255,216,107,0.4)' : 'rgba(255,233,160,0.5)');
    }
    return;
  }
  const pts: number[] = [];
  const phase = r() * 10;
  for (let x = 0; x <= w; x++) {
    const X = x / U + ox * 8;
    let y: number;
    if (kind === 'peaks' || kind === 'peaks2') {
      const k = kind === 'peaks' ? 0.045 : 0.07;
      y = Math.abs(((X * k + phase) % 2) - 1);
      y = (1 - y) * 0.85 + Math.sin(X * 0.13) * 0.08;
    } else if (kind === 'trees') {
      y =
        0.45 +
        Math.sin(X * 0.05 + phase) * 0.15 +
        (Math.floor(X / 3) % 3 === 0 ? 0.25 : 0.1) * (Math.sin(X * 0.9) > 0 ? 1 : 0.4);
    } else if (kind === 'dunes') {
      y = 0.25 + Math.sin(X * 0.04 + phase) * 0.12;
    } else y = 0.55 + Math.sin(X * 0.03 + phase) * 0.25 + Math.sin(X * 0.11) * 0.08;
    pts.push(base - y * amp);
  }
  for (let x = 0; x <= w; x++) ctx.fillRect(x, Math.round(pts[x]!), 1, Math.ceil(base - pts[x]!) + 1);
  if (kind === 'peaks') {
    ctx.fillStyle = '#ffffff';
    for (let x = 0; x <= w; x++) {
      const top = pts[x]!;
      if (top < base - amp * 0.62)
        ctx.fillRect(x, Math.round(top), 1, Math.round((base - amp * 0.62 - top) * 0.9) + 1);
    }
  }
}

function lights(ctx: CanvasRenderingContext2D, w: number, horizon: number, time: number) {
  const cols = ['#ff3d7f', '#ffd23f', '#3dd6ff', '#7dff6b', '#c56bff'];
  for (let s = 0; s < 3; s++) {
    const y0 = horizon * (0.2 + s * 0.12);
    // guirlandes atténuées : elles restent derrière le jeu
    ctx.globalAlpha = 0.45;
    for (let x = 0; x < w; x += Math.round(7 * U)) {
      const sag = Math.sin(((x % (60 * U)) / (60 * U)) * Math.PI) * 6 * U;
      const on = Math.sin(time * 3 + x * 0.3 + s) > -0.2;
      px(ctx, x, Math.round(y0 + sag), on ? cols[((x / 7 + s) % cols.length) | 0]! : '#553355', 2, 2);
    }
    ctx.globalAlpha = 1;
  }
}

/* Pixel art dessiné par le jeu : textures des poutres, fissures, sol et ciel de chaque monde.
   Tout est dessiné à basse résolution (TEX pixels par mètre) puis agrandi sans lissage. */
import type { Mat } from '../sim/defs';
import type { Theme } from '../sim/level';

export const TEX = 16;

/** Générateur pseudo-aléatoire reproductible. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return { c, ctx };
}

const px = (ctx: CanvasRenderingContext2D, x: number, y: number, col: string, w = 1, h = 1) => {
  ctx.fillStyle = col;
  ctx.fillRect(x, y, w, h);
};

/* ------------------------------------------------------------ poutres */

const beamCache = new Map<string, HTMLCanvasElement>();

/** Texture d'une poutre (bois, glace, pierre, métal) de w × h mètres, à l'état d'usure `stage` (0 à 2). */
export function beamTexture(
  mat: Mat,
  w: number,
  h: number,
  stage: number,
  frozen: boolean,
): HTMLCanvasElement {
  const key = `${mat}|${w}|${h}|${stage}|${frozen}`;
  const hit = beamCache.get(key);
  if (hit) return hit;
  const W = Math.max(3, Math.round(w * TEX));
  const H = Math.max(3, Math.round(h * TEX));
  const { c, ctx } = canvas(W, H);
  const r = rng(W * 131 + H * 7 + mat.length);
  if (mat === 'wood') {
    px(ctx, 0, 0, '#b9773f', W, H);
    const vertical = H > W;
    // lames
    const n = vertical ? Math.max(1, Math.round(W / 4)) : Math.max(1, Math.round(H / 4));
    for (let i = 1; i < n; i++) {
      if (vertical) px(ctx, Math.round((i * W) / n), 0, '#8a5226', 1, H);
      else px(ctx, 0, Math.round((i * H) / n), '#8a5226', W, 1);
    }
    for (let i = 0; i < (W * H) / 6; i++)
      px(
        ctx,
        Math.floor(r() * W),
        Math.floor(r() * H),
        r() < 0.5 ? '#a4652f' : '#c98a4f',
        vertical ? 1 : 2,
        vertical ? 2 : 1,
      );
    ctx.strokeStyle = '#5a3216';
    px(ctx, 0, 0, '#e0a868', W, 1);
    px(ctx, 0, 0, '#d4975a', 1, H);
    px(ctx, 0, H - 1, '#5a3216', W, 1);
    px(ctx, W - 1, 0, '#5a3216', 1, H);
    // clous
    const nail = (x: number, y: number) => {
      px(ctx, x, y, '#3b3b3b');
      px(ctx, x, y - 1 >= 0 ? y - 1 : y, '#cfcfcf');
    };
    if (vertical) {
      nail(Math.floor(W / 2), 2);
      nail(Math.floor(W / 2), H - 3);
    } else {
      nail(2, Math.floor(H / 2));
      nail(W - 3, Math.floor(H / 2));
    }
  } else if (mat === 'stone') {
    px(ctx, 0, 0, '#9b978f', W, H);
    for (let i = 0; i < (W * H) / 4; i++)
      px(
        ctx,
        Math.floor(r() * W),
        Math.floor(r() * H),
        ['#8a867f', '#aeaaa2', '#7d7973'][Math.floor(r() * 3)]!,
      );
    const brick = 10;
    const rows = Math.max(1, Math.round(H / 6));
    for (let j = 0; j < rows; j++) {
      const y0 = Math.round((j * H) / rows);
      if (j) px(ctx, 0, y0, '#5f5b56', W, 1);
      for (let x = (j % 2) * (brick / 2); x < W; x += brick)
        if (x > 0) px(ctx, Math.round(x), y0, '#5f5b56', 1, Math.round(H / rows));
    }
    px(ctx, 0, 0, '#cbc7bf', W, 1);
    px(ctx, 0, H - 1, '#4c4945', W, 1);
    px(ctx, 0, 0, '#4c4945', 1, H);
    px(ctx, W - 1, 0, '#4c4945', 1, H);
  } else if (mat === 'metal') {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#c3ccd6');
    g.addColorStop(0.5, '#8e99a6');
    g.addColorStop(1, '#6b7581');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < W * H * 0.05; i++) px(ctx, Math.floor(r() * W), Math.floor(r() * H), '#7d8794');
    const step = 8;
    const vertical = H > W;
    for (let t = 3; t < (vertical ? H : W) - 2; t += step) {
      const [x, y] = vertical ? [Math.floor(W / 2), t] : [t, Math.floor(H / 2)];
      px(ctx, x, y, '#4a525d');
      px(ctx, x - 1, y - 1, '#eef3f8');
    }
    px(ctx, 0, 0, '#eef3f8', W, 1);
    px(ctx, 0, H - 1, '#3e4650', W, 1);
    px(ctx, 0, 0, '#3e4650', 1, H);
    px(ctx, W - 1, 0, '#3e4650', 1, H);
  } else {
    // glace
    px(ctx, 0, 0, 'rgba(160,226,248,0.82)', W, H);
    for (let i = 0; i < W + H; i += 7) {
      for (let k = 0; k < 3; k++) px(ctx, i - k * 1, k + 1, 'rgba(255,255,255,0.75)');
    }
    for (let i = 0; i < (W * H) / 10; i++)
      px(ctx, Math.floor(r() * W), Math.floor(r() * H), 'rgba(220,248,255,0.8)');
    px(ctx, 0, 0, '#ffffff', W, 1);
    px(ctx, 0, H - 1, '#4ba3c7', W, 1);
    px(ctx, 0, 0, '#e8fbff', 1, H);
    px(ctx, W - 1, 0, '#4ba3c7', 1, H);
  }
  if (frozen) frost(ctx, W, H, r);
  if (stage > 0) cracks(ctx, W, H, stage, r);
  beamCache.set(key, c);
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

/* ------------------------------------------------------------ mondes */

export interface ThemeArt {
  sky: [string, string, string];
  far: string;
  mid: string;
  near: string;
  top: string;
  topLight: string;
  dirt: string;
  dirtDark: string;
  /** Objets de décor (famille/fichier, hauteur en m). */
  decor: [string, string, number][];
  night?: boolean;
}

export const THEMES: Record<Theme, ThemeArt> = {
  camping: {
    sky: ['#4fa8e8', '#8fd0f4', '#d9f2ff'],
    far: '#9cc9b0',
    mid: '#6fae78',
    near: '#4f8f58',
    top: '#5fb84a',
    topLight: '#8fdc5e',
    dirt: '#8a5a33',
    dirtDark: '#6a4024',
    decor: [
      ['sapin', '1.png', 4.2],
      ['arbre', '1.png', 3.8],
      ['sapin', '2.png', 3.6],
      ['buisson', '1.png', 1.2],
      ['feu', 'image.png', 0.9],
      ['arbre', '2.png', 4],
      ['fougere', 'image.png', 0.8],
      ['souche', 'image.png', 0.7],
      ['sapin', '3.png', 4.4],
      ['buisson', '2.png', 1.3],
    ],
  },
  festival: {
    sky: ['#3b2a78', '#c4589c', '#ffb36b'],
    far: '#5a3a86',
    mid: '#7a4a8c',
    near: '#4a2f63',
    top: '#7aa04a',
    topLight: '#a6cc66',
    dirt: '#6b4a3a',
    dirtDark: '#4f3428',
    decor: [
      ['buvette', 'image.png', 3.2],
      ['torche', '1.png', 2],
      ['food-duke', 'image.png', 3.4],
      ['barriere', 'image.png', 1],
      ['portique-dance', 'image.png', 4.5],
      ['torche', '2.png', 2],
      ['food-glace', 'image.png', 3.4],
      ['toilettes', 'image.png', 2.3],
      ['stand-bmx', 'image.png', 3.6],
      ['table-pique', 'image.png', 1.2],
    ],
  },
  montagne: {
    sky: ['#6fb6ee', '#b5dcf7', '#f2faff'],
    far: '#c9d8ea',
    mid: '#9fb3c8',
    near: '#7d93a8',
    top: '#f4fbff',
    topLight: '#ffffff',
    dirt: '#7b8794',
    dirtDark: '#5b6672',
    decor: [
      ['erable-neige', 'image.png', 4.6],
      ['buisson-neige', 'image.png', 1.1],
      ['sapin', '2.png', 4],
      ['cairn', 'image.png', 1.2],
      ['rocher-neige', '2.png', 1.2],
      ['erable-neige', 'image.png', 3.8],
      ['sapin', '1.png', 3.4],
    ],
  },
  plage: {
    sky: ['#38b4f0', '#8ad8fa', '#e2f8ff'],
    far: '#2a9fd8',
    mid: '#7fd3e8',
    near: '#e8c477',
    top: '#f2d28a',
    topLight: '#fff0b8',
    dirt: '#d9b066',
    dirtDark: '#b88c46',
    decor: [
      ['palmier', '1.png', 4.6],
      ['parasol', '1.png', 2.2],
      ['transat', 'image.png', 1],
      ['palmier', '2.png', 4.2],
      ['parasol', '2.png', 2.2],
      ['plante', '1.png', 0.9],
      ['palmier', '3.png', 4.4],
      ['parasol', '3.png', 2.2],
    ],
  },
  ville: {
    sky: ['#0f0c2e', '#2b1f5c', '#6a3f8f'],
    far: '#241d4a',
    mid: '#2f2660',
    near: '#1a1538',
    top: '#5a5a66',
    topLight: '#8a8a96',
    dirt: '#3a3a44',
    dirtDark: '#2a2a32',
    night: true,
    decor: [
      ['lampadaire', 'image.png', 3.6],
      ['borne', 'image.png', 0.8],
      ['poubelle', '1.png', 1],
      ['lampadaire', 'image.png', 3.6],
      ['voiture', '2.png', 1.6],
      ['plante', '4.png', 1],
    ],
  },
};

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

/** Bande du dessus du sol (herbe, neige, sable, trottoir). */
export function groundTop(theme: Theme): HTMLCanvasElement {
  const key = `top-${theme}`;
  const hit = groundCache.get(key);
  if (hit) return hit;
  const t = THEMES[theme];
  const S = TEX * 2;
  const H = 6;
  const { c, ctx } = canvas(S, H + 3);
  const r = rng(theme.length * 7);
  px(ctx, 0, 0, t.top, S, H);
  px(ctx, 0, 0, t.topLight, S, 1);
  for (let x = 0; x < S; x++) {
    const d = Math.floor(r() * 3);
    px(ctx, x, H, t.top, 1, d);
    if (r() < 0.25) px(ctx, x, 1 + Math.floor(r() * (H - 2)), t.topLight);
  }
  if (theme === 'camping' || theme === 'festival')
    for (let i = 0; i < 6; i++) px(ctx, Math.floor(r() * S), 0, darken(t.top, 25), 1, 2);
  if (theme === 'ville') {
    px(ctx, 0, H - 1, '#3a3a44', S, 1);
    px(ctx, 0, 0, '#b0b0bc', S, 2);
  }
  groundCache.set(key, c);
  return c;
}

export function lighten(hex: string, n: number) {
  return shade(hex, n);
}
export function darken(hex: string, n: number) {
  return shade(hex, -n);
}
function shade(hex: string, n: number) {
  const v = parseInt(hex.slice(1), 16);
  const c = (s: number) => Math.max(0, Math.min(255, ((v >> s) & 255) + n));
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, '0')}`;
}

/* ------------------------------------------------------------ ciel et lointains */

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
    for (let i = 0; i < 90; i++) {
      const x = Math.floor(r() * w);
      const y = Math.floor(r() * horizon * 0.8);
      const tw = Math.sin(time * 2 + i) > 0.6 ? '#ffffff' : '#b9b3e8';
      px(ctx, x, y, tw);
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
      const cy = 8 + r() * horizon * 0.35;
      cloud(
        ctx,
        cx,
        cy,
        10 + r() * 16,
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
    0.55,
    11,
    theme === 'montagne' ? 'peaks' : theme === 'ville' ? 'city' : theme === 'plage' ? 'sea' : 'round',
  );
  hills(
    ctx,
    w,
    horizon,
    ox * 0.35,
    t.mid,
    0.28,
    23,
    theme === 'ville' ? 'city2' : theme === 'plage' ? 'dunes' : theme === 'montagne' ? 'peaks2' : 'trees',
  );
  if (theme === 'festival') lights(ctx, w, horizon, time);
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
    const bw = kind === 'city' ? 14 : 20;
    for (let x = -bw - (Math.floor(ox * 6) % bw); x < w + bw; x += bw) {
      const k = Math.abs(Math.floor((x + Math.floor(ox * 6)) / bw));
      const hh = amp * (0.35 + rng(k * 31 + seed)() * 0.9);
      ctx.fillStyle = col;
      ctx.fillRect(x, Math.round(base - hh), bw - 2, Math.round(hh) + 1);
      const rr = rng(k * 17 + seed);
      for (let wy = base - hh + 3; wy < base - 3; wy += 4)
        for (let wx = x + 2; wx < x + bw - 4; wx += 3)
          if (rr() < 0.3) px(ctx, wx, Math.round(wy), kind === 'city' ? '#ffd86b' : '#ffe9a0');
    }
    return;
  }
  const pts: number[] = [];
  const phase = r() * 10;
  for (let x = 0; x <= w; x++) {
    const X = x + ox * 8;
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
    for (let x = 0; x < w; x += 7) {
      const sag = Math.sin(((x % 60) / 60) * Math.PI) * 6;
      const on = Math.sin(time * 3 + x * 0.3 + s) > -0.2;
      px(ctx, x, Math.round(y0 + sag), on ? cols[((x / 7 + s) % cols.length) | 0]! : '#553355', 2, 2);
    }
  }
}

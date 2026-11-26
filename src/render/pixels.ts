/* Petits outils de pixel art : hasard reproductible, canevas, pixel, couleurs. */

/** Pixels de texture par mètre : tout est dessiné à cette résolution puis agrandi sans lissage. */
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

export function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return { c, ctx };
}

export const px = (ctx: CanvasRenderingContext2D, x: number, y: number, col: string, w = 1, h = 1) => {
  ctx.fillStyle = col;
  ctx.fillRect(x, y, w, h);
};

/* ------------------------------------------------------------ poutres */

export function rgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
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

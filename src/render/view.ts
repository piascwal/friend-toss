/* La vue : le canevas, la caméra courante (x, y du coin bas gauche en m, échelle en px/m)
   et les conversions monde ↔ écran. Tous les dessins passent par elle. */

export interface Cam {
  x: number;
  y: number;
  s: number;
}

export class View {
  readonly ctx: CanvasRenderingContext2D;
  W = 0;
  H = 0;
  dpr = 1;
  cam: Cam = { x: -5, y: -2, s: 30 };

  constructor(readonly canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.resize();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = this.canvas.clientWidth;
    this.H = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
  }

  sx(x: number) {
    return (x - this.cam.x) * this.cam.s;
  }

  sy(y: number) {
    return this.H - (y - this.cam.y) * this.cam.s;
  }

  /** Point de l'écran (px CSS) vers le monde (m). */
  toWorld(px: number, py: number) {
    return { x: px / this.cam.s + this.cam.x, y: (this.H - py) / this.cam.s + this.cam.y };
  }

  toScreen(x: number, y: number) {
    return { x: this.sx(x), y: this.sy(y) };
  }

  /** Image lissée (sprites de la banque), centrée en (x, y), de w × h mètres, tournée de `angle`. */
  pic(
    img: CanvasImageSource,
    x: number,
    y: number,
    w: number,
    h: number,
    angle = 0,
    flip = false,
    src?: [number, number, number, number],
  ) {
    this.draw(img, x, y, w, h, angle, flip, true, src);
  }

  /** Image en gros pixels (textures dessinées par le jeu). */
  pixel(img: CanvasImageSource, x: number, y: number, w: number, h: number, angle = 0) {
    this.draw(img, x, y, w, h, angle, false, false);
  }

  private draw(
    img: CanvasImageSource,
    x: number,
    y: number,
    w: number,
    h: number,
    angle: number,
    flip: boolean,
    smooth: boolean,
    src?: [number, number, number, number],
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.sx(x), this.sy(y));
    if (angle) ctx.rotate(-angle);
    if (flip) ctx.scale(-1, 1);
    const W = w * this.cam.s;
    const H = h * this.cam.s;
    ctx.imageSmoothingEnabled = smooth;
    if (smooth) ctx.imageSmoothingQuality = 'high';
    if (src) ctx.drawImage(img, src[0], src[1], src[2], src[3], -W / 2, -H / 2, W, H);
    else ctx.drawImage(img, -W / 2, -H / 2, W, H);
    ctx.restore();
  }
}

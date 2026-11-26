/* Le décor : ciel et lointains (petit canevas en gros pixels), sol en relief arrondi, plateformes. */
import { terrainSurface, type LevelDef, type Theme } from '../sim/level';
import { TEX } from './pixels';
import { drawSky } from './sky';
import { groundTile } from './textures';
import { THEMES } from './themes';
import type { View } from './view';

export class Scenery {
  private sky = document.createElement('canvas');
  private skyCtx = this.sky.getContext('2d')!;
  private surface: [number, number][] = [];

  constructor(
    private view: View,
    private level: LevelDef,
    private theme: Theme,
  ) {
    this.surface = terrainSurface(level);
  }

  /** Ciel et collines : dessinés au tiers de la résolution, puis agrandis (gros pixels). */
  drawBackground(time: number) {
    const v = this.view;
    const w = Math.ceil(v.W / 3);
    const h = Math.ceil(v.H / 3);
    if (this.sky.width !== w || this.sky.height !== h) {
      this.sky.width = w;
      this.sky.height = h;
    }
    drawSky(this.skyCtx, this.theme, w, h, v.cam.x, time, v.sy(0) / 3);
    v.ctx.imageSmoothingEnabled = false;
    v.ctx.drawImage(this.sky, -8, -8, v.W + 16, v.H + 16);
  }

  /** Sol : le relief rempli de terre, bordé d'une épaisse bande arrondie (herbe, neige, sable…). */
  drawGround() {
    const v = this.view;
    const ctx = v.ctx;
    const art = THEMES[this.theme];
    const pts = this.surface;
    ctx.beginPath();
    ctx.moveTo(v.sx(pts[0]![0]), v.sy(pts[0]![1]));
    for (const [x, y] of pts) ctx.lineTo(v.sx(x), v.sy(y));
    ctx.lineTo(v.sx(pts.at(-1)![0]), v.H + 50);
    ctx.lineTo(v.sx(pts[0]![0]), v.H + 50);
    ctx.closePath();
    ctx.fillStyle = this.pattern();
    ctx.fill();
    this.edge(
      () => {
        ctx.moveTo(v.sx(pts[0]![0]), v.sy(pts[0]![1]));
        for (const [x, y] of pts) ctx.lineTo(v.sx(x), v.sy(y));
      },
      art.top,
      art.topLight,
    );
    for (const g of this.level.ground ?? []) this.drawPlatform(g.x0, g.x1, g.top, g.bottom ?? -1);
  }

  /** Plateforme (estrade, falaise, îlot, plafond de roche) : bloc de terre aux coins arrondis. */
  private drawPlatform(x0: number, x1: number, top: number, bottom: number) {
    const v = this.view;
    const ctx = v.ctx;
    const art = THEMES[this.theme];
    const r = Math.min(0.7, (top - bottom) / 2, (x1 - x0) / 2) * v.cam.s;
    const X0 = v.sx(x0);
    const X1 = v.sx(x1);
    const Y0 = v.sy(top);
    const Y1 = v.sy(bottom);
    ctx.beginPath();
    ctx.roundRect(X0, Y0, X1 - X0, Y1 - Y0, r);
    ctx.fillStyle = this.pattern();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = Math.max(2, v.cam.s * 0.08);
    ctx.stroke();
    this.edge(
      () => {
        ctx.moveTo(X0 + r * 0.6, Y0);
        ctx.lineTo(X1 - r * 0.6, Y0);
      },
      art.top,
      art.topLight,
    );
  }

  /** Bande du dessus : épaisse, arrondie, avec un liseré clair. */
  private edge(path: () => void, color: string, light: string) {
    const v = this.view;
    const ctx = v.ctx;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    path();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = v.cam.s * 0.62;
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = v.cam.s * 0.5;
    ctx.stroke();
    ctx.translate(0, -v.cam.s * 0.14);
    ctx.beginPath();
    path();
    ctx.strokeStyle = light;
    ctx.lineWidth = v.cam.s * 0.1;
    ctx.stroke();
    ctx.restore();
  }

  /** Motif de terre, aligné sur le monde. */
  private pattern() {
    const v = this.view;
    const pat = v.ctx.createPattern(groundTile(this.theme), 'repeat')!;
    const s = v.cam.s / TEX;
    pat.setTransform(new DOMMatrix([s, 0, 0, s, v.sx(0), v.sy(0)]));
    return pat;
  }
}

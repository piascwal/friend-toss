/* Affichage d'un niveau : caméra, ciel, décor, sol, objets, relous, amis, effets et visée. */
import { enemyFrame, pic, pose, propPic, spritePath } from '../assets';
import { MATS, type Mat } from '../sim/defs';
import type { LevelDef, Theme } from '../sim/level';
import { BARREL, CANNON, GRAVITY, muzzle, type Ent, type Sim } from '../sim/sim';
import { blockTexture, cannonArt, drawSky, groundTile, groundTop, overlay, rng, TEX, THEMES } from './art';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  kind: 'sq' | 'smoke' | 'ring' | 'flash' | 'pic' | 'star' | 'beam';
  g: number;
  rot?: number;
  vr?: number;
  img?: CanvasImageSource | null;
  x2?: number;
  y2?: number;
}

interface FloatText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  max: number;
  size: number;
  bubble?: boolean;
}

/** Ce que le jeu demande d'afficher en plus de la simulation. */
export interface Scene {
  /** Canon : angle du fût (radians) et recul après le tir (0 à 1). */
  cannon: { angle: number; recoil: number };
  /** Ami qui saute dans le canon (`hop` de 0 à 1), puis attend dedans. */
  loaded?: { id: string; hop: number };
  /** Visée en cours : vitesse de lancer. */
  aim?: { vx: number; vy: number; power: number };
  /** Amis qui attendent leur tour (après celui chargé). */
  waiting: string[];
  /** Amis qui fêtent la victoire. */
  celebrate?: boolean;
}

interface Decor {
  pic: [string, string];
  x: number;
  h: number;
  dark: number;
}

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  private sky = document.createElement('canvas');
  private skyCtx = this.sky.getContext('2d')!;
  private W = 0;
  private H = 0;
  private dpr = 1;
  /** Caméra : x, y du coin bas gauche (m) et échelle (px/m). */
  cam = { x: -6, y: -2, s: 30 };
  private target = { x: -6, y: -2, s: 30 };
  private bounds = { x0: -5, x1: 40, y1: 12 };
  /**
   * Caméra façon jeu de lancer : travelling d'ouverture (de la structure vers le canon), visée près du
   * canon avec un relou visible au bord, suivi de l'ami en vol, pause sur l'impact, puis retour au canon.
   * Le joueur peut aussi faire glisser la vue et zoomer.
   */
  private mode: 'intro' | 'aim' | 'follow' | 'watch' | 'free' = 'aim';
  private modeT = 0;
  private introFrom = { x: 0, s: 30 };
  private free = { x: 0, s: 30 };
  private shake = 0;
  private particles: Particle[] = [];
  private texts: FloatText[] = [];
  private decor: Decor[] = [];
  private theme: Theme = 'camping';
  private tinted = new Map<HTMLCanvasElement, HTMLCanvasElement>();
  private time = 0;
  /** Marges de l'interface (px CSS) : la caméra n'y place rien d'important. */
  margins = { top: 64, bottom: 64 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = this.canvas.clientWidth;
    this.H = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    this.sky.width = Math.ceil(this.W / 3);
    this.sky.height = Math.ceil(this.H / 3);
    this.fitNow();
  }

  /** Prépare le décor d'un niveau. */
  setLevel(level: LevelDef, theme: Theme, sim: Sim) {
    this.theme = theme;
    this.particles = [];
    this.texts = [];
    let x1 = 20;
    let y1 = 9;
    for (const e of sim.ents) {
      const p = e.body.getPosition();
      x1 = Math.max(x1, p.x + Math.max(e.w, e.h) / 2);
      y1 = Math.max(y1, p.y + e.h / 2);
    }
    this.bounds = { x0: -5, x1: x1 + 2.5, y1: y1 + 2 };
    this.level = sim;
    // décor : quelques objets de la banque, derrière les structures
    const art = THEMES[theme];
    const r = rng(level.id.charCodeAt(0) * 97 + level.id.charCodeAt(2) * 13);
    this.decor = [];
    let x = -16;
    let i = Math.floor(r() * art.decor.length);
    while (x < this.bounds.x1 + 30) {
      const [id, file, h] = art.decor[i % art.decor.length]!;
      const busy = x > 9 && x < x1 && h > 2.5;
      // la zone du canon reste dégagée (seuls de petits décors y poussent)
      const nearThrower = x > -8 && x < (h > 1.6 ? 9 : 3);
      if (!nearThrower && (!busy || r() < 0.35))
        this.decor.push({ pic: [id, file], x, h: h * (0.85 + r() * 0.3), dark: busy ? 0.55 : 0.8 });
      x += 3 + r() * 5;
      i += 1 + Math.floor(r() * 2);
    }
    this.fitNow();
  }

  private level: Sim | null = null;

  private fitNow() {
    const t = this.level ? this.aimView(this.level) : { x: -5, s: 30 };
    this.cam = { x: t.x, y: this.groundY(t.s), s: t.s };
    this.target = { ...this.cam };
  }

  private groundY(s: number) {
    return -(this.margins.bottom + 8) / s;
  }

  private availH() {
    return this.H - this.margins.top - this.margins.bottom - 8;
  }

  /** Vue de visée : le canon à gauche, et au moins le premier relou visible à droite. */
  private aimView(sim: Sim) {
    let ex = this.bounds.x1;
    for (const e of sim.ents)
      if (e.kind === 'enemy' && !e.dead) ex = Math.min(ex, e.body.getPosition().x + e.w / 2);
    const need = Math.min(Math.max(ex + 1.5 - this.bounds.x0, 14), 30);
    const s = Math.max(this.W / need, this.fitAll());
    return { x: this.bounds.x0, s };
  }

  /** Échelle qui montre tout le niveau (zoom arrière maximal). */
  private fitAll() {
    const b = this.bounds;
    return Math.max(6, Math.min(this.W / (b.x1 + 2 - b.x0), this.availH() / b.y1));
  }

  /** Vue de la structure : son bord droit, assez haut pour tout voir. */
  private structureView(s0: number) {
    const s = Math.max(this.fitAll(), Math.min(s0, this.availH() / this.bounds.y1));
    return { x: Math.max(this.bounds.x0, this.bounds.x1 + 1 - this.W / s), s };
  }

  /** Ouverture du niveau : on part de la structure et on glisse jusqu'au canon. */
  startIntro(sim: Sim) {
    const a = this.aimView(sim);
    const from = this.structureView(a.s);
    this.introFrom = from;
    this.cam = { x: from.x, y: this.groundY(from.s), s: from.s };
    this.mode = 'intro';
    this.modeT = 0;
  }

  get introRunning() {
    return this.mode === 'intro';
  }

  skipIntro() {
    if (this.mode === 'intro') this.mode = 'aim';
  }

  /** Le joueur fait glisser la vue (px CSS). */
  panBy(dx: number) {
    if (this.mode !== 'free') this.free = { x: this.target.x, s: this.target.s };
    this.mode = 'free';
    this.free.x -= dx / this.free.s;
    this.clampFree();
  }

  /** Le joueur zoome autour d'un point de l'écran. */
  zoomAt(factor: number, px: number) {
    if (this.mode !== 'free') this.free = { x: this.target.x, s: this.target.s };
    this.mode = 'free';
    const wx = px / this.free.s + this.free.x;
    const max = this.level ? this.aimView(this.level).s * 1.6 : 80;
    this.free.s = Math.min(max, Math.max(this.fitAll(), this.free.s * factor));
    this.free.x = wx - px / this.free.s;
    this.clampFree();
  }

  private clampFree() {
    const viewW = this.W / this.free.s;
    this.free.x = Math.min(
      Math.max(this.free.x, this.bounds.x0 - 2),
      Math.max(this.bounds.x0, this.bounds.x1 + 3 - viewW),
    );
  }

  /** Un ami vient de partir : la caméra le suit. */
  launched() {
    this.mode = 'follow';
    this.modeT = 0;
  }

  /** Retour au canon (pour viser). */
  backToCannon() {
    this.mode = 'aim';
  }

  private updateCamera(sim: Sim, dt: number) {
    this.modeT += dt;
    const aim = this.aimView(sim);
    let lead: { x: number; y: number } | undefined;
    for (const e of sim.flying) {
      const p = e.body.getPosition();
      if (!lead || p.x > lead.x) lead = { x: p.x, y: p.y };
    }
    if (this.mode === 'intro') {
      // pause sur la structure, puis glissement jusqu'au canon
      const hold = 1.1;
      const dur = 2.2;
      const k = Math.min(1, Math.max(0, (this.modeT - hold) / dur));
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      const s = this.introFrom.s + (aim.s - this.introFrom.s) * e;
      const x = this.introFrom.x + (aim.x - this.introFrom.x) * e;
      this.cam = { x, y: this.groundY(s), s };
      this.target = { ...this.cam };
      if (k >= 1) this.mode = 'aim';
      return;
    }
    if (this.mode === 'follow' && !lead) {
      this.mode = 'watch';
      this.modeT = 0;
    }
    if (this.mode === 'watch' && sim.phase === 'aim' && this.modeT > 1.6) this.mode = 'aim';
    if (lead && this.mode !== 'free') this.mode = 'follow';
    let x = this.target.x;
    let s = this.target.s;
    if (this.mode === 'aim') ({ x, s } = aim);
    else if (this.mode === 'free') ({ x, s } = this.free);
    else if (this.mode === 'follow' && lead) {
      s = Math.max(this.fitAll(), Math.min(aim.s, this.availH() / (lead.y + 2.5)));
      const viewW = this.W / s;
      x = Math.min(
        Math.max(lead.x - viewW * 0.38, this.bounds.x0),
        Math.max(this.bounds.x0, this.bounds.x1 + 3 - viewW),
      );
    } else if (this.mode === 'watch' && (sim.phase === 'won' || sim.phase === 'lost'))
      ({ x, s } = this.structureView(aim.s));
    this.target = { x, y: this.groundY(s), s };
    const k = Math.min(1, dt * (this.mode === 'follow' ? 4 : this.mode === 'free' ? 12 : 2.4));
    this.cam.x += (this.target.x - this.cam.x) * k;
    this.cam.s += (this.target.s - this.cam.s) * k;
    this.cam.y = this.groundY(this.cam.s);
  }

  /* ------------------------------------------------------------ effets */

  burst(x: number, y: number, colors: string[], n: number, speed: number, size = 0.18) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.3 + Math.random());
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v + speed * 0.4,
        life: 0.6 + Math.random() * 0.7,
        max: 1.3,
        size: size * (0.5 + Math.random()),
        color: colors[i % colors.length]!,
        kind: 'sq',
        g: -14,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 12,
      });
    }
  }

  smoke(x: number, y: number, n: number, size = 0.6, color = 'rgba(240,240,240,0.9)') {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      this.particles.push({
        x: x + Math.cos(a) * 0.3,
        y: y + Math.sin(a) * 0.3,
        vx: Math.cos(a) * 1.5,
        vy: Math.sin(a) * 1.5 + 0.8,
        life: 0.5 + Math.random() * 0.5,
        max: 1,
        size: size * (0.6 + Math.random() * 0.6),
        color,
        kind: 'smoke',
        g: 0,
      });
    }
  }

  ring(x: number, y: number, r: number, color: string, life = 0.4) {
    this.particles.push({ x, y, vx: 0, vy: 0, life, max: life, size: r, color, kind: 'ring', g: 0 });
  }

  flash(x: number, y: number, r: number, color = '#fff6c0') {
    this.particles.push({ x, y, vx: 0, vy: 0, life: 0.22, max: 0.22, size: r, color, kind: 'flash', g: 0 });
  }

  sprite(
    img: CanvasImageSource | null,
    x: number,
    y: number,
    vx: number,
    vy: number,
    size: number,
    life: number,
    vr = 0,
  ) {
    if (!img) return;
    this.particles.push({
      x,
      y,
      vx,
      vy,
      life,
      max: life,
      size,
      color: '',
      kind: 'pic',
      g: 0,
      img,
      rot: 0,
      vr,
    });
  }

  beam(x0: number, y0: number, x1: number, y1: number) {
    this.particles.push({
      x: x0,
      y: y0,
      x2: x1,
      y2: y1,
      vx: 0,
      vy: 0,
      life: 0.5,
      max: 0.5,
      size: 0.9,
      color: '#7fe9ff',
      kind: 'beam',
      g: 0,
    });
  }

  stars(x: number, y: number, n: number, color = '#ffd23f') {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * 4,
        vy: Math.sin(a) * 4 + 3,
        life: 0.9,
        max: 0.9,
        size: 0.3,
        color,
        kind: 'star',
        g: -8,
      });
    }
  }

  text(x: number, y: number, text: string, color = '#fff', size = 18, life = 1.1, bubble = false) {
    this.texts.push({ x, y, text, color, life, max: life, size, bubble });
  }

  addShake(n: number) {
    this.shake = Math.min(1.2, this.shake + n);
  }

  /** Effets propres aux matériaux qui cassent. */
  breakFx(x: number, y: number, w: number, h: number, mat: Mat) {
    const d = MATS[mat].debris;
    const n = Math.min(26, Math.round(8 + w * h * 6));
    this.burst(x, y, d, n, 5, mat === 'ice' ? 0.14 : 0.2);
    if (mat !== 'ice') this.smoke(x, y, 3, 0.5, 'rgba(210,200,190,0.7)');
  }

  /* ------------------------------------------------------------ dessin */

  private sx(x: number) {
    return (x - this.cam.x) * this.cam.s;
  }
  private sy(y: number) {
    return this.H - (y - this.cam.y) * this.cam.s;
  }
  /** Point de l'écran (px CSS) vers le monde (m). */
  toWorld(px: number, py: number) {
    return { x: px / this.cam.s + this.cam.x, y: (this.H - py) / this.cam.s + this.cam.y };
  }
  toScreen(x: number, y: number) {
    return { x: this.sx(x), y: this.sy(y) };
  }

  draw(sim: Sim, scene: Scene, dt: number) {
    this.time += dt;
    this.updateCamera(sim, dt);

    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    if (this.shake > 0) {
      const m = this.shake * 10;
      ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
      this.shake = Math.max(0, this.shake - dt * 2.5);
    }
    // ciel (petit canevas agrandi : gros pixels)
    const horizon = this.sy(0) / 3;
    drawSky(this.skyCtx, this.theme, this.sky.width, this.sky.height, this.cam.x, this.time, horizon);
    ctx.drawImage(this.sky, -8, -8, this.W + 16, this.H + 16);

    this.drawDecor();
    this.drawGround(sim.level);
    this.drawTrail(sim.lastTrail, 'rgba(255,255,255,0.35)');
    this.drawTrail(sim.trail, 'rgba(255,255,255,0.75)');
    for (const e of sim.ents) if (!e.dead && e.kind === 'block' && e.objDef?.fixed) this.drawBlock(e);
    for (const e of sim.ents) if (!e.dead && e.kind === 'block' && !e.objDef?.fixed) this.drawBlock(e);
    for (const e of sim.ents) if (!e.dead && e.kind === 'enemy') this.drawEnemy(e, sim);
    this.drawCannon(scene);
    for (const e of sim.ents)
      if (!e.dead && e.kind !== 'block' && e.kind !== 'enemy') this.drawProjectile(e, sim);
    this.updateParticles(dt);
    this.drawParticles();
    if (scene.aim) this.drawAim(scene.aim);
    this.drawTexts(dt);
  }

  private tint(p: HTMLCanvasElement, dark: number): HTMLCanvasElement {
    let t = this.tinted.get(p);
    if (!t) {
      t = document.createElement('canvas');
      // le décor est réduit (gros pixels) et assombri : il reste au second plan
      const scale = Math.min(1, 96 / p.height);
      t.width = Math.max(1, Math.round(p.width * scale));
      t.height = Math.max(1, Math.round(p.height * scale));
      const c = t.getContext('2d')!;
      c.imageSmoothingQuality = 'high';
      c.drawImage(p, 0, 0, t.width, t.height);
      c.globalCompositeOperation = 'source-atop';
      c.fillStyle = THEMES[this.theme].night
        ? `rgba(20,10,60,${1 - dark + 0.15})`
        : `rgba(40,60,90,${1 - dark})`;
      c.fillRect(0, 0, t.width, t.height);
      this.tinted.set(p, t);
    }
    return t;
  }

  private drawDecor() {
    const ctx = this.ctx;
    for (const d of this.decor) {
      const p = propPic(d.pic[0], d.pic[1]);
      if (!p) continue;
      const t = this.tint(p, d.dark);
      const h = d.h * this.cam.s;
      const w = (h * p.width) / p.height;
      ctx.drawImage(
        t,
        Math.round(this.sx(d.x) - w / 2),
        Math.round(this.sy(0) - h + 2),
        Math.round(w),
        Math.round(h),
      );
      if (d.pic[0] === 'lampadaire' && THEMES[this.theme].night) {
        const g = ctx.createRadialGradient(
          this.sx(d.x),
          this.sy(d.h * 0.92),
          0,
          this.sx(d.x),
          this.sy(d.h * 0.92),
          h * 0.6,
        );
        g.addColorStop(0, 'rgba(255,220,120,0.35)');
        g.addColorStop(1, 'rgba(255,220,120,0)');
        ctx.fillStyle = g;
        ctx.fillRect(this.sx(d.x) - h, this.sy(d.h * 0.92) - h, h * 2, h * 2);
      }
    }
  }

  private pattern(tile: HTMLCanvasElement) {
    const pat = this.ctx.createPattern(tile, 'repeat')!;
    const s = this.cam.s / TEX;
    pat.setTransform(new DOMMatrix([s, 0, 0, s, this.sx(0), this.sy(0)]));
    return pat;
  }

  private drawGround(level: LevelDef) {
    const ctx = this.ctx;
    const rects = [
      { x0: -60, x1: 400, top: 0, bottom: -30 },
      ...(level.ground ?? []).map((g) => ({ ...g, bottom: g.bottom ?? -1 })),
    ];
    const body = this.pattern(groundTile(this.theme));
    const top = groundTop(this.theme);
    for (const g of rects) {
      const x0 = this.sx(g.x0);
      const x1 = this.sx(g.x1);
      const y0 = this.sy(g.top);
      const y1 = Math.min(this.H + 20, this.sy(g.bottom));
      ctx.fillStyle = body;
      ctx.fillRect(Math.round(x0), Math.round(y0), Math.round(x1 - x0), Math.round(y1 - y0));
      // bande du dessus
      const th = (top.height / TEX) * this.cam.s;
      const tw = (top.width / TEX) * this.cam.s;
      for (let x = x0; x < x1; x += tw) {
        const w = Math.min(tw, x1 - x);
        ctx.drawImage(
          top,
          0,
          0,
          (w / tw) * top.width,
          top.height,
          Math.round(x),
          Math.round(y0),
          Math.ceil(w),
          Math.round(th),
        );
      }
      if (g.top > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(Math.round(x1 - 3), Math.round(y0), 3, Math.round(y1 - y0));
      }
    }
  }

  private drawTrail(trail: { x: number; y: number }[], color: string) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    for (let i = 0; i < trail.length; i += 4) {
      const p = trail[i]!;
      const r = i % 8 === 0 ? 3 : 2;
      ctx.fillRect(Math.round(this.sx(p.x) - r / 2), Math.round(this.sy(p.y) - r / 2), r, r);
    }
  }

  /** Dessine une image centrée en (x, y), de w × h mètres, tournée de `angle`. */
  private drawPic(
    img: CanvasImageSource,
    x: number,
    y: number,
    w: number,
    h: number,
    angle = 0,
    flip = false,
    src?: [number, number, number, number],
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.sx(x), this.sy(y));
    if (angle) ctx.rotate(-angle);
    if (flip) ctx.scale(-1, 1);
    const W = w * this.cam.s;
    const H = h * this.cam.s;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (src) ctx.drawImage(img, src[0], src[1], src[2], src[3], -W / 2, -H / 2, W, H);
    else ctx.drawImage(img, -W / 2, -H / 2, W, H);
    ctx.restore();
  }

  private drawPixel(img: CanvasImageSource, x: number, y: number, w: number, h: number, angle: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.sx(x), this.sy(y));
    if (angle) ctx.rotate(-angle);
    ctx.imageSmoothingEnabled = false;
    const W = w * this.cam.s;
    const H = h * this.cam.s;
    ctx.drawImage(img, -W / 2, -H / 2, W, H);
    ctx.restore();
  }

  private stage(e: Ent) {
    const r = e.hp / e.maxHp;
    return e.maxHp > 1e8 ? 0 : r < 0.35 ? 2 : r < 0.7 ? 1 : 0;
  }

  private drawBlock(e: Ent) {
    const p = e.body.getPosition();
    const a = e.body.getAngle();
    const def = e.objDef!;
    if (def.special?.type === 'cage' && e.caged) {
      // l'ami enfermé, derrière les barreaux
      const img = pose(e.caged, 'idle');
      if (img) {
        const h = e.h * 0.85;
        this.drawPic(img, p.x, p.y - e.h * 0.05, (h * img.width) / img.height, h, a);
      }
    }
    if (def.special?.type === 'rocket' && e.fuse !== undefined) {
      const up = e.body.getWorldVector({ x: 0, y: 1 });
      for (let i = 0; i < 2; i++)
        this.particles.push({
          x: p.x - up.x * e.h * 0.55,
          y: p.y - up.y * e.h * 0.55,
          vx: -up.x * 8 + (Math.random() - 0.5) * 2,
          vy: -up.y * 8 + (Math.random() - 0.5) * 2,
          life: 0.3,
          max: 0.3,
          size: 0.35,
          color: Math.random() < 0.5 ? '#ffd23f' : '#ff6a1a',
          kind: 'sq',
          g: 0,
        });
    }
    if (def.sprite) {
      const img = pic(spritePath(def.sprite));
      if (img) {
        const pad = def.special?.type === 'portal' ? 1 : 1.04;
        if (def.special?.type === 'portal') {
          const glow = 0.5 + Math.sin(this.time * 6) * 0.2;
          this.ctx.globalAlpha = 1;
          this.drawPic(img, p.x, p.y, e.w * pad, e.h * pad, a);
          this.ctx.fillStyle = `rgba(120,240,255,${glow * 0.35})`;
          const r = e.h * 0.32 * this.cam.s;
          this.ctx.beginPath();
          this.ctx.ellipse(this.sx(p.x), this.sy(p.y), r * 1.1, r, 0, 0, Math.PI * 2);
          this.ctx.fill();
        } else this.drawPic(img, p.x, p.y, e.w * pad, e.h * pad, a);
      }
      const st = this.stage(e);
      if (st || e.frozen) this.drawPixel(overlay(e.w, e.h, st, !!e.frozen, e.id), p.x, p.y, e.w, e.h, a);
      if (def.special?.type === 'gold' && Math.random() < 0.04)
        this.stars(p.x + (Math.random() - 0.5) * e.w, p.y + e.h * 0.4, 1, '#fff2a8');
    } else {
      this.drawPixel(
        blockTexture(def.mat, e.w, e.h, def.shape, this.stage(e), !!e.frozen),
        p.x,
        p.y,
        e.w,
        e.h,
        a,
      );
    }
  }

  private drawEnemy(e: Ent, sim: Sim) {
    const p = e.body.getPosition();
    const a = e.body.getAngle();
    const def = e.enemyDef!;
    const f = enemyFrame(e.enemy!, e.variant, this.time + e.id * 0.37, e.hurt > 0);
    if (!f) return;
    const sheet = def.anim === 'sheet';
    const h = e.h * (def.drawScale ?? 1) * (sheet ? 1.12 : 1.04);
    let w = (h * f.sw) / f.sh;
    if (!sheet) w = Math.min(w, e.w * 1.6);
    const ctx = this.ctx;
    // rebond au repos (images fixes), tremblement quand touché
    const bob = def.anim === 'sheet' ? 0 : Math.abs(Math.sin(this.time * 3 + e.id)) * 0.05;
    const jit = e.hurt > 0 ? (Math.random() - 0.5) * 0.08 : 0;
    // ombre
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    const shadowY = this.sy(p.y - e.h / 2);
    ctx.fillRect(
      Math.round(this.sx(p.x) - (e.w * this.cam.s) / 2),
      Math.round(shadowY - 2),
      Math.round(e.w * this.cam.s),
      3,
    );
    const cy = p.y + (h - e.h) / 2 - (sheet ? e.h * 0.02 : 0) + bob;
    this.drawPic(f.img, p.x + jit, cy, w, h, a, false, [f.sx, f.sy, f.sw, f.sh]);
    if (e.frozen) this.drawPixel(overlay(e.w, e.h, 0, true, e.id), p.x, p.y, e.w * 1.1, e.h * 1.05, a);
    // barre de vie (relous abîmés, boss toujours)
    if (e.hp < e.maxHp || def.boss) {
      const W = Math.max(18, e.w * this.cam.s);
      const x = this.sx(p.x) - W / 2;
      const y = this.sy(p.y + e.h / 2 + 0.25) - 4;
      ctx.fillStyle = '#1a1020';
      ctx.fillRect(Math.round(x - 1), Math.round(y - 1), Math.round(W + 2), 5);
      const r = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = r > 0.5 ? '#7dff6b' : r > 0.25 ? '#ffd23f' : '#ff4d4d';
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(W * r), 3);
    }
    void sim;
  }

  private drawCannon(scene: Scene) {
    const ctx = this.ctx;
    // les amis qui attendent, en file derrière le canon
    scene.waiting.forEach((id, i) => {
      const img = pose(id, scene.celebrate ? 'win' : 'idle');
      if (!img) return;
      const h = 1.5;
      const w = (h * img.width) / img.height;
      const hop = scene.celebrate ? Math.abs(Math.sin(this.time * 6 + i)) * 0.4 : 0;
      this.drawPic(img, -2.4 - i * 1.1, h / 2 + hop, w, h);
    });
    const art = cannonArt();
    const a = scene.cannon.angle;
    const dir = { x: Math.cos(a), y: Math.sin(a) };
    const back = scene.cannon.recoil * 0.45;
    // roue arrière, affût, fût, roue avant
    this.drawPixel(art.wheel, CANNON.x - 0.55, 0.5, 1, 1, -this.time * 0);
    this.drawPixel(art.carriage, CANNON.x - 0.1, 0.72, 1.7, 0.75, 0);
    const len = 2.3;
    const axis = 0.7 - back;
    // l'ami chargé : sa tête dépasse de la bouche du canon
    const L = scene.loaded;
    const mouth = { x: CANNON.x + dir.x * (BARREL - back), y: CANNON.y + dir.y * (BARREL - back) };
    if (L && L.hop >= 1) {
      const face = pose(L.id, 'portrait');
      if (face) {
        const r = 0.36;
        const cx = mouth.x + dir.x * 0.05;
        const cy = mouth.y + dir.y * 0.05 + 0.12;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.sx(cx), this.sy(cy), r * this.cam.s, 0, Math.PI * 2);
        ctx.clip();
        this.drawPic(face, cx, cy, r * 2.1, r * 2.1);
        ctx.restore();
      }
    }
    this.drawPixel(art.barrel, CANNON.x + dir.x * axis, CANNON.y + dir.y * axis, len, 0.8, a);
    this.drawPixel(art.wheel, CANNON.x + 0.35, 0.5, 1, 1, 0);
    if (L && L.hop < 1) {
      // saut de la file jusque dans le canon
      const img = pose(L.id, 'jump');
      if (img) {
        const k = L.hop;
        const from = { x: -2.4, y: 0.75 };
        const x = from.x + (mouth.x - from.x) * k;
        const y = from.y + (mouth.y - from.y) * k + Math.sin(k * Math.PI) * 1.4;
        const h = 1.4 * (1 - k * 0.45);
        this.drawPic(img, x, y, (h * img.width) / img.height, h);
      }
    }
  }

  private drawProjectile(e: Ent, sim: Sim) {
    const p = e.body.getPosition();
    const v = e.body.getLinearVelocity();
    const f = e.friend!;
    if (e.kind === 'ball' || e.kind === 'puck') {
      const img = pose(f.id, f.fxPose!);
      if (img) this.drawPic(img, p.x, p.y, e.w * 1.5, e.h * 1.5, e.body.getAngle());
      return;
    }
    if (e.kind === 'pet') {
      const img = pose(f.id, Math.floor(this.time * 10) % 2 ? 'pj_pet_run1' : 'pj_pet_run2');
      if (img) this.drawPic(img, p.x, p.y + 0.15, 1.3, (1.3 * img.height) / img.width);
      return;
    }
    let name = 'jump';
    let angle = Math.atan2(v.y, v.x) * 0.25;
    if (e.impactAt !== undefined) {
      name = 'hit';
      angle = e.body.getAngle();
      if ((e.slowFor ?? 0) > 0.2) {
        name = 'down';
        angle = 0;
      }
    } else if (e.powerUsed && f.castPose && f.power !== 'triple' && f.power !== 'none') {
      name = f.castPose;
      angle = 0;
    } else if (v.y < -3) name = 'fall';
    if (e.mode === 'spin') {
      name = 'sp_pirouette';
      angle = sim.time * 14;
    }
    if (e.mode === 'levitate') {
      const m = pose(f.id, 'pj_mandala');
      if (m) this.drawPic(m, p.x, p.y, 2.2, 2.2, this.time * 2);
    }
    const img = pose(f.id, name);
    if (!img) return;
    const wide = img.width > img.height * 1.15;
    const h = wide ? (1.7 * img.height) / img.width : 1.5;
    const w = (h * img.width) / img.height;
    const flip = name === 'jump' && v.x < -1;
    this.drawPic(img, p.x, p.y + (name === 'down' ? h / 2 - e.h / 2 : 0), w, h, angle, flip);
    // traînée de vitesse
    const sp = Math.hypot(v.x, v.y);
    if (sp > 18) {
      this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      this.ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.sx(p.x - (v.x / sp) * 0.8), this.sy(p.y - (v.y / sp) * 0.8 + i * 0.3));
        this.ctx.lineTo(this.sx(p.x - (v.x / sp) * 2.2), this.sy(p.y - (v.y / sp) * 2.2 + i * 0.3));
        this.ctx.stroke();
      }
    }
  }

  private drawAim(aim: NonNullable<Scene['aim']>) {
    const ctx = this.ctx;
    const m = muzzle(aim.vx, aim.vy);
    for (let i = 1; i < 22; i++) {
      const t = i * 0.06;
      const x = m.x + aim.vx * t;
      const y = m.y + aim.vy * t + 0.5 * GRAVITY * t * t;
      if (y < 0) break;
      // gros points blancs cernés de noir, de plus en plus petits
      const r = Math.max(3, this.cam.s * (0.2 - i * 0.006));
      const X = Math.round(this.sx(x) - r / 2);
      const Y = Math.round(this.sy(y) - r / 2);
      ctx.fillStyle = '#1a1030';
      ctx.fillRect(X - 2, Y - 2, Math.round(r) + 4, Math.round(r) + 4);
      ctx.fillStyle = i % 2 ? '#ffffff' : '#ffd23f';
      ctx.fillRect(X, Y, Math.round(r), Math.round(r));
    }
  }

  private updateParticles(dt: number) {
    for (const p of this.particles) {
      p.life -= dt;
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.vr) p.rot = (p.rot ?? 0) + p.vr * dt;
      if (p.kind === 'sq' && p.y < 0.05 && p.g) {
        p.y = 0.05;
        p.vy *= -0.3;
        p.vx *= 0.6;
      }
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  private drawParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const k = p.life / p.max;
      const x = this.sx(p.x);
      const y = this.sy(p.y);
      const s = p.size * this.cam.s;
      switch (p.kind) {
        case 'sq':
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.min(1, k * 2);
          ctx.fillRect(
            Math.round(x - s / 2),
            Math.round(y - s / 2),
            Math.max(2, Math.round(s)),
            Math.max(2, Math.round(s)),
          );
          break;
        case 'star':
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.min(1, k * 2);
          ctx.fillRect(Math.round(x - s / 2), Math.round(y - 1), Math.round(s), 2);
          ctx.fillRect(Math.round(x - 1), Math.round(y - s / 2), 2, Math.round(s));
          break;
        case 'smoke': {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = k * 0.85;
          const r = s * (1.6 - k * 0.8);
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'ring': {
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = k;
          ctx.lineWidth = Math.max(2, 6 * k);
          ctx.beginPath();
          ctx.arc(x, y, s * (1 - k * 0.8), 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'flash': {
          ctx.globalAlpha = k;
          const g = ctx.createRadialGradient(x, y, 0, x, y, s);
          g.addColorStop(0, '#ffffff');
          g.addColorStop(0.4, p.color);
          g.addColorStop(1, 'rgba(255,120,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, s, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'pic':
          if (p.img) {
            ctx.globalAlpha = Math.min(1, k * 2);
            this.drawPic(
              p.img,
              p.x,
              p.y,
              p.size,
              (p.size * (p.img as HTMLCanvasElement).height) / (p.img as HTMLCanvasElement).width,
              p.rot ?? 0,
              p.vx < 0,
            );
          }
          break;
        case 'beam': {
          ctx.globalAlpha = k;
          const w = p.size * this.cam.s * k;
          ctx.strokeStyle = '#7fe9ff';
          ctx.lineWidth = w;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(this.sx(p.x2!), this.sy(p.y2!));
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = w * 0.4;
          ctx.stroke();
          break;
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  private drawTexts(dt: number) {
    const ctx = this.ctx;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const t of this.texts) {
      t.life -= dt;
      t.y += dt * (t.bubble ? 0.2 : 1.4);
      const k = t.life / t.max;
      const x = this.sx(t.x);
      const y = this.sy(t.y);
      ctx.globalAlpha = Math.min(1, k * 3);
      const size = t.size * (k > 0.85 ? 1 + (k - 0.85) * 3 : 1);
      ctx.font = `${Math.round(size)}px "Press Start 2P", monospace`;
      if (t.bubble) {
        const w = ctx.measureText(t.text).width + 16;
        const h = size + 14;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(x - w / 2), Math.round(y - h / 2), Math.round(w), Math.round(h));
        ctx.fillRect(Math.round(x - 4), Math.round(y + h / 2), 8, 6);
        ctx.fillStyle = '#1a1020';
        ctx.fillRect(Math.round(x - w / 2), Math.round(y + h / 2), Math.round(w), 2);
        ctx.fillText(t.text, Math.round(x), Math.round(y + 1));
      } else {
        ctx.fillStyle = '#1a1020';
        ctx.fillText(t.text, Math.round(x + 2), Math.round(y + 2));
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, Math.round(x), Math.round(y));
      }
      ctx.globalAlpha = 1;
    }
    this.texts = this.texts.filter((t) => t.life > 0);
  }
}

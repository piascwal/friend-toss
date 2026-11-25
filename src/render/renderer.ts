/* Affichage d'un niveau : caméra, ciel, décor, sol, objets, relous, amis, effets et visée. */
import { enemyFrame, pic, pose, propPic, spritePath } from '../assets';
import { MATS, THROWER, type Mat } from '../sim/defs';
import type { LevelDef, Theme } from '../sim/level';
import { ANCHOR, GRAVITY, type Ent, type Sim } from '../sim/sim';
import { beamTexture, drawSky, groundTile, groundTop, overlay, rng, TEX, THEMES } from './art';

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
  /** Pose du lanceur. */
  throwerPose: string;
  /** Ami posé dans les mains du lanceur (ou tiré pendant la visée). */
  loaded?: { id: string; x: number; y: number; hop: number };
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
  private bounds = { x0: -6, x1: 40, y1: 12 };
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
    this.bounds = { x0: -6.5, x1: x1 + 2.5, y1: y1 + 3.5 };
    // décor : quelques objets de la banque, derrière les structures
    const art = THEMES[theme];
    const r = rng(level.id.charCodeAt(0) * 97 + level.id.charCodeAt(2) * 13);
    this.decor = [];
    let x = -16;
    let i = Math.floor(r() * art.decor.length);
    while (x < this.bounds.x1 + 30) {
      const [id, file, h] = art.decor[i % art.decor.length]!;
      const busy = x > 9 && x < x1 && h > 2.5;
      const nearThrower = x > -6 && x < 3;
      if (!nearThrower && (!busy || r() < 0.35))
        this.decor.push({ pic: [id, file], x, h: h * (0.85 + r() * 0.3), dark: busy ? 0.55 : 0.8 });
      x += 3 + r() * 5;
      i += 1 + Math.floor(r() * 2);
    }
    this.fitNow();
  }

  private fitNow() {
    this.fit();
    this.cam = { ...this.target };
  }

  /**
   * Cadre le niveau entier ; avec `follow` (l'ami en vol), zoome et suit l'ami tant que le reste
   * de l'action reste lisible, comme une caméra de foot.
   */
  fit(follow?: { x: number; y: number }) {
    const b = this.bounds;
    const ground = this.margins.bottom + 8;
    const availH = this.H - this.margins.top - ground;
    const s0 = Math.max(6, Math.min(this.W / (b.x1 - b.x0), availH / b.y1));
    const x0 = b.x0 - Math.max(0, (this.W / s0 - (b.x1 - b.x0)) / 2) * 0.4;
    if (!follow) {
      this.target = { x: x0, y: -ground / s0, s: s0 };
      return;
    }
    // zoom limité : l'ami et 3 m au-dessus de lui restent à l'écran
    let s = Math.min(s0 * 1.55, availH / Math.max(b.y1 * 0.7, follow.y + 3));
    s = Math.max(s, Math.min(s0, availH / (follow.y + 3)));
    const viewW = this.W / s;
    const x = Math.min(Math.max(follow.x - viewW * 0.42, b.x0), Math.max(b.x0, b.x1 + 4 - viewW));
    this.target = { x, y: -ground / s, s };
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
    // caméra : suit l'ami s'il sort du cadre
    let lead: { x: number; y: number } | undefined;
    for (const e of sim.flying) {
      const p = e.body.getPosition();
      if (!lead || p.x > lead.x) lead = { x: p.x, y: p.y };
    }
    this.fit(sim.phase === 'won' || sim.phase === 'lost' ? undefined : lead);
    const k = Math.min(1, dt * (lead ? 2.2 : 1.6));
    this.cam.x += (this.target.x - this.cam.x) * k;
    this.cam.y += (this.target.y - this.cam.y) * k;
    this.cam.s += (this.target.s - this.cam.s) * k;

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
    this.drawThrower(scene);
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
      this.drawPixel(beamTexture(def.mat, e.w, e.h, this.stage(e), !!e.frozen), p.x, p.y, e.w, e.h, a);
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

  private drawThrower(scene: Scene) {
    const ctx = this.ctx;
    // les amis qui attendent, en file derrière le lanceur
    scene.waiting.forEach((id, i) => {
      const img = pose(id, scene.celebrate ? 'win' : 'idle');
      if (!img) return;
      const h = 1.45;
      const w = (h * img.width) / img.height;
      const hop = scene.celebrate ? Math.abs(Math.sin(this.time * 6 + i)) * 0.4 : 0;
      this.drawPic(img, -2.2 - i * 1.05, h / 2 + hop, w, h);
    });
    const t = pose(THROWER, scene.throwerPose);
    if (t) {
      const h = scene.throwerPose === 'crouch' ? 1.65 : 1.95;
      const w = (h * t.width) / t.height;
      this.drawPic(t, -0.55, h / 2, w, h);
    }
    if (scene.loaded) {
      const L = scene.loaded;
      const img = pose(L.id, 'jump');
      if (img) {
        const h = 1.35;
        const w = (h * img.width) / img.height;
        this.drawPic(img, L.x, L.y + Math.sin(L.hop * Math.PI) * 0.6, w, h);
      }
      if (scene.aim) {
        // élastique d'énergie entre le lanceur et l'ami
        ctx.strokeStyle = 'rgba(255,240,180,0.9)';
        ctx.lineWidth = Math.max(2, this.cam.s * 0.08);
        ctx.beginPath();
        ctx.moveTo(this.sx(ANCHOR.x - 0.3), this.sy(ANCHOR.y));
        ctx.lineTo(this.sx(L.x), this.sy(L.y));
        ctx.lineTo(this.sx(ANCHOR.x + 0.3), this.sy(ANCHOR.y));
        ctx.stroke();
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
    for (let i = 1; i < 26; i++) {
      const t = i * 0.055;
      const x = ANCHOR.x + aim.vx * t;
      const y = ANCHOR.y + aim.vy * t + 0.5 * GRAVITY * t * t;
      const r = Math.max(2, 6 - i * 0.18);
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)';
      ctx.fillRect(
        Math.round(this.sx(x) - r / 2),
        Math.round(this.sy(y) - r / 2),
        Math.round(r),
        Math.round(r),
      );
      if (y < 0) break;
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

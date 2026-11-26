/* Effets visuels : particules (débris, fumée, flashs, anneaux, rayons) et textes flottants. */
import { MATS, type Mat } from '../sim/defs';
import type { View } from './view';

export interface Particle {
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

export class Effects {
  private particles: Particle[] = [];
  private texts: FloatText[] = [];
  /** Secousse de l'écran (0 à 1,2). */
  shake = 0;

  clear() {
    this.particles = [];
    this.texts = [];
  }

  /** Ajoute une particule brute (flammes de fusée, traînées). */
  add(p: Particle) {
    this.particles.push(p);
  }

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

  update(dt: number) {
    this.shake = Math.max(0, this.shake - dt * 2.5);
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

  /** Dessine les particules (après les objets). */
  draw(v: View) {
    const ctx = v.ctx;
    for (const p of this.particles) {
      const k = p.life / p.max;
      const x = v.sx(p.x);
      const y = v.sy(p.y);
      const s = p.size * v.cam.s;
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
            v.pic(
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
          const w = p.size * v.cam.s * k;
          ctx.strokeStyle = '#7fe9ff';
          ctx.lineWidth = w;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(v.sx(p.x2!), v.sy(p.y2!));
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

  /** Dessine les textes flottants (scores, cris) par-dessus tout. */
  drawTexts(v: View, dt: number) {
    const ctx = v.ctx;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const t of this.texts) {
      t.life -= dt;
      t.y += dt * (t.bubble ? 0.2 : 1.4);
      const k = t.life / t.max;
      const x = v.sx(t.x);
      const y = v.sy(t.y);
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

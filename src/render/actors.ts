/* Les acteurs : modules et objets des structures, relous, amis en vol (look « grosse tête » de la banque
   s'il existe, sinon leur portrait dans un rond à leur couleur) et projectiles de pouvoir. */
import { enemyFrame, exactPose, pic, pose, spritePath } from '../assets';
import type { Ent } from '../sim/entity';
import type { Effects } from './effects';
import { blockTexture, overlay, tntTexture } from './textures';
import type { View } from './view';

/** Usure d'un objet : 0 intact, 1 fissuré, 2 très abîmé. */
function wear(e: Ent) {
  const r = e.hp / e.maxHp;
  return e.maxHp > 1e8 ? 0 : r < 0.35 ? 2 : r < 0.7 ? 1 : 0;
}

/* ------------------------------------------------------------ objets */

export function drawBlock(v: View, fx: Effects, e: Ent, time: number) {
  const p = e.body.getPosition();
  const a = e.body.getAngle();
  const def = e.objDef!;
  const sp = def.special;
  if (sp?.type === 'cage' && e.caged) {
    const img = pose(e.caged, 'idle');
    if (img) v.pic(img, p.x, p.y - e.h * 0.05, (e.h * 0.85 * img.width) / img.height, e.h * 0.85, a);
  }
  if (sp?.type === 'rocket' && e.fuse !== undefined) rocketFlames(fx, e);
  if (e.obj === 'tnt') {
    v.pixel(tntTexture(wear(e)), p.x, p.y, e.w, e.h, a);
    return;
  }
  if (!def.sprite) {
    v.pixel(blockTexture(def.mat, e.w, e.h, def.shape, wear(e), !!e.frozen), p.x, p.y, e.w, e.h, a);
    return;
  }
  const img = pic(spritePath(def.sprite));
  if (img) v.pic(img, p.x, p.y, e.w * 1.04, e.h * 1.04, a);
  if (sp?.type === 'portal') portalGlow(v, p.x, p.y, e.h, time);
  const st = wear(e);
  if (st || e.frozen) v.pixel(overlay(e.w, e.h, st, !!e.frozen, e.id), p.x, p.y, e.w, e.h, a);
  if (sp?.type === 'gold' && Math.random() < 0.04)
    fx.stars(p.x + (Math.random() - 0.5) * e.w, p.y + e.h * 0.4, 1, '#fff2a8');
}

function rocketFlames(fx: Effects, e: Ent) {
  const p = e.body.getPosition();
  const up = e.body.getWorldVector({ x: 0, y: 1 });
  for (let i = 0; i < 2; i++)
    fx.add({
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

function portalGlow(v: View, x: number, y: number, h: number, time: number) {
  const glow = 0.5 + Math.sin(time * 6) * 0.2;
  const r = h * 0.32 * v.cam.s;
  v.ctx.fillStyle = `rgba(120,240,255,${glow * 0.35})`;
  v.ctx.beginPath();
  v.ctx.ellipse(v.sx(x), v.sy(y), r * 1.1, r, 0, 0, Math.PI * 2);
  v.ctx.fill();
}

/* ------------------------------------------------------------ relous */

export function drawEnemy(v: View, e: Ent, time: number) {
  const p = e.body.getPosition();
  const a = e.body.getAngle();
  const def = e.enemyDef!;
  const f = enemyFrame(e.enemy!, e.variant, time + e.id * 0.37, e.hurt > 0);
  if (!f) return;
  const sheet = def.anim === 'sheet';
  let h = e.h * (def.drawScale ?? 1) * (sheet ? 1.12 : 1.04);
  let w = (h * f.sw) / f.sh;
  if (!sheet) w = Math.min(w, e.w * 1.6);
  // touché : il s'écrase un instant et tremble ; au repos, il respire
  if (e.hurt > 0) {
    w *= 1.1;
    h *= 0.88;
  } else h *= 1 + Math.sin(time * 3 + e.id) * 0.015;
  const jit = e.hurt > 0 ? (Math.random() - 0.5) * 0.1 : 0;
  const cy = p.y - e.h / 2 + h / 2 - (sheet ? e.h * 0.02 : 0);
  v.pic(f.img, p.x + jit, cy, w, h, a, false, [f.sx, f.sy, f.sw, f.sh]);
  if (e.frozen) v.pixel(overlay(e.w, e.h, 0, true, e.id), p.x, p.y, e.w * 1.1, e.h * 1.05, a);
  if (e.hp < e.maxHp || def.boss) lifeBar(v, p.x, p.y + e.h / 2 + 0.3, e.w, Math.max(0, e.hp / e.maxHp));
}

function lifeBar(v: View, x: number, y: number, w: number, r: number) {
  const ctx = v.ctx;
  const W = Math.max(18, w * v.cam.s);
  const X = v.sx(x) - W / 2;
  const Y = v.sy(y) - 4;
  ctx.fillStyle = '#1a1020';
  ctx.fillRect(Math.round(X - 1), Math.round(Y - 1), Math.round(W + 2), 6);
  ctx.fillStyle = r > 0.5 ? '#7dff6b' : r > 0.25 ? '#ffd23f' : '#ff4d4d';
  ctx.fillRect(Math.round(X), Math.round(Y), Math.round(W * r), 4);
}

/* ------------------------------------------------------------ amis et projectiles */

/** Diamètre de la tête d'un ami en vol (m) : bien plus gros que son corps physique, pour le reconnaître. */
export const HEAD = 1.25;

/**
 * Grosse tête : l'image « tête seule » du look chibi si la banque l'a, sinon le portrait de l'ami dans
 * un rond épais à sa couleur.
 */
export function drawHead(v: View, id: string, color: string, x: number, y: number, d: number, angle = 0) {
  const chibi = exactPose(id, 'chibi_head');
  if (chibi) return v.pic(chibi, x, y, (d * 1.15 * chibi.width) / chibi.height, d * 1.15, angle);
  const ctx = v.ctx;
  const X = v.sx(x);
  const Y = v.sy(y);
  const r = (d / 2) * v.cam.s;
  ctx.fillStyle = '#1a1030';
  ctx.beginPath();
  ctx.arc(X, Y, r + Math.max(2, r * 0.08), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(X, Y, r, 0, Math.PI * 2);
  ctx.fill();
  const face = pose(id, 'portrait');
  if (!face) return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(X, Y, r * 0.8, 0, Math.PI * 2);
  ctx.clip();
  v.pic(face, x, y, d * 0.86, d * 0.86, angle);
  ctx.restore();
}

export function drawProjectile(v: View, e: Ent, time: number) {
  const p = e.body.getPosition();
  const vel = e.body.getLinearVelocity();
  const f = e.friend!;
  if (e.mode === 'fire') return drawFireball(v, p.x, p.y, time);
  if (e.kind === 'ball' || e.kind === 'puck') {
    const img = pose(f.id, f.fxPose!);
    if (img) v.pic(img, p.x, p.y, e.w * 1.5, e.h * 1.5, e.body.getAngle());
    return;
  }
  if (e.kind === 'pet') {
    const img = pose(f.id, Math.floor(time * 10) % 2 ? 'pj_pet_run1' : 'pj_pet_run2');
    if (img) v.pic(img, p.x, p.y + 0.15, 1.3, (1.3 * img.height) / img.width);
    return;
  }
  if (e.mode === 'levitate') {
    const m = pose(f.id, 'pj_mandala');
    if (m) v.pic(m, p.x, p.y, 2.4, 2.4, time * 2);
  }
  const speed = Math.hypot(vel.x, vel.y);
  if (speed > 12) speedLines(v, p.x, p.y, vel.x / speed, vel.y / speed, f.color);
  // la tête roule après l'impact, tourbillonne pendant la pirouette
  const angle = e.mode === 'spin' ? time * 14 : e.impactAt !== undefined ? e.body.getAngle() : 0;
  const size = e.kind === 'clone' ? HEAD * 0.85 : HEAD;
  const body = chibiInFlight(e);
  if (body) v.pic(body, p.x, p.y + size * 0.15, (size * 1.4 * body.width) / body.height, size * 1.4, angle);
  else drawHead(v, f.id, f.color, p.x, p.y, size, angle);
}

/** Image du look chibi pour un ami en vol (sonné après l'impact, pouvoir déclenché, ou en vol). */
function chibiInFlight(e: Ent) {
  const id = e.friend!.id;
  const name =
    e.impactAt !== undefined
      ? 'chibi_hit'
      : e.powerUsed && e.friend!.power !== 'none'
        ? 'chibi_power'
        : 'chibi_fly';
  return exactPose(id, name) ?? exactPose(id, 'chibi_fly');
}

function speedLines(v: View, x: number, y: number, dx: number, dy: number, color: string) {
  const ctx = v.ctx;
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = Math.max(2, v.cam.s * 0.08);
  ctx.lineCap = 'round';
  for (const o of [-0.35, 0, 0.35]) {
    ctx.beginPath();
    ctx.moveTo(v.sx(x - dx * 0.9 - dy * o), v.sy(y - dy * 0.9 + dx * o));
    ctx.lineTo(v.sx(x - dx * 2 - dy * o), v.sy(y - dy * 2 + dx * o));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawFireball(v: View, x: number, y: number, time: number) {
  const ctx = v.ctx;
  const X = v.sx(x);
  const Y = v.sy(y);
  const r = 0.45 * v.cam.s * (1 + Math.sin(time * 30) * 0.08);
  const g = ctx.createRadialGradient(X, Y, 0, X, Y, r * 1.6);
  g.addColorStop(0, '#fff6c0');
  g.addColorStop(0.35, '#ffd23f');
  g.addColorStop(0.7, '#ff6a1a');
  g.addColorStop(1, 'rgba(255,60,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(X, Y, r * 1.6, 0, Math.PI * 2);
  ctx.fill();
}

/** Tracé pointillé d'un tir. */
export function drawTrail(v: View, trail: { x: number; y: number }[], color: string) {
  const ctx = v.ctx;
  ctx.fillStyle = color;
  for (let i = 0; i < trail.length; i += 4) {
    const p = trail[i]!;
    const r = i % 8 === 0 ? 4 : 3;
    ctx.fillRect(Math.round(v.sx(p.x) - r / 2), Math.round(v.sy(p.y) - r / 2), r, r);
  }
}

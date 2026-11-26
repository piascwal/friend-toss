/* Le canon et la bande qui attend son tour : le prochain ami saute dans le canon et sa tête dépasse
   de la bouche ; pendant la visée, des points montrent le début de la trajectoire. */
import { pose } from '../assets';
import { FRIEND_BY_ID } from '../sim/defs';
import { BARREL, CANNON, GRAVITY, muzzle } from '../sim/constants';
import { drawHead } from './actors';
import { cannonArt } from './cannon-art';
import type { View } from './view';

/** Ce que le jeu demande d'afficher autour du canon. */
export interface CannonScene {
  /** Angle du fût (radians) et recul après le tir (0 à 1). */
  cannon: { angle: number; recoil: number };
  /** Ami qui saute dans le canon (`hop` de 0 à 1), puis attend dedans. */
  loaded?: { id: string; hop: number };
  /** Visée en cours : vitesse de tir. */
  aim?: { vx: number; vy: number; power: number };
  /** Amis qui attendent leur tour, en file derrière le canon. */
  waiting: string[];
  /** Victoire : la bande fait la fête. */
  celebrate?: boolean;
}

/** Position du premier ami de la file. */
const QUEUE_X = -2.4;

export function drawCannon(v: View, scene: CannonScene, time: number) {
  drawQueue(v, scene, time);
  const art = cannonArt();
  const a = scene.cannon.angle;
  const dir = { x: Math.cos(a), y: Math.sin(a) };
  const back = scene.cannon.recoil * 0.45;
  const mouth = { x: CANNON.x + dir.x * (BARREL - back), y: CANNON.y + dir.y * (BARREL - back) };
  v.pixel(art.wheel, CANNON.x - 0.55, 0.5, 1, 1);
  v.pixel(art.carriage, CANNON.x - 0.1, 0.72, 1.7, 0.75);
  const L = scene.loaded;
  // la grosse tête de l'ami dépasse de la bouche du canon
  if (L && L.hop >= 1) {
    const f = FRIEND_BY_ID[L.id];
    drawHead(v, L.id, f?.color ?? '#fff', mouth.x + dir.x * 0.15, mouth.y + dir.y * 0.15 + 0.15, 1.05);
  }
  const axis = 0.7 - back;
  v.pixel(art.barrel, CANNON.x + dir.x * axis, CANNON.y + dir.y * axis, 2.3, 0.8, a);
  v.pixel(art.wheel, CANNON.x + 0.35, 0.5, 1, 1);
  if (L && L.hop < 1) drawHop(v, L.id, L.hop, mouth);
  if (scene.aim) drawAim(v, scene.aim);
}

function drawQueue(v: View, scene: CannonScene, time: number) {
  scene.waiting.forEach((id, i) => {
    const img = pose(id, scene.celebrate ? 'win' : 'idle');
    if (!img) return;
    const h = 1.5;
    const hop = scene.celebrate ? Math.abs(Math.sin(time * 6 + i)) * 0.4 : 0;
    v.pic(img, QUEUE_X - i * 1.1, h / 2 + hop, (h * img.width) / img.height, h);
  });
}

/** Saut de la file jusque dans le canon. */
function drawHop(v: View, id: string, k: number, mouth: { x: number; y: number }) {
  const img = pose(id, 'jump');
  if (!img) return;
  const x = QUEUE_X + (mouth.x - QUEUE_X) * k;
  const y = 0.75 + (mouth.y - 0.75) * k + Math.sin(k * Math.PI) * 1.4;
  const h = 1.4 * (1 - k * 0.45);
  v.pic(img, x, y, (h * img.width) / img.height, h);
}

/** Début de la trajectoire : gros points blancs et jaunes cernés de noir. */
function drawAim(v: View, aim: { vx: number; vy: number }) {
  const ctx = v.ctx;
  const m = muzzle(aim.vx, aim.vy);
  for (let i = 1; i < 22; i++) {
    const t = i * 0.06;
    const x = m.x + aim.vx * t;
    const y = m.y + aim.vy * t + 0.5 * GRAVITY * t * t;
    if (y < 0) break;
    const r = Math.max(3, v.cam.s * (0.2 - i * 0.006));
    const X = Math.round(v.sx(x) - r / 2);
    const Y = Math.round(v.sy(y) - r / 2);
    ctx.fillStyle = '#1a1030';
    ctx.fillRect(X - 2, Y - 2, Math.round(r) + 4, Math.round(r) + 4);
    ctx.fillStyle = i % 2 ? '#ffffff' : '#ffd23f';
    ctx.fillRect(X, Y, Math.round(r), Math.round(r));
  }
}

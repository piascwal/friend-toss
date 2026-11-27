/* Morceaux de décor prêts à poser : château, échafaudage, cheminée, pilotis, éboulis, pont, grotte…
   Chacun est paramétrable (taille, matériaux, graine) pour varier les niveaux sans répéter la même forme.
   Les relous et les objets se logent ensuite dans les cases renvoyées. */
import { Build, ROOM_W, T, type Fort, type M } from './build';

/** Hasard reproductible (même graine, même éboulis). */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

/** Cases libres (centre, bas) où loger un relou. */
type Cell = { x: number; y: number };

export interface Castle {
  left: Fort;
  keep: Fort;
  right: Fort;
  /** Haut des courtines (murs entre les tours et le donjon). */
  walls: number;
}

/**
 * Château : un donjon de `cols` × `floors` pièces au milieu, une tour crénelée de chaque côté (un étage
 * de plus), et des courtines en blocs entre eux. `wall` : matériau des courtines (pierre par défaut).
 */
export function castle(
  b: Build,
  x: number,
  y: number,
  o: { m?: M; mats?: M[]; cols?: number; floors?: number; towers?: number; wall?: M; gap?: number } = {},
): Castle {
  const cols = o.cols ?? 2;
  const floors = o.floors ?? 2;
  const towers = o.towers ?? floors + 1;
  const gap = o.gap ?? 1.6;
  const m = o.m ?? 'pierre';
  const keepW = cols * (ROOM_W - T) + T + 0.3;
  const dx = keepW / 2 + gap + ROOM_W / 2 + 0.15;
  const keep = b.fort(x, y, cols, floors, { m, mats: o.mats, roof: m });
  const left = b.fort(x - dx, y, 1, towers, { m, mats: o.mats, crenels: m });
  const right = b.fort(x + dx, y, 1, towers, { m, mats: o.mats, crenels: m });
  const s = gap / 2 - 0.02;
  let walls = y;
  for (const cx of [x - keepW / 2 - gap / 2 - 0.08, x + keepW / 2 + gap / 2 + 0.08]) {
    walls = b.wall(cx - s, y, 2, 3, o.wall ?? 'pierre', s);
    b.crenels(cx, walls, gap * 0.8, o.wall ?? 'pierre', 0.45);
  }
  return { left, keep, right, walls };
}

/**
 * Échafaudage : `floors` étages de `cols` cases en poteaux fins (0,3 m), haut et fragile.
 * Une secousse à la base et tout s'effondre.
 */
export function scaffold(
  b: Build,
  x: number,
  y: number,
  cols: number,
  floors: number,
  m: M = 'bois',
  h = 1.8,
): Fort {
  return b.fort(x, y, cols, floors, { m, t: 0.3, w: 2.2, h });
}

/**
 * Cheminée : deux murs épais et hauts encadrent un puits ouvert par le haut ; le relou est au fond.
 * Un tir à plat ne l'atteint pas : il faut tomber dedans (LOLO, le palet de MAR-1) ou abattre un mur.
 */
export function chimney(b: Build, x: number, y: number, h = 4, m: M = 'pierre', inner = 1.6): Cell {
  const w = 0.8;
  for (let fy = y; fy < y + h - 0.01; fy += 1) {
    const bh = Math.min(1, y + h - fy);
    b.block(x - inner / 2 - w / 2, fy, m, w, bh);
    b.block(x + inner / 2 + w / 2, fy, m, w, bh);
  }
  return { x, y };
}

/**
 * Cabane sur pilotis : deux longs poteaux, un plancher, une pièce dessus. Les pilotis cassés, tout tombe.
 * Renvoie la case de la pièce.
 */
export function stilts(b: Build, x: number, y: number, h: number, m: M = 'bois', roof: M = m): Cell {
  const w = ROOM_W + 0.6;
  b.pillar(x - w / 2 + 0.3, y, h, m, 0.35);
  b.pillar(x + w / 2 - 0.3, y, h, m, 0.35);
  const deck = b.plank(x, y + h, w + 0.2, m);
  return b.fort(x, deck, 1, 1, { m, roof }).cell(0, 0);
}

/**
 * Éboulis : des piles de blocs de tailles et de matériaux mêlés, de hauteurs inégales, avec des
 * roues, des cadres et des toits posés au hasard (mais stables). Renvoie le haut de chaque pile.
 */
export function rubble(
  b: Build,
  x0: number,
  y: number,
  piles: number,
  seed: number,
  mats: M[] = ['bois'],
): Cell[] {
  const r = rng(seed);
  const pick = <T>(a: T[]) => a[Math.floor(r() * a.length)]!;
  const tops: Cell[] = [];
  let x = x0;
  for (let i = 0; i < piles; i++) {
    const base = 1.1 + r() * 0.7;
    const cx = x + base / 2;
    let top = y;
    let w = base;
    const n = 2 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) {
      const h = 0.5 + r() * 0.6;
      const m = pick(mats);
      top = r() < 0.25 ? b.frame(cx, top, m, Math.min(w, 1)) : b.block(cx, top, m, w, h);
      w = Math.max(0.5, w * (0.6 + r() * 0.4));
    }
    const last = r();
    if (last < 0.3) top = b.ball(cx, top, pick(mats), Math.min(0.8, w));
    else if (last < 0.55) top = b.roof(cx, top, Math.min(1.2, w + 0.2), pick(mats), 0.5);
    tops.push({ x: cx, y: top });
    x += base + 0.08;
  }
  return tops;
}

/**
 * Deux tours reliées par un pont posé sur leurs toits. Renvoie les tours et le haut du pont.
 */
export function bridge(
  b: Build,
  xa: number,
  xb: number,
  y: number,
  floors: number,
  m: M = 'bois',
  deck: M = m,
): { a: Fort; b: Fort; deck: number } {
  const a = b.fort(xa, y, 1, floors, { m });
  const c = b.fort(xb, b.groundAt(xb) > y ? b.groundAt(xb) : y, 1, floors, { m });
  const top = b.plank((xa + xb) / 2, Math.max(a.top, c.top), xb - xa + ROOM_W, deck, 0.5);
  return { a, b: c, deck: top };
}

/**
 * Grotte : un plafond de roche flottant au-dessus du sol, de x0 à x1, à `h` m de haut. On n'y entre
 * qu'à plat (INDIANNE, une boule de feu) ou en faisant tomber ce qui est posé dessus.
 */
export function cave(b: Build, x0: number, x1: number, y: number, h = 2.4, depth = 1.6): number {
  return b.island(x0, x1, y + h + depth, depth);
}

/**
 * Bunker : une rangée basse de pièces en pierre sous un plafond de métal, chargé de blocs.
 * Les tirs d'en haut rebondissent ; le chien de CLEM, au ras du sol, y entre.
 */
export function bunker(b: Build, x: number, y: number, cols: number, load: M = 'pierre'): Fort {
  const f = b.fort(x, y, cols, 1, { m: 'pierre', ceil: 'metal', h: 1.9 });
  const n = Math.max(1, Math.floor((cols * (ROOM_W - T) - 0.4) / 0.8));
  b.wall(x - (n * 0.8) / 2, f.top, n, 1, load, 0.8);
  return f;
}

/** Serre de verre : pièces de glace, cadres creux sur le toit. Fragile, idéale pour TOM et ses copies. */
export function greenhouse(b: Build, x: number, y: number, cols: number, floors: number): Fort {
  const f = b.fort(x, y, cols, floors, { m: 'glace', taper: true });
  const n = Math.max(1, cols - floors + 1);
  for (let i = 0; i < n; i++) b.frame(x + (i - (n - 1) / 2) * (ROOM_W - T), f.top, 'glace', 0.9);
  return f;
}

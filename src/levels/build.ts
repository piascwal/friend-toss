/* Outil pour écrire les niveaux : on pose des modules (blocs, poutres, pièces, forteresses…) en mètres.
   Le canon est en x = -2 (les positions sont décalées de 2 m à la sortie), le sol plat en y = 0,
   et y est toujours le bas de la pièce posée. */
import { OBJECTS, type EnemyKind, type ObjDef, type ObjKind } from '../sim/defs';
import { SCALE } from '../sim/constants';
import type { EnemyPlace, Ground, ItemDef, LevelDef } from '../sim/level';

/** Épaisseur des poutres et poteaux (m) : des modules bien épais, façon jeu de construction. */
export const T = 0.45;

/** Pièce standard : assez large et haute pour le plus gros relou. */
export const ROOM_W = 2.4;
export const ROOM_H = 2;

export interface FortOptions {
  /** Matériau des poteaux (par étage avec `mats`) et des plafonds. */
  m?: M;
  mats?: M[];
  ceil?: M;
  w?: number;
  h?: number;
  taper?: boolean;
  /** Toit en triangle au sommet. */
  roof?: M;
  /** Épaisseur des poteaux et plafonds (T par défaut ; plus fin pour un échafaudage). */
  t?: number;
  /** Créneaux sur le dernier plafond (château). */
  crenels?: M;
}

export interface Fort {
  top: number;
  cell: (col: number, floor: number) => { x: number; y: number };
  cells: { x: number; y: number }[][];
}

/** Palier d'un relief en terrasses : partie plate de `a` à `b`, à la hauteur `y`. */
export interface Flat {
  a: number;
  b: number;
  y: number;
  mid: number;
}

export interface Storey {
  top: number;
  cell: { x: number; y: number };
  /** Une case par pièce (étage à plusieurs pièces). */
  cells?: { x: number; y: number }[];
}

export interface TowerOptions {
  /** Matériaux mêlés des poteaux (et des dalles, sauf `slab`). */
  mats?: M[];
  slab?: M[];
  w?: number;
  h?: number;
  /** Rétrécit chaque étage de tant de mètres. */
  shrink?: number;
  /** Pièces côte à côte par étage (une liste : une valeur par étage, la dernière vaut pour la suite). */
  rooms?: number | number[];
  /** Bric-à-brac dans les pièces (oui par défaut ; non pour loger un pilier). */
  fill?: boolean;
  roof?: 'toit' | 'boule' | 'creneaux' | 'cadre' | 'rien';
}

export interface Tower {
  top: number;
  cells: { x: number; y: number }[];
  /** Case d'un étage (et de sa pièce `room`, de gauche à droite). */
  cell: (floor: number, room?: number) => { x: number; y: number };
}

/** Matériau d'un module. */
export type M = 'bois' | 'glace' | 'pierre' | 'metal';

const BOX: Record<M, ObjKind> = {
  bois: 'planche',
  glace: 'planche-glace',
  pierre: 'planche-pierre',
  metal: 'planche-metal',
};
const BALL: Record<M, ObjKind> = {
  bois: 'rond',
  glace: 'rond-glace',
  pierre: 'rond-pierre',
  metal: 'rond-metal',
};
const FRAME_K: Record<M, ObjKind> = {
  bois: 'cadre',
  glace: 'cadre-glace',
  pierre: 'cadre-pierre',
  metal: 'cadre-metal',
};
const WEDGE: Record<M, ObjKind> = {
  bois: 'coin',
  glace: 'coin-glace',
  pierre: 'coin-pierre',
  metal: 'coin-metal',
};

/**
 * Construit une structure module par module. Les y donnés sont toujours le bas de la pièce ;
 * les méthodes renvoient le haut de ce qu'elles posent, pour empiler facilement.
 */
export class Build {
  items: ItemDef[] = [];
  enemies: EnemyPlace[] = [];
  ground: Ground[] = [];
  land: [number, number][] = [];
  rocks: [number, number][][] = [];
  /** Hasard reproductible : chaque niveau a sa graine, pour des structures variées mais fixes. */
  private seed: number;

  constructor(seed = 1) {
    this.seed = seed >>> 0 || 1;
  }

  /** Nombre entre a et b (hasard reproductible). */
  rand(a = 0, b = 1): number {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return a + (this.seed / 4294967296) * (b - a);
  }

  pick<T>(list: T[]): T {
    return list[Math.floor(this.rand(0, list.length))]!;
  }

  /**
   * Relief : une suite de points (x, y) de la surface du sol, de gauche à droite.
   * Les angles sont arrondis par le jeu ; poser les structures sur les parties plates.
   */
  relief(points: [number, number][]): this {
    this.land = points;
    return this;
  }

  /**
   * Relief en terrasses à partir de x0 : une suite de paliers [longueur, hauteur] reliés par des pentes,
   * puis retour au sol plat (la place où tombent les débris). Renvoie chaque palier avec sa partie
   * vraiment plate (`a` à `b`, hors arrondis) et son milieu, pour y poser les structures.
   */
  terraces<const S extends readonly (readonly [number, number])[]>(
    x0: number,
    steps: S,
  ): { [K in keyof S]: Flat } {
    const pts: [number, number][] = [
      [-10, 0],
      [x0, 0],
    ];
    const flats: Flat[] = [];
    let x = x0;
    let y = 0;
    const runOf = (dy: number) => Math.max(1.2, Math.abs(dy) * 0.75);
    const margin = (dy: number) => Math.min(1.5, Math.hypot(runOf(dy), dy) / 2) + 0.1;
    steps.forEach(([len, h], i) => {
      x += runOf(h - y);
      pts.push([x, h]);
      const next = i + 1 < steps.length ? steps[i + 1]![1] : 0;
      const a = x + margin(h - y);
      const b = x + len - margin(next - h);
      flats.push({ a, b, y: h, mid: (a + b) / 2 });
      x += len;
      pts.push([x, h]);
      y = h;
    });
    pts.push([x + runOf(y), 0], [x + 80, 0]);
    this.relief(pts);
    return flats as { [K in keyof S]: Flat };
  }

  /**
   * Rampe : une poutre penchée qui part du sol (ou d'un palier) en `xg` et vient s'appuyer sur le
   * coin d'un rocher ou d'un îlot, en (xr, yr). Elle relie la structure au relief.
   */
  ramp(xg: number, xr: number, yr: number, m: M = 'bois', th = 0.35): this {
    const up = xr > xg;
    return up
      ? this.beam(xg, this.groundAt(xg), xr + 0.25, yr + 0.05, m, th)
      : this.beam(xr - 0.25, yr + 0.05, xg, this.groundAt(xg), m, th);
  }

  /** Hauteur du sol (relief non arrondi) en x. */
  groundAt(x: number): number {
    const p = this.land;
    if (!p.length || x <= p[0]![0]) return p[0]?.[1] ?? 0;
    for (let i = 1; i < p.length; i++)
      if (x <= p[i]![0]) {
        const [x0, y0] = p[i - 1]!;
        const [x1, y1] = p[i]!;
        return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
      }
    return p.at(-1)![1];
  }

  add(k: ObjKind, x: number, y: number, extra: Partial<ItemDef> = {}): this {
    this.items.push({ k, x, y, ...extra });
    return this;
  }

  /** Empile des objets de la banque les uns sur les autres. */
  stack(x: number, y: number, kinds: ObjKind[]): number {
    let top = y;
    for (const k of kinds) {
      this.add(k, x, top);
      top += HEIGHTS[k] ?? 1.2;
    }
    return top;
  }

  /** Bloc rectangulaire (carré par défaut). */
  block(x: number, y: number, m: M = 'bois', w = 1, h = w): number {
    this.items.push({ k: BOX[m], x, y, w, h });
    return y + h;
  }

  /** Poutre horizontale épaisse. */
  plank(x: number, y: number, w: number, m: M = 'bois', h = T): number {
    return this.block(x, y, m, w, h);
  }

  /** Poteau vertical épais. */
  pillar(x: number, y: number, h: number, m: M = 'bois', w = T): number {
    return this.block(x, y, m, w, h);
  }

  /** Module rond (roue, boule, boulet). */
  ball(x: number, y: number, m: M = 'bois', d = 1): number {
    this.items.push({ k: BALL[m], x, y, w: d, h: d });
    return y + d;
  }

  /** Cadre creux (carré évidé) : léger, on voit à travers, il se brise vite. */
  frame(x: number, y: number, m: M = 'bois', s = 1): number {
    this.items.push({ k: FRAME_K[m], x, y, w: s, h: s });
    return y + s;
  }

  /** Créneaux : petits blocs espacés sur une longueur `len` centrée en x (haut des murs de château). */
  crenels(x: number, y: number, len: number, m: M = 'pierre', s = 0.5): number {
    const n = Math.max(2, Math.floor((len + s) / (1.7 * s)));
    const gap = (len - s) / (n - 1);
    for (let i = 0; i < n; i++) this.block(x - len / 2 + s / 2 + i * gap, y, m, s);
    return y + s;
  }

  /** Toit triangulaire. */
  roof(x: number, y: number, w = 1.2, m: M = 'bois', h = w * 0.6): number {
    this.items.push({ k: WEDGE[m], x, y, w, h });
    return y + h;
  }

  /** Pièce : deux poteaux et un plafond. Intérieur libre : w − 2T de large, h de haut. */
  room(x: number, y: number, w: number, h: number, m: M = 'bois', ceil: M = m): number {
    this.pillar(x - w / 2 + T / 2, y, h, m);
    this.pillar(x + w / 2 - T / 2, y, h, m);
    return this.plank(x, y + h, w + 0.3, ceil);
  }

  /** Rangée de pièces qui partagent leurs poteaux ; renvoie le haut du plafond. */
  rooms(x0: number, y: number, n: number, w: number, h: number, m: M = 'bois', ceil: M = m, t = T): number {
    for (let i = 0; i <= n; i++) this.pillar(x0 + i * (w - t) + t / 2, y, h, m, t);
    const len = n * (w - t) + t;
    return this.plank(x0 + len / 2, y + h, len + 0.3, ceil, t);
  }

  /**
   * Forteresse : `floors` étages de `cols` pièces côte à côte (poteaux partagés), en pyramide si
   * `taper` (une pièce de moins par étage). Renvoie le haut et les cases (centre, bas) pour y loger
   * des relous ou des objets : `cell(colonne, étage)`.
   */
  fort(x: number, y: number, cols: number, floors: number, o: FortOptions = {}): Fort {
    const w = o.w ?? ROOM_W;
    const h = o.h ?? ROOM_H;
    const t = o.t ?? T;
    const step = w - t;
    const cells: { x: number; y: number }[][] = [];
    let top = y;
    let n = cols;
    for (let f = 0; f < floors; f++) {
      n = o.taper ? Math.max(1, cols - f) : cols;
      const x0 = x - (n * step + t) / 2;
      const m = o.mats?.[f] ?? o.m ?? 'bois';
      cells.push(Array.from({ length: n }, (_, i) => ({ x: x0 + i * step + w / 2, y: top })));
      top = this.rooms(x0, top, n, w, h, m, o.ceil ?? m, t);
    }
    if (o.crenels) top = this.crenels(x, top, n * step + t, o.crenels);
    else if (o.roof) top = this.roof(x, top, Math.min(3, n * step * 0.6), o.roof, 1.1);
    const cell = (c: number, f: number) => {
      const row = cells[f];
      if (!row?.[c]) throw new Error(`Case ${c},${f} hors de la forteresse`);
      return row[c];
    };
    return { top, cell, cells };
  }

  /** Relou dans une case de forteresse. */
  in(k: EnemyKind, at: { x: number; y: number }, v?: number): this {
    return this.relou(k, at.x, at.y, v);
  }

  /** Objet de la banque (ou TNT) dans une case de forteresse. */
  put(k: ObjKind, at: { x: number; y: number }, dx = 0): this {
    return this.add(k, at.x + dx, at.y);
  }

  /** Mur de blocs carrés (cols × rows). */
  wall(x0: number, y: number, cols: number, rows: number, m: M = 'bois', s = 1): number {
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) this.block(x0 + c * s + s / 2, y + r * s, m, s);
    return y + rows * s;
  }

  /** Pyramide de blocs carrés. */
  pyramid(x: number, y: number, rows: number, m: M = 'bois', s = 1): number {
    for (let r = 0; r < rows; r++) {
      const n = rows - r;
      for (let i = 0; i < n; i++) this.block(x + (i - (n - 1) / 2) * s, y + r * s, m, s);
    }
    return y + rows * s;
  }

  /** Dominos : poteaux debout espacés, qui se renversent les uns sur les autres. */
  dominoes(x0: number, y: number, n: number, gap: number, h: number, m: M = 'bois'): number {
    for (let i = 0; i < n; i++) this.pillar(x0 + i * gap, y, h, m);
    return y + h;
  }

  relou(k: EnemyKind, x: number, y: number, v?: number): this {
    this.enemies.push({ k, x, y, v });
    return this;
  }

  plateau(x0: number, x1: number, top: number, bottom?: number): number {
    this.ground.push({ x0, x1, top, bottom });
    return top;
  }

  /** Îlot de terre flottant, de x0 à x1, dessus en `top`, épais de `depth`. */
  /* ------------------------------------------------------------ rochers de terre */

  /** Rocher de forme libre (polygone fermé). */
  rock(points: [number, number][]): this {
    this.rocks.push(points);
    return this;
  }

  /**
   * Îlot flottant façon motte de terre : dessus plat de x0 à x1, dessous effilé et irrégulier.
   * Renvoie le haut.
   */
  island(x0: number, x1: number, top: number, depth = 1.6): number {
    const w = x1 - x0;
    const m = x0 + w * this.rand(0.4, 0.6);
    this.rock([
      [x0, top],
      [x1, top],
      [x1 - 0.15, top - depth * 0.45],
      [m + w * 0.18, top - depth * this.rand(0.8, 1)],
      [m - w * 0.12, top - depth],
      [x0 + 0.2, top - depth * 0.5],
    ]);
    return top;
  }

  /** Pic de terre (trapèze) posé au sol : base de `base` m, dessus plat de `flat` m, haut `h`. */
  peak(x: number, base: number, flat: number, h: number, y = 0): number {
    this.rock([
      [x - base / 2, y - 0.6],
      [x + base / 2, y - 0.6],
      [x + flat / 2, y + h],
      [x - flat / 2, y + h],
    ]);
    return y + h;
  }

  /** Butte à flancs raides (falaise) de x0 à x1, dessus à `top`. */
  ledge(x0: number, x1: number, top: number, slope = 0.8): number {
    this.rock([
      [x0 - slope, -0.6],
      [x1 + slope, -0.6],
      [x1, top],
      [x0, top],
    ]);
    return top;
  }

  /**
   * Abri sous roche : un surplomb de terre de x0 à x1, haut de `top`, posé sur un pied de terre à
   * droite (large de `t`) et ouvert à gauche, côté canon, sur `h` m de haut. On n'y tire qu'à plat
   * (INDIANNE, une boule de feu, un tir tendu) ou en faisant tomber ce qui est posé dessus.
   */
  tunnel(x0: number, x1: number, top: number, h = 2.4, t = 1.4): number {
    this.rock([
      [x0, h],
      [x1 - t, h],
      [x1 - t, -0.6],
      [x1 + 0.6, -0.6],
      [x1, top],
      [x0, top],
    ]);
    return top;
  }

  /* ------------------------------------------------------------ modules variés */

  /** Poutre en biais posée de (x0, y0) à (x1, y1) : son dessous touche ces deux points. */
  beam(x0: number, y0: number, x1: number, y1: number, m: M = 'bois', th = 0.35): this {
    const a = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
    this.items.push({
      k: BOX[m],
      x: (x0 + x1) / 2,
      y: (y0 + y1) / 2,
      w: Math.hypot(x1 - x0, y1 - y0),
      h: th,
      a,
    });
    return this;
  }

  /**
   * Poteau fait de morceaux : un tronçon principal, parfois coiffé d'une cale d'un autre matériau ou
   * monté en cadres creux. Toujours `h` de haut au total, pour que les plafonds restent droits.
   */
  column(x: number, y: number, h: number, w: number, mats: M[]): number {
    const kind = this.rand();
    if (kind < 0.18 && h > 1.2) {
      // pile de cadres creux carrés
      const n = Math.max(2, Math.round(h / Math.max(0.6, w + 0.25)));
      for (let i = 0; i < n; i++) this.frame(x, y + (i * h) / n, this.pick(mats), h / n);
    } else if (kind < 0.55 && h > 1) {
      // tronçon et cale (un peu plus fine ou plus large : pas tout à fait aligné, mais stable)
      const cap = this.rand(0.5, 0.8);
      this.block(x, y, this.pick(mats), w, h - cap);
      this.block(x, y + h - cap, this.pick(mats), w * this.rand(0.85, 1), cap);
    } else this.block(x, y, this.pick(mats), w, h);
    return y + h;
  }

  /**
   * Étage : deux poteaux composés et une dalle d'épaisseur et de débord variables.
   * Renvoie le haut et la case (centre, bas) entre les poteaux.
   */
  storey(
    x: number,
    y: number,
    w: number,
    h: number,
    mats: M[],
    slab: M[] = mats,
    fill = true,
    rooms = 1,
  ): Storey {
    const pw = this.rand(0.4, 0.65);
    const all = rooms * w - (rooms - 1) * pw;
    const x0 = x - all / 2;
    for (let i = 0; i <= rooms; i++) this.column(x0 + pw / 2 + i * (w - pw), y, h, pw, mats);
    const th = this.pick([0.35, 0.45, 0.55, 0.65]);
    const top = this.block(x, y + h, this.pick(slab), all + this.rand(0, 0.7), th);
    const cells = Array.from({ length: rooms }, (_, i) => {
      const cx = x0 + w / 2 + i * (w - pw);
      // bric-à-brac d'un côté de la pièce, le relou de l'autre
      const inner = w - 2 * pw;
      const jw = Math.min(0.8, inner - 1.45);
      if (!fill || jw < 0.45) return { x: cx, y };
      const jx = this.rand() < 0.5 ? -1 : 1;
      this.junk(cx + jx * (inner / 2 - jw / 2 - 0.04), y, jw, h - 0.12, mats);
      return { x: cx - jx * (jw / 2 + 0.04), y };
    });
    return { top, cell: cells[0]!, cells };
  }

  /** Petite pile de bric-à-brac (blocs, cadres) de `w` de large, sous un plafond à `h`. */
  junk(x: number, y: number, w: number, h: number, mats: M[]): number {
    let top = y;
    while (top - y < h - 0.5) {
      const room = h - (top - y);
      const k = this.rand();
      if (k < 0.3 && room > w) top = this.frame(x, top, this.pick(mats), w);
      else top = this.block(x, top, this.pick(mats), w, Math.min(room, this.rand(0.35, 0.8)));
      if (this.rand() < 0.35) break;
    }
    return top;
  }

  /**
   * Objets posés en vrac sur une surface libre de x0 à x1 (dalle, pont, rocher) : petits blocs,
   * cadres, boules, toits.
   */
  clutter(x0: number, x1: number, y: number, mats: M[]): this {
    let x = x0 + this.rand(0, 0.3);
    for (;;) {
      const w = this.rand(0.5, 0.95);
      if (x + w > x1) break;
      const k = this.rand();
      const m = this.pick(mats);
      if (k < 0.2) this.ball(x + w / 2, y, m === 'glace' ? 'pierre' : m, w);
      else if (k < 0.4) this.frame(x + w / 2, y, m, w);
      else if (k < 0.55) this.roof(x + w / 2, y, w + 0.2, m, 0.5);
      else {
        const top = this.block(x + w / 2, y, m, w, this.rand(0.4, 0.9));
        if (this.rand() < 0.4) this.block(x + w / 2, top, this.pick(mats), w * 0.7, 0.4);
      }
      x += w + this.rand(0.05, 0.5);
    }
    return this;
  }

  /**
   * Jambe de force : une poutre en biais calée entre le sol (ou un rocher) et la face d'un poteau,
   * côté `side` (1 : à droite de la face en `xFace`, -1 : à gauche), qui touche la face à `yTop`.
   */
  brace(xFace: number, yTop: number, side: 1 | -1, y0: number, run = 1, m: M = 'bois'): this {
    if (side === 1) return this.beam(xFace, yTop, xFace + run, y0, m, 0.3);
    return this.beam(xFace - run, y0, xFace, yTop, m, 0.3);
  }

  /**
   * Tour d'étages variés, de plus en plus étroite si `shrink`, coiffée d'un toit, d'une boule, de
   * créneaux ou d'un cadre (au hasard si `roof` n'est pas donné). Renvoie le haut final et les cases de chaque étage.
   */
  tower(x: number, y: number, floors: number, o: TowerOptions = {}): Tower {
    const mats = o.mats ?? ['bois'];
    const cells: { x: number; y: number }[] = [];
    const rooms: { x: number; y: number }[][] = [];
    let top = y;
    let w = o.w ?? 3;
    let n = 1;
    for (let f = 0; f < floors; f++) {
      const h = o.h ?? this.pick([1.9, 2, 2.1]);
      const r = Array.isArray(o.rooms) ? (o.rooms[f] ?? o.rooms.at(-1)!) : (o.rooms ?? 1);
      n = r;
      const s = this.storey(x, top, w, h, mats, o.slab ?? mats, o.fill ?? true, r);
      cells.push(s.cell);
      rooms.push(s.cells ?? [s.cell]);
      top = s.top;
      if (o.shrink) w = Math.max(1.6, w - o.shrink);
    }
    w = n * w;
    const roof = o.roof ?? this.pick(['toit', 'boule', 'creneaux', 'cadre', 'rien'] as const);
    const m = this.pick(o.slab ?? mats);
    if (roof === 'toit') top = this.roof(x, top, Math.min(w, 2.4), m, this.rand(0.8, 1.3));
    else if (roof === 'boule') {
      // boule calée entre deux cales, pour qu'elle ne roule pas toute seule
      const d = this.rand(0.7, 1);
      this.block(x - d / 2 - 0.13, top, m, 0.25, 0.3);
      this.block(x + d / 2 + 0.13, top, m, 0.25, 0.3);
      top = this.ball(x, top, m === 'glace' ? 'pierre' : m, d);
    } else if (roof === 'creneaux') top = this.crenels(x, top, w * 0.85, m, 0.45);
    else if (roof === 'cadre') top = this.frame(x, top, m, this.rand(0.7, 1));
    return { top, cells, cell: (f, i = 0) => rooms[f]![i]! };
  }

  /**
   * Arche entre deux appuis de hauteurs différentes (sol, rocher, haut de tour) : un poteau composé
   * de chaque côté jusqu'à `top`, puis une dalle. C'est ainsi qu'un château s'accroche au relief.
   * Renvoie le haut et la case au sol du côté gauche.
   */
  arch(x0: number, y0: number, x1: number, y1: number, top: number, mats: M[], slab: M[] = mats): Storey {
    const pw = this.rand(0.4, 0.6);
    this.column(x0, y0, top - y0, pw, mats);
    this.column(x1, y1, top - y1, pw, mats);
    const th = this.pick([0.35, 0.45, 0.55]);
    const end = this.block((x0 + x1) / 2, top, this.pick(slab), x1 - x0 + pw + this.rand(0.1, 0.6), th);
    return { top: end, cell: { x: (x0 + x1) / 2, y: Math.max(y0, y1) } };
  }

  /** Dalle de pont posée sur deux appuis, de x0 à x1. */
  span(x0: number, x1: number, y: number, m: M = 'bois', th = 0.4): number {
    return this.block((x0 + x1) / 2, y, m, x1 - x0, th);
  }

  cage(x: number, y: number, friend: string): this {
    return this.add('cage', x, y, { friend });
  }

  /** Décalage horizontal de tout le niveau : les positions sont écrites depuis 0 = 2 m devant le canon. */
  static readonly DX = 2;

  /** Point fixe de l'agrandissement (m) : le début des structures reste à la même distance du canon. */
  static readonly ORIGIN = 8;

  /** Le niveau prêt à jouer : décalé devant le canon et agrandi de SCALE (voir constants.ts). */
  level(def: Omit<LevelDef, 'items' | 'enemies' | 'ground' | 'rocks'>): LevelDef {
    const k = SCALE;
    const X = (x: number) => Build.ORIGIN + (x - Build.ORIGIN) * k + Build.DX;
    const pt = ([x, y]: [number, number]): [number, number] => [X(x), y * k];
    return {
      ...def,
      items: this.items.map((i) => {
        const d = OBJECTS[i.k] as ObjDef;
        return { ...i, x: X(i.x), y: i.y * k, w: (i.w ?? d.w) * k, h: (i.h ?? d.h) * k };
      }),
      enemies: this.enemies.map((e) => ({ ...e, x: X(e.x), y: e.y * k })),
      ground: this.ground.map((g) => ({
        x0: X(g.x0),
        x1: X(g.x1),
        top: g.top * k,
        bottom: g.bottom === undefined ? undefined : g.bottom * k,
      })),
      rocks: this.rocks.length ? this.rocks.map((r) => r.map(pt)) : undefined,
      terrain: this.land.length ? this.land.map(pt) : undefined,
    };
  }
}

/** Hauteurs des objets (pour empiler). */
export const HEIGHTS: Partial<Record<ObjKind, number>> = {
  caisse: 1.2,
  'petite-caisse': 0.8,
  tonneau: 1.07,
  'tonneau-wog': 1.22,
  'tonneau-or': 1.1,
  tronc: 0.8,
  baril: 1.26,
  caisson: 1.12,
  'caisson-rose': 1.14,
  bidon: 0.75,
  'tonneau-fusee': 1.22,
  pneus: 1.13,
  poubelle: 1.17,
  'rocher-plat': 1.08,
  menhir: 1.45,
  dolmen: 1.35,
  enceinte: 1.52,
  'enceinte-rose': 1.15,
  cage: 1.3,
  van: 2.6,
  voiture: 1.75,
};

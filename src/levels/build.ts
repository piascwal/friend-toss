/* Outil pour écrire les niveaux : on pose des modules (blocs, poutres, pièces, forteresses…) en mètres.
   Le canon est en x = -2 (les positions sont décalées de 2 m à la sortie), le sol plat en y = 0,
   et y est toujours le bas de la pièce posée. */
import type { EnemyKind, ObjKind } from '../sim/defs';
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

  /**
   * Relief : une suite de points (x, y) de la surface du sol, de gauche à droite.
   * Les angles sont arrondis par le jeu ; poser les structures sur les parties plates.
   */
  relief(points: [number, number][]): this {
    this.land = points;
    return this;
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

  /** Tour de plusieurs étages de pièces. */
  tower(x: number, y: number, floors: number, w: number, h: number, m: M = 'bois', ceil: M = m): number {
    let top = y;
    for (let i = 0; i < floors; i++) top = this.room(x, top, w, h, m, ceil);
    return top;
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
  island(x0: number, x1: number, top: number, depth = 1.2): number {
    return this.plateau(x0, x1, top, top - depth);
  }

  cage(x: number, y: number, friend: string): this {
    return this.add('cage', x, y, { friend });
  }

  /** Décalage horizontal de tout le niveau : les positions sont écrites depuis 0 = 2 m devant le canon. */
  static readonly DX = 2;

  level(def: Omit<LevelDef, 'items' | 'enemies' | 'ground'>): LevelDef {
    const dx = Build.DX;
    return {
      ...def,
      items: this.items.map((i) => ({ ...i, x: i.x + dx })),
      enemies: this.enemies.map((e) => ({ ...e, x: e.x + dx })),
      ground: this.ground.map((g) => ({ ...g, x0: g.x0 + dx, x1: g.x1 + dx })),
      terrain: this.land.length ? this.land.map(([x, y]) => [x + dx, y] as [number, number]) : undefined,
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

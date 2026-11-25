/* Format d'un niveau, et petit outil pour construire les structures (empiler, poser des poutres). */
import type { EnemyKind, ObjKind } from './defs';

export interface ItemDef {
  k: ObjKind;
  /** Centre horizontal (m). */
  x: number;
  /** Bas de l'objet (m), avant rotation. */
  y: number;
  /** Largeur et hauteur des poutres (sinon celles de l'objet). */
  w?: number;
  h?: number;
  /** Angle en degrés (sens inverse des aiguilles d'une montre). */
  a?: number;
  /** Cage : l'ami enfermé. */
  friend?: string;
}

export interface EnemyPlace {
  k: EnemyKind;
  x: number;
  y: number;
  /** Variante d'image (1, 2…). */
  v?: number;
}

/** Plateforme fixe : rectangle de x0 à x1, de `bottom` (0 par défaut) jusqu'à `top`. */
export interface Ground {
  x0: number;
  x1: number;
  top: number;
  bottom?: number;
}

export type Theme = 'camping' | 'festival' | 'montagne' | 'plage' | 'ville';

export interface LevelDef {
  id: string;
  name: string;
  /** Amis lancés, dans l'ordre. */
  friends: string[];
  items: ItemDef[];
  enemies: EnemyPlace[];
  ground?: Ground[];
  /** Ce qu'apprend le niveau (affiché au début). */
  tip?: string;
  /** Seuils de 2 et 3 étoiles (sinon calculés). */
  stars?: [number, number];
}

/** Épaisseur des poutres et poteaux (m) : des modules bien épais, façon jeu de construction. */
export const T = 0.45;

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
  rooms(x0: number, y: number, n: number, w: number, h: number, m: M = 'bois', ceil: M = m): number {
    for (let i = 0; i <= n; i++) this.pillar(x0 + i * (w - T) + T / 2, y, h, m);
    const len = n * (w - T) + T;
    return this.plank(x0 + len / 2, y + h, len + 0.3, ceil);
  }

  /** Tour de plusieurs étages de pièces. */
  tower(x: number, y: number, floors: number, w: number, h: number, m: M = 'bois', ceil: M = m): number {
    let top = y;
    for (let i = 0; i < floors; i++) top = this.room(x, top, w, h, m, ceil);
    return top;
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

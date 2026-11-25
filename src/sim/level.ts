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

/** Construit une structure pièce par pièce. Les y donnés sont toujours le bas de la pièce. */
export class Build {
  items: ItemDef[] = [];
  enemies: EnemyPlace[] = [];
  ground: Ground[] = [];

  add(k: ObjKind, x: number, y: number, extra: Partial<ItemDef> = {}): this {
    this.items.push({ k, x, y, ...extra });
    return this;
  }

  /** Empile des objets les uns sur les autres ; renvoie le haut de la pile. */
  stack(x: number, y: number, kinds: ObjKind[], heights: Partial<Record<ObjKind, number>> = {}): number {
    let top = y;
    for (const k of kinds) {
      this.add(k, x, top);
      top += heights[k] ?? HEIGHTS[k] ?? 1.2;
    }
    return top;
  }

  /** Poutre horizontale. */
  beam(x: number, y: number, w: number, mat: Beam = 'planche', h = 0.3): number {
    this.items.push({ k: mat, x, y, w, h });
    return y + h;
  }

  /** Poteau vertical. */
  post(x: number, y: number, h: number, mat: Beam = 'planche', w = 0.3): number {
    this.items.push({ k: mat, x, y, w, h });
    return y + h;
  }

  /** Cabane : deux poteaux et un toit. Renvoie le haut du toit. */
  hut(x: number, y: number, w: number, h: number, mat: Beam = 'planche', roof: Beam = mat): number {
    this.post(x - w / 2 + 0.15, y, h, mat);
    this.post(x + w / 2 - 0.15, y, h, mat);
    return this.beam(x, y + h, w + 0.3, roof);
  }

  /** Tour de plusieurs étages de cabanes. */
  tower(
    x: number,
    y: number,
    floors: number,
    w: number,
    h: number,
    mat: Beam = 'planche',
    roof: Beam = mat,
  ): number {
    let top = y;
    for (let i = 0; i < floors; i++) top = this.hut(x, top, w, h, mat, roof);
    return top;
  }

  /** Pyramide d'objets carrés. */
  pyramid(x: number, y: number, rows: number, k: ObjKind = 'caisse', size = HEIGHTS[k] ?? 1.2): number {
    for (let r = 0; r < rows; r++) {
      const n = rows - r;
      for (let i = 0; i < n; i++) this.add(k, x + (i - (n - 1) / 2) * (size + 0.02), y + r * size);
    }
    return y + rows * size;
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

  /** Décalage horizontal de tout le niveau : les positions sont écrites depuis 0 = 5 m devant le lanceur. */
  static readonly DX = 5;

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

type Beam = 'planche' | 'planche-glace' | 'planche-pierre' | 'planche-metal';

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

/* Format d'un niveau (données pures), et surface du sol prête à simuler et à dessiner. */
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
  /** Relief du sol : points (x, y) de gauche à droite ; plat (y = 0) par défaut. */
  terrain?: [number, number][];
  /** Ce qu'apprend le niveau (affiché au début). */
  tip?: string;
  /** Seuils de 2 et 3 étoiles (sinon calculés). */
  stars?: [number, number];
}

/**
 * Surface du sol prête à dessiner et à simuler : prolongée loin à gauche et à droite, angles arrondis
 * (arc de 1,5 m au plus) pour un relief tout en rondeurs.
 */
export function terrainSurface(level: LevelDef): [number, number][] {
  const raw = level.terrain?.length ? level.terrain : [[0, 0] as [number, number]];
  const pts: [number, number][] = [[-80, raw[0]![1]], ...raw, [500, raw.at(-1)![1]]];
  const out: [number, number][] = [pts[0]!];
  for (let i = 1; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i - 1]!;
    const [px, py] = pts[i]!;
    const [bx, by] = pts[i + 1]!;
    const la = Math.hypot(ax - px, ay - py);
    const lb = Math.hypot(bx - px, by - py);
    const d = Math.min(1.5, la / 2, lb / 2);
    if (d < 0.05) {
      out.push([px, py]);
      continue;
    }
    const p1: [number, number] = [px + ((ax - px) / la) * d, py + ((ay - py) / la) * d];
    const p2: [number, number] = [px + ((bx - px) / lb) * d, py + ((by - py) / lb) * d];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      const u = 1 - t;
      out.push([
        u * u * p1[0] + 2 * u * t * px + t * t * p2[0],
        u * u * p1[1] + 2 * u * t * py + t * t * p2[1],
      ]);
    }
  }
  out.push(pts.at(-1)!);
  // points trop proches : Box2D n'en veut pas
  return out.filter((p, i) => i === 0 || Math.hypot(p[0] - out[i - 1]![0], p[1] - out[i - 1]![1]) > 0.02);
}

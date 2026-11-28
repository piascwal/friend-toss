/* Accessibilité : un relou doit pouvoir être touché. On cherche une ligne droite qui arrive sur lui
   depuis le ciel ou depuis la gauche (le côté du canon) sans traverser la terre (sol, rochers,
   plateformes) ni un objet incassable. Les objets cassables, eux, ne comptent pas : on peut les abattre. */
import type { LevelDef } from '../src/sim/level';
import { rockOutline, terrainSurface } from '../src/sim/level';
import { OBJECTS, MATS, ENEMIES, type ObjDef } from '../src/sim/defs';
import { SCALE } from '../src/sim/constants';

type Seg = [number, number, number, number];

function crosses(a: Seg, b: Seg): boolean {
  const [x1, y1, x2, y2] = a;
  const [x3, y3, x4, y4] = b;
  const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  if (Math.abs(d) < 1e-9) return false;
  const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
  const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
  return t > 0 && t < 1 && u >= 0 && u <= 1;
}

function loop(pts: [number, number][]): Seg[] {
  return pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length]!;
    return [p[0], p[1], q[0], q[1]];
  });
}

/** Les obstacles infranchissables du niveau, en segments. */
export function walls(level: LevelDef): Seg[] {
  const segs: Seg[] = [];
  const surf = terrainSurface(level);
  for (let i = 1; i < surf.length; i++) segs.push([...surf[i - 1]!, ...surf[i]!] as Seg);
  for (const r of level.rocks ?? []) segs.push(...loop(rockOutline(r)));
  const box = (x0: number, y0: number, x1: number, y1: number) =>
    loop([
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ]);
  for (const g of level.ground ?? []) segs.push(...box(g.x0, g.bottom ?? -1, g.x1, g.top));
  for (const it of level.items) {
    const def = OBJECTS[it.k] as ObjDef;
    if (!def.fixed && MATS[def.mat].hp < 1e6) continue;
    const w = it.w ?? def.w * SCALE;
    const h = it.h ?? def.h * SCALE;
    segs.push(...box(it.x - w / 2, it.y, it.x + w / 2, it.y + h));
  }
  return segs;
}

/** Les relous qu'aucune ligne droite venue du ciel ou de la gauche n'atteint. */
export function unreachable(level: LevelDef): string[] {
  const segs = walls(level);
  return level.enemies
    .filter((e) => {
      const h = ENEMIES[e.k].h * SCALE;
      // on vise le haut du corps et le milieu : il suffit de toucher l'un des deux
      for (const ty of [e.y + h * 0.75, e.y + h * 0.4])
        for (let deg = 90; deg <= 180; deg += 2) {
          const r = (deg * Math.PI) / 180;
          const ray: Seg = [e.x, ty, e.x + Math.cos(r) * 80, ty + Math.sin(r) * 80];
          if (!segs.some((s) => crosses(ray, s))) return false;
        }
      return true;
    })
    .map((e) => `${e.k}@${e.x.toFixed(1)},${e.y.toFixed(1)}`);
}

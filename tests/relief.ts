/* Relief : un niveau doit vivre sur du relief, pas sur un sol plat. On mesure, sous l'étendue de la
   structure, la part de sol plat au niveau zéro sans aucune terre (butte, pic, îlot) au-dessus,
   et on vérifie qu'il y a au moins un îlot flottant. */
import type { LevelDef } from '../src/sim/level';
import { rockOutline, terrainSurface } from '../src/sim/level';

/** Hauteur du sol (relief) en x. */
function terrainAt(level: LevelDef, x: number): number {
  const s = terrainSurface(level);
  for (let i = 1; i < s.length; i++)
    if (x <= s[i]![0]) {
      const [x0, y0] = s[i - 1]!;
      const [x1, y1] = s[i]!;
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
    }
  return 0;
}

/** Y a-t-il de la terre (rocher, îlot, plateforme) à la verticale de x ? */
function earthAbove(level: LevelDef, x: number): boolean {
  for (const g of level.ground ?? []) if (x >= g.x0 && x <= g.x1) return true;
  for (const r of level.rocks ?? []) {
    const p = rockOutline(r);
    for (let i = 0; i < p.length; i++) {
      const a = p[i]!;
      const b = p[(i + 1) % p.length]!;
      if ((a[0] - x) * (b[0] - x) <= 0) return true;
    }
  }
  return false;
}

/** Part (0 à 1) de sol plat et nu sous l'étendue des objets et des relous. */
export function flatShare(level: LevelDef): number {
  const xs = [...level.items.map((i) => i.x), ...level.enemies.map((e) => e.x)];
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  let flat = 0;
  let n = 0;
  for (let x = x0; x <= x1; x += 0.25, n++) if (terrainAt(level, x) < 0.1 && !earthAbove(level, x)) flat++;
  return flat / Math.max(1, n);
}

/** Au moins un îlot de terre flottant (rocher ou plateforme qui ne touche pas le sol). */
export function hasIsland(level: LevelDef): boolean {
  if ((level.ground ?? []).some((g) => (g.bottom ?? 0) > 0.3)) return true;
  return (level.rocks ?? []).some((r) => Math.min(...r.map((p) => p[1])) > 0.3);
}

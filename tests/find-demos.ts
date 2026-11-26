/* Cherche, pour chaque pouvoir, le tir de démonstration le plus spectaculaire (le plus de relous
   tombés, puis le plus de points, avec le pouvoir déclenché). À recopier dans src/levels/demos.ts. */
import { FRIENDS } from '../src/sim/defs';
import { demoFor } from '../src/levels/demos';
import { play } from './solver';

const out: Record<string, unknown> = {};
for (const f of FRIENDS) {
  const base = demoFor(f.id, f.power).level;
  let best: { deg: number; pw: number; at?: number; left: number; score: number } | undefined;
  const timings = f.power === 'none' ? [undefined] : [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2];
  for (let deg = 0; deg <= 70; deg += 3)
    for (const pw of [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.9])
      for (const at of timings) {
        const sim = play(base, [{ deg, pw, at }]);
        const left = sim.enemiesLeft;
        if (!best || left < best.left || (left === best.left && sim.score > best.score))
          best = { deg, pw, at, left, score: sim.score };
      }
  out[f.power] = best;
  console.log(f.power.padEnd(9), JSON.stringify(best));
}

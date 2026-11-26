/* Difficulté : part des premiers tirs (angle × puissance, pouvoir à mi-vol) qui gagnent, et relous tués en moyenne. */
import { ALL_LEVELS } from '../src/levels';
import { play } from './solver';
import { FRIEND_BY_ID } from '../src/sim/defs';

const ids = process.argv.slice(2);
for (const level of ALL_LEVELS.filter((l) => !ids.length || ids.some((i) => l.id.startsWith(i)))) {
  let n = 0,
    wins = 0,
    killed = 0;
  const f = FRIEND_BY_ID[level.friends[0]!]!;
  for (let deg = 4; deg <= 64; deg += 6)
    for (const pw of [0.6, 0.7, 0.8, 0.9, 1])
      for (const at of f.power === 'none' ? [undefined] : [undefined, 0.8]) {
        const sim = play(level, [{ deg, pw, at }]);
        n++;
        killed += level.enemies.length - sim.enemiesLeft;
        if (sim.enemiesLeft === 0) wins++;
      }
  console.log(
    level.id.padEnd(4),
    `${((wins / n) * 100).toFixed(0).padStart(3)}% gagnants`,
    `tués ${(killed / n).toFixed(1)}/${level.enemies.length}`,
  );
}

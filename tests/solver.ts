/* Solveur : cherche, tir par tir, le meilleur lancer (angle, puissance, moment du pouvoir).
   Il ne joue pas parfaitement, mais s'il gagne, le niveau est faisable. */
import type { LevelDef } from '../src/sim/level';
import { MAX_SPEED } from '../src/sim/constants';
import { createSim, type Sim } from '../src/sim/sim';
import { FRIEND_BY_ID } from '../src/sim/defs';

export interface Shot {
  deg: number;
  pw: number;
  /** Délai (s) avant le pouvoir ; absent : pas de pouvoir. */
  at?: number;
}

const MAX_STEPS = 60 * 14;

/** Rejoue des tirs ; renvoie la simulation à la fin du dernier. */
export function play(level: LevelDef, shots: Shot[]): Sim {
  const sim = createSim(level);
  for (const s of shots) {
    let n = 0;
    while (!sim.canLaunch && sim.phase !== 'won' && sim.phase !== 'lost' && n++ < MAX_STEPS) sim.step();
    if (!sim.canLaunch) break;
    const r = (s.deg * Math.PI) / 180;
    sim.launch(Math.cos(r) * MAX_SPEED * s.pw, Math.sin(r) * MAX_SPEED * s.pw);
    const t0 = sim.time;
    n = 0;
    while (sim.phase === 'flying' && n++ < MAX_STEPS) {
      if (s.at !== undefined && sim.current && sim.time - t0 >= s.at) {
        const target = nearestEnemy(sim);
        sim.activate(target);
      }
      sim.step();
    }
  }
  let n = 0;
  while (sim.phase !== 'won' && sim.phase !== 'lost' && !sim.canLaunch && n++ < MAX_STEPS) sim.step();
  return sim;
}

function nearestEnemy(sim: Sim) {
  const p = sim.current!.body.getPosition();
  let best: { x: number; y: number } | undefined;
  let bd = Infinity;
  for (const e of sim.ents) {
    if (e.kind !== 'enemy' || e.dead) continue;
    const q = e.body.getPosition();
    const d = Math.hypot(q.x - p.x, q.y - p.y);
    if (d < bd && q.x > p.x) {
      bd = d;
      best = { x: q.x, y: q.y };
    }
  }
  return best;
}

export function solve(level: LevelDef): { won: boolean; shots: Shot[]; score: number; stars: number } {
  const shots: Shot[] = [];
  for (let i = 0; i < level.friends.length; i++) {
    const friend = FRIEND_BY_ID[level.friends[i]!]!;
    const timings = friend.power === 'none' ? [undefined] : [undefined, 0.45, 0.75, 1.05, 1.35];
    let best: { shot: Shot; left: number; score: number } | undefined;
    for (let deg = 4; deg <= 72; deg += 4)
      for (const pw of [0.56, 0.64, 0.72, 0.8, 0.88, 0.96, 1])
        for (const at of timings) {
          const shot = { deg, pw, at };
          const sim = play(level, [...shots, shot]);
          const left = sim.enemiesLeft;
          if (!best || left < best.left || (left === best.left && sim.score > best.score))
            best = { shot, left, score: sim.score };
          if (left === 0) {
            shots.push(shot);
            const fin = play(level, shots);
            return { won: fin.phase === 'won', shots, score: fin.score, stars: fin.stars() };
          }
        }
    shots.push(best!.shot);
  }
  const fin = play(level, shots);
  return { won: fin.phase === 'won', shots, score: fin.score, stars: fin.stars() };
}

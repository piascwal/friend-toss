import { describe, expect, it } from 'vitest';
import { WORLDS } from '../../src/data/levels';
import { solve } from '../solver';

const world = WORLDS[4]!;
describe(world.name, () => {
  for (const level of world.levels)
    it(`${level.id} ${level.name} est faisable`, () => {
      const r = solve(level);
      console.log(level.id, r.won ? 'GAGNÉ' : 'PERDU', r.score, '★'.repeat(r.stars), JSON.stringify(r.shots));
      expect(r.won).toBe(true);
    }, 600_000);
});

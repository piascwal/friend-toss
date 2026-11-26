/* Chaque présentation animée fait bien tomber tous les relous de sa mini-scène. */
import { expect, it } from 'vitest';
import { demoFor } from '../src/levels/demos';
import { FRIENDS } from '../src/sim/defs';
import { play } from './solver';

for (const f of FRIENDS)
  it(`démo de ${f.name} (${f.powerName})`, () => {
    const { level, shot } = demoFor(f.id, f.power);
    expect(play(level, [shot]).enemiesLeft).toBe(0);
  });

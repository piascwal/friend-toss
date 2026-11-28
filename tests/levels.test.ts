/* Les niveaux sont bien construits : chaque pièce reste où le niveau la pose, et rien ne tombe ni ne
   casse tant qu'on ne tire pas. (La faisabilité est vérifiée par le solveur : npm run solve.) */
import { describe, expect, it } from 'vitest';
import { ALL_LEVELS, UNLOCKS, STARTERS } from '../src/levels';
import { FRIENDS, FRIEND_BY_ID } from '../src/sim/defs';
import { createSim } from '../src/sim/sim';
import { unreachable } from './reach';
import { flatShare, hasIsland } from './relief';

describe('niveaux', () => {
  for (const level of ALL_LEVELS) {
    it(`${level.id} : pièces en place`, () => {
      const sim = createSim(level);
      const off: string[] = [];
      const check = (k: string, x: number, y: number, e: (typeof sim.ents)[number]) => {
        const p = e.body.getPosition();
        if (Math.abs(p.x - x) > 0.25 || Math.abs(p.y - (y + e.h / 2)) > 0.35)
          off.push(`${k}@${x},${y}→${p.x.toFixed(2)},${(p.y - e.h / 2).toFixed(2)}`);
      };
      const blocks = sim.ents.filter((e) => e.kind === 'block');
      level.items.forEach((it, i) => it.a === undefined && check(it.k, it.x, it.y, blocks[i]!));
      const enemies = sim.ents.filter((e) => e.kind === 'enemy');
      level.enemies.forEach((it, i) => check(it.k, it.x, it.y, enemies[i]!));
      expect(off).toEqual([]);
    });

    it(`${level.id} : chaque relou est atteignable`, () => {
      expect(unreachable(level)).toEqual([]);
    });

    // le tout premier niveau reste sur du plat ; tous les autres vivent sur du relief, avec un îlot
    if (level.id !== '1-1')
      it(`${level.id} : relief (peu de plat, au moins un îlot)`, () => {
        expect({ plat: flatShare(level) <= 0.35, ilot: hasIsland(level) }).toEqual({
          plat: true,
          ilot: true,
        });
      });

    it(`${level.id} : tient debout sans tir`, () => {
      const sim = createSim(level);
      const before = sim.ents.length;
      const start = new Map(sim.ents.map((e) => [e, e.body.getPosition().clone()]));
      for (let i = 0; i < 60 * 6; i++) sim.step();
      const moved = sim.ents.filter((e) => {
        const p = e.body.getPosition();
        const s = start.get(e)!;
        return Math.hypot(p.x - s.x, p.y - s.y) > 0.3;
      });
      expect({ lost: before - sim.ents.length, moved: moved.length, score: sim.score }).toEqual({
        lost: 0,
        moved: 0,
        score: 0,
      });
    });
  }
});

describe('progression', () => {
  it('chaque ami est libéré une seule fois, avant le premier niveau où on le lance', () => {
    const have = new Set(STARTERS);
    const freed: string[] = [];
    for (const level of ALL_LEVELS) {
      for (const f of level.friends) expect(have.has(f), `${level.id} lance ${f}`).toBe(true);
      const u = UNLOCKS[level.id];
      if (u) {
        have.add(u);
        freed.push(u);
      }
    }
    expect(new Set(freed).size).toBe(freed.length);
    expect([...have].sort()).toEqual(FRIENDS.map((f) => f.id).sort());
  });

  it('chaque ami a un pouvoir décrit', () => {
    for (const f of FRIENDS) expect(FRIEND_BY_ID[f.id]!.desc.length).toBeGreaterThan(20);
  });
});

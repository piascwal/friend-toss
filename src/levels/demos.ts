/* Mini-scènes de démonstration : une par pouvoir, pour la présentation animée d'un ami (le canon tire
   tout seul et le pouvoir se déclenche au bon moment). Les tirs ont été trouvés par le solveur
   (tests/demos.test.ts vérifie qu'ils font toujours tomber au moins un relou). */
import type { PowerId } from '../sim/defs';
import type { LevelDef } from '../sim/level';
import { Build } from './build';

export interface Demo {
  level: LevelDef;
  /** Tir : angle (degrés), puissance (0 à 1), délai du pouvoir après le tir (s). */
  shot: { deg: number; pw: number; at?: number };
}

type Scene = (b: Build) => void;

const SCENES: Record<PowerId, Scene> = {
  none: (b) => {
    b.in('habitue', b.fort(11, 0, 1, 2, { roof: 'bois' }).cell(0, 0));
  },
  dash: (b) => {
    b.wall(9, 0, 2, 3);
    b.in('habitue', b.fort(13.5, 0, 1, 1, { roof: 'bois' }).cell(0, 0));
  },
  triple: (b) => {
    for (const x of [10, 12.6, 15.2]) b.in('habitue', b.fort(x, 0, 1, 1, { m: 'glace' }).cell(0, 0));
  },
  blast: (b) => {
    for (const x of [10.5, 13.1, 15.7]) b.in('habitue', b.fort(x, 0, 1, 2).cell(0, 1));
  },
  slam: (b) => {
    const f = b.fort(12, 0, 1, 2, { m: 'pierre', roof: 'pierre' });
    b.in('gardien', f.cell(0, 0)).in('habitue', f.cell(0, 1));
  },
  freeze: (b) => {
    const f = b.fort(12, 0, 2, 1, { m: 'metal' });
    b.in('gardien', f.cell(0, 0)).in('habitue', f.cell(1, 0));
  },
  jump: (b) => {
    b.pillar(9, 0, 5, 'metal', 0.6);
    b.in('habitue', b.fort(13, 0, 1, 1, { roof: 'bois' }).cell(0, 0));
  },
  spin: (b) => {
    b.pillar(9.5, 0, 3.6, 'metal');
    b.pillar(16.5, 0, 3.6, 'metal');
    b.plank(13, 3.6, 7.6);
    b.relou('habitue', 11.5, 0).relou('habitue', 14.5, 0, 2);
  },
  smash: (b) => {
    b.pillar(10, 0, 3, 'pierre', 0.6);
    b.pillar(15, 0, 3, 'pierre', 0.6);
    b.plank(12.5, 3, 5.8, 'pierre', 0.5);
    b.relou('habitue', 11.8, 0).add('tnt', 13.3, 0);
  },
  levitate: (b) => {
    b.pillar(9, 0, 1.8, 'pierre', 0.5);
    b.pillar(18, 0, 1.8, 'pierre', 0.5);
    b.plank(13.5, 1.8, 9.6, 'metal');
    b.relou('habitue', 13, 0).relou('habitue', 16, 0, 2);
  },
  pet: (b) => {
    b.in('habitue', b.fort(11.5, 0, 1, 1).cell(0, 0));
    b.in('habitue', b.fort(14.5, 0, 1, 1).cell(0, 0), 2);
  },
  beam: (b) => {
    b.pillar(9.5, 0, 3, 'bois', 0.7);
    b.relou('habitue', 11, 0);
    b.pillar(12.5, 0, 3, 'glace', 0.7);
    b.relou('habitue', 14, 0, 2);
    b.pillar(15.5, 0, 3, 'bois', 0.7);
  },
  puck: (b) => {
    b.pillar(10, 0, 2.6, 'metal');
    b.pillar(13.2, 0, 2.6, 'metal');
    b.plank(11, 2.6, 2.4, 'metal');
    b.pillar(14.6, 0, 2.6, 'metal');
    b.plank(15, 2.6, 1.5, 'metal');
    b.relou('habitue', 11.6, 0);
  },
  fireball: (b) => {
    b.pillar(9, 0, 2.2, 'metal', 0.6);
    const f = b.fort(15, 0, 2, 1, { m: 'metal' });
    b.put('tnt', f.cell(0, 0)).in('habitue', f.cell(1, 0));
  },
};

/** Tirs de démonstration (trouvés par le solveur : npm run demos). */
const SHOTS: Record<PowerId, Demo['shot']> = {
  none: { deg: 9, pw: 0.9 },
  dash: { deg: 6, pw: 0.9, at: 0.3 },
  triple: { deg: 6, pw: 0.9, at: 0.3 },
  blast: { deg: 18, pw: 0.6, at: 0.5 },
  slam: { deg: 36, pw: 0.8, at: 0.7 },
  freeze: { deg: 3, pw: 0.8, at: 0.3 },
  jump: { deg: 9, pw: 0.75, at: 0.3 },
  spin: { deg: 12, pw: 0.75, at: 0.2 },
  smash: { deg: 0, pw: 0.45, at: 0.2 },
  levitate: { deg: 0, pw: 0.45, at: 0.4 },
  pet: { deg: 30, pw: 0.45, at: 0.9 },
  beam: { deg: 0, pw: 0.7, at: 0.2 },
  puck: { deg: 63, pw: 0.6, at: 1 },
  fireball: { deg: 30, pw: 0.55, at: 1.2 },
};

/** La démonstration du pouvoir d'un ami. */
export function demoFor(friendId: string, power: PowerId): Demo {
  const b = new Build();
  SCENES[power](b);
  return {
    level: b.level({ id: `demo-${friendId}`, name: 'Démo', friends: [friendId] }),
    shot: SHOTS[power],
  };
}

export const DEMO_SHOTS = SHOTS;

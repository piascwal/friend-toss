/* Monde 3 — La Montagne : pierre, boulets, falaises, îlots, grotte, givre, et le Yéti Alpha. */
import { Build } from './build';
import type { WorldDef } from './index';

function seisme() {
  const b = new Build();
  const a = b.fort(14, 0, 1, 2, { m: 'pierre', roof: 'pierre' });
  b.in('videur', a.cell(0, 0)).in('fetard', a.cell(0, 1));
  const c = b.fort(19, 0, 2, 2, { m: 'pierre' });
  b.in('fetard', c.cell(0, 0), 2).in('pilier', c.cell(1, 0)).in('fetard', c.cell(0, 1), 3);
  return b.level({
    id: '3-1',
    name: 'Séisme',
    friends: ['lolo', 'lolo', 'lolo'],
    tip: 'LOLO : place-le au-dessus d’une tour en pierre, puis touche. Il pique et fait tout trembler.',
  });
}

function avalanche() {
  const b = new Build();
  b.relief([
    [-10, 0],
    [8, 0],
    [10, 5],
    [17, 5],
    [18, 0],
    [60, 0],
  ]);
  b.ball(12.5, 5, 'pierre', 1.3);
  b.ball(15, 5, 'pierre', 1.3);
  const f = b.fort(21.5, 0, 2, 1, { m: 'glace' });
  b.in('fetard', f.cell(0, 0)).in('videur', f.cell(1, 0));
  const t = b.fort(25.5, 0, 1, 2, { m: 'glace' });
  b.in('fetard', t.cell(0, 0), 2).in('fetard', t.cell(0, 1), 3);
  return b.level({
    id: '3-2',
    name: 'Avalanche',
    friends: ['roulian', 'mat', 'lolo'],
    tip: 'Pousse les boulets du haut de la falaise : ils feront le travail.',
  });
}

function leRefuge() {
  const b = new Build();
  b.relief([
    [-10, 0],
    [9, 0],
    [12, 2],
    [27, 2],
    [30, 0],
    [60, 0],
  ]);
  const f = b.fort(20, 2, 3, 2, { mats: ['pierre', 'glace'], taper: true, roof: 'pierre' });
  b.in('fetard', f.cell(0, 0))
    .in('pilier', f.cell(1, 0))
    .in('fetard', f.cell(2, 0), 2)
    .in('fetard', f.cell(0, 1), 3);
  b.add('menhir', 14.6, 2).add('menhir', 15.4, 2);
  return b.level({ id: '3-3', name: 'Le refuge', friends: ['lolo', 'tom', 'lolo', 'jbg'] });
}

function laGrotte() {
  const b = new Build();
  b.plateau(14, 26, 6.5, 5.2);
  const f = b.fort(20, 0, 2, 2, { m: 'glace' });
  b.in('fetard', f.cell(0, 0))
    .in('fetard', f.cell(1, 0), 2)
    .in('videur', f.cell(0, 1))
    .in('fetard', f.cell(1, 1), 3);
  b.in('fetard', b.fort(20, 6.5, 1, 1, { m: 'pierre' }).cell(0, 0), 4);
  b.cage(29, 0, 'roulie');
  return b.level({
    id: '3-4',
    name: 'La grotte',
    friends: ['lolo', 'jbg', 'mat', 'lolo'],
    tip: 'Sous la roche, il faut tirer à plat… ou faire sauter ce qui la tient.',
  });
}

function givre() {
  const b = new Build();
  b.pillar(13, 0, 3, 'metal', 0.6);
  const f = b.fort(17.5, 0, 3, 2, { m: 'metal', ceil: 'pierre' });
  b.in('videur', f.cell(0, 0))
    .in('pilier', f.cell(1, 0))
    .in('fetard', f.cell(2, 0))
    .in('fetard', f.cell(1, 1), 2);
  return b.level({
    id: '3-5',
    name: 'Givre',
    friends: ['roulie', 'lolo', 'roulie', 'lolo'],
    tip: 'ROULIE : touche en vol, elle gèle tout devant elle. Ce qui est gelé casse comme du verre.',
  });
}

function leCol() {
  const b = new Build();
  b.relief([
    [-10, 0],
    [9, 0],
    [11, 3],
    [18, 3],
    [20, 0.5],
    [24.5, 0.5],
    [26.5, 3.5],
    [36, 3.5],
    [38, 0],
    [60, 0],
  ]);
  const a = b.fort(14.5, 3, 1, 2, { m: 'pierre' });
  b.in('fetard', a.cell(0, 0)).in('fetard', a.cell(0, 1), 2);
  b.in('videur', b.fort(22.2, 0.5, 1, 1, { m: 'glace' }).cell(0, 0));
  const c = b.fort(31, 3.5, 2, 2, { mats: ['glace', 'pierre'], roof: 'pierre' });
  b.in('fetard', c.cell(0, 0), 3).in('pilier', c.cell(1, 0)).in('fetard', c.cell(1, 1), 4);
  b.add('tonneau-or', 34.5, 3.5);
  return b.level({ id: '3-6', name: 'Le col', friends: ['roulie', 'lolo', 'jbm', 'mat'] });
}

function lesIlots() {
  const b = new Build();
  b.plateau(13, 18, 3, 2);
  b.plateau(20, 25, 4.5, 3.5);
  b.plateau(27, 32, 2.5, 1.5);
  b.in('fetard', b.fort(15.5, 3, 1, 1, { m: 'pierre' }).cell(0, 0));
  const m = b.fort(22.5, 4.5, 1, 2, { m: 'glace' });
  b.in('fetard', m.cell(0, 0), 2).in('videur', m.cell(0, 1));
  b.in('fetard', b.fort(29.5, 2.5, 1, 1).cell(0, 0), 3);
  b.relou('fetard', 22.5, 0, 4);
  return b.level({ id: '3-7', name: 'Les îlots', friends: ['jbg', 'lolo', 'roulie', 'tom'] });
}

function lesMenhirs() {
  const b = new Build();
  b.dominoes(11, 0, 4, 1.4, 3.2, 'pierre');
  const f = b.fort(19.5, 0, 2, 2, { m: 'glace', roof: 'glace' });
  b.in('fetard', f.cell(0, 0))
    .in('fetard', f.cell(1, 0), 2)
    .in('fetard', f.cell(0, 1), 3)
    .in('videur', f.cell(1, 1));
  return b.level({
    id: '3-8',
    name: 'Les dominos',
    friends: ['mat', 'lolo', 'jbm', 'roulie'],
    tip: 'Fais tomber le premier poteau : les autres suivent.',
  });
}

function leBarrage() {
  const b = new Build();
  b.wall(12.5, 0, 2, 4, 'pierre');
  b.ball(13.5, 4, 'pierre', 1.2);
  const f = b.fort(19.5, 0, 3, 2, { m: 'glace', taper: true });
  b.in('fetard', f.cell(0, 0))
    .in('pilier', f.cell(1, 0))
    .in('fetard', f.cell(2, 0), 2)
    .in('fetard', f.cell(0, 1), 3);
  return b.level({ id: '3-9', name: 'Le barrage', friends: ['lolo', 'roulie', 'jbg', 'lolo'] });
}

function leSommet() {
  const b = new Build();
  b.relief([
    [-10, 0],
    [8, 0],
    [13, 3],
    [18, 3],
    [21, 6],
    [32, 6],
    [35, 0],
    [60, 0],
  ]);
  b.ball(15.5, 3, 'pierre', 1.2);
  const f = b.fort(26.5, 6, 3, 3, { mats: ['pierre', 'glace', 'pierre'], taper: true, roof: 'pierre' });
  b.in('fetard', f.cell(0, 0)).in('videur', f.cell(1, 0)).in('fetard', f.cell(2, 0), 2);
  b.in('pilier', f.cell(1, 1)).in('fetard', f.cell(0, 2), 3);
  return b.level({ id: '3-10', name: 'Le sommet', friends: ['roulie', 'jbg', 'lolo', 'tom', 'mat'] });
}

function laCrevasse() {
  const b = new Build();
  b.relief([
    [-10, 0],
    [8, 0],
    [8.6, 4],
    [14.4, 4],
    [15, 0],
    [24, 0],
    [24.6, 4],
    [34, 4],
    [36, 0],
    [60, 0],
  ]);
  b.ball(11, 4, 'pierre', 1.2);
  b.ball(12.6, 4, 'pierre', 1.2);
  const f = b.fort(19.5, 0, 3, 1, { m: 'pierre', ceil: 'glace' });
  b.in('fetard', f.cell(0, 0)).in('pilier', f.cell(1, 0)).in('fetard', f.cell(2, 0), 2);
  const c = b.fort(29, 4, 2, 2, { m: 'glace' });
  b.in('videur', c.cell(0, 0)).in('fetard', c.cell(1, 1), 3);
  return b.level({ id: '3-11', name: 'La crevasse', friends: ['lolo', 'roulie', 'jbm', 'jbg'] });
}

function yetiAlpha() {
  const b = new Build();
  b.plateau(20, 34, 1);
  b.relou('yeti-alpha', 27, 1);
  b.pillar(23.6, 1, 3.8, 'pierre', 0.7);
  b.pillar(30.4, 1, 3.8, 'pierre', 0.7);
  const roof = b.plank(27, 4.8, 8, 'pierre', 0.6);
  b.ball(24.8, roof, 'pierre', 1.2);
  b.ball(29.2, roof, 'pierre', 1.2);
  b.roof(27, roof, 2.2, 'pierre', 1.1);
  const g = b.fort(16, 0, 1, 2, { m: 'pierre' });
  b.in('videur', g.cell(0, 0)).in('fetard', g.cell(0, 1));
  b.relou('pilier', 36.5, 0);
  b.cage(39.5, 0, 'soso');
  return b.level({
    id: '3-12',
    name: 'BOSS : Yéti Alpha',
    friends: ['lolo', 'roulie', 'lolo', 'jbm', 'jbg', 'roulie'],
    tip: 'Fais tomber le toit et les boulets sur le Yéti Alpha.',
  });
}

export const MONTAGNE: WorldDef = {
  id: 3,
  name: 'La Montagne',
  theme: 'montagne',
  tagline: 'Pierre, glace et falaises : place aux poids lourds.',
  color: '#7cc8ff',
  levels: [
    seisme(),
    avalanche(),
    leRefuge(),
    laGrotte(),
    givre(),
    leCol(),
    lesIlots(),
    lesMenhirs(),
    leBarrage(),
    leSommet(),
    laCrevasse(),
    yetiAlpha(),
  ],
};

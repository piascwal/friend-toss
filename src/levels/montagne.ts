/* Monde 3 — La Montagne : pierre, boulets, falaises, îlots, grotte, givre, et le Yéti Alpha. */
import { Build } from './build';
import { castle, cave, chimney, greenhouse, rubble, scaffold } from './pieces';
import type { WorldDef } from './index';

function seisme() {
  const b = new Build();
  const a = b.fort(14, 0, 1, 2, { m: 'pierre', roof: 'pierre' });
  b.in('gardien', a.cell(0, 0)).in('habitue', a.cell(0, 1));
  const c = b.fort(19, 0, 2, 2, { m: 'pierre' });
  b.in('habitue', c.cell(0, 0), 2).in('pilier', c.cell(1, 0)).in('habitue', c.cell(0, 1), 3);
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
    [18.5, 0],
    [60, 0],
  ]);
  b.ball(12.5, 5, 'pierre', 1.3);
  b.ball(15, 5, 'pierre', 1.3);
  const f = b.fort(22, 0, 2, 1, { m: 'glace' });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(1, 0));
  const top = b.island(25.5, 31.5, 3.5);
  const g = greenhouse(b, 28.5, top, 2, 1);
  b.in('habitue', g.cell(0, 0), 2).in('habitue', g.cell(1, 0), 3);
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
    [8, 0],
    [11, 2],
    [33, 2],
    [35, 0],
    [60, 0],
  ]);
  b.in('habitue', chimney(b, 14.6, 2, 3.5, 'pierre'));
  const c = castle(b, 23, 2, { m: 'pierre', mats: ['pierre', 'glace'], cols: 2, floors: 1, towers: 2 });
  b.in('pilier', c.keep.cell(0, 0)).in('habitue', c.keep.cell(1, 0), 2);
  b.in('habitue', c.left.cell(0, 1), 3).in('habitue', c.right.cell(0, 1), 4);
  return b.level({
    id: '3-3',
    name: 'Le refuge',
    friends: ['lolo', 'tom', 'lolo', 'jbg'],
    tip: 'Un relou au fond de la cheminée : seul un tir qui tombe tout droit l’atteint.',
  });
}

function laGrotte() {
  const b = new Build();
  const roof = cave(b, 15, 25, 0);
  b.relou('habitue', 18, 0).relou('gardien', 21.5, 0);
  const t = b.fort(20, roof, 1, 1, { m: 'pierre', crenels: 'pierre' });
  b.in('habitue', t.cell(0, 0), 2);
  b.ball(16.4, roof, 'pierre', 1.2);
  b.add('menhir', 23.6, roof);
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
  b.in('gardien', f.cell(0, 0))
    .in('pilier', f.cell(1, 0))
    .in('habitue', f.cell(2, 0))
    .in('habitue', f.cell(1, 1), 2);
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
    [7, 0],
    [10, 4],
    [17, 4],
    [19.5, 1.2],
    [24, 1.2],
    [26.5, 4.5],
    [34, 4.5],
    [36, 0],
    [60, 0],
  ]);
  const a = b.fort(13.5, 4, 1, 2, { m: 'glace', roof: 'glace' });
  b.in('habitue', a.cell(0, 0)).in('habitue', a.cell(0, 1), 2);
  b.relou('pilier', 21.8, 1.2);
  const f = b.fort(30.2, 4.5, 2, 2, { mats: ['pierre', 'glace'], m: 'pierre', crenels: 'glace' });
  b.in('gardien', f.cell(0, 0)).in('habitue', f.cell(1, 0), 3).in('habitue', f.cell(0, 1), 4);
  return b.level({
    id: '3-6',
    name: 'Le col',
    friends: ['roulie', 'lolo', 'jbm', 'mat'],
    tip: 'Le pilier se cache au fond du col : il faut lui tomber dessus.',
  });
}

function lesIlots() {
  const b = new Build();
  const a = b.island(11, 15.5, 3);
  b.in('habitue', b.fort(13.2, a, 1, 1, { m: 'glace', roof: 'glace' }).cell(0, 0));
  const c = b.island(17.5, 22.5, 6.5);
  const t = b.fort(19.5, c, 1, 2, { m: 'glace' });
  b.in('gardien', t.cell(0, 0)).in('habitue', t.cell(0, 1), 2);
  b.ball(21.6, c, 'pierre', 1);
  b.relou('habitue', 20, 0, 3);
  const d = b.island(24.5, 31, 2.5);
  const f = b.fort(27.7, d, 2, 1, { m: 'pierre', roof: 'pierre' });
  b.in('habitue', f.cell(0, 0), 4).in('habitue', f.cell(1, 0));
  return b.level({ id: '3-7', name: 'Les îlots', friends: ['jbg', 'lolo', 'roulie', 'tom'] });
}

function lesMenhirs() {
  const b = new Build();
  b.plateau(9.5, 16.5, 4);
  b.plateau(16.5, 23, 2.2);
  b.dominoes(10.6, 4, 4, 1.25, 2.4, 'pierre');
  b.relou('habitue', 15.6, 4);
  const t = b.fort(19.6, 2.2, 1, 2, { m: 'glace', roof: 'glace' });
  b.in('gardien', t.cell(0, 0)).in('habitue', t.cell(0, 1), 2);
  const f = b.fort(27, 0, 2, 1, { m: 'pierre', crenels: 'pierre' });
  b.in('habitue', f.cell(0, 0), 3).in('gardien', f.cell(1, 0));
  return b.level({
    id: '3-8',
    name: 'Les dominos',
    friends: ['mat', 'lolo', 'jbm', 'roulie'],
    tip: 'Fais tomber le premier poteau : les autres suivent, de terrasse en terrasse.',
  });
}

function leBarrage() {
  const b = new Build();
  b.wall(12, 0, 2, 5, 'pierre');
  b.relou('pilier', 15.2, 0);
  b.wall(16.6, 0, 1, 3, 'glace');
  b.relou('habitue', 18.4, 0);
  const f = b.fort(23, 0, 2, 2, { m: 'glace', roof: 'pierre' });
  b.in('habitue', f.cell(0, 0), 2).in('gardien', f.cell(1, 0)).in('habitue', f.cell(0, 1), 3);
  b.add('tonneau-or', 27, 0);
  return b.level({
    id: '3-9',
    name: 'Le barrage',
    friends: ['lolo', 'roulie', 'jbg', 'lolo'],
    tip: 'Derrière le barrage, le pilier est à l’abri des tirs tendus. Pas des tirs qui tombent.',
  });
}

function leSommet() {
  const b = new Build();
  b.relief([
    [-10, 0],
    [8, 0],
    [11, 3],
    [17, 3],
    [20, 6],
    [34, 6],
    [36.5, 0],
    [60, 0],
  ]);
  const s = scaffold(b, 14, 3, 1, 2, 'glace');
  b.in('habitue', s.cell(0, 1));
  const f = b.fort(24, 6, 2, 2, { mats: ['pierre', 'glace'], m: 'pierre', crenels: 'pierre' });
  b.in('pilier', f.cell(0, 0)).in('habitue', f.cell(1, 0), 2).in('habitue', f.cell(0, 1), 3);
  b.in('gardien', chimney(b, 29.5, 6, 3, 'pierre', 1.4));
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
    [35, 4],
    [37, 0],
    [60, 0],
  ]);
  b.ball(11, 4, 'pierre', 1.2);
  b.ball(12.6, 4, 'pierre', 1.2);
  const f = b.fort(19.5, 0, 3, 1, { m: 'pierre', ceil: 'glace' });
  b.in('habitue', f.cell(0, 0)).in('pilier', f.cell(1, 0)).in('habitue', f.cell(2, 0), 2);
  rubble(b, 16.2, f.top, 1, 9, ['glace']);
  const c = b.fort(29.5, 4, 2, 2, { m: 'glace', crenels: 'glace' });
  b.in('gardien', c.cell(0, 0)).in('habitue', c.cell(1, 1), 3);
  b.ball(33.4, 4, 'pierre', 1);
  return b.level({ id: '3-11', name: 'La crevasse', friends: ['lolo', 'roulie', 'jbm', 'jbg'] });
}

function yetiAlpha() {
  const b = new Build();
  const l = b.fort(15.5, 0, 1, 3, { m: 'pierre', mats: ['pierre', 'glace', 'glace'], crenels: 'pierre' });
  b.in('gardien', l.cell(0, 0)).in('habitue', l.cell(0, 2));
  b.plateau(19.5, 34.5, 1);
  b.relou('yeti-alpha', 27, 1);
  b.pillar(23.6, 1, 3.8, 'pierre', 0.7);
  b.pillar(30.4, 1, 3.8, 'pierre', 0.7);
  const roof = b.plank(27, 4.8, 8, 'pierre', 0.6);
  b.ball(24.8, roof, 'pierre', 1.2);
  b.ball(29.2, roof, 'pierre', 1.2);
  b.roof(27, roof, 2.2, 'pierre', 1.1);
  b.relou('habitue', 21.5, 1, 2);
  const s = scaffold(b, 38, 0, 1, 2, 'glace');
  b.in('pilier', s.cell(0, 0));
  b.cage(42, 0, 'soso');
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

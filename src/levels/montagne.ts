/* Monde 3 — La Montagne : pierre, boulets, falaises, îlots, grotte, givre, et le Yéti Alpha. */
import { Build } from './build';
import { chimney } from './pieces';
import type { WorldDef } from './index';

function seisme() {
  const b = new Build(301);
  const a = b.tower(13, b.peak(13, 6.4, 3.6, 2), 1, { mats: ['pierre'], roof: 'toit' });
  b.in('gardien', a.cell(0));
  b.relou('pilier', 17.2, 0);
  const c = b.tower(21.6, b.peak(21.6, 6.8, 3.8, 2.4), 2, { mats: ['pierre', 'glace'], roof: 'creneaux' });
  b.in('habitue', c.cell(0), 2).in('habitue', c.cell(1), 3);
  return b.level({
    id: '3-1',
    name: 'Séisme',
    friends: ['lolo', 'lolo', 'lolo'],
    tip: 'LOLO : place-le au-dessus d’une cible, puis touche. Il pique et fait tout trembler. Le pilier est au fond du creux…',
  });
}

function avalanche() {
  const b = new Build(302);
  const cliff = b.ledge(9.6, 17, 5);
  b.ball(12.5, cliff, 'pierre', 1.3);
  b.ball(15, cliff, 'pierre', 1.3);
  const f = b.tower(22, 0, 1, { rooms: 2, w: 2.6, mats: ['glace'], roof: 'rien' });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(0, 1));
  b.clutter(20, 24, f.top, ['glace', 'pierre']);
  const top = b.island(25.6, 31.4, 4.2);
  b.in('habitue', b.tower(28.5, top, 1, { mats: ['glace'], roof: 'cadre' }).cell(0), 2);
  return b.level({
    id: '3-2',
    name: 'Avalanche',
    friends: ['roulian', 'mat', 'lolo'],
    tip: 'Pousse les boulets du haut de la falaise : ils feront le travail.',
  });
}

function leRefuge() {
  const b = new Build(303);
  const top = b.ledge(10.6, 33, 2);
  b.in('habitue', chimney(b, 14.6, top, 3.5, 'pierre'));
  const l = b.tower(19.6, top, 2, { w: 2.6, mats: ['pierre', 'glace'], roof: 'rien' });
  const k = b.tower(25, top, 1, { w: 3.2, h: 2, mats: ['pierre'], fill: false, roof: 'rien' });
  const r = b.tower(30.4, top, 2, { w: 2.6, mats: ['pierre', 'glace'], roof: 'rien' });
  b.in('habitue', l.cell(1), 2).in('pilier', k.cell(0)).in('habitue', r.cell(0), 3);
  const p = b.arch(20.2, l.top, 24.4, k.top, Math.max(l.top, k.top) + 1, ['pierre']);
  const q = b.arch(25.6, k.top, 29.8, r.top, Math.max(k.top, r.top) + 1, ['pierre', 'glace']);
  b.crenels(22.3, p.top, 3.4, 'pierre');
  b.relou('habitue', 27.7, q.top, 4);
  return b.level({
    id: '3-3',
    name: 'Le refuge',
    friends: ['lolo', 'tom', 'lolo', 'jbg'],
    tip: 'Un relou au fond de la cheminée : seul un tir qui tombe tout droit l’atteint.',
  });
}

function laGrotte() {
  const b = new Build(304);
  const roof = b.tunnel(12.5, 25.5, 4.4, 2.4, 1.4);
  b.relou('habitue', 16.4, 0).relou('gardien', 21.4, 0);
  b.clutter(18, 20, 0, ['pierre']);
  const t = b.tower(19.6, roof, 1, { rooms: 2, w: 2.8, mats: ['pierre', 'glace'], roof: 'creneaux' });
  b.in('habitue', t.cell(0, 1), 2);
  b.ball(13.6, roof, 'pierre', 1.1);
  b.add('menhir', 24.6, roof);
  b.cage(28.5, 0, 'roulie');
  return b.level({
    id: '3-4',
    name: 'La grotte',
    friends: ['lolo', 'jbg', 'mat', 'lolo'],
    tip: 'Sous la roche, il faut tirer à plat… ou faire sauter ce qui la tient.',
  });
}

function givre() {
  const b = new Build(305);
  b.pillar(12.5, 0, 3, 'metal', 0.6);
  const f = b.tower(18, 0, 2, {
    rooms: 2,
    w: 3,
    h: 2,
    mats: ['metal', 'pierre'],
    fill: false,
    roof: 'creneaux',
  });
  b.in('pilier', f.cell(0, 0)).in('gardien', f.cell(0, 1)).in('habitue', f.cell(1, 0));
  const top = b.island(23.4, 28.2, 4.6);
  b.in('habitue', b.tower(25.8, top, 1, { mats: ['pierre', 'metal'], roof: 'toit' }).cell(0), 2);
  return b.level({
    id: '3-5',
    name: 'Givre',
    friends: ['roulie', 'lolo', 'roulie', 'lolo'],
    tip: 'ROULIE : touche en vol, elle gèle tout devant elle. Ce qui est gelé casse comme du verre.',
  });
}

function leCol() {
  const b = new Build(306);
  const a = b.tower(13.5, b.peak(13.5, 9, 4.2, 4), 2, { mats: ['glace', 'pierre'], roof: 'rien' });
  const c = b.tower(29.5, b.peak(29.5, 10, 5, 4.5), 2, { w: 3.4, mats: ['pierre', 'glace'], roof: 'rien' });
  b.in('habitue', a.cell(0)).in('habitue', a.cell(1), 2).in('gardien', c.cell(0)).in('habitue', c.cell(1), 3);
  const p = b.arch(14.3, a.top, 28.6, c.top, Math.max(a.top, c.top) + 1.2, ['pierre']);
  b.relou('habitue', 21.5, p.top, 4);
  b.crenels(17.4, p.top, 3, 'glace');
  b.crenels(25.6, p.top, 3, 'glace');
  b.relou('pilier', 21.4, 0);
  return b.level({
    id: '3-6',
    name: 'Le col',
    friends: ['roulie', 'lolo', 'jbm', 'mat'],
    tip: 'Le pilier se cache au fond du col, sous le pont : il faut lui tomber dessus.',
  });
}

function lesIlots() {
  const b = new Build(307);
  const a = b.island(10.8, 15.6, 3);
  b.in('habitue', b.tower(13.2, a, 1, { mats: ['glace'], roof: 'toit' }).cell(0));
  const c = b.island(17.8, 23.2, 6.6);
  const t = b.tower(20.5, c, 2, { w: 2.8, mats: ['glace', 'pierre'], roof: 'toit' });
  b.in('gardien', t.cell(0)).in('habitue', t.cell(1), 2);
  b.relou('habitue', 20.5, 0, 3);
  b.clutter(18, 19.6, 0, ['pierre']);
  const d = b.island(25, 32, 3.2);
  const f = b.tower(28.5, d, 1, { rooms: 2, w: 2.8, mats: ['pierre', 'glace'], roof: 'toit' });
  b.in('habitue', f.cell(0, 0), 4).in('habitue', f.cell(0, 1));
  return b.level({ id: '3-7', name: 'Les îlots', friends: ['jbg', 'lolo', 'roulie', 'tom'] });
}

function lesMenhirs() {
  const b = new Build(308);
  b.rock([
    [9, -0.6],
    [9.6, 4],
    [16.6, 4],
    [16.6, 2.2],
    [23, 2.2],
    [23.8, -0.6],
  ]);
  b.dominoes(10.4, 4, 4, 1.25, 2.4, 'pierre');
  b.relou('habitue', 15.5, 4);
  const t = b.tower(19.6, 2.2, 2, { w: 2.8, mats: ['glace'], roof: 'toit' });
  b.in('gardien', t.cell(0)).in('habitue', t.cell(1), 2);
  const f = b.tower(28, 0, 1, { rooms: 2, w: 2.8, mats: ['pierre'], roof: 'creneaux' });
  b.in('habitue', f.cell(0, 0), 3).in('gardien', f.cell(0, 1));
  return b.level({
    id: '3-8',
    name: 'Les dominos',
    friends: ['mat', 'lolo', 'jbm', 'roulie'],
    tip: 'Fais tomber le premier poteau : les autres suivent, de terrasse en terrasse.',
  });
}

function leBarrage() {
  const b = new Build(309);
  const base = b.ledge(10.8, 14.2, 1);
  b.wall(11.5, base, 2, 4, 'pierre');
  b.relou('pilier', 16.3, 0);
  b.wall(18, 0, 1, 3, 'glace');
  b.relou('habitue', 19.8, 0);
  const f = b.tower(24.5, 0, 2, { rooms: [2, 1], w: 2.8, mats: ['glace', 'pierre'], roof: 'toit' });
  b.in('habitue', f.cell(0, 0), 2).in('gardien', f.cell(0, 1)).in('habitue', f.cell(1), 3);
  b.add('tonneau-or', 29, 0);
  return b.level({
    id: '3-9',
    name: 'Le barrage',
    friends: ['lolo', 'roulie', 'jbg', 'lolo'],
    tip: 'Derrière le barrage, le pilier est à l’abri des tirs tendus. Pas des tirs qui tombent.',
  });
}

function leSommet() {
  const b = new Build(310);
  b.rock([
    [8, -0.6],
    [11, 3],
    [16.5, 3],
    [19, 6.2],
    [34, 6.2],
    [35.5, -0.6],
  ]);
  b.in('habitue', b.tower(13.8, 3, 2, { w: 2.6, mats: ['glace'], roof: 'cadre' }).cell(1));
  const f = b.tower(23.5, 6.2, 2, { rooms: 2, w: 2.8, mats: ['pierre', 'glace'], roof: 'creneaux' });
  b.in('pilier', f.cell(0, 0)).in('habitue', f.cell(0, 1), 2).in('habitue', f.cell(1, 1), 3);
  b.in('gardien', chimney(b, 30.4, 6.2, 3, 'pierre', 1.4));
  return b.level({ id: '3-10', name: 'Le sommet', friends: ['roulie', 'jbg', 'lolo', 'tom', 'mat'] });
}

function laCrevasse() {
  const b = new Build(311);
  b.ledge(8.6, 14.4, 4, 0.5);
  b.ledge(24.6, 35, 4, 0.5);
  b.ball(10.6, 4, 'pierre', 1.2);
  b.ball(12.2, 4, 'pierre', 1.1);
  const f = b.tower(19.5, 0, 1, { rooms: 3, w: 2.8, h: 2, mats: ['pierre'], slab: ['glace'], fill: false });
  b.in('habitue', f.cell(0, 0)).in('pilier', f.cell(0, 1)).in('habitue', f.cell(0, 2), 2);
  const p = b.arch(13.6, 4, 25.4, 4, 6.2, ['pierre', 'glace']);
  b.relou('habitue', 19.5, p.top, 3);
  const c = b.tower(30, 4, 2, { mats: ['glace'], roof: 'creneaux' });
  b.in('gardien', c.cell(0)).in('habitue', c.cell(1), 4);
  return b.level({ id: '3-11', name: 'La crevasse', friends: ['lolo', 'roulie', 'jbm', 'jbg'] });
}

function yetiAlpha() {
  const b = new Build(312);
  const l = b.tower(15.5, 0, 3, { w: 2.6, mats: ['pierre', 'glace'], roof: 'creneaux' });
  b.in('gardien', l.cell(0)).in('habitue', l.cell(2));
  const top = b.ledge(19.6, 34.4, 1, 0.5);
  b.relou('yeti-alpha', 27, top);
  b.pillar(23.6, top, 3.8, 'pierre', 0.7);
  b.pillar(30.4, top, 3.8, 'pierre', 0.7);
  const roof = b.plank(27, top + 3.8, 8, 'pierre', 0.6);
  b.ball(24.8, roof, 'pierre', 1.2);
  b.ball(29.2, roof, 'pierre', 1.2);
  b.roof(27, roof, 2.2, 'pierre', 1.1);
  b.relou('habitue', 21.5, top, 2);
  const s = b.tower(38.5, 0, 2, { w: 3.2, h: 2, mats: ['glace', 'pierre'], fill: false, roof: 'toit' });
  b.in('pilier', s.cell(0)).in('habitue', s.cell(1), 3);
  b.cage(42.5, 0, 'soso');
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

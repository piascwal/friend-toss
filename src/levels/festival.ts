/* Monde 2 — Le Festival : barils et TNT, glace, enceintes en métal, gradins, et DJ Boucle. */
import { Build } from './build';
import { chimney } from './pieces';
import type { WorldDef } from './index';

function caVaPeter() {
  const b = new Build(201);
  const t = b.tower(14, b.ledge(10.8, 17.2, 1.2), 2, { rooms: [2, 1], roof: 'rien' });
  b.in('habitue', t.cell(0, 0)).put('baril', t.cell(0, 1)).in('habitue', t.cell(1, 0), 2);
  b.add('baril', 14, t.top);
  const r = b.tower(21.5, 0, 1, { roof: 'toit' });
  b.in('habitue', r.cell(0), 3);
  b.add('baril', 23.6, 0);
  b.clutter(24.4, 27, 0, ['bois', 'glace']);
  return b.level({
    id: '2-1',
    name: 'Ça va péter',
    friends: ['roulian', 'mat', 'tom'],
    tip: 'Les barils explosent au moindre choc… et font exploser leurs voisins.',
  });
}

function barAGlacons() {
  const b = new Build(202);
  const a = b.tower(13.5, b.peak(13.5, 7, 3.6, 1.6), 2, { mats: ['glace'], roof: 'cadre' });
  b.in('habitue', a.cell(0)).in('habitue', a.cell(1), 2);
  const top = b.island(17.4, 23.6, 5);
  b.in('gardien', b.tower(20.5, top, 1, { mats: ['glace', 'bois'], roof: 'toit' }).cell(0));
  b.in('habitue', b.tower(20.5, 0, 1, { mats: ['glace'], roof: 'rien' }).cell(0), 3);
  b.clutter(22.6, 26.5, 0, ['glace']);
  return b.level({
    id: '2-2',
    name: 'Le bar à glaçons',
    friends: ['tom', 'tom', 'tom'],
    tip: 'La glace casse au moindre choc. TOM et ses trois copies adorent.',
  });
}

function paumeDeSouffle() {
  const b = new Build(203);
  const t = b.tower(16, 0, 2, { rooms: 2, mats: ['glace', 'bois'], roof: 'creneaux' });
  b.in('habitue', t.cell(0, 0)).in('gardien', t.cell(0, 1)).in('habitue', t.cell(1, 1), 2);
  b.clutter(19.4, 21.5, 0, ['glace']);
  const top = b.island(22, 27, 4.2);
  b.in('habitue', b.tower(24.5, top, 1, { mats: ['glace'], roof: 'boule' }).cell(0), 3);
  return b.level({
    id: '2-3',
    name: 'Le pogo',
    friends: ['jbm', 'jbm', 'jbm'],
    tip: 'JBM : touche en vol pour la Paume de souffle. Déclenche-la au milieu des tours.',
  });
}

function laScene() {
  const b = new Build(204);
  const stage = b.ledge(11, 27, 1.2, 0.5);
  const l = b.tower(13, stage, 3, { w: 2.4, mats: ['metal', 'bois'], roof: 'rien', fill: false });
  const r = b.tower(25, stage, 3, { w: 2.4, mats: ['metal', 'bois'], roof: 'rien', fill: false });
  b.in('habitue', l.cell(1)).in('habitue', r.cell(2), 2);
  const truss = b.arch(13.5, l.top, 24.5, r.top, Math.max(l.top, r.top) + 0.8, ['metal']);
  b.add('baril', 17, truss.top).add('baril', 21, truss.top);
  b.clutter(18, 20, truss.top, ['metal', 'bois']);
  const c = b.tower(19, stage, 1, { rooms: 2, w: 2.8, mats: ['glace', 'bois'], roof: 'toit' });
  b.in('gardien', c.cell(0, 0)).in('habitue', c.cell(0, 1), 3);
  b.cage(29.5, 0, 'jbg');
  return b.level({ id: '2-4', name: 'La scène', friends: ['jbm', 'tom', 'mat', 'roulian'] });
}

function bouleDeFeu() {
  const b = new Build(205);
  const top = b.tunnel(11.5, 19, 3.2);
  b.relou('habitue', 15, 0).add('baril', 16.4, 0);
  b.in('habitue', b.tower(15.2, top, 1, { mats: ['metal', 'glace'], roof: 'toit' }).cell(0), 2);
  const r = b.tower(23.5, 0, 2, { mats: ['metal'], slab: ['metal', 'bois'], roof: 'creneaux' });
  b.in('gardien', r.cell(0)).in('habitue', r.cell(1), 3);
  return b.level({
    id: '2-5',
    name: 'Boule de feu',
    friends: ['jbg', 'jbg', 'jbg'],
    tip: 'JBG : touche en vol, sa boule de feu file tout droit et explose au contact. Le tunnel s’y prête.',
  });
}

function carreVip() {
  const b = new Build(206);
  b.stack(11.6, 0, ['enceinte', 'enceinte-rose']);
  b.stack(12.6, 0, ['enceinte']);
  const top = b.ledge(15, 25, 1.5);
  const v = b.tower(20, top, 1, {
    rooms: 3,
    w: 2.8,
    mats: ['metal'],
    slab: ['glace'],
    roof: 'rien',
    fill: false,
  });
  b.in('gardien', v.cell(0, 0)).put('caisson', v.cell(0, 1)).in('gardien', v.cell(0, 2), 2);
  const u = b.tower(20, v.top, 1, { rooms: 2, w: 2.8, mats: ['glace'], roof: 'creneaux' });
  b.in('habitue', u.cell(0, 0)).in('habitue', u.cell(0, 1), 2);
  b.clutter(26, 29, 0, ['glace', 'metal']);
  return b.level({
    id: '2-6',
    name: 'Le carré VIP',
    friends: ['tom', 'jbm', 'jbg', 'mat'],
    tip: 'Le métal ne casse presque pas. Le caisson explosif, lui, si.',
  });
}

function confettis() {
  const b = new Build(207);
  b.clutter(10.6, 13.4, b.peak(12, 5, 2.8, 1.4), ['bois', 'glace']);
  b.relou('habitue', 15.2, 0);
  b.in('habitue', b.tower(18.6, b.peak(18.6, 6.4, 3.6, 2.4), 1, { roof: 'boule' }).cell(0), 2);
  b.relou('gardien', 22.6, 0).add('baril', 23.8, 0);
  const top = b.island(24.6, 30, 4.6);
  b.in('habitue', b.tower(27, top, 1, { mats: ['glace'], roof: 'cadre' }).cell(0), 3);
  b.clutter(28.6, 29.9, top, ['glace']);
  return b.level({ id: '2-7', name: 'Pluie de confettis', friends: ['tom', 'jbm', 'mat', 'roulian'] });
}

function lesGradins() {
  const b = new Build(208);
  b.rock([
    [10.4, -0.6],
    [11, 1.2],
    [15.5, 1.2],
    [15.5, 2.4],
    [20, 2.4],
    [20, 3.6],
    [24.5, 3.6],
    [24.5, 4.8],
    [34, 4.8],
    [34.8, -0.6],
  ]);
  b.wall(11.4, 1.2, 1, 2, 'glace', 0.8);
  b.relou('habitue', 13.6, 1.2);
  b.wall(15.9, 2.4, 1, 2, 'glace', 0.8);
  b.relou('gardien', 18.1, 2.4);
  b.wall(20.4, 3.6, 1, 2, 'bois', 0.8);
  b.relou('habitue', 22.6, 3.6, 2);
  const f = b.tower(29.5, 4.8, 2, { rooms: [2, 1], w: 2.8, mats: ['bois', 'glace'], roof: 'toit' });
  b.in('habitue', f.cell(0, 0), 3).in('gardien', f.cell(0, 1)).in('habitue', f.cell(1), 4);
  return b.level({
    id: '2-8',
    name: 'Les gradins',
    friends: ['jbg', 'tom', 'jbm', 'mat'],
    tip: 'Chaque gradin a son muret : la boule de feu de JBG file à plat par-dessus les marches.',
  });
}

function backstage() {
  const b = new Build(209);
  const l = b.tower(13.2, 0, 2, { roof: 'toit' });
  b.in('habitue', l.cell(0)).in('habitue', l.cell(1), 2);
  b.add('tnt', 16, 0);
  b.in('gardien', chimney(b, 19, 0, 3.2, 'metal'));
  b.add('tnt', 22, 0);
  const r = b.tower(26.4, b.ledge(23.6, 29.2, 1.5), 2, { mats: ['glace', 'bois'], roof: 'creneaux' });
  b.in('habitue', r.cell(0), 3).in('habitue', r.cell(1), 4);
  return b.level({
    id: '2-9',
    name: 'Le backstage',
    friends: ['mat', 'jbg', 'tom', 'jbm'],
    tip: 'Le gardien est au fond d’un puits de métal : les deux caisses de TNT à ses pieds sont la clé.',
  });
}

function pilierAuBar() {
  const b = new Build(210);
  b.stack(11.5, 0, ['enceinte', 'enceinte-rose']);
  const bar = b.tower(19, 0, 1, {
    rooms: 3,
    w: 3,
    h: 2,
    mats: ['metal'],
    slab: ['bois'],
    roof: 'rien',
    fill: false,
  });
  b.in('habitue', bar.cell(0, 0)).in('pilier', bar.cell(0, 1)).in('habitue', bar.cell(0, 2), 2);
  const s = b.tower(19, bar.top, 2, { rooms: 2, w: 2.6, mats: ['bois'], roof: 'creneaux' });
  b.put('baril', s.cell(0, 0)).in('gardien', s.cell(0, 1)).in('habitue', s.cell(1, 0), 3);
  return b.level({ id: '2-10', name: 'Le pilier du bar', friends: ['jbm', 'jbg', 'tom', 'mat'] });
}

function toursDeSon() {
  const b = new Build(211);
  const top = b.island(11.4, 16.2, 4.6);
  b.stack(12.5, top, ['enceinte', 'enceinte-rose']);
  b.relou('habitue', 14.8, top);
  const a = b.tower(22, b.peak(22, 6.4, 3.8, 1.5), 2, { mats: ['metal', 'glace'], roof: 'rien' });
  const c = b.tower(30, b.peak(30, 6.4, 3.8, 1.5), 2, { mats: ['glace', 'metal'], roof: 'rien' });
  b.in('habitue', a.cell(0), 2).in('habitue', c.cell(1), 3);
  const p = b.arch(22.8, a.top, 29.2, c.top, Math.max(a.top, c.top) + 1, ['metal']);
  b.relou('gardien', 26, p.top).add('baril', 24.2, p.top);
  b.relou('habitue', 26, 0, 4);
  return b.level({ id: '2-11', name: 'Les tours de son', friends: ['jbg', 'jbm', 'tom', 'roulian', 'mat'] });
}

function djBoucle() {
  const b = new Build(212);
  const g = b.tower(12, 0, 1, { rooms: 2, w: 2.8, mats: ['glace'], roof: 'cadre' });
  b.in('habitue', g.cell(0, 0), 3).in('habitue', g.cell(0, 1));
  const stage = b.ledge(16, 32, 1.2, 0.5);
  b.relou('dj', 24, stage);
  const l = b.tower(18.3, stage, 2, { w: 2.6, mats: ['metal'], roof: 'rien', fill: false });
  const r = b.tower(29.7, stage, 2, { w: 2.6, mats: ['metal'], roof: 'rien', fill: false });
  b.in('habitue', l.cell(1)).in('gardien', r.cell(0)).in('habitue', r.cell(1), 2);
  const p = b.arch(18.8, l.top, 29.2, r.top, Math.max(l.top, r.top) + 0.8, ['metal']);
  b.add('baril', 22.2, p.top).add('tnt', 24, p.top).add('baril', 25.8, p.top);
  b.cage(35, 0, 'lolo');
  return b.level({
    id: '2-12',
    name: 'BOSS : DJ Boucle',
    friends: ['jbm', 'tom', 'jbg', 'mat', 'jbm', 'roulian'],
    tip: 'Les barils en haut de l’échafaudage tombent pile sur la scène…',
  });
}

export const FESTIVAL: WorldDef = {
  id: 2,
  name: 'Le Festival',
  theme: 'festival',
  tagline: 'Le carré VIP est squatté. Barils, TNT et confettis.',
  color: '#ff3d7f',
  levels: [
    caVaPeter(),
    barAGlacons(),
    paumeDeSouffle(),
    laScene(),
    bouleDeFeu(),
    carreVip(),
    confettis(),
    lesGradins(),
    backstage(),
    pilierAuBar(),
    toursDeSon(),
    djBoucle(),
  ],
};

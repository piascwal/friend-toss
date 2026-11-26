/* Monde 2 — Le Festival : barils et TNT, glace, enceintes en métal, gradins, et DJ Boucle. */
import { Build } from './build';
import type { WorldDef } from './index';

function caVaPeter() {
  const b = new Build();
  const f = b.fort(15, 0, 3, 2, { roof: 'bois' });
  b.put('baril', f.cell(1, 0));
  b.in('habitue', f.cell(0, 0)).in('habitue', f.cell(2, 0), 2).in('habitue', f.cell(1, 1), 3);
  const t = b.fort(20, 0, 1, 2);
  b.put('baril', t.cell(0, 1)).in('habitue', t.cell(0, 0), 4);
  return b.level({
    id: '2-1',
    name: 'Ça va péter',
    friends: ['roulian', 'mat', 'tom'],
    tip: 'Les barils explosent au moindre choc… et font exploser leurs voisins.',
  });
}

function barAGlacons() {
  const b = new Build();
  const f = b.fort(16, 0, 3, 3, { m: 'glace', taper: true, roof: 'glace' });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(1, 0)).in('habitue', f.cell(2, 0), 2);
  b.in('habitue', f.cell(0, 1), 3).in('habitue', f.cell(1, 1), 4).in('habitue', f.cell(0, 2));
  return b.level({
    id: '2-2',
    name: 'Le bar à glaçons',
    friends: ['tom', 'tom', 'tom'],
    tip: 'La glace casse au moindre choc. TOM et ses trois copies adorent.',
  });
}

function paumeDeSouffle() {
  const b = new Build();
  [12, 15.2, 18.4, 21.6].forEach((x, i) => {
    const t = b.fort(x, 0, 1, 2 + (i % 2), { m: i % 2 ? 'glace' : 'bois' });
    b.in('habitue', t.cell(0, 0), i + 1);
    if (i === 1) b.add('caisson-rose', x, t.top);
    if (i === 2) b.in('gardien', t.cell(0, 1));
  });
  return b.level({
    id: '2-3',
    name: 'Le pogo',
    friends: ['jbm', 'jbm', 'jbm'],
    tip: 'JBM : touche en vol pour la Paume de souffle. Déclenche-la au milieu des tours.',
  });
}

function laScene() {
  const b = new Build();
  b.plateau(13, 27, 1.5);
  const f = b.fort(20.5, 1.5, 3, 2, { ceil: 'metal' });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(1, 0)).in('habitue', f.cell(2, 0), 2);
  b.in('habitue', f.cell(0, 1), 3).put('baril', f.cell(1, 1)).in('habitue', f.cell(2, 1), 4);
  b.stack(15, 1.5, ['enceinte', 'enceinte']);
  b.cage(30, 0, 'jbg');
  return b.level({ id: '2-4', name: 'La scène', friends: ['jbm', 'tom', 'mat', 'roulian'] });
}

function bouleDeFeu() {
  const b = new Build();
  b.pillar(13, 0, 4, 'metal', 0.6);
  b.pillar(13.6, 0, 4, 'pierre', 0.6);
  const f = b.fort(19.5, 0, 2, 1, { m: 'metal' });
  b.put('tnt', f.cell(0, 0)).in('habitue', f.cell(1, 0));
  b.relou('gardien', 19.5, f.top);
  b.in('habitue', b.fort(24, 0, 1, 2, { m: 'metal', ceil: 'bois' }).cell(0, 1), 2);
  return b.level({
    id: '2-5',
    name: 'Boule de feu',
    friends: ['jbg', 'jbg', 'jbg'],
    tip: 'JBG : touche en vol, sa boule de feu file tout droit et explose au contact.',
  });
}

function carreVip() {
  const b = new Build();
  b.stack(13, 0, ['enceinte', 'enceinte']);
  b.stack(14.1, 0, ['enceinte']);
  const f = b.fort(18, 0, 3, 2, { m: 'metal' });
  b.in('gardien', f.cell(0, 0)).put('caisson', f.cell(1, 0)).in('gardien', f.cell(2, 0), 2);
  b.in('habitue', f.cell(1, 1)).in('habitue', f.cell(0, 1), 2);
  return b.level({
    id: '2-6',
    name: 'Le carré VIP',
    friends: ['tom', 'jbm', 'jbg', 'mat'],
    tip: 'Le métal ne casse presque pas. Le caisson explosif, lui, si.',
  });
}

function confettis() {
  const b = new Build();
  b.add('caisson-rose', 14.3, 0);
  const t = b.fort(17.5, 0, 1, 5, { mats: ['bois', 'glace', 'bois', 'glace', 'bois'], roof: 'bois' });
  b.in('gardien', t.cell(0, 0))
    .in('habitue', t.cell(0, 1))
    .in('habitue', t.cell(0, 3), 2)
    .put('baril', t.cell(0, 4));
  b.in('habitue', b.fort(21.5, 0, 1, 2).cell(0, 0), 3);
  return b.level({ id: '2-7', name: 'Pluie de confettis', friends: ['tom', 'jbm', 'mat', 'roulian'] });
}

function lesGradins() {
  const b = new Build();
  b.relief([
    [-10, 0],
    [11, 0],
    [11.6, 1.5],
    [16, 1.5],
    [16.6, 3],
    [21, 3],
    [21.6, 4.5],
    [29, 4.5],
    [31, 0],
    [60, 0],
  ]);
  b.in('habitue', b.fort(13.8, 1.5, 1, 1).cell(0, 0));
  b.in('habitue', b.fort(18.8, 3, 1, 1, { m: 'glace' }).cell(0, 0), 2);
  const f = b.fort(25, 4.5, 2, 2);
  b.in('gardien', f.cell(0, 0)).in('habitue', f.cell(1, 0), 3).in('habitue', f.cell(0, 1), 4);
  b.add('tnt', 25, f.top);
  return b.level({ id: '2-8', name: 'Les gradins', friends: ['jbg', 'tom', 'jbm', 'mat'] });
}

function backstage() {
  const b = new Build();
  const a = b.fort(13.5, 0, 2, 2);
  b.in('habitue', a.cell(0, 0)).in('habitue', a.cell(1, 1), 2);
  b.add('tnt', 17.2, 0).add('tnt', 18.3, 0);
  const c = b.fort(21.5, 0, 2, 2, { roof: 'bois' });
  b.in('habitue', c.cell(0, 0), 3).in('habitue', c.cell(1, 0), 4).in('gardien', c.cell(0, 1));
  return b.level({
    id: '2-9',
    name: 'Le backstage',
    friends: ['mat', 'jbg', 'tom', 'jbm'],
    tip: 'Deux caisses de TNT entre deux forts : une seule étincelle suffit.',
  });
}

function pilierAuBar() {
  const b = new Build();
  const f = b.fort(18, 0, 3, 2, { mats: ['glace', 'metal'], roof: 'glace' });
  b.in('habitue', f.cell(0, 0))
    .in('pilier', f.cell(1, 0))
    .in('habitue', f.cell(2, 0), 2)
    .in('gardien', f.cell(1, 1));
  b.add('baril', 14.5, 0);
  return b.level({ id: '2-10', name: 'Le pilier du bar', friends: ['jbm', 'jbg', 'tom', 'mat'] });
}

function toursDeSon() {
  const b = new Build();
  for (const [i, x] of [12.5, 15.5].entries()) {
    const top = b.stack(x, 0, ['enceinte', 'enceinte', 'enceinte']);
    b.add('baril', x, top);
    b.relou('habitue', x + 1.4, 0, i + 1);
  }
  const f = b.fort(22, 0, 2, 3, { taper: true, ceil: 'metal', roof: 'metal' });
  b.in('gardien', f.cell(0, 0))
    .in('habitue', f.cell(1, 0), 3)
    .in('habitue', f.cell(0, 1), 4)
    .in('habitue', f.cell(0, 2));
  return b.level({ id: '2-11', name: 'Les tours de son', friends: ['jbg', 'jbm', 'tom', 'roulian', 'mat'] });
}

function djBoucle() {
  const b = new Build();
  b.plateau(18, 32, 1.6);
  b.relou('dj', 25, 1.6);
  b.pillar(22.6, 1.6, 4.4, 'metal');
  b.pillar(27.4, 1.6, 4.4, 'metal');
  const deck = b.plank(25, 6, 5.6, 'metal');
  b.add('baril', 23.8, deck).add('baril', 26.2, deck);
  b.add('tnt', 20, 1.6);
  b.relou('habitue', 29.5, 1.6).relou('habitue', 31, 1.6, 2);
  b.in('gardien', b.fort(14, 0, 1, 1, { ceil: 'metal' }).cell(0, 0));
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

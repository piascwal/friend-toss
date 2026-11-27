/* Monde 2 — Le Festival : barils et TNT, glace, enceintes en métal, gradins, et DJ Boucle. */
import { Build } from './build';
import { bridge, chimney, greenhouse, rubble, scaffold } from './pieces';
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
  const g = greenhouse(b, 14.5, 0, 3, 2);
  b.in('habitue', g.cell(0, 0)).in('gardien', g.cell(1, 0)).in('habitue', g.cell(2, 0), 2);
  b.in('habitue', g.cell(0, 1), 3);
  rubble(b, 19.4, 0, 2, 31, ['glace']);
  const s = scaffold(b, 26, 0, 1, 3, 'glace');
  b.in('habitue', s.cell(0, 0), 4).in('habitue', s.cell(0, 2));
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
  const stage = b.plateau(12, 27, 1.2);
  const l = scaffold(b, 13.6, stage, 1, 3);
  const r = scaffold(b, 25.4, stage, 1, 3);
  b.add('baril', 13.6, l.top).add('baril', 25.4, r.top);
  b.in('habitue', l.cell(0, 1)).in('habitue', r.cell(0, 2), 2);
  const f = b.fort(19.5, stage, 2, 1, { m: 'glace', roof: 'bois' });
  b.in('gardien', f.cell(0, 0)).in('habitue', f.cell(1, 0), 3);
  b.cage(31, 0, 'jbg');
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
  b.stack(12.6, 0, ['enceinte', 'enceinte-rose']);
  b.stack(13.6, 0, ['enceinte']);
  const f = b.fort(19, 0, 3, 1, { m: 'metal', ceil: 'glace' });
  b.in('gardien', f.cell(0, 0)).put('caisson', f.cell(1, 0)).in('gardien', f.cell(2, 0), 2);
  const u = b.fort(19, f.top, 2, 1, { m: 'glace', roof: 'metal' });
  b.in('habitue', u.cell(0, 0)).in('habitue', u.cell(1, 0), 2);
  const s = scaffold(b, 26.5, 0, 1, 3, 'glace');
  b.in('habitue', s.cell(0, 1), 3);
  b.add('caisson-rose', 26.5, 0);
  return b.level({
    id: '2-6',
    name: 'Le carré VIP',
    friends: ['tom', 'jbm', 'jbg', 'mat'],
    tip: 'Le métal ne casse presque pas. Le caisson explosif, lui, si.',
  });
}

function confettis() {
  const b = new Build();
  rubble(b, 9.6, 0, 2, 41, ['bois', 'glace']);
  b.relou('habitue', 14.2, 0);
  rubble(b, 15.1, 0, 2, 52, ['glace', 'bois']);
  b.relou('gardien', 19.6, 0);
  b.add('baril', 20.9, 0);
  rubble(b, 21.8, 0, 2, 63, ['bois']);
  b.relou('habitue', 26.2, 0, 2);
  const s = scaffold(b, 29, 0, 1, 2, 'glace');
  b.in('habitue', s.cell(0, 1), 3);
  return b.level({ id: '2-7', name: 'Pluie de confettis', friends: ['tom', 'jbm', 'mat', 'roulian'] });
}

function lesGradins() {
  const b = new Build();
  const steps = [1.2, 2.4, 3.6, 4.8];
  steps.forEach((top, i) => b.plateau(11 + i * 4.5, 34, top));
  b.wall(11.2, 1.2, 1, 2, 'glace', 0.8);
  b.relou('habitue', 13.6, 1.2);
  b.wall(15.7, 2.4, 1, 2, 'glace', 0.8);
  b.relou('gardien', 18.1, 2.4);
  b.wall(20.2, 3.6, 1, 2, 'bois', 0.8);
  b.relou('habitue', 22.6, 3.6, 2);
  const f = b.fort(28.5, 4.8, 2, 2, { mats: ['bois', 'glace'], roof: 'bois' });
  b.in('habitue', f.cell(0, 0), 3).in('gardien', f.cell(1, 0)).in('habitue', f.cell(1, 1), 4);
  return b.level({
    id: '2-8',
    name: 'Les gradins',
    friends: ['jbg', 'tom', 'jbm', 'mat'],
    tip: 'Chaque gradin a son muret : la boule de feu de JBG file à plat par-dessus les marches.',
  });
}

function backstage() {
  const b = new Build();
  const l = b.fort(13.5, 0, 1, 2, { roof: 'bois' });
  b.in('habitue', l.cell(0, 0)).in('habitue', l.cell(0, 1), 2);
  b.add('tnt', 15.8, 0);
  const c = chimney(b, 19, 0, 3, 'metal');
  b.in('gardien', c);
  b.add('tnt', 22.2, 0);
  const r = b.fort(25, 0, 2, 2, { m: 'glace', roof: 'glace' });
  b.in('habitue', r.cell(0, 0), 3).in('habitue', r.cell(1, 1), 4);
  return b.level({
    id: '2-9',
    name: 'Le backstage',
    friends: ['mat', 'jbg', 'tom', 'jbm'],
    tip: 'Le gardien est au fond d’un puits de métal : les deux caisses de TNT à ses pieds sont la clé.',
  });
}

function pilierAuBar() {
  const b = new Build();
  const bar = b.fort(19, 0, 3, 1, { m: 'metal', ceil: 'bois' });
  b.in('habitue', bar.cell(0, 0)).in('pilier', bar.cell(1, 0)).in('habitue', bar.cell(2, 0), 2);
  const s = scaffold(b, 19, bar.top, 3, 2);
  b.put('baril', s.cell(0, 1)).put('baril', s.cell(2, 1)).in('gardien', s.cell(1, 0));
  b.in('habitue', s.cell(1, 1), 3);
  b.stack(12.5, 0, ['enceinte', 'enceinte-rose']);
  return b.level({ id: '2-10', name: 'Le pilier du bar', friends: ['jbm', 'jbg', 'tom', 'mat'] });
}

function toursDeSon() {
  const b = new Build();
  const top = b.island(11.5, 16, 4.5);
  b.stack(12.6, top, ['enceinte', 'enceinte-rose']);
  b.relou('habitue', 14.6, top);
  b.relou('habitue', 14, 0, 2);
  b.stack(16.5, 0, ['enceinte', 'enceinte']);
  const p = bridge(b, 22, 30, 0, 2, 'glace', 'metal');
  b.relou('gardien', 26, p.deck).add('baril', 24, p.deck);
  b.in('habitue', p.a.cell(0, 0), 3).in('habitue', p.b.cell(0, 1), 4);
  b.relou('habitue', 26, 0);
  return b.level({ id: '2-11', name: 'Les tours de son', friends: ['jbg', 'jbm', 'tom', 'roulian', 'mat'] });
}

function djBoucle() {
  const b = new Build();
  const stage = b.plateau(16, 32, 1.2);
  b.relou('dj', 24, stage);
  const p = bridge(b, 18.2, 29.8, stage, 3, 'metal', 'metal');
  b.add('baril', 22.2, p.deck).add('baril', 25.8, p.deck).add('tnt', 24, p.deck);
  b.in('habitue', p.a.cell(0, 1)).in('gardien', p.b.cell(0, 0)).in('habitue', p.b.cell(0, 2), 2);
  const f = greenhouse(b, 12, 0, 2, 1);
  b.in('habitue', f.cell(0, 0), 3).in('habitue', f.cell(1, 0));
  b.cage(35.5, 0, 'lolo');
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

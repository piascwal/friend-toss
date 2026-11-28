/* Monde 1 — Le Camping : le bois, les pièces sur plusieurs étages, les roues, la TNT, les collines. */
import { Build } from './build';
import type { WorldDef } from './index';

function premierTir() {
  const b = new Build();
  b.in('habitue', b.fort(13, 0, 1, 1, { roof: 'bois' }).cell(0, 0));
  b.relou('habitue', 17.5, b.pyramid(17.5, 0, 3));
  return b.level({
    id: '1-1',
    name: 'Premier tir',
    friends: ['roulian', 'roulian', 'roulian'],
    tip: "Pose le doigt sur le canon, tire vers l'arrière pour viser, relâche pour tirer.",
  });
}

function deuxEtages() {
  const b = new Build(102);
  const a = b.tower(12, b.ledge(10, 14, 1.4), 2, { roof: 'toit' });
  b.in('habitue', a.cell(0)).in('habitue', a.cell(1), 2);
  const [g1, g2] = b.terraces(16, [
    [5.5, 0.9],
    [4, 1.8],
  ]);
  const c = b.tower(g1.mid, g1.y, 2, { roof: 'creneaux', mats: ['bois', 'bois', 'pierre'] });
  b.in('habitue', c.cell(1), 3);
  b.clutter(g2.a, g2.b, g2.y, ['bois', 'pierre']);
  b.clutter(g2.b + 1.8, g2.b + 5.4, b.island(g2.b + 1.4, g2.b + 5.8, 5.4), ['bois']);
  return b.level({
    id: '1-2',
    name: 'Deux étages',
    friends: ['roulian', 'roulian', 'roulian'],
    tip: 'Vise le bas : quand le rez-de-chaussée lâche, tout l’étage tombe.',
  });
}

function laCage() {
  const b = new Build(103);
  const [g] = b.terraces(9.6, [[5.4, 1]]);
  const t = b.tower(g.mid, g.y, 2, { roof: 'rien' });
  b.in('habitue', t.cell(0)).in('habitue', t.cell(1), 2);
  const top = b.island(15.8, 21.6, 5.6);
  b.arch(g.mid + 0.6, t.top, 16.6, top, Math.max(t.top, top) + 1.6, ['bois']);
  const h = b.tower(18.6, top, 1, { roof: 'toit' });
  b.in('habitue', h.cell(0), 3);
  b.cage(20.9, top, 'mat');
  b.relou('habitue', 19.8, 0, 4);
  b.clutter(17.9, 19, 0, ['bois']);
  return b.level({
    id: '1-3',
    name: 'La cage',
    friends: ['roulian', 'roulian', 'roulian'],
    tip: 'Un ami est enfermé dans la cage ! Gagne le niveau pour le libérer (casse la cage : bonus).',
  });
}

function leMur() {
  const b = new Build(104);
  const [g] = b.terraces(9.4, [[7.6, 0.8]]);
  b.in('habitue', b.tower(g.a + 1.85, g.y, 1, { roof: 'creneaux' }).cell(0));
  b.wall(g.b - 1.95, g.y, 2, 3, 'bois', 0.95);
  const r = b.tower(20.6, b.ledge(18.4, 25, 1.6), 2, { roof: 'toit' });
  b.in('habitue', r.cell(0), 2).in('habitue', r.cell(1), 3);
  b.clutter(22.5, 25, 1.6, ['bois', 'pierre']);
  b.clutter(26.6, 30.4, b.island(26.2, 30.8, 6), ['bois']);
  return b.level({
    id: '1-4',
    name: 'Le mur de caisses',
    friends: ['mat', 'mat', 'mat'],
    tip: 'MAT : touche l’écran pendant son vol pour la Ruée. Il fonce et transperce le bois.',
  });
}

function laColline() {
  const b = new Build(105);
  const a = b.tower(13, b.peak(13, 7, 3.2, 2.2), 2, { roof: 'rien' });
  b.in('habitue', a.cell(0)).in('habitue', a.cell(1), 2);
  const c = b.tower(22.5, b.peak(22.5, 8, 3.6, 3.4), 1, { roof: 'rien' });
  b.in('habitue', c.cell(0), 3);
  const p = b.arch(14, a.top, 21.5, c.top, Math.max(a.top, c.top) + 1.8, ['bois']);
  b.relou('habitue', 17.8, p.top, 4);
  b.clutter(15, 17, p.top, ['bois']).clutter(18.7, 21, p.top, ['bois', 'pierre']);
  b.relou('habitue', 17.8, 0);
  b.clutter(27.2, 31.2, b.island(26.8, 31.6, 7), ['bois', 'pierre']);
  return b.level({ id: '1-5', name: 'La colline', friends: ['roulian', 'mat', 'mat', 'roulian'] });
}

function leVideur() {
  const b = new Build(106);
  const [g] = b.terraces(10.4, [[5.4, 0.8]]);
  const l = b.tower(g.mid, g.y, 3, { w: 2.4, roof: 'rien' });
  b.in('habitue', l.cell(0)).in('habitue', l.cell(2), 2);
  const k = b.tower(19.6, b.ledge(17.4, 22.4, 2), 2, {
    w: 3,
    roof: 'rien',
    mats: ['bois', 'bois', 'pierre'],
  });
  b.in('gardien', k.cell(0)).in('habitue', k.cell(1), 3);
  const p = b.arch(g.mid + 0.7, l.top, 18.6, k.top, Math.max(l.top, k.top) + 1.4, ['bois', 'pierre']);
  b.crenels((g.mid + 19.3) / 2, p.top, 3.4, 'bois');
  b.in('habitue', b.tower(26.6, b.peak(26.6, 6.4, 3.8, 1.4), 1, { roof: 'toit' }).cell(0), 4);
  b.clutter(30.4, 34.2, b.island(30, 34.6, 6.2), ['bois']);
  return b.level({
    id: '1-6',
    name: 'Le gardien',
    friends: ['mat', 'roulian', 'mat'],
    tip: 'Le gardien encaisse : fais-lui tomber les étages dessus.',
  });
}

function lesRoues() {
  const b = new Build(107);
  const a = b.tower(12.5, b.ledge(10.5, 14.5, 1.5), 2, { roof: 'boule' });
  b.in('habitue', a.cell(0)).in('habitue', a.cell(1), 2);
  b.relou('gardien', 17.4, 0);
  const top = b.island(19.6, 26.4, 6);
  b.in('habitue', b.tower(23, top, 1, { roof: 'boule' }).cell(0), 3);
  b.ball(20.4, top, 'bois', 0.9);
  b.ball(25.6, top, 'pierre', 0.8);
  b.in('habitue', b.tower(23, 0, 1, { roof: 'rien', w: 2.4 }).cell(0), 4);
  b.cage(28.8, b.peak(28.8, 5, 2.6, 1.2), 'tom');
  return b.level({
    id: '1-7',
    name: 'Les roues',
    friends: ['roulian', 'mat', 'mat', 'roulian'],
    tip: 'Les roues en haut des tours tombent sur les voisines…',
  });
}

function visionTriple() {
  const b = new Build(108);
  b.in('habitue', b.tower(12.5, 0, 1, { mats: ['glace', 'bois'], roof: 'toit' }).cell(0));
  b.in(
    'habitue',
    b.tower(17.5, b.peak(17.5, 6, 2.8, 2), 1, { w: 2.4, mats: ['glace'], roof: 'toit' }).cell(0),
    2,
  );
  const top = b.island(21.4, 25.6, 4.4);
  b.in('habitue', b.tower(23.5, top, 1, { w: 2.4, mats: ['glace', 'bois'], roof: 'cadre' }).cell(0), 3);
  b.relou('habitue', 23.5, 0, 4);
  return b.level({
    id: '1-8',
    name: 'Vision triple',
    friends: ['tom', 'tom', 'tom'],
    tip: 'TOM : touche en vol, il voit triple. Trois TOM pour trois cabanes.',
  });
}

function laTnt() {
  const b = new Build(109);
  const top = b.tunnel(11.5, 18.5, 3.4);
  const t = b.tower(15, top, 2, { roof: 'rien' });
  b.in('habitue', t.cell(0)).in('habitue', t.cell(1), 2);
  b.add('tnt', 15, t.top);
  b.relou('habitue', 15.6, 0, 3).add('tnt', 14.2, 0);
  const [g] = b.terraces(19.6, [[6, 1.2]]);
  const r = b.tower(g.mid, g.y, 2, { roof: 'toit' });
  b.clutter(g.b + 1.9, g.b + 5.6, b.island(g.b + 1.5, g.b + 6, 6), ['bois']);
  b.put('tnt', r.cell(0)).in('habitue', r.cell(1), 4);
  return b.level({
    id: '1-9',
    name: 'Boum',
    friends: ['roulian', 'mat', 'tom'],
    tip: 'La TNT saute au premier choc. Celle du tunnel ne se touche qu’en tirant à plat.',
  });
}

function lePont() {
  const b = new Build(110);
  const a = b.tower(12.5, b.peak(12.5, 7, 3, 2.5), 1, { roof: 'rien' });
  const c = b.tower(25, b.peak(25, 8, 3.4, 3), 1, { roof: 'rien' });
  b.in('habitue', a.cell(0)).in('habitue', c.cell(0), 2);
  const p = b.arch(13.4, a.top, 24.1, c.top, Math.max(a.top, c.top) + 1.2, ['bois', 'pierre']);
  b.relou('habitue', 16.8, p.top, 3).relou('habitue', 20.8, p.top, 4);
  b.clutter(17.7, 19.9, p.top, ['bois', 'pierre']);
  b.relou('pilier', 18.4, 0);
  b.add('tnt', 20.4, 0);
  b.clutter(28.8, 32.6, b.island(28.4, 33, 7.6), ['bois', 'pierre']);
  return b.level({
    id: '1-10',
    name: 'Le pont',
    friends: ['mat', 'tom', 'roulian', 'mat'],
    tip: 'Le pilier : le gros relou. Il ne craint pas grand-chose… sauf la TNT.',
  });
}

function leChaletPerche() {
  const b = new Build(111);
  const [g] = b.terraces(9.6, [[5.4, 0.8]]);
  const t = b.tower(g.mid, g.y, 2, { roof: 'rien', mats: ['bois', 'glace'] });
  b.in('habitue', t.cell(1));
  const top = b.island(16.8, 23.6, 5.6);
  b.arch(g.mid + 0.7, t.top, 17.6, top, Math.max(t.top, top) + 1.8, ['bois']);
  b.in('gardien', b.tower(20.4, top, 1, { w: 3, roof: 'toit' }).cell(0));
  b.add('tonneau-or', 22.9, top);
  b.wall(18.6, 0, 1, 2, 'pierre', 0.8);
  b.relou('habitue', 20.4, 0, 2);
  const r = b.tower(28.5, b.peak(28.5, 7, 3.8, 2), 2, { roof: 'toit' });
  b.in('habitue', r.cell(0), 3).in('habitue', r.cell(1), 4);
  return b.level({ id: '1-11', name: 'Le chalet perché', friends: ['tom', 'mat', 'roulian', 'mat'] });
}

function leFort() {
  const b = new Build(112);
  const [g1, g2] = b.terraces(8.2, [
    [3.4, 0.6],
    [5.6, 1.2],
  ]);
  b.wall(g1.mid - 0.9, g1.y, 2, 1, 'bois', 0.9);
  const l = b.tower(g2.mid, g2.y, 3, { w: 2.6, roof: 'rien' });
  b.in('gardien', l.cell(0)).in('habitue', l.cell(2));
  const k = b.tower(23, b.ledge(19, 27, 2.2), 2, { w: 3.2, h: 2, roof: 'rien', mats: ['bois', 'pierre'] });
  b.in('pilier', k.cell(0)).in('habitue', k.cell(1), 2);
  const p = b.arch(g2.mid + 0.9, l.top, 21.8, k.top, Math.max(l.top, k.top) + 1.3, ['bois', 'pierre']);
  b.relou('habitue', g2.mid + 1.7, p.top, 3);
  b.clutter(g2.mid + 2.6, 21.2, p.top, ['bois', 'pierre']);
  b.crenels(24.1, k.top, 1.4, 'pierre');
  b.cage(26.1, 2.2, 'jbm');
  const r = b.tower(31.2, b.peak(31.2, 6.6, 4.2, 1.6), 2, { roof: 'creneaux' });
  b.clutter(35, 38.8, b.island(34.6, 39.2, 7.2), ['bois', 'pierre']);
  b.put('tnt', r.cell(0)).in('habitue', r.cell(1), 4);
  return b.level({
    id: '1-12',
    name: 'Le fort du camping',
    friends: ['mat', 'tom', 'roulian', 'mat', 'tom'],
    tip: 'La grande forteresse : commence par ce qui la tient debout.',
  });
}

export const CAMPING: WorldDef = {
  id: 1,
  name: 'Le Camping',
  theme: 'camping',
  tagline: 'Les relous ont envahi notre coin de camping.',
  color: '#5fb84a',
  levels: [
    premierTir(),
    deuxEtages(),
    laCage(),
    leMur(),
    laColline(),
    leVideur(),
    lesRoues(),
    visionTriple(),
    laTnt(),
    lePont(),
    leChaletPerche(),
    leFort(),
  ],
};

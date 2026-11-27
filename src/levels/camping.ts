/* Monde 1 — Le Camping : le bois, les pièces sur plusieurs étages, les roues, la TNT, les collines. */
import { Build } from './build';
import { bridge, castle, rubble, scaffold, stilts } from './pieces';
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
  const b = new Build();
  const f = b.fort(14, 0, 1, 2, { roof: 'bois' });
  b.in('habitue', f.cell(0, 0)).in('habitue', f.cell(0, 1), 2);
  b.relou('habitue', 18.5, b.wall(17.5, 0, 2, 2), 3);
  return b.level({
    id: '1-2',
    name: 'Deux étages',
    friends: ['roulian', 'roulian', 'roulian'],
    tip: 'Vise le bas : quand le rez-de-chaussée lâche, tout l’étage tombe.',
  });
}

function laCage() {
  const b = new Build();
  const f = b.fort(15, 0, 2, 2);
  b.in('habitue', f.cell(0, 0)).in('habitue', f.cell(1, 0), 2).in('habitue', f.cell(0, 1), 3);
  b.cage(15, f.top, 'mat');
  b.stack(19.5, 0, ['tonneau', 'tonneau']);
  return b.level({
    id: '1-3',
    name: 'La cage',
    friends: ['roulian', 'roulian', 'roulian'],
    tip: 'Un ami est enfermé dans la cage ! Gagne le niveau pour le libérer (casse la cage : bonus).',
  });
}

function leMur() {
  const b = new Build();
  b.wall(12, 0, 2, 4);
  const f = b.fort(18, 0, 2, 2, { roof: 'bois' });
  b.in('habitue', f.cell(0, 0)).in('habitue', f.cell(1, 0), 2).in('habitue', f.cell(1, 1), 3);
  return b.level({
    id: '1-4',
    name: 'Le mur de caisses',
    friends: ['mat', 'mat', 'mat'],
    tip: 'MAT : touche l’écran pendant son vol pour la Ruée. Il fonce et transperce le bois.',
  });
}

function laColline() {
  const b = new Build();
  b.relief([
    [-10, 0],
    [6, 0],
    [9, 2],
    [19, 2],
    [21, 4.5],
    [33, 4.5],
    [35, 0],
    [60, 0],
  ]);
  const f = b.fort(11.9, 2, 1, 2, { roof: 'bois' });
  b.in('habitue', f.cell(0, 0)).in('habitue', f.cell(0, 1), 2);
  rubble(b, 13.4, 2, 2, 5);
  const s = scaffold(b, 26.5, 4.5, 2, 3);
  b.in('habitue', s.cell(0, 0), 3).in('habitue', s.cell(1, 1)).in('habitue', s.cell(0, 2), 2);
  b.ball(27.6, s.top, 'bois', 0.9);
  return b.level({ id: '1-5', name: 'La colline', friends: ['roulian', 'mat', 'mat', 'roulian'] });
}

function leVideur() {
  const b = new Build();
  const c = castle(b, 18, 0, { m: 'bois', wall: 'bois', cols: 2, floors: 1, towers: 2 });
  b.in('gardien', c.keep.cell(0, 0)).in('habitue', c.keep.cell(1, 0));
  b.in('habitue', c.left.cell(0, 1), 2).in('habitue', c.right.cell(0, 0), 3);
  return b.level({
    id: '1-6',
    name: 'Le gardien',
    friends: ['mat', 'roulian', 'mat'],
    tip: 'Le gardien encaisse : fais-lui tomber les étages dessus.',
  });
}

function lesRoues() {
  const b = new Build();
  b.relief([
    [-10, 0],
    [8, 0],
    [10, 1.5],
    [16, 1.5],
    [18, 0],
    [24, 0],
    [26, 3],
    [34, 3],
    [36, 0],
    [60, 0],
  ]);
  const a = b.fort(13, 1.5, 1, 3);
  b.ball(13, a.top, 'bois', 1);
  b.in('habitue', a.cell(0, 0)).in('habitue', a.cell(0, 2), 2);
  b.relou('gardien', 21, 0);
  const s = scaffold(b, 30, 3, 2, 2);
  b.ball(29, s.top, 'bois', 1);
  b.ball(31, s.top, 'bois', 1);
  b.in('habitue', s.cell(0, 0), 3).in('habitue', s.cell(1, 1), 4);
  b.cage(39, 0, 'tom');
  return b.level({
    id: '1-7',
    name: 'Les roues',
    friends: ['roulian', 'mat', 'mat', 'roulian'],
    tip: 'Les roues en haut des tours tombent sur les voisines…',
  });
}

function visionTriple() {
  const b = new Build();
  b.in('habitue', b.fort(12, 0, 1, 1).cell(0, 0));
  b.in('habitue', b.fort(15.8, b.wall(14.8, 0, 2, 1), 1, 1).cell(0, 0), 2);
  b.in('habitue', b.fort(19.5, 0, 1, 1).cell(0, 0), 3);
  b.in('habitue', b.fort(23, b.wall(22, 0, 2, 2), 1, 1).cell(0, 0), 4);
  return b.level({
    id: '1-8',
    name: 'Vision triple',
    friends: ['tom', 'tom', 'tom'],
    tip: 'TOM : touche en vol, il voit triple. Trois TOM pour trois cabanes.',
  });
}

function laTnt() {
  const b = new Build();
  rubble(b, 9.5, 0, 2, 21);
  b.add('tnt', 14.4, 0);
  const s = scaffold(b, 19, 0, 3, 3);
  b.put('tnt', s.cell(2, 2));
  b.in('habitue', s.cell(0, 0)).in('habitue', s.cell(2, 0), 2).in('habitue', s.cell(0, 1), 3);
  b.in('habitue', s.cell(1, 2), 4);
  const f = b.fort(26.5, 0, 1, 1, { roof: 'bois' });
  b.in('habitue', f.cell(0, 0));
  b.add('tnt', 24.2, 0);
  return b.level({ id: '1-9', name: 'Boum', friends: ['roulian', 'mat', 'tom'] });
}

function lePont() {
  const b = new Build();
  b.relief([
    [-10, 0],
    [8, 0],
    [10, 2.5],
    [16, 2.5],
    [18, 0],
    [23, 0],
    [25, 2.5],
    [32, 2.5],
    [34, 0],
    [60, 0],
  ]);
  const p = bridge(b, 13, 28.5, 2.5, 2);
  b.relou('habitue', 17.5, p.deck).relou('habitue', 23.5, p.deck, 2);
  b.relou('pilier', 19.8, 0);
  b.add('tnt', 21.6, 0);
  b.in('habitue', p.a.cell(0, 0), 3).in('habitue', p.b.cell(0, 1), 4);
  return b.level({
    id: '1-10',
    name: 'Le pont',
    friends: ['mat', 'tom', 'roulian', 'mat'],
    tip: 'Le pilier : le gros relou. Il ne craint pas grand-chose… sauf la TNT.',
  });
}

function leChaletPerche() {
  const b = new Build();
  const room = stilts(b, 12.5, 0, 3);
  b.in('habitue', room);
  const top = b.island(17.5, 25, 5);
  const c = b.fort(21, top, 2, 1, { roof: 'bois' });
  b.in('gardien', c.cell(0, 0)).in('habitue', c.cell(1, 0), 2);
  b.add('tonneau-or', 24.3, top);
  const s = scaffold(b, 30, 0, 1, 3);
  b.in('habitue', s.cell(0, 0), 3).in('habitue', s.cell(0, 2));
  return b.level({ id: '1-11', name: 'Le chalet perché', friends: ['tom', 'mat', 'roulian', 'mat'] });
}

function leFort() {
  const b = new Build();
  rubble(b, 9.5, 0, 3, 7);
  const c = castle(b, 23, 0, { m: 'bois', wall: 'bois', cols: 3, floors: 2, towers: 3 });
  b.in('pilier', c.keep.cell(1, 0)).put('tnt', c.keep.cell(2, 0));
  b.in('habitue', c.keep.cell(0, 0)).in('habitue', c.keep.cell(0, 1), 2).in('gardien', c.keep.cell(2, 1));
  b.in('gardien', c.left.cell(0, 0)).in('habitue', c.left.cell(0, 2), 3);
  b.in('habitue', c.right.cell(0, 1), 4);
  b.cage(35.5, 0, 'jbm');
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

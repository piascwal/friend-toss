/* Monde 1 — Le Camping : le bois, les pièces sur plusieurs étages, les roues, la TNT, les collines. */
import { Build } from './build';
import type { WorldDef } from './index';

function premierTir() {
  const b = new Build();
  b.in('fetard', b.fort(13, 0, 1, 1, { roof: 'bois' }).cell(0, 0));
  b.relou('fetard', 17.5, b.pyramid(17.5, 0, 3));
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
  b.in('fetard', f.cell(0, 0)).in('fetard', f.cell(0, 1), 2);
  b.relou('fetard', 18.5, b.wall(17.5, 0, 2, 2), 3);
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
  b.in('fetard', f.cell(0, 0)).in('fetard', f.cell(1, 0), 2).in('fetard', f.cell(0, 1), 3);
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
  b.in('fetard', f.cell(0, 0)).in('fetard', f.cell(1, 0), 2).in('fetard', f.cell(1, 1), 3);
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
    [8, 0],
    [11, 1.5],
    [25, 1.5],
    [28, 0],
    [60, 0],
  ]);
  const f = b.fort(18, 1.5, 3, 2, { taper: true, roof: 'bois' });
  b.in('fetard', f.cell(0, 0))
    .in('fetard', f.cell(1, 0), 2)
    .in('fetard', f.cell(2, 0), 3)
    .in('fetard', f.cell(0, 1), 4);
  return b.level({ id: '1-5', name: 'La colline', friends: ['roulian', 'mat', 'mat'] });
}

function leVideur() {
  const b = new Build();
  const f = b.fort(16, 0, 2, 3, { roof: 'bois' });
  b.in('videur', f.cell(0, 0))
    .in('fetard', f.cell(1, 0))
    .in('fetard', f.cell(0, 1), 2)
    .in('fetard', f.cell(1, 2), 3);
  b.stack(19.8, 0, ['tonneau', 'tonneau', 'tonneau']);
  return b.level({
    id: '1-6',
    name: 'Le videur',
    friends: ['mat', 'roulian', 'mat'],
    tip: 'Le videur encaisse : fais-lui tomber les étages dessus.',
  });
}

function lesRoues() {
  const b = new Build();
  const a = b.fort(12.5, 0, 1, 3);
  b.ball(12.5, a.top, 'bois', 1);
  b.in('fetard', a.cell(0, 0)).in('fetard', a.cell(0, 2), 2);
  b.in('fetard', b.fort(16, 0, 1, 2, { roof: 'bois' }).cell(0, 1), 3);
  const c = b.fort(19.5, 0, 1, 3);
  b.ball(19.5, c.top, 'bois', 1);
  b.in('fetard', c.cell(0, 0), 4).in('videur', c.cell(0, 1));
  b.cage(23.5, 0, 'tom');
  return b.level({
    id: '1-7',
    name: 'Les roues',
    friends: ['roulian', 'mat', 'mat', 'roulian'],
    tip: 'Les roues en haut des tours tombent sur les voisines…',
  });
}

function visionTriple() {
  const b = new Build();
  b.in('fetard', b.fort(12, 0, 1, 1).cell(0, 0));
  b.in('fetard', b.fort(15.8, b.wall(14.8, 0, 2, 1), 1, 1).cell(0, 0), 2);
  b.in('fetard', b.fort(19.5, 0, 1, 1).cell(0, 0), 3);
  b.in('fetard', b.fort(23, b.wall(22, 0, 2, 2), 1, 1).cell(0, 0), 4);
  return b.level({
    id: '1-8',
    name: 'Vision triple',
    friends: ['tom', 'tom', 'tom'],
    tip: 'TOM : touche en vol, il voit triple. Trois TOM pour trois cabanes.',
  });
}

function laTnt() {
  const b = new Build();
  const f = b.fort(16, 0, 3, 2, { roof: 'bois' });
  b.put('tnt', f.cell(1, 0));
  b.in('fetard', f.cell(0, 0))
    .in('fetard', f.cell(2, 0), 2)
    .in('fetard', f.cell(0, 1), 3)
    .in('fetard', f.cell(2, 1), 4);
  const t = b.fort(20.6, 0, 1, 3);
  b.put('tnt', t.cell(0, 2));
  b.in('fetard', t.cell(0, 0));
  return b.level({ id: '1-9', name: 'Boum', friends: ['roulian', 'mat', 'tom'] });
}

function lePont() {
  const b = new Build();
  const a = b.fort(13, 0, 1, 3);
  const c = b.fort(21, 0, 1, 3);
  const deck = b.plank(17, a.top, 10.6);
  b.relou('fetard', 15.5, deck).relou('fetard', 18.5, deck, 2);
  b.relou('pilier', 17, 0);
  b.add('tnt', 19, 0);
  b.in('fetard', a.cell(0, 0), 3).in('fetard', c.cell(0, 1), 4);
  return b.level({
    id: '1-10',
    name: 'Le pont',
    friends: ['mat', 'tom', 'roulian', 'mat'],
    tip: 'Le pilier : le gros relou. Il ne craint pas grand-chose… sauf la TNT.',
  });
}

function leChaletPerche() {
  const b = new Build();
  b.relief([
    [-10, 0],
    [8, 0],
    [13, 4],
    [29, 4],
    [33, 0],
    [60, 0],
  ]);
  const f = b.fort(21, 4, 3, 3, { taper: true, roof: 'bois' });
  b.in('videur', f.cell(1, 0))
    .in('fetard', f.cell(0, 0))
    .in('fetard', f.cell(2, 0), 2)
    .in('fetard', f.cell(0, 2), 3);
  b.add('tnt', f.cell(1, 1).x, f.cell(1, 1).y);
  b.add('tonneau-or', 26.8, 4);
  return b.level({ id: '1-11', name: 'Le chalet perché', friends: ['tom', 'mat', 'roulian', 'mat'] });
}

function leFort() {
  const b = new Build();
  const f = b.fort(18, 0, 4, 3, { taper: true, roof: 'bois' });
  b.in('fetard', f.cell(0, 0))
    .in('pilier', f.cell(1, 0))
    .in('videur', f.cell(2, 0))
    .in('fetard', f.cell(3, 0), 2);
  b.in('fetard', f.cell(0, 1), 3).put('tnt', f.cell(1, 1)).in('fetard', f.cell(2, 1), 4);
  b.in('videur', f.cell(0, 2), 2).in('fetard', f.cell(1, 2));
  const l = b.fort(11.5, 0, 1, 2);
  b.ball(11.5, l.top, 'bois', 1);
  b.in('fetard', l.cell(0, 1), 2);
  const r = b.fort(24.5, 0, 1, 2);
  b.ball(24.5, r.top, 'bois', 1);
  b.in('fetard', r.cell(0, 0), 3);
  b.cage(28.5, 0, 'jbm');
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
  tagline: 'Les fêtards ont envahi notre coin de camping.',
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

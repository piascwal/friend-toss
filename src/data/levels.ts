/* Les mondes et leurs niveaux. Chaque monde apprend une ou deux mécaniques, puis les combine ;
   son dernier niveau est un boss. Un ami enfermé dans une cage rejoint la bande quand le niveau est gagné.
   Les positions sont en mètres (le canon est 2 m avant x = 0), le sol en y = 0, et y est le bas des pièces. */
import { Build, type LevelDef, type Theme } from '../sim/level';

export interface WorldDef {
  id: number;
  name: string;
  theme: Theme;
  tagline: string;
  /** Couleur principale (carte, HUD). */
  color: string;
  levels: LevelDef[];
}

/* ============================================================ MONDE 1 — LE CAMPING */

function l1_1() {
  const b = new Build();
  const top = b.room(13, 0, 2.2, 1.7);
  b.relou('fetard', 13, 0);
  b.roof(13, b.block(13, top), 1.4);
  b.relou('fetard', 17, b.pyramid(17, 0, 3));
  return b.level({
    id: '1-1',
    name: 'Premier tir',
    friends: ['roulian', 'roulian', 'roulian'],
    tip: "Pose le doigt sur le canon, tire vers l'arrière pour viser, relâche pour tirer.",
  });
}

function l1_2() {
  const b = new Build();
  const t = b.tower(13, 0, 2, 2.4, 1.7);
  b.roof(13, t, 2, 'bois', 1);
  b.relou('fetard', 13, 0);
  b.relou('fetard', 13, 2.15, 2);
  b.cage(16.5, b.wall(15.5, 0, 2, 2), 'mat');
  const r = b.room(20, 0, 2.2, 1.7);
  b.relou('fetard', 20, 0, 3);
  b.ball(20, r, 'bois', 0.9);
  return b.level({
    id: '1-2',
    name: 'La cage',
    friends: ['roulian', 'roulian', 'roulian'],
    tip: 'Un ami est enfermé dans la cage ! Gagne le niveau pour le libérer (casse la cage : bonus).',
  });
}

function l1_3() {
  const b = new Build();
  b.wall(12, 0, 2, 4);
  const top = b.rooms(15.5, 0, 2, 2.2, 1.7);
  b.relou('fetard', 16.6, 0);
  b.relou('fetard', 18.35, 0, 2);
  b.block(16.6, top);
  b.block(18.35, top);
  b.plank(17.475, top + 1, 2.8);
  b.relou('fetard', 17.475, top + 1 + 0.45, 3);
  b.add('tonneau', 22, b.pyramid(22, 0, 2));
  return b.level({
    id: '1-3',
    name: 'Le mur de caisses',
    friends: ['mat', 'mat', 'mat'],
    tip: 'MAT : touche l’écran pendant son vol pour la Ruée. Il fonce et transperce le bois.',
  });
}

function l1_4() {
  const b = new Build();
  b.relou('pigeon', 12.5, b.tower(12.5, 0, 2, 2, 1.6));
  b.relou('fetard', 12.5, 0);
  b.relou('pigeon', 16.5, b.tower(16.5, 0, 3, 2, 1.6), 2);
  b.relou('fetard', 16.5, 2.05, 2);
  b.relou('pigeon', 20.5, b.tower(20.5, 0, 2, 2, 1.6), 3);
  b.relou('fetard', 20.5, 0, 3);
  b.add('tonneau-or', 23.5, b.block(23.5, 0));
  return b.level({
    id: '1-4',
    name: 'Pigeons perchés',
    friends: ['roulian', 'mat', 'mat'],
    tip: 'Les tours tombent mieux quand on vise leur base… et elles tombent sur les voisines.',
  });
}

function l1_5() {
  const b = new Build();
  const f1 = b.rooms(12, 0, 3, 2.3, 1.7);
  b.relou('fetard', 13.15, 0);
  b.relou('fetard', 15, 0, 2);
  b.relou('fetard', 16.85, 0, 3);
  const f2 = b.rooms(13.075, f1, 2, 2.3, 1.7);
  b.relou('fetard', 14.225, f1, 4);
  b.relou('fetard', 16.075, f1, 1);
  const f3 = b.room(15.15, f2, 2.3, 1.7);
  b.relou('pigeon', 15.15, f2);
  b.roof(15.15, f3, 2.4, 'bois', 1.1);
  b.stack(19.6, 0, ['tonneau', 'tonneau']);
  b.cage(22.5, 0, 'tom');
  return b.level({
    id: '1-5',
    name: 'Le grand chalet',
    friends: ['roulian', 'mat', 'mat', 'roulian'],
  });
}

function l1_6() {
  const b = new Build();
  b.plateau(11, 25, 1.2);
  b.roof(12.5, b.tower(12.5, 1.2, 2, 2, 1.6), 2.2, 'bois', 1);
  b.relou('fetard', 12.5, 1.2);
  b.relou('fetard', 12.5, 3.25, 2);
  const hall = b.rooms(14.5, 1.2, 2, 2.6, 1.9);
  b.relou('videur', 15.8, 1.2);
  b.relou('fetard', 17.95, 1.2, 3);
  b.add('tronc', 15.8, hall);
  b.add('tronc', 17.95, hall);
  b.roof(16.875, b.plank(16.875, hall + 0.8, 4.6), 2.2);
  b.relou('pigeon', 21, b.tower(21, 1.2, 2, 2, 1.6), 2);
  b.relou('fetard', 21, 1.2, 4);
  return b.level({
    id: '1-6',
    name: 'Le fort du camping',
    friends: ['mat', 'roulian', 'mat', 'roulian', 'mat'],
    tip: 'Le videur est costaud : fais-lui tomber les troncs dessus.',
  });
}

/* ============================================================ MONDE 2 — LE FESTIVAL */

function l2_1() {
  const b = new Build();
  b.room(12.5, 0, 3, 1.7);
  b.relou('fetard', 12, 0);
  b.add('baril', 13.1, 0);
  const t = b.tower(16.5, 0, 3, 2, 1.6);
  b.relou('fetard', 16.5, 0, 2);
  b.relou('fetard', 16.5, 2.05, 3);
  b.add('baril', 16.5, 4.1);
  b.relou('pigeon', 16.5, t);
  b.room(20.5, 0, 3, 1.7);
  b.relou('fetard', 21, 0, 4);
  b.add('baril', 19.9, 0);
  b.roof(12.5, 2.15, 2.6);
  b.roof(20.5, 2.15, 2.6);
  return b.level({
    id: '2-1',
    name: 'Ça va péter',
    friends: ['roulian', 'mat', 'roulian'],
    tip: 'Les barils explosent au moindre choc… et font exploser leurs voisins.',
  });
}

function l2_2() {
  const b = new Build();
  b.roof(12.5, b.tower(12.5, 0, 2, 2.2, 1.6, 'glace'), 2, 'glace', 1);
  b.relou('fetard', 12.5, 0);
  b.relou('fetard', 12.5, 2.05, 2);
  b.relou('pigeon', 16, b.tower(16, 0, 3, 2.2, 1.6, 'glace'));
  b.relou('fetard', 16, 2.05, 3);
  b.relou('fetard', 16, 4.1, 4);
  b.relou('pigeon', 19.5, b.pyramid(19.5, 0, 2, 'glace'), 2);
  return b.level({
    id: '2-2',
    name: 'Le bar à glaçons',
    friends: ['tom', 'tom', 'tom'],
    tip: 'TOM : touche en vol, il voit triple. Trois TOM contre la glace, c’est radical.',
  });
}

function l2_3() {
  const b = new Build();
  b.stack(11.5, 0, ['enceinte', 'enceinte']);
  b.stack(12.6, 0, ['enceinte']);
  const r = b.room(16, 0, 3.4, 1.8, 'metal', 'metal');
  b.relou('videur', 15.4, 0);
  b.add('caisson', 16.7, 0);
  b.block(14.9, r);
  b.block(17.1, r);
  b.relou('fetard', 16, r);
  b.tower(20.5, 0, 2, 2, 1.6);
  b.relou('fetard', 20.5, 0, 2);
  b.add('baril', 20.5, 2.05);
  b.cage(23.5, 0, 'jbm');
  return b.level({
    id: '2-3',
    name: 'Le carré VIP',
    friends: ['tom', 'mat', 'roulian', 'mat'],
    tip: 'Le métal ne casse presque pas. Le caisson explosif, lui, si.',
  });
}

function l2_4() {
  const b = new Build();
  [12, 14.9, 17.8, 20.7].forEach((x, i) => {
    const top = b.tower(x, 0, 2, 2, 1.6, i % 2 ? 'glace' : 'bois');
    b.relou(i % 2 ? 'fetard' : 'supporter', x, 0, i + 1);
    if (i === 1) b.add('caisson-rose', x, top);
    else b.relou('pigeon', x, top, i + 1);
  });
  return b.level({
    id: '2-4',
    name: 'Le pogo',
    friends: ['jbm', 'jbm', 'jbm'],
    tip: 'JBM : touche en vol pour la Paume de souffle. Déclenche-la au milieu des tours.',
  });
}

function l2_5() {
  const b = new Build();
  b.add('caisson-rose', 11.5, 0);
  const t = b.tower(15, 0, 4, 2.6, 1.7, 'bois', 'glace');
  b.relou('fetard', 15, 0);
  b.relou('videur', 15, 2.15, 2);
  b.relou('fetard', 15, 4.3, 3);
  b.add('baril', 15, 6.45);
  b.relou('pigeon', 15, t);
  b.stack(18.5, 0, ['enceinte', 'enceinte']);
  b.add('bidon', 22, b.room(22, 0, 2.4, 1.7));
  b.relou('fetard', 22, 0, 4);
  b.add('tonneau-or', 24.5, 0);
  return b.level({
    id: '2-5',
    name: 'Pluie de confettis',
    friends: ['tom', 'jbm', 'mat', 'roulian'],
  });
}

function l2_6() {
  const b = new Build();
  b.plateau(19, 31, 1.6);
  b.relou('dj', 25.5, 1.6);
  b.relou('baffle', 21.5, 1.6, 1);
  b.relou('baffle', 29.5, 1.6, 3);
  b.pillar(23.3, 1.6, 4.2, 'metal');
  b.pillar(27.7, 1.6, 4.2, 'metal');
  const roof = b.plank(25.5, 5.8, 5.2, 'metal');
  b.add('baril', 24.3, roof);
  b.add('baril', 26.7, roof);
  b.room(15, 0, 2.4, 1.8, 'bois', 'metal');
  b.relou('videur', 15, 0);
  b.add('baril', 17.5, 0);
  b.cage(33.5, 0, 'lolo');
  return b.level({
    id: '2-6',
    name: 'BOSS : DJ Boucle',
    friends: ['jbm', 'tom', 'mat', 'roulian', 'jbm'],
    tip: 'Les barils en haut de l’échafaudage tombent pile sur la scène…',
  });
}

/* ============================================================ MONDE 3 — LA MONTAGNE */

function l3_1() {
  const b = new Build();
  b.roof(13, b.tower(13, 0, 2, 2.4, 1.8, 'pierre'), 2.2, 'pierre', 1);
  b.relou('yeti', 13, 0);
  b.relou('fetard', 13, 2.25);
  b.block(17.5, b.tower(17.5, 0, 2, 2.4, 1.8, 'pierre'), 'pierre');
  b.relou('fetard', 17.5, 0, 2);
  b.relou('yeti', 17.5, 2.25);
  return b.level({
    id: '3-1',
    name: 'Séisme',
    friends: ['lolo', 'lolo', 'lolo'],
    tip: 'LOLO : place-le au-dessus d’une tour en pierre, puis touche. Il pique et fait tout trembler.',
  });
}

function l3_2() {
  const b = new Build();
  b.plateau(10, 17, 4.5);
  b.ball(13.5, 4.5, 'pierre', 1.3);
  b.ball(15.6, 4.5, 'pierre', 1.3);
  b.room(19, 0, 2.6, 1.8, 'glace');
  b.relou('yeti', 19, 0);
  const r = b.room(22.5, 0, 2.6, 1.8, 'glace');
  b.relou('fetard', 22.5, 0);
  b.relou('fetard', 22.5, r, 3);
  b.roof(19, b.room(19, 2.25, 2.6, 1.6, 'glace'), 2.4, 'glace');
  b.relou('pigeon', 19, 2.25);
  return b.level({
    id: '3-2',
    name: 'Avalanche',
    friends: ['roulian', 'mat', 'lolo'],
    tip: 'Pousse les boulets du haut de la falaise : ils feront le travail.',
  });
}

function l3_3() {
  const b = new Build();
  const top = b.room(14, 0, 4.4, 2, 'pierre');
  b.relou('yeti', 13.2, 0);
  b.relou('fetard', 15, 0);
  b.add('menhir', 12.6, top);
  b.add('menhir', 15.4, top);
  b.relou('fetard', 14, top, 2);
  b.roof(14, b.plank(14, top + 1.45, 3.6, 'glace'), 2, 'pierre', 1);
  b.add('rocher-plat', 18.5, 0);
  b.relou('fetard', 18.5, 1.08, 3);
  b.cage(21.5, 0, 'roulie');
  b.roof(25, b.tower(25, 0, 2, 2.2, 1.6, 'pierre', 'glace'), 2.2, 'pierre');
  b.relou('fetard', 25, 0, 4);
  return b.level({
    id: '3-3',
    name: 'Le refuge',
    friends: ['lolo', 'tom', 'lolo', 'mat'],
  });
}

function l3_4() {
  const b = new Build();
  b.pillar(12, 0, 3, 'metal', 0.6);
  b.pillar(12.6, 0, 3, 'metal', 0.6);
  b.tower(16, 0, 2, 3, 1.8, 'pierre', 'metal');
  b.relou('videur', 16, 0);
  b.relou('yeti', 16, 2.25);
  b.pillar(19.3, 0, 3.4, 'pierre', 0.6);
  b.add('dolmen', 22, 0);
  b.relou('fetard', 22, 1.35, 2);
  b.roof(16, 4.5, 3, 'metal');
  b.block(24.3, b.block(24.3, 0, 'pierre'), 'pierre');
  return b.level({
    id: '3-4',
    name: 'Givre',
    friends: ['roulie', 'lolo', 'roulie', 'lolo'],
    tip: 'ROULIE : touche en vol, elle gèle tout devant elle. Ce qui est gelé casse comme du verre.',
  });
}

function l3_5() {
  const b = new Build();
  b.plateau(15, 29, 3.5);
  b.ball(16, 3.5, 'pierre', 1.2);
  b.relou('pigeon', 19.5, b.tower(19.5, 3.5, 2, 2.4, 1.8, 'pierre', 'glace'));
  b.relou('yeti', 19.5, 3.5);
  b.tower(24, 3.5, 2, 2.4, 1.8, 'glace', 'pierre');
  b.relou('fetard', 24, 3.5);
  b.relou('yeti', 24, 5.75);
  b.add('tonneau-or', 27.5, 3.5);
  b.relou('fetard', 31, 0, 3);
  b.roof(24, 8, 2.6, 'pierre', 1.2);
  return b.level({
    id: '3-5',
    name: 'Le col',
    friends: ['roulie', 'lolo', 'jbm', 'mat'],
  });
}

function l3_6() {
  const b = new Build();
  b.plateau(20, 32, 1);
  b.relou('yeti-alpha', 26, 1);
  b.pillar(22.3, 1, 3.6, 'pierre', 0.7);
  b.pillar(29.7, 1, 3.6, 'pierre', 0.7);
  const roof = b.plank(26, 4.6, 8.4, 'pierre', 0.6);
  b.ball(23.5, roof, 'pierre', 1.2);
  b.ball(28.5, roof, 'pierre', 1.2);
  b.roof(26, roof, 2.4, 'pierre', 1.2);
  b.add('menhir', 16, 0);
  b.add('menhir', 17, 0);
  b.relou('yeti', 18.5, 0);
  b.relou('yeti', 33.5, 0);
  b.cage(36, 0, 'soso');
  return b.level({
    id: '3-6',
    name: 'BOSS : Yéti Alpha',
    friends: ['lolo', 'roulie', 'lolo', 'jbm', 'roulie', 'mat'],
    tip: 'Fais tomber le toit et les boulets sur le Yéti Alpha.',
  });
}

/* ============================================================ MONDE 4 — LA PLAGE */

function l4_1() {
  const b = new Build();
  b.pillar(13, 0, 6, 'metal', 0.6);
  b.pillar(13.6, 0, 6, 'pierre', 0.6);
  const top = b.rooms(16, 0, 2, 2.4, 1.7);
  b.relou('goeland', 17.2, 0);
  b.relou('influenceur', 19.15, 0);
  b.relou('fetard', 18.175, top, 2);
  b.roof(23, b.tower(23, 0, 2, 2, 1.6), 2.2);
  b.relou('fetard', 23, 0, 3);
  b.relou('pigeon', 23, 2.05);
  return b.level({
    id: '4-1',
    name: 'Double saut',
    friends: ['soso', 'soso', 'soso'],
    tip: 'SOSO : touche en vol, elle rebondit en l’air. Parfait pour passer le mur.',
  });
}

function l4_2() {
  const b = new Build();
  b.add('trampoline-bois', 10, 0);
  b.pillar(13.5, 0, 3, 'metal');
  b.pillar(21.5, 0, 3, 'metal');
  b.plank(17.5, 3, 8.6, 'metal');
  b.relou('influenceur', 15.5, 0);
  b.relou('goeland', 19, 0);
  b.block(17.2, 0);
  b.pillar(24.5, 0, 6, 'metal', 0.6);
  b.room(27, 0, 2.4, 1.7);
  b.relou('fetard', 27, 0);
  b.cage(30, 0, 'elo');
  b.pyramid(17.5, 3.45, 2);
  return b.level({
    id: '4-2',
    name: 'Trampolines',
    friends: ['roulian', 'soso', 'mat', 'soso'],
    tip: 'Tire sur le trampoline : l’ami rebondit… et entre par le côté.',
  });
}

function l4_3() {
  const b = new Build();
  b.pillar(13, 0, 3.6, 'metal');
  b.pillar(21, 0, 3.6, 'metal');
  b.plank(17, 3.6, 8.6, 'bois');
  const r1 = b.room(15.4, 0, 2.4, 1.6);
  const r2 = b.room(18.6, 0, 2.4, 1.6);
  b.relou('goeland', 15.4, 0);
  b.relou('goeland', 18.6, 0);
  b.relou('influenceur', 15.4, r1);
  b.relou('fetard', 18.6, r2, 3);
  b.roof(15, 4.05, 2);
  b.roof(19, 4.05, 2);
  return b.level({
    id: '4-3',
    name: 'La cabine de plage',
    friends: ['elo', 'elo', 'elo'],
    tip: 'ELO : touche en vol pour la Pirouette. Elle ricoche partout à l’intérieur.',
  });
}

function l4_4() {
  const b = new Build();
  b.add('tonneau-fusee', 9.5, 0, { a: -35 });
  b.add('tonneau-fusee', 10.8, 0, { a: -28 });
  const t = b.tower(16.5, 0, 3, 2.4, 1.7, 'bois', 'pierre');
  b.relou('influenceur', 16.5, 0);
  b.relou('goeland', 16.5, 2.15);
  b.relou('fetard', 16.5, 4.3, 2);
  b.relou('goeland', 16.5, t);
  b.cage(20.5, 0, 'roro');
  return b.level({
    id: '4-4',
    name: 'Tonneaux-fusées',
    friends: ['mat', 'elo', 'tom'],
    tip: 'Touche un tonneau-fusée : il part dans le sens où il pointe, puis explose.',
  });
}

function l4_5() {
  const b = new Build();
  b.plateau(13, 24, 2);
  b.pillar(15, 2, 3.4, 'pierre', 0.6);
  b.pillar(22, 2, 3.4, 'pierre', 0.6);
  b.plank(18.5, 5.4, 7.8, 'pierre', 0.5);
  b.relou('goeland', 17, 2);
  b.add('baril', 19.5, 2);
  b.relou('goeland', 21, 2);
  b.add('pneus', 25.5, 0);
  b.relou('goeland', 27, 0);
  b.relou('influenceur', 29, 0);
  b.wall(16.5, 5.9, 4, 1);
  b.roof(27, b.room(27, 0, 2, 1.6), 2.2);
  return b.level({
    id: '4-5',
    name: 'Smash',
    friends: ['roro', 'roro', 'roro'],
    tip: 'RORO : pendant son vol, touche l’endroit visé. Il y smashe une balle de padel.',
  });
}

function l4_6() {
  const b = new Build();
  b.plateau(22, 34, 1.5);
  b.relou('champion', 28, 1.5);
  b.stack(24, 1.5, ['pneus', 'pneus', 'pneus']);
  b.stack(32, 1.5, ['pneus', 'pneus', 'pneus']);
  const roof = b.plank(28, 4.89, 9, 'metal');
  b.add('baril', 26, roof);
  b.add('baril', 30, roof);
  b.add('tonneau-fusee', 15, 0, { a: -35 });
  b.add('trampoline-metal', 19, 0);
  b.relou('goeland', 21, 0);
  b.relou('influenceur', 36, 0);
  b.cage(39, 0, 'indianne');
  return b.level({
    id: '4-6',
    name: 'BOSS : le Champion',
    friends: ['soso', 'roro', 'elo', 'lolo', 'jbm', 'roro'],
    tip: 'Les barils du toit tombent pile sur le Champion…',
  });
}

/* ============================================================ MONDE 5 — LA VILLE */

function l5_1() {
  const b = new Build();
  b.pillar(12, 0, 1.7, 'pierre', 0.5);
  b.pillar(24, 0, 1.7, 'pierre', 0.5);
  b.add('van', 18, b.plank(18, 1.7, 12.5, 'metal'));
  b.relou('trader', 20, 0);
  b.relou('presse', 22, 0);
  b.add('poubelle', 16, 0);
  b.room(28, 0, 2.4, 1.7);
  b.relou('trader', 28, 0);
  b.roof(28, 2.15, 2.6);
  b.room(31.5, 0, 2.4, 1.7, 'metal', 'metal');
  b.relou('presse', 31.5, 0, 1);
  return b.level({
    id: '5-1',
    name: 'Le tunnel',
    friends: ['indianne', 'indianne', 'indianne'],
    tip: 'INDIANNE : touche en vol, elle lévite tout droit. Vise l’entrée du tunnel.',
  });
}

function l5_2() {
  const b = new Build();
  b.add('portail', 8, 3);
  b.pillar(14, 0, 8, 'metal', 0.6);
  b.add('portail-sortie', 20, 9);
  const r = b.room(20, 0, 3, 2);
  b.relou('trader', 20, 0);
  b.relou('presse', 20, r);
  b.pillar(26, 0, 8, 'metal', 0.6);
  b.cage(23.5, 0, 'clem');
  b.wall(15.5, 0, 2, 3);
  return b.level({
    id: '5-2',
    name: 'Téléporteurs',
    friends: ['roulian', 'mat', 'indianne', 'mat'],
    tip: 'Ce qui entre dans le téléporteur ressort de l’autre, à la même vitesse.',
  });
}

function l5_3() {
  const b = new Build();
  b.add('voiture', 13, 0);
  const top = b.rooms(16.5, 0, 3, 2.4, 1.7);
  b.relou('presse', 17.7, 0);
  b.relou('trader', 19.65, 0);
  b.relou('marin', 21.6, 0);
  b.block(18.675, top, 'metal');
  b.block(20.625, top, 'metal');
  b.add('borne', 24, 0);
  b.cage(26.5, 0, 'bubu');
  b.roof(19.65, b.plank(19.65, 3.15, 2.8, 'metal'), 2.4, 'metal');
  return b.level({
    id: '5-3',
    name: 'Va chercher !',
    friends: ['clem', 'clem', 'clem'],
    tip: 'CLEM : touche en vol, son chien fonce au ras du sol et bouscule les fondations.',
  });
}

function l5_4() {
  const b = new Build();
  b.pillar(12, 0, 3.2, 'bois', 0.7);
  b.pillar(12.8, 0, 3.2, 'glace', 0.7);
  b.relou('trader', 14.2, 0);
  b.pillar(15.6, 0, 3.2, 'bois', 0.7);
  b.relou('presse', 17, 0);
  b.pillar(18.4, 0, 3.2, 'glace', 0.7);
  b.relou('marin', 19.8, 0, 2);
  b.pillar(21.2, 0, 3.2, 'pierre', 0.7);
  b.plank(16.6, 3.2, 10, 'metal');
  b.cage(24.5, 0, 'mar-1');
  return b.level({
    id: '5-4',
    name: 'Rayon',
    friends: ['bubu', 'bubu', 'bubu'],
    tip: 'BUBU : touche en vol, son rayon traverse le bois et la glace en ligne droite.',
  });
}

function l5_5() {
  const b = new Build();
  b.pillar(12, 0, 2.6, 'metal', 0.5);
  b.pillar(15.8, 0, 2.6, 'metal');
  b.plank(13.9, 2.6, 4.3, 'metal');
  b.pillar(17.4, 0, 2.6, 'metal');
  b.pillar(21, 0, 2.6, 'metal', 0.5);
  b.plank(19.2, 2.6, 4.3, 'metal');
  b.relou('trader', 13.9, 0);
  b.add('bidon', 15, 0);
  b.relou('presse', 16.6, 0);
  b.relou('marin', 19.2, 0);
  b.add('van', 25, 0);
  b.relou('trader', 25, 2.6);
  b.roof(13.9, b.block(13.9, 3.05), 1.2);
  b.roof(19.2, b.block(19.2, 3.05), 1.2);
  return b.level({
    id: '5-5',
    name: 'Lancer frappé',
    friends: ['mar-1', 'mar-1', 'mar-1'],
    tip: 'MAR-1 : survole le toit, puis touche. Le palet pique par la fente.',
  });
}

function l5_6() {
  const b = new Build();
  b.plateau(26, 40, 2);
  b.relou('robot', 33, 2);
  b.pillar(29.5, 2, 4.2, 'metal', 0.5);
  b.pillar(36.5, 2, 4.2, 'metal', 0.5);
  const roof = b.plank(33, 6.2, 7.8, 'pierre', 0.5);
  b.add('baril', 31.5, roof);
  b.add('baril', 34.5, roof);
  b.add('caisson', 30.7, 2);
  b.add('caisson', 35.3, 2);
  b.add('van', 20, 0);
  b.relou('trader', 20, 2.6);
  b.add('tonneau-fusee', 15, 0, { a: -38 });
  b.relou('presse', 24.5, 0);
  b.relou('marin', 42, 0);
  b.add('tonneau-or', 44, 0);
  return b.level({
    id: '5-6',
    name: 'BOSS : le Méga-Robot',
    friends: ['lolo', 'bubu', 'mar-1', 'roro', 'clem', 'jbm', 'roulie'],
    tip: 'Toute la bande est là. Le robot est blindé : gèle-le, fais tomber le toit, smashe les barils.',
  });
}

export const WORLDS: WorldDef[] = [
  {
    id: 1,
    name: 'Le Camping',
    theme: 'camping',
    tagline: 'Les fêtards ont envahi notre coin de camping.',
    color: '#5fb84a',
    levels: [l1_1(), l1_2(), l1_3(), l1_4(), l1_5(), l1_6()],
  },
  {
    id: 2,
    name: 'Le Festival',
    theme: 'festival',
    tagline: 'Le carré VIP est squatté. Barils, enceintes et confettis.',
    color: '#ff3d7f',
    levels: [l2_1(), l2_2(), l2_3(), l2_4(), l2_5(), l2_6()],
  },
  {
    id: 3,
    name: 'La Montagne',
    theme: 'montagne',
    tagline: 'Pierre, glace et yétis : place aux poids lourds.',
    color: '#7cc8ff',
    levels: [l3_1(), l3_2(), l3_3(), l3_4(), l3_5(), l3_6()],
  },
  {
    id: 4,
    name: 'La Plage',
    theme: 'plage',
    tagline: 'Trampolines, pneus et tonneaux-fusées sous le soleil.',
    color: '#ffc23d',
    levels: [l4_1(), l4_2(), l4_3(), l4_4(), l4_5(), l4_6()],
  },
  {
    id: 5,
    name: 'La Ville',
    theme: 'ville',
    tagline: 'Téléporteurs, tunnels et un robot géant.',
    color: '#b46bff',
    levels: [l5_1(), l5_2(), l5_3(), l5_4(), l5_5(), l5_6()],
  },
];

export const ALL_LEVELS = WORLDS.flatMap((w) => w.levels.map((l) => ({ ...l, world: w })));
export const LEVEL_BY_ID = Object.fromEntries(ALL_LEVELS.map((l) => [l.id, l]));

/** Ami libéré par chaque niveau (cage). */
export const UNLOCKS: Record<string, string> = Object.fromEntries(
  ALL_LEVELS.flatMap((l) => l.items.filter((i) => i.friend).map((i) => [l.id, i.friend!])),
);

/** Amis disponibles au départ. */
export const STARTERS = ['roulian'];

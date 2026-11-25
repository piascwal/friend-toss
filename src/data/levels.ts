/* Les mondes et leurs niveaux. Chaque monde apprend une ou deux mécaniques, puis les combine ;
   son dernier niveau est un boss. Un ami enfermé dans une cage rejoint la bande quand le niveau est gagné.
   Les positions sont en mètres : le lanceur est en x = 0, le sol en y = 0, et y est le bas des pièces. */
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
  b.hut(19, 0, 3, 2);
  b.relou('fetard', 19, 0);
  b.stack(22.5, 0, ['caisse', 'caisse']);
  return b.level({
    id: '1-1',
    name: 'Premier lancer',
    friends: ['roulian', 'roulian', 'roulian'],
    tip: "Tire vers l'arrière pour viser, relâche pour lancer. Fais tomber le fêtard !",
  });
}

function l1_2() {
  const b = new Build();
  b.stack(17, 0, ['tonneau', 'tonneau', 'tonneau']);
  b.hut(20.5, 0, 2.6, 1.9);
  b.relou('fetard', 20.5, 0);
  b.relou('fetard', 23.5, 0, 2);
  const t = b.stack(26.5, 0, ['caisse', 'caisse']);
  b.cage(26.5, t, 'mat');
  return b.level({
    id: '1-2',
    name: 'La cage',
    friends: ['roulian', 'roulian', 'roulian'],
    tip: 'Un ami est enfermé dans la cage ! Gagne le niveau pour le libérer (casse la cage : bonus).',
  });
}

function l1_3() {
  const b = new Build();
  b.stack(16, 0, ['caisse', 'caisse', 'caisse', 'caisse']);
  b.stack(17.25, 0, ['caisse', 'caisse', 'caisse']);
  b.hut(21, 0, 2.6, 1.8);
  b.relou('fetard', 21, 0);
  b.hut(24.5, 0, 2.6, 1.8);
  b.relou('fetard', 24.5, 0, 3);
  b.stack(27, 0, ['tonneau']);
  return b.level({
    id: '1-3',
    name: 'Le mur de caisses',
    friends: ['mat', 'mat', 'mat'],
    tip: 'MAT : touche l’écran pendant son vol pour la Ruée. Il fonce et transperce le bois.',
  });
}

function l1_4() {
  const b = new Build();
  const t1 = b.tower(18, 0, 2, 2.4, 1.8);
  b.relou('pigeon', 18, t1);
  b.relou('fetard', 18, 0);
  const t2 = b.tower(25, 0, 3, 2.4, 1.8);
  b.relou('pigeon', 25, t2, 2);
  b.relou('fetard', 25, 2.1, 2);
  const g = b.stack(30, 0, ['caisse']);
  b.add('tonneau-or', 30, g);
  return b.level({
    id: '1-4',
    name: 'Pigeons perchés',
    friends: ['roulian', 'mat', 'mat'],
    tip: 'Les tours tombent mieux quand on vise leur base.',
  });
}

function l1_5() {
  const b = new Build();
  b.stack(19.5, 0, ['tonneau', 'tonneau']);
  const top = b.tower(23, 0, 3, 3.6, 1.9);
  b.relou('fetard', 22.4, 0);
  b.relou('fetard', 23.6, 2.2, 2);
  b.relou('fetard', 23, 4.4, 3);
  b.stack(26.5, 0, ['tonneau', 'tonneau']);
  b.stack(23, top, ['petite-caisse']);
  b.cage(30.5, 0, 'tom');
  return b.level({
    id: '1-5',
    name: 'La tour du camping',
    friends: ['roulian', 'mat', 'mat', 'roulian'],
  });
}

function l1_6() {
  const b = new Build();
  b.plateau(21, 33, 1.2);
  const l = b.tower(22.5, 1.2, 2, 2.2, 1.8);
  b.relou('pigeon', 22.5, l, 3);
  b.relou('fetard', 22.5, 1.2);
  const r = b.tower(31.5, 1.2, 2, 2.2, 1.8);
  b.relou('pigeon', 31.5, r, 4);
  b.relou('fetard', 31.5, 3.3, 4);
  // la grande salle
  b.post(25, 1.2, 2.6);
  b.post(29, 1.2, 2.6);
  b.beam(27, 3.8, 4.6);
  b.stack(25.6, 4.1, ['petite-caisse']);
  b.stack(28.4, 4.1, ['petite-caisse']);
  b.beam(27, 4.9, 3.8);
  b.relou('videur', 27, 1.2);
  b.relou('fetard', 27, 5.2);
  b.stack(19, 0, ['caisse', 'caisse']);
  return b.level({
    id: '1-6',
    name: 'Le Grand Chalet',
    friends: ['mat', 'roulian', 'mat', 'roulian', 'mat'],
    tip: 'Le videur est costaud : fais-lui tomber le toit dessus.',
  });
}

/* ============================================================ MONDE 2 — LE FESTIVAL */

function l2_1() {
  const b = new Build();
  b.hut(19, 0, 3.4, 2);
  b.relou('fetard', 18.4, 0);
  b.add('baril', 19.8, 0);
  b.hut(24, 0, 3.4, 2);
  b.relou('fetard', 24.6, 0, 2);
  b.add('baril', 23.3, 0);
  b.relou('fetard', 21.5, 2.3, 3);
  b.beam(21.5, 2.3, 2.2);
  return b.level({
    id: '2-1',
    name: 'Ça va péter',
    friends: ['roulian', 'mat', 'roulian'],
    tip: 'Les barils explosent au moindre choc. Un bon tir, plusieurs relous !',
  });
}

function l2_2() {
  const b = new Build();
  const t = b.tower(19, 0, 2, 2.4, 1.6, 'planche-glace');
  b.relou('pigeon', 19, t);
  b.relou('fetard', 19, 0);
  b.relou('fetard', 19, 1.9, 2);
  const t2 = b.tower(23.5, 0, 3, 2.4, 1.6, 'planche-glace');
  b.relou('pigeon', 23.5, t2, 2);
  b.relou('fetard', 23.5, 1.9, 3);
  b.relou('fetard', 23.5, 3.8, 4);
  return b.level({
    id: '2-2',
    name: 'Le bar à glaçons',
    friends: ['tom', 'tom', 'tom'],
    tip: 'TOM : touche en vol, il voit triple. Trois TOM contre la glace, c’est radical.',
  });
}

function l2_3() {
  const b = new Build();
  b.add('enceinte', 17.5, 0);
  b.add('enceinte', 18.7, 0);
  b.add('enceinte', 17.5, 1.52);
  b.hut(22.5, 0, 3.6, 2.2, 'planche', 'planche-metal');
  b.relou('videur', 21.8, 0);
  b.add('caisson', 23.4, 0);
  b.relou('fetard', 22.5, 2.5);
  b.stack(26.5, 0, ['enceinte-rose', 'enceinte-rose']);
  b.relou('fetard', 26.5, 2.3, 2);
  b.cage(29.5, 0, 'jbm');
  return b.level({
    id: '2-3',
    name: 'Le carré VIP',
    friends: ['tom', 'mat', 'roulian', 'mat'],
    tip: 'Le métal ne casse presque pas. Le caisson explosif, lui, si.',
  });
}

function l2_4() {
  const b = new Build();
  for (const [i, x] of [18, 21, 24, 27].entries()) {
    const t = b.tower(x, 0, 2, 2, 1.6);
    b.relou(i % 2 ? 'fetard' : 'supporter', x, 0, (i % 4) + 1);
    if (i % 2) b.relou('pigeon', x, t, i);
  }
  return b.level({
    id: '2-4',
    name: 'Le pogo',
    friends: ['jbm', 'jbm', 'jbm'],
    tip: 'JBM : touche en vol pour la Paume de souffle. Déclenche-la au milieu des tours.',
  });
}

function l2_5() {
  const b = new Build();
  b.add('caisson-rose', 20, 0);
  const t = b.tower(23, 0, 4, 2.6, 1.7);
  b.relou('fetard', 23, 0);
  b.relou('videur', 23, 2, 2);
  b.relou('fetard', 23, 4, 3);
  b.relou('pigeon', 23, t);
  b.stack(26.2, 0, ['enceinte', 'enceinte']);
  const g = b.stack(29, 0, ['caisse', 'caisse']);
  b.add('tonneau-or', 29, g);
  b.relou('fetard', 31, 0, 4);
  b.add('bidon', 30.2, 0);
  return b.level({
    id: '2-5',
    name: 'Pluie de confettis',
    friends: ['tom', 'jbm', 'mat', 'roulian'],
  });
}

function l2_6() {
  const b = new Build();
  b.plateau(24, 36, 1.6);
  b.relou('dj', 31, 1.6);
  b.relou('baffle', 27, 1.6, 1);
  b.relou('baffle', 35, 1.6, 3);
  b.add('baril', 28.5, 1.6);
  b.add('baril', 33.5, 1.6);
  b.hut(20, 0, 3, 2, 'planche', 'planche-metal');
  b.relou('videur', 20, 0);
  b.stack(25, 1.6, ['enceinte']);
  b.cage(38.5, 0, 'lolo');
  return b.level({
    id: '2-6',
    name: 'BOSS : DJ Boucle',
    friends: ['jbm', 'tom', 'mat', 'roulian', 'jbm'],
    tip: 'Fais exploser les barils au pied de la scène !',
  });
}

/* ============================================================ MONDE 3 — LA MONTAGNE */

function l3_1() {
  const b = new Build();
  const t = b.tower(19, 0, 2, 2.4, 1.7, 'planche-pierre');
  b.relou('yeti', 19, 0);
  b.relou('fetard', 19, t);
  const t2 = b.tower(24, 0, 2, 2.4, 1.7, 'planche-pierre');
  b.relou('yeti', 24, 2, 1);
  b.relou('fetard', 24, t2, 2);
  return b.level({
    id: '3-1',
    name: 'Séisme',
    friends: ['lolo', 'lolo', 'lolo'],
    tip: 'LOLO : place-le au-dessus d’une tour en pierre, puis touche. Il pique et fait tout trembler.',
  });
}

function l3_2() {
  const b = new Build();
  b.plateau(15, 21, 4.5);
  b.add('rocher', 18, 4.5);
  b.add('rocher', 20, 4.5);
  b.hut(24, 0, 3.2, 1.8, 'planche-glace');
  b.relou('yeti', 24, 0);
  b.hut(28, 0, 3.2, 1.8, 'planche-glace');
  b.relou('fetard', 28, 0);
  b.relou('fetard', 28, 2.1, 3);
  return b.level({
    id: '3-2',
    name: 'Avalanche',
    friends: ['roulian', 'mat', 'lolo'],
    tip: 'Pousse les rochers du haut de la falaise : ils feront le travail.',
  });
}

function l3_3() {
  const b = new Build();
  b.post(19, 0, 2.2, 'planche-pierre');
  b.post(23, 0, 2.2, 'planche-pierre');
  b.beam(21, 2.2, 4.6, 'planche-pierre');
  b.add('menhir', 20.3, 2.5);
  b.add('menhir', 21.7, 2.5);
  b.beam(21, 3.95, 2.4, 'planche-glace');
  b.relou('yeti', 21, 0);
  b.relou('fetard', 21, 4.25);
  b.add('rocher-plat', 26, 0);
  b.relou('fetard', 26, 1.08, 2);
  b.cage(29, 0, 'roulie');
  return b.level({
    id: '3-3',
    name: 'Le refuge',
    friends: ['lolo', 'tom', 'lolo', 'mat'],
  });
}

function l3_4() {
  const b = new Build();
  b.post(18.5, 0, 2.6, 'planche-metal');
  b.post(18.9, 0, 2.6, 'planche-metal');
  b.tower(22, 0, 2, 3, 1.8, 'planche-pierre', 'planche-metal');
  b.relou('videur', 22, 0);
  b.relou('yeti', 22, 2.1);
  b.post(25.5, 0, 3.4, 'planche-pierre');
  b.post(25.9, 0, 3.4, 'planche-pierre');
  b.relou('fetard', 28, 0, 2);
  b.add('dolmen', 28, 1.3);
  return b.level({
    id: '3-4',
    name: 'Givre',
    friends: ['roulie', 'lolo', 'roulie', 'lolo'],
    tip: 'ROULIE : touche en vol, elle gèle tout devant elle. Ce qui est gelé casse comme du verre.',
  });
}

function l3_5() {
  const b = new Build();
  b.plateau(20, 34, 3.5);
  b.add('rocher', 21, 3.5);
  const t = b.tower(25, 3.5, 2, 2.6, 1.8, 'planche-pierre', 'planche-glace');
  b.relou('yeti', 25, 3.5);
  b.relou('pigeon', 25, t);
  b.tower(30, 3.5, 2, 2.6, 1.8, 'planche-glace', 'planche-pierre');
  b.relou('fetard', 30, 3.5);
  b.relou('yeti', 30, 5.6);
  b.add('tonneau-or', 33, 3.5);
  b.relou('fetard', 36, 0, 3);
  return b.level({
    id: '3-5',
    name: 'Le col',
    friends: ['roulie', 'lolo', 'jbm', 'mat'],
  });
}

function l3_6() {
  const b = new Build();
  b.plateau(26, 38, 1);
  b.relou('yeti-alpha', 32, 1);
  b.post(28.5, 1, 4, 'planche-pierre', 0.5);
  b.post(35.5, 1, 4, 'planche-pierre', 0.5);
  b.beam(32, 5, 7.6, 'planche-pierre', 0.5);
  b.add('rocher', 30, 5.5);
  b.add('rocher', 34, 5.5);
  b.add('menhir', 22, 0);
  b.add('menhir', 23, 0);
  b.relou('yeti', 24.5, 0);
  b.relou('yeti', 39.5, 0);
  b.cage(42, 0, 'soso');
  return b.level({
    id: '3-6',
    name: 'BOSS : Yéti Alpha',
    friends: ['lolo', 'roulie', 'lolo', 'jbm', 'roulie', 'mat'],
    tip: 'Fais tomber le toit et les rochers sur le Yéti Alpha.',
  });
}

/* ============================================================ MONDE 4 — LA PLAGE */

function l4_1() {
  const b = new Build();
  b.post(18, 0, 6, 'planche-metal', 0.5);
  b.hut(22, 0, 3, 1.8);
  b.relou('goeland', 22, 0);
  b.relou('influenceur', 24.5, 0);
  b.hut(27, 0, 3, 1.8);
  b.relou('fetard', 27, 0, 2);
  return b.level({
    id: '4-1',
    name: 'Double saut',
    friends: ['soso', 'soso', 'soso'],
    tip: 'SOSO : touche en vol, elle rebondit en l’air. Parfait pour passer le mur.',
  });
}

function l4_2() {
  const b = new Build();
  b.add('trampoline-bois', 14, 0);
  b.post(17.5, 0, 3, 'planche-metal');
  b.post(25.5, 0, 3, 'planche-metal');
  b.beam(21.5, 3, 8.6, 'planche-metal');
  b.relou('influenceur', 20, 0);
  b.relou('goeland', 23, 0);
  b.add('caisse', 21.5, 0);
  b.post(29, 0, 6, 'planche-metal', 0.5);
  b.relou('fetard', 32, 0);
  b.cage(35, 0, 'elo');
  return b.level({
    id: '4-2',
    name: 'Trampolines',
    friends: ['roulian', 'soso', 'mat', 'soso'],
    tip: 'Lance un ami sur le trampoline : il rebondit… et entre par le côté.',
  });
}

function l4_3() {
  const b = new Build();
  // boîte fermée : murs en métal, intérieur en bois
  b.post(19, 0, 3.4, 'planche-metal');
  b.post(27, 0, 3.4, 'planche-metal');
  b.beam(23, 3.4, 8.6, 'planche');
  b.post(21.5, 0, 1.6);
  b.post(24.5, 0, 1.6);
  b.beam(23, 1.6, 3.6);
  b.relou('goeland', 20.3, 0);
  b.relou('influenceur', 23, 0);
  b.relou('fetard', 25.8, 0, 3);
  b.relou('goeland', 23, 1.9);
  return b.level({
    id: '4-3',
    name: 'La cabine de plage',
    friends: ['elo', 'elo', 'elo'],
    tip: 'ELO : touche en vol pour la Pirouette. Elle ricoche partout à l’intérieur.',
  });
}

function l4_4() {
  const b = new Build();
  b.add('tonneau-fusee', 16, 0, { a: -40 });
  b.add('tonneau-fusee', 17.4, 0, { a: -30 });
  const t = b.tower(24, 0, 3, 2.6, 1.8, 'planche', 'planche-pierre');
  b.relou('influenceur', 24, 0);
  b.relou('goeland', 24, 2.1);
  b.relou('fetard', 24, 4.2, 2);
  b.relou('goeland', 24, t);
  b.cage(29, 0, 'roro');
  return b.level({
    id: '4-4',
    name: 'Tonneaux-fusées',
    friends: ['mat', 'elo', 'tom'],
    tip: 'Touche un tonneau-fusée : il part dans le sens où il pointe, puis explose.',
  });
}

function l4_5() {
  const b = new Build();
  b.plateau(17, 30, 2);
  b.post(20, 2, 3.4, 'planche-pierre', 0.6);
  b.beam(23.5, 5.4, 7.6, 'planche-pierre', 0.4);
  b.post(27, 2, 3.4, 'planche-pierre', 0.6);
  b.relou('goeland', 23.5, 2);
  b.add('baril', 25.2, 2);
  b.relou('goeland', 32, 0);
  b.add('pneus', 30.8, 0);
  b.relou('influenceur', 34, 0);
  return b.level({
    id: '4-5',
    name: 'Smash',
    friends: ['roro', 'roro', 'roro'],
    tip: 'RORO : pendant son vol, touche l’endroit visé. Il y smashe une balle de padel.',
  });
}

function l4_6() {
  const b = new Build();
  b.plateau(28, 40, 1.5);
  b.relou('champion', 34, 1.5);
  b.stack(30, 1.5, ['pneus', 'pneus', 'pneus']);
  b.stack(38, 1.5, ['pneus', 'pneus', 'pneus']);
  const roof = b.beam(34, 4.89, 9, 'planche-metal');
  b.add('baril', 32, roof);
  b.add('baril', 36, roof);
  b.add('tonneau-fusee', 20, 0, { a: -35 });
  b.add('trampoline-metal', 24, 0);
  b.relou('goeland', 26.5, 0);
  b.relou('influenceur', 42, 0);
  b.cage(45, 0, 'indianne');
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
  // tunnel bas : il faut voler à plat
  b.post(16, 0, 1.6, 'planche-pierre', 0.4);
  b.beam(22, 1.6, 12.4, 'planche-metal', 0.4);
  b.add('van', 22, 2);
  b.post(28, 0, 1.6, 'planche-pierre', 0.4);
  b.relou('trader', 24, 0);
  b.relou('presse', 26, 0);
  b.add('poubelle', 20, 0);
  b.relou('trader', 32, 0);
  return b.level({
    id: '5-1',
    name: 'Le tunnel',
    friends: ['indianne', 'indianne', 'indianne'],
    tip: 'INDIANNE : touche en vol, elle lévite tout droit. Vise l’entrée du tunnel.',
  });
}

function l5_2() {
  const b = new Build();
  b.add('portail', 12, 3);
  b.post(20, 0, 8, 'planche-metal', 0.5);
  b.add('portail-sortie', 26, 9);
  b.hut(26, 0, 3.4, 2.2);
  b.relou('trader', 26, 0);
  b.relou('presse', 26, 2.5);
  b.beam(26, 2.5, 1);
  b.post(32, 0, 8, 'planche-metal', 0.5);
  b.cage(29.5, 0, 'clem');
  return b.level({
    id: '5-2',
    name: 'Téléporteurs',
    friends: ['roulian', 'mat', 'indianne', 'mat'],
    tip: 'Ce qui entre dans le téléporteur ressort de l’autre, à la même vitesse.',
  });
}

function l5_3() {
  const b = new Build();
  b.add('voiture', 19, 0);
  b.hut(24, 0, 3, 1.7);
  b.relou('presse', 24, 0);
  b.hut(28, 0, 3, 1.7);
  b.relou('trader', 28, 0);
  b.add('borne', 30.3, 0);
  b.hut(32.5, 0, 3, 1.7);
  b.relou('marin', 32.5, 0);
  b.beam(28, 2, 12, 'planche-metal');
  b.cage(36, 0, 'bubu');
  return b.level({
    id: '5-3',
    name: 'Va chercher !',
    friends: ['clem', 'clem', 'clem'],
    tip: 'CLEM : touche en vol, son chien fonce au ras du sol et bouscule les fondations.',
  });
}

function l5_4() {
  const b = new Build();
  b.post(18, 0, 3.2, 'planche', 0.6);
  b.post(18.7, 0, 3.2, 'planche-glace', 0.6);
  b.relou('trader', 20, 0);
  b.post(21.2, 0, 3.2, 'planche', 0.6);
  b.relou('presse', 22.6, 0);
  b.post(23.8, 0, 3.2, 'planche-glace', 0.6);
  b.relou('marin', 25.2, 0, 2);
  b.post(26.6, 0, 3.2, 'planche-pierre', 0.6);
  b.beam(22.3, 3.2, 9.4, 'planche-metal');
  b.cage(30, 0, 'mar-1');
  return b.level({
    id: '5-4',
    name: 'Rayon',
    friends: ['bubu', 'bubu', 'bubu'],
    tip: 'BUBU : touche en vol, son rayon traverse le bois et la glace en ligne droite.',
  });
}

function l5_5() {
  const b = new Build();
  b.post(19, 0, 2.6, 'planche-metal', 0.5);
  b.post(28, 0, 2.6, 'planche-metal', 0.5);
  b.post(22.7, 0, 2.6, 'planche-metal');
  b.post(24.3, 0, 2.6, 'planche-metal');
  b.beam(20.8, 2.6, 4.3, 'planche-metal');
  b.beam(26.2, 2.6, 4.3, 'planche-metal');
  b.relou('trader', 21, 0);
  b.relou('presse', 23.5, 0);
  b.relou('marin', 26, 0);
  b.add('bidon', 24.5, 0);
  b.add('van', 33, 0);
  b.relou('trader', 33, 2.6);
  return b.level({
    id: '5-5',
    name: 'Lancer frappé',
    friends: ['mar-1', 'mar-1', 'mar-1'],
    tip: 'MAR-1 : survole le toit, puis touche. Le palet pique par la fente.',
  });
}

function l5_6() {
  const b = new Build();
  b.plateau(30, 44, 2);
  b.relou('robot', 37, 2);
  b.post(32.5, 2, 4.2, 'planche-metal', 0.5);
  b.post(41.5, 2, 4.2, 'planche-metal', 0.5);
  b.beam(37, 6.2, 9.6, 'planche-pierre', 0.5);
  b.add('baril', 34.5, 6.7);
  b.add('baril', 39.5, 6.7);
  b.add('caisson', 34.2, 2);
  b.add('caisson', 39.8, 2);
  b.add('van', 24, 0);
  b.relou('trader', 24, 2.6);
  b.add('tonneau-fusee', 19, 0, { a: -38 });
  b.relou('presse', 28.5, 0);
  b.relou('marin', 46, 0);
  b.add('tonneau-or', 48, 0);
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

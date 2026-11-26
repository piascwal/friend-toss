/* Monde 5 — La Ville : métal, voitures, tunnels, téléporteurs, toits, métro, et le Méga-Robot. */
import { Build } from './build';
import type { WorldDef } from './index';

function leTunnel() {
  const b = new Build();
  b.pillar(12, 0, 2, 'pierre', 0.5);
  b.pillar(24, 0, 2, 'pierre', 0.5);
  b.add('van', 18, b.plank(18, 2, 12.5, 'metal'));
  b.relou('habitue', 16, 0).relou('gardien', 19, 0).relou('habitue', 22, 0, 2);
  b.add('poubelle', 14, 0);
  b.in('habitue', b.fort(28, 0, 1, 1, { roof: 'bois' }).cell(0, 0), 3);
  return b.level({
    id: '5-1',
    name: 'Le tunnel',
    friends: ['indianne', 'indianne', 'indianne'],
    tip: 'INDIANNE : touche en vol, elle lévite tout droit. Vise l’entrée du tunnel.',
  });
}

function leParking() {
  const b = new Build();
  b.add('voiture', 13, 0);
  b.relou('habitue', 18.5, b.stack(18.5, 0, ['van', 'voiture']));
  const f = b.fort(24.5, 0, 2, 2, { m: 'metal', ceil: 'bois' });
  b.in('gardien', f.cell(0, 0)).in('habitue', f.cell(1, 0), 2).in('habitue', f.cell(0, 1), 3);
  return b.level({ id: '5-2', name: 'Le parking', friends: ['indianne', 'lolo', 'jbg', 'mat'] });
}

function teleporteurs() {
  const b = new Build();
  b.add('portail', 8, 3);
  b.pillar(14, 0, 8, 'metal', 0.6);
  b.add('portail-sortie', 20, 9);
  const f = b.fort(20, 0, 2, 1, { roof: 'bois' });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(1, 0));
  b.pillar(26, 0, 8, 'metal', 0.6);
  b.cage(24, 0, 'clem');
  return b.level({
    id: '5-3',
    name: 'Téléporteurs',
    friends: ['roulian', 'mat', 'indianne', 'mat'],
    tip: 'Ce qui entre dans le téléporteur ressort de l’autre, à la même vitesse.',
  });
}

function vaChercher() {
  const b = new Build();
  b.add('voiture', 13, 0);
  const f = b.fort(19.5, 0, 3, 1, { ceil: 'metal' });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(1, 0)).in('pilier', f.cell(2, 0));
  b.block(18.5, f.top, 'metal');
  b.block(20.5, f.top, 'metal');
  b.add('borne', 24.5, 0);
  return b.level({
    id: '5-4',
    name: 'Va chercher !',
    friends: ['clem', 'clem', 'clem'],
    tip: 'CLEM : touche en vol, son chien fonce au ras du sol et bouscule les fondations.',
  });
}

function leChantier() {
  const b = new Build();
  const f = b.fort(18, 0, 2, 4, { m: 'metal', ceil: 'bois' });
  b.in('pilier', f.cell(0, 0))
    .in('habitue', f.cell(1, 0))
    .put('tnt', f.cell(0, 1))
    .in('habitue', f.cell(1, 1), 2);
  b.in('habitue', f.cell(0, 2), 3).put('tnt', f.cell(1, 3)).in('gardien', f.cell(0, 3));
  return b.level({ id: '5-5', name: 'Le chantier', friends: ['clem', 'lolo', 'jbg', 'roulie'] });
}

function lesToits() {
  const b = new Build();
  b.relief([
    [-10, 0],
    [9, 0],
    [9.5, 3],
    [15, 3],
    [15.5, 1],
    [20.5, 1],
    [21, 5],
    [31, 5],
    [32, 0],
    [60, 0],
  ]);
  b.in('habitue', b.fort(12.2, 3, 1, 1).cell(0, 0));
  b.in('gardien', b.fort(18, 1, 1, 1, { m: 'metal' }).cell(0, 0));
  const f = b.fort(26, 5, 2, 2, { m: 'metal', ceil: 'bois', roof: 'metal' });
  b.in('habitue', f.cell(0, 0), 2).in('pilier', f.cell(1, 0)).in('habitue', f.cell(1, 1), 3);
  b.cage(34.5, 0, 'bubu');
  return b.level({ id: '5-6', name: 'Les toits', friends: ['indianne', 'clem', 'roro', 'jbg'] });
}

function rayon() {
  const b = new Build();
  b.pillar(12, 0, 3.2, 'bois', 0.7);
  b.pillar(12.8, 0, 3.2, 'glace', 0.7);
  b.relou('habitue', 14.2, 0);
  b.pillar(15.6, 0, 3.2, 'bois', 0.7);
  b.relou('gardien', 17, 0);
  b.pillar(18.4, 0, 3.2, 'glace', 0.7);
  b.relou('pilier', 19.8, 0);
  b.pillar(21.2, 0, 3.2, 'pierre', 0.7);
  b.relou('habitue', 16.6, b.plank(16.6, 3.2, 10, 'metal'), 2);
  return b.level({
    id: '5-7',
    name: 'Rayon',
    friends: ['bubu', 'bubu', 'bubu'],
    tip: 'BUBU : touche en vol, son rayon traverse le bois et la glace en ligne droite.',
  });
}

function laBanque() {
  const b = new Build();
  const f = b.fort(19, 0, 3, 2, { m: 'metal' });
  b.in('gardien', f.cell(0, 0)).in('pilier', f.cell(1, 0)).in('gardien', f.cell(2, 0), 2);
  b.put('tonneau-or', f.cell(0, 1)).in('habitue', f.cell(1, 1)).put('tnt', f.cell(2, 1));
  return b.level({ id: '5-8', name: 'La banque', friends: ['bubu', 'lolo', 'roulie', 'jbg'] });
}

function leMetro() {
  const b = new Build();
  b.plateau(12, 28, 5, 3.6);
  const f = b.fort(20, 0, 3, 1, { m: 'metal' });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(1, 0)).in('habitue', f.cell(2, 0), 2);
  const u = b.fort(20, 5, 2, 1, { roof: 'bois' });
  b.in('habitue', u.cell(0, 0), 3).in('habitue', u.cell(1, 0), 4);
  b.cage(31, 0, 'mar-1');
  return b.level({ id: '5-9', name: 'Le métro', friends: ['indianne', 'bubu', 'clem', 'mat'] });
}

function lancerFrappe() {
  const b = new Build();
  b.pillar(12, 0, 2.6, 'metal', 0.5);
  b.pillar(15.8, 0, 2.6, 'metal');
  b.roof(13.9, b.block(13.9, b.plank(13.9, 2.6, 4.3, 'metal')), 1.2);
  b.pillar(17.4, 0, 2.6, 'metal');
  b.pillar(21, 0, 2.6, 'metal', 0.5);
  b.roof(19.2, b.block(19.2, b.plank(19.2, 2.6, 4.3, 'metal')), 1.2);
  b.relou('habitue', 13.6, 0).add('bidon', 14.8, 0).relou('gardien', 16.6, 0).relou('habitue', 19.2, 0, 2);
  b.add('van', 25, 0).relou('habitue', 25, 2.6, 3);
  return b.level({
    id: '5-10',
    name: 'Lancer frappé',
    friends: ['mar-1', 'mar-1', 'mar-1'],
    tip: 'MAR-1 : survole le toit, puis touche. Le palet pique par la fente.',
  });
}

function tourDeVerre() {
  const b = new Build();
  const t = b.fort(19, 0, 2, 5, {
    mats: ['metal', 'metal', 'glace', 'glace', 'glace'],
    ceil: 'glace',
    roof: 'glace',
  });
  b.in('pilier', t.cell(0, 0))
    .in('habitue', t.cell(1, 0))
    .in('habitue', t.cell(0, 1), 2)
    .in('habitue', t.cell(1, 2), 2);
  b.put('tnt', t.cell(0, 3)).in('habitue', t.cell(1, 3), 3).in('habitue', t.cell(0, 4), 4);
  return b.level({ id: '5-11', name: 'La tour de verre', friends: ['mar-1', 'bubu', 'tom', 'roro', 'lolo'] });
}

function megaRobot() {
  const b = new Build();
  b.plateau(26, 42, 2);
  b.relou('robot', 34, 2);
  b.pillar(30.5, 2, 4.4, 'metal', 0.5);
  b.pillar(37.5, 2, 4.4, 'metal', 0.5);
  const roof = b.plank(34, 6.4, 7.8, 'pierre', 0.5);
  b.add('baril', 32.5, roof).add('baril', 35.5, roof);
  b.add('caisson', 31.6, 2).add('caisson', 36.4, 2);
  b.add('van', 20, 0).relou('habitue', 20, 2.6);
  b.add('tonneau-fusee', 15, 0, { a: -38 });
  b.relou('gardien', 24.5, 0).relou('pilier', 44.5, 0);
  b.add('tonneau-or', 47, 0);
  return b.level({
    id: '5-12',
    name: 'BOSS : le Méga-Robot',
    friends: ['lolo', 'bubu', 'mar-1', 'roro', 'clem', 'jbm', 'roulie', 'jbg'],
    tip: 'Toute la bande est là. Le robot est blindé : gèle-le, fais tomber le toit, smashe les barils.',
  });
}

export const VILLE: WorldDef = {
  id: 5,
  name: 'La Ville',
  theme: 'ville',
  tagline: 'Tunnels, téléporteurs, toits et un robot géant.',
  color: '#b46bff',
  levels: [
    leTunnel(),
    leParking(),
    teleporteurs(),
    vaChercher(),
    leChantier(),
    lesToits(),
    rayon(),
    laBanque(),
    leMetro(),
    lancerFrappe(),
    tourDeVerre(),
    megaRobot(),
  ],
};

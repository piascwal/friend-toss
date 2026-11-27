/* Monde 5 — La Ville : métal, voitures, tunnels, téléporteurs, toits, métro, et le Méga-Robot. */
import { Build } from './build';
import { bunker, chimney, rubble, scaffold } from './pieces';
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
  b.add('van', 12.5, 0).relou('habitue', 12.5, 2.6);
  const p = b.fort(21, 0, 3, 3, { mats: ['pierre', 'pierre', 'glace'], ceil: 'metal', crenels: 'metal' });
  b.in('habitue', p.cell(0, 0), 2).in('gardien', p.cell(2, 0));
  b.in('habitue', p.cell(1, 1)).in('habitue', p.cell(2, 2), 3);
  return b.level({
    id: '5-2',
    name: 'Le parking',
    friends: ['indianne', 'lolo', 'jbg', 'mat'],
    tip: 'Les étages du parking sont longs et plats : INDIANNE peut les traverser d’un bout à l’autre.',
  });
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
  rubble(b, 11, 0, 2, 91, ['pierre', 'bois']);
  const s = scaffold(b, 21.5, 0, 2, 4, 'metal');
  b.in('pilier', s.cell(0, 0))
    .in('habitue', s.cell(1, 1))
    .in('gardien', s.cell(0, 2))
    .in('habitue', s.cell(1, 3), 2);
  b.put('tnt', s.cell(1, 0));
  b.stack(26.5, 0, ['poubelle', 'poubelle']);
  b.relou('habitue', 28, 0, 3);
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
    [32, 5],
    [33, 0],
    [60, 0],
  ]);
  b.in('habitue', b.fort(12.2, 3, 1, 1, { roof: 'bois' }).cell(0, 0));
  b.in('gardien', b.fort(18, 1, 1, 1, { m: 'metal' }).cell(0, 0));
  const f = b.fort(24.5, 5, 2, 2, { m: 'metal', ceil: 'bois', crenels: 'metal' });
  b.in('habitue', f.cell(0, 0), 2).in('pilier', f.cell(1, 0)).in('habitue', f.cell(1, 1), 3);
  b.in('habitue', chimney(b, 29.4, 5, 2.5, 'pierre', 1.2), 4);
  b.cage(35.5, 0, 'bubu');
  return b.level({
    id: '5-6',
    name: 'Les toits',
    friends: ['indianne', 'clem', 'roro', 'jbg'],
    tip: 'Un relou dans la cheminée : RORO smashe sa balle tout droit au fond.',
  });
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
  const f = b.fort(20, 0, 3, 2, { mats: ['metal', 'bois'], ceil: 'pierre', crenels: 'metal' });
  b.in('gardien', f.cell(0, 0)).in('pilier', f.cell(1, 0)).put('tonneau-or', f.cell(2, 0));
  b.in('habitue', f.cell(0, 1), 2).in('habitue', f.cell(1, 1), 3).in('habitue', f.cell(2, 1), 4);
  const s = scaffold(b, 27.5, 0, 1, 3, 'glace');
  b.in('habitue', s.cell(0, 2));
  b.stack(13.5, 0, ['poubelle']);
  return b.level({
    id: '5-8',
    name: 'La banque',
    friends: ['bubu', 'lolo', 'roulie', 'jbg'],
    tip: 'Trois relous alignés à l’étage : un seul rayon de BUBU les traverse tous.',
  });
}

function leMetro() {
  const b = new Build();
  const top = b.plateau(12, 28, 5, 3.6);
  const f = b.fort(20, 0, 3, 1, { m: 'metal' });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(1, 0)).in('habitue', f.cell(2, 0), 2);
  const t = b.fort(15, top, 1, 2, { m: 'pierre', crenels: 'pierre' });
  b.in('habitue', t.cell(0, 1), 3);
  const u = b.fort(21.5, top, 2, 1, { roof: 'bois' });
  b.in('habitue', u.cell(0, 0), 4).in('habitue', u.cell(1, 0));
  const s = scaffold(b, 26.4, top, 1, 2);
  b.put('baril', s.cell(0, 1));
  b.cage(31, 0, 'mar-1');
  return b.level({
    id: '5-9',
    name: 'Le métro',
    friends: ['indianne', 'bubu', 'clem', 'mat'],
    tip: 'Sous la rue, le métro : le chien de CLEM file au ras du sol, INDIANNE lévite dans le tunnel.',
  });
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
  b.in('habitue', chimney(b, 13.5, 0, 3, 'pierre'));
  const t = b.fort(22, 0, 2, 5, {
    mats: ['metal', 'glace', 'glace', 'glace', 'glace'],
    h: 1.8,
    crenels: 'metal',
  });
  b.in('pilier', t.cell(0, 0)).in('habitue', t.cell(1, 1), 2).in('habitue', t.cell(0, 3), 3);
  b.in('habitue', t.cell(1, 4), 4);
  return b.level({ id: '5-11', name: 'La tour de verre', friends: ['mar-1', 'bubu', 'tom', 'roro', 'lolo'] });
}

function megaRobot() {
  const b = new Build();
  b.add('tonneau-fusee', 11, 0, { a: -38 });
  b.add('van', 15.5, 0).relou('habitue', 15.5, 2.6);
  const t = b.fort(21, 0, 1, 3, { m: 'metal', mats: ['metal', 'glace', 'glace'], crenels: 'metal' });
  b.in('gardien', t.cell(0, 0)).in('habitue', t.cell(0, 2), 2);
  b.plateau(26, 42, 2);
  b.relou('robot', 34, 2);
  b.pillar(30.5, 2, 4.4, 'metal', 0.5);
  b.pillar(37.5, 2, 4.4, 'metal', 0.5);
  const roof = b.plank(34, 6.4, 7.8, 'pierre', 0.5);
  b.add('baril', 32.5, roof).add('baril', 35.5, roof);
  b.add('caisson', 31.6, 2).add('caisson', 36.4, 2);
  b.in('pilier', bunker(b, 45.5, 0, 1, 'metal').cell(0, 0));
  b.add('tonneau-or', 48.5, 0);
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

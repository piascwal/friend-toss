/* Monde 5 — La Ville : métal, voitures, tunnels, téléporteurs, toits, métro, et le Méga-Robot. */
import { Build } from './build';
import { chimney, bunker } from './pieces';
import type { WorldDef } from './index';

function leTunnel() {
  const b = new Build(501);
  const top = b.tunnel(12, 26, 4.6, 2.4, 1.6);
  b.relou('habitue', 15.5, 0).relou('gardien', 19, 0).relou('habitue', 22.4, 0, 2);
  b.add('poubelle', 13.6, 0);
  b.add('van', 18, top);
  b.in('habitue', b.tower(30, 0, 1, { roof: 'toit' }).cell(0), 3);
  return b.level({
    id: '5-1',
    name: 'Le tunnel',
    friends: ['indianne', 'indianne', 'indianne'],
    tip: 'INDIANNE : touche en vol, elle lévite tout droit. Vise l’entrée du tunnel.',
  });
}

function leParking() {
  const b = new Build(502);
  b.add('van', 12.5, 0).relou('habitue', 12.5, 2.6);
  const p = b.tower(21.5, 0, 3, {
    rooms: 3,
    w: 2.6,
    mats: ['pierre', 'metal', 'glace'],
    slab: ['metal', 'pierre'],
    roof: 'creneaux',
  });
  b.in('habitue', p.cell(0, 0), 2).in('gardien', p.cell(0, 2));
  b.in('habitue', p.cell(1, 1)).in('habitue', p.cell(2, 2), 3);
  return b.level({
    id: '5-2',
    name: 'Le parking',
    friends: ['indianne', 'lolo', 'jbg', 'mat'],
    tip: 'Les étages du parking sont longs et plats : INDIANNE peut les traverser d’un bout à l’autre.',
  });
}

function teleporteurs() {
  const b = new Build(503);
  b.add('portail', 8, 3);
  b.pillar(14, 0, 8, 'metal', 0.6);
  b.add('portail-sortie', 20, 9);
  const f = b.tower(19.6, 0, 1, { rooms: 2, w: 2.6, roof: 'toit' });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(0, 1));
  b.pillar(26, 0, 8, 'metal', 0.6);
  b.cage(24.1, 0, 'clem');
  return b.level({
    id: '5-3',
    name: 'Téléporteurs',
    friends: ['roulian', 'mat', 'indianne', 'mat'],
    tip: 'Ce qui entre dans le téléporteur ressort de l’autre, à la même vitesse.',
  });
}

function vaChercher() {
  const b = new Build(504);
  b.add('voiture', 12.5, 0);
  const f = b.tower(20, 0, 1, {
    rooms: 3,
    w: 2.8,
    h: 2,
    mats: ['metal', 'pierre'],
    slab: ['metal'],
    fill: false,
  });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(0, 1)).in('pilier', f.cell(0, 2));
  b.add('borne', 26.5, 0);
  return b.level({
    id: '5-4',
    name: 'Va chercher !',
    friends: ['clem', 'clem', 'clem'],
    tip: 'CLEM : touche en vol, son chien fonce au ras du sol et bouscule les fondations.',
  });
}

function leChantier() {
  const b = new Build(505);
  b.clutter(10.5, 14.5, 0, ['pierre', 'bois']);
  const s = b.tower(21, 0, 4, { rooms: 2, w: 2.4, mats: ['metal', 'bois'], roof: 'rien' });
  b.in('pilier', s.cell(0, 0)).put('tnt', s.cell(0, 1)).in('habitue', s.cell(1, 1));
  b.in('gardien', s.cell(2, 0)).in('habitue', s.cell(3, 1), 2);
  b.clutter(19.2, 22.8, s.top, ['metal', 'pierre']);
  b.stack(26.5, 0, ['poubelle', 'poubelle']);
  b.relou('habitue', 28.2, 0, 3);
  return b.level({ id: '5-5', name: 'Le chantier', friends: ['clem', 'lolo', 'jbg', 'roulie'] });
}

function lesToits() {
  const b = new Build(506);
  const a = b.ledge(9.6, 15, 3, 0.3);
  b.in('habitue', b.tower(12.3, a, 1, { roof: 'toit' }).cell(0));
  const c = b.ledge(15.8, 20.2, 1, 0.3);
  b.in('gardien', b.tower(18, c, 1, { w: 2.6, mats: ['metal'], roof: 'creneaux' }).cell(0));
  const d = b.ledge(21, 32, 5, 0.3);
  const f = b.tower(24.6, d, 2, { rooms: [2, 1], w: 2.8, mats: ['metal', 'bois'], roof: 'toit' });
  b.in('habitue', f.cell(0, 0), 2).in('pilier', f.cell(0, 1)).in('habitue', f.cell(1), 3);
  b.in('habitue', chimney(b, 30, d, 2.6, 'pierre', 1.2), 4);
  b.cage(35, 0, 'bubu');
  return b.level({
    id: '5-6',
    name: 'Les toits',
    friends: ['indianne', 'clem', 'roro', 'jbg'],
    tip: 'Un relou dans la cheminée : RORO smashe sa balle tout droit au fond.',
  });
}

function rayon() {
  const b = new Build(507);
  const f = b.tower(18, 0, 1, {
    rooms: 3,
    w: 2.8,
    h: 2,
    mats: ['bois', 'glace'],
    slab: ['metal'],
    fill: false,
  });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(0, 1)).in('pilier', f.cell(0, 2));
  const u = b.tower(18, f.top, 1, { rooms: 2, w: 2.6, mats: ['bois', 'glace'], roof: 'creneaux' });
  b.in('habitue', u.cell(0, 1), 2);
  return b.level({
    id: '5-7',
    name: 'Rayon',
    friends: ['bubu', 'bubu', 'bubu'],
    tip: 'BUBU : touche en vol, son rayon traverse le bois et la glace en ligne droite.',
  });
}

function laBanque() {
  const b = new Build(508);
  b.stack(12.5, 0, ['poubelle']);
  const v = b.tower(20, 0, 1, { rooms: 3, w: 2.8, h: 2, mats: ['metal'], slab: ['pierre'], fill: false });
  b.in('gardien', v.cell(0, 0)).in('pilier', v.cell(0, 1)).put('tonneau-or', v.cell(0, 2));
  const g = b.tower(20, v.top, 1, { rooms: 3, w: 2.6, mats: ['bois'], fill: false, roof: 'creneaux' });
  b.in('habitue', g.cell(0, 0), 2).in('habitue', g.cell(0, 1), 3).in('habitue', g.cell(0, 2), 4);
  const s = b.tower(29, 0, 3, { w: 2.4, mats: ['glace'], roof: 'cadre' });
  b.in('habitue', s.cell(2));
  return b.level({
    id: '5-8',
    name: 'La banque',
    friends: ['bubu', 'lolo', 'roulie', 'jbg'],
    tip: 'Trois relous alignés à l’étage : un seul rayon de BUBU les traverse tous.',
  });
}

function leMetro() {
  const b = new Build(509);
  b.rock([
    [12, 3.6],
    [28, 3.6],
    [28, 5],
    [12, 5],
  ]);
  const f = b.tower(20, 0, 1, { rooms: 3, w: 2.6, mats: ['metal'], fill: false, roof: 'rien' });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(0, 1)).in('habitue', f.cell(0, 2), 2);
  const t = b.tower(14.5, 5, 2, { w: 2.6, mats: ['pierre'], roof: 'creneaux' });
  b.in('habitue', t.cell(1), 3);
  const u = b.tower(21, 5, 1, { rooms: 2, w: 2.6, roof: 'toit' });
  b.in('habitue', u.cell(0, 0), 4).in('habitue', u.cell(0, 1));
  b.clutter(25, 27.8, 5, ['metal', 'bois']);
  b.cage(31, 0, 'mar-1');
  return b.level({
    id: '5-9',
    name: 'Le métro',
    friends: ['indianne', 'bubu', 'clem', 'mat'],
    tip: 'Sous la rue, le métro : le chien de CLEM file au ras du sol, INDIANNE lévite dans le tunnel.',
  });
}

function lancerFrappe() {
  const b = new Build(510);
  b.pillar(12, 0, 2.6, 'metal', 0.5);
  b.pillar(15.8, 0, 2.6, 'metal');
  b.roof(13.9, b.block(13.9, b.plank(13.9, 2.6, 4.3, 'metal')), 1.2);
  b.pillar(17.4, 0, 2.6, 'metal');
  b.pillar(21, 0, 2.6, 'metal', 0.5);
  b.roof(19.2, b.block(19.2, b.plank(19.2, 2.6, 4.3, 'metal')), 1.2);
  b.relou('habitue', 13.6, 0).add('bidon', 14.8, 0).relou('gardien', 16.6, 0).relou('habitue', 19.2, 0, 2);
  const top = b.island(23.6, 29, 4);
  b.in('habitue', b.tower(26.3, top, 1, { mats: ['metal', 'bois'], roof: 'creneaux' }).cell(0), 3);
  return b.level({
    id: '5-10',
    name: 'Lancer frappé',
    friends: ['mar-1', 'mar-1', 'mar-1'],
    tip: 'MAR-1 : survole le toit, puis touche. Le palet pique par la fente.',
  });
}

function tourDeVerre() {
  const b = new Build(511);
  b.in('habitue', chimney(b, 13.5, 0, 3, 'pierre'));
  const t = b.tower(22, 0, 5, { rooms: 2, w: 2.6, h: 1.9, mats: ['glace', 'metal'], roof: 'creneaux' });
  b.in('pilier', t.cell(0, 0)).in('habitue', t.cell(1, 1), 2).in('habitue', t.cell(3, 0), 3);
  b.in('habitue', t.cell(4, 1), 4);
  return b.level({ id: '5-11', name: 'La tour de verre', friends: ['mar-1', 'bubu', 'tom', 'roro', 'lolo'] });
}

function megaRobot() {
  const b = new Build(512);
  b.add('tonneau-fusee', 11, 0, { a: -38 });
  b.add('van', 15.5, 0).relou('habitue', 15.5, 2.6);
  const t = b.tower(21, 0, 3, { w: 2.6, mats: ['metal', 'glace'], roof: 'creneaux' });
  b.in('gardien', t.cell(0)).in('habitue', t.cell(2), 2);
  const top = b.ledge(26, 42, 2, 0.5);
  b.relou('robot', 34, top);
  b.pillar(30.5, top, 4.4, 'metal', 0.5);
  b.pillar(37.5, top, 4.4, 'metal', 0.5);
  const roof = b.plank(34, top + 4.4, 7.8, 'pierre', 0.5);
  b.add('baril', 32.5, roof).add('baril', 35.5, roof);
  b.add('caisson', 31.6, top).add('caisson', 36.4, top);
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

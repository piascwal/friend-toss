/* Monde 5 — La Ville : métal, voitures, tunnels, téléporteurs, toits, métro, et le Méga-Robot. */
import { Build } from './build';
import { chimney, bunker } from './pieces';
import type { WorldDef } from './index';

function leTunnel() {
  const b = new Build(501);
  const [t1, , t2] = b.terraces(8, [
    [3.6, 1.2],
    [13.4, 0],
    [7, 2],
  ]);
  b.clutter(t1.a, t1.b, t1.y, ['metal', 'bois']);
  const top = b.tunnel(14.6, 26.6, 4.6, 2.4, 1.6);
  b.relou('habitue', 18, 0).relou('gardien', 22.4, 0);
  b.add('poubelle', 15.6, 0);
  b.add('van', 20.5, top);
  b.tower(t2.mid, t2.y, 1, { roof: 'toit' });
  b.ramp(t2.b - 0.3, 36.5, 5.4, 'metal');
  const il = b.island(36.5, 41.5, 5.4);
  b.in('habitue', b.tower(39, il, 1, { w: 2.6, mats: ['metal', 'bois'], roof: 'creneaux' }).cell(0), 2);
  return b.level({
    id: '5-1',
    name: 'Le tunnel',
    friends: ['indianne', 'indianne', 'indianne'],
    tip: 'INDIANNE : touche en vol, elle lévite tout droit. Vise l’entrée du tunnel.',
  });
}

function leParking() {
  const b = new Build(502);
  const [t1, t2] = b.terraces(8, [
    [4.5, 0.8],
    [10, 2.2],
  ]);
  b.add('poubelle', t1.a + 0.5, t1.y);
  b.clutter(t1.a + 1.2, t1.b, t1.y, ['metal', 'pierre']);
  const p = b.tower(t2.mid, t2.y, 3, {
    rooms: 2,
    w: 2.8,
    mats: ['pierre', 'metal', 'glace'],
    slab: ['metal', 'pierre'],
    roof: 'creneaux',
  });
  b.in('habitue', p.cell(0, 0)).in('gardien', p.cell(1, 1)).in('habitue', p.cell(2, 0), 2);
  const il = b.island(26, 31.5, 6.4);
  b.in('habitue', b.tower(28.75, il, 1, { w: 2.6, roof: 'toit' }).cell(0), 3);
  b.ramp(34.5, 31.5, 6.4, 'metal');
  return b.level({
    id: '5-2',
    name: 'Le parking',
    friends: ['indianne', 'lolo', 'jbg', 'mat'],
    tip: 'Les étages du parking sont longs et plats : INDIANNE peut les traverser d’un bout à l’autre.',
  });
}

function teleporteurs() {
  const b = new Build(503);
  const [t] = b.terraces(11.5, [[18, 1.5]]);
  b.add('portail', 8, 3);
  b.pillar(14, t.y, 8, 'metal', 0.6);
  b.add('portail-sortie', 20, 10.5);
  const f = b.tower(19.6, t.y, 1, { rooms: 2, w: 2.6, roof: 'toit' });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(0, 1));
  b.pillar(26, t.y, 8, 'metal', 0.6);
  b.cage(24.1, t.y, 'clem');
  const il = b.island(31.5, 36.5, 5);
  b.in('habitue', b.tower(34, il, 1, { w: 2.6, roof: 'boule' }).cell(0), 2);
  return b.level({
    id: '5-3',
    name: 'Téléporteurs',
    friends: ['roulian', 'mat', 'indianne', 'mat'],
    tip: 'Ce qui entre dans le téléporteur ressort de l’autre, à la même vitesse.',
  });
}

function vaChercher() {
  const b = new Build(504);
  const [t1, t2, t3] = b.terraces(8, [
    [4.5, 1.4],
    [11, 0],
    [5, 2.4],
  ]);
  b.add('voiture', t1.mid, t1.y);
  const f = b.tower(t2.mid, 0, 1, {
    rooms: 3,
    w: 2.8,
    h: 2,
    mats: ['metal', 'pierre'],
    slab: ['metal'],
    fill: false,
  });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(0, 1)).in('pilier', f.cell(0, 2));
  const il = b.island(t2.mid - 3, t2.mid + 3, 7.2);
  b.clutter(t2.mid - 2.6, t2.mid + 2.6, il, ['metal', 'bois']);
  b.add('borne', t3.mid, t3.y);
  return b.level({
    id: '5-4',
    name: 'Va chercher !',
    friends: ['clem', 'clem', 'clem'],
    tip: 'CLEM : touche en vol, son chien fonce au ras du sol et bouscule les fondations.',
  });
}

function leChantier() {
  const b = new Build(505);
  const [t1, t2, t3] = b.terraces(8, [
    [5, 0.6],
    [8, 2.6],
    [6, 1],
  ]);
  b.clutter(t1.a, t1.b, t1.y, ['pierre', 'bois']);
  const s = b.tower(t2.mid, t2.y, 4, { rooms: 2, w: 2.6, mats: ['metal', 'bois'], roof: 'rien' });
  b.in('gardien', s.cell(0, 0)).put('tnt', s.cell(0, 1)).in('habitue', s.cell(1, 1));
  b.in('habitue', s.cell(3, 0), 2);
  b.clutter(t2.mid - 2.2, t2.mid + 2.2, s.top, ['metal', 'pierre']);
  b.stack(t3.a + 0.4, t3.y, ['poubelle', 'poubelle']);
  const il = b.island(t3.mid + 0.8, t3.mid + 6, 5.4);
  b.ramp(t3.a + 1.2, t3.mid + 0.8, 5.4, 'metal');
  b.in('habitue', b.tower(t3.mid + 3.4, il, 1, { w: 2.6, mats: ['metal'], roof: 'toit' }).cell(0), 3);
  return b.level({ id: '5-5', name: 'Le chantier', friends: ['clem', 'lolo', 'jbg', 'roulie'] });
}

function lesToits() {
  const b = new Build(506);
  const a = b.ledge(9.6, 15, 3, 0.3);
  b.in('habitue', b.tower(12.3, a, 1, { roof: 'toit' }).cell(0));
  const c = b.ledge(15.8, 20.2, 1, 0.3);
  b.in('gardien', b.tower(18, c, 1, { w: 2.6, mats: ['metal'], roof: 'creneaux' }).cell(0));
  b.cage(18, b.island(15.6, 20.4, 7.4), 'bubu');
  const d = b.ledge(21, 32, 5, 0.3);
  const f = b.tower(24.6, d, 2, { rooms: [2, 1], w: 2.8, mats: ['metal', 'bois'], roof: 'toit' });
  b.in('habitue', f.cell(0, 0), 2).in('pilier', f.cell(0, 1)).in('habitue', f.cell(1), 3);
  b.in('habitue', chimney(b, 30, d, 2.6, 'pierre', 1.2), 4);
  return b.level({
    id: '5-6',
    name: 'Les toits',
    friends: ['indianne', 'clem', 'roro', 'jbg'],
    tip: 'Un relou dans la cheminée : RORO smashe sa balle tout droit au fond.',
  });
}

function rayon() {
  const b = new Build(507);
  const [t] = b.terraces(8, [[12, 1.6]]);
  const f = b.tower(t.mid, t.y, 1, {
    rooms: 3,
    w: 2.8,
    h: 2,
    mats: ['bois', 'glace'],
    slab: ['metal'],
    fill: false,
  });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(0, 1)).in('pilier', f.cell(0, 2));
  const u = b.tower(t.mid, f.top, 1, { rooms: 2, w: 2.6, mats: ['bois', 'glace'], roof: 'creneaux' });
  b.in('habitue', u.cell(0, 1), 2);
  const il = b.island(23, 28, 5.2);
  b.clutter(23.4, 27.6, il, ['bois', 'glace']);
  return b.level({
    id: '5-7',
    name: 'Rayon',
    friends: ['bubu', 'bubu', 'bubu'],
    tip: 'BUBU : touche en vol, son rayon traverse le bois et la glace en ligne droite.',
  });
}

function laBanque() {
  const b = new Build(508);
  const [t1, t2] = b.terraces(8.5, [
    [10.5, 1.2],
    [6.5, 3.2],
  ]);
  const v = b.tower(t1.mid, t1.y, 1, {
    rooms: 3,
    w: 2.6,
    h: 2,
    mats: ['metal'],
    slab: ['pierre'],
    fill: false,
  });
  b.in('gardien', v.cell(0, 0)).in('pilier', v.cell(0, 1)).put('tonneau-or', v.cell(0, 2));
  const g = b.tower(t1.mid, v.top, 1, { rooms: 3, w: 2.4, mats: ['bois'], fill: false, roof: 'creneaux' });
  b.in('habitue', g.cell(0, 0), 2).in('habitue', g.cell(0, 1), 3).in('habitue', g.cell(0, 2), 4);
  const s = b.tower(t2.mid, t2.y, 3, { w: 2.4, mats: ['glace'], roof: 'cadre' });
  b.in('habitue', s.cell(2));
  const il = b.island(t2.b + 1.5, t2.b + 6, 6);
  b.clutter(t2.b + 1.9, t2.b + 5.6, il, ['metal', 'glace']);
  b.ramp(t2.b + 9, t2.b + 6, 6, 'metal');
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
  const [t] = b.terraces(9.5, [[14, 1.4]]);
  const y = t.y;
  b.pillar(12, y, 2.6, 'metal', 0.5);
  b.pillar(15.8, y, 2.6, 'metal');
  b.roof(13.9, b.block(13.9, b.plank(13.9, y + 2.6, 4.3, 'metal')), 1.2);
  b.pillar(17.4, y, 2.6, 'metal');
  b.pillar(21, y, 2.6, 'metal', 0.5);
  b.roof(19.2, b.block(19.2, b.plank(19.2, y + 2.6, 4.3, 'metal')), 1.2);
  b.relou('habitue', 13.6, y).add('bidon', 14.8, y).relou('gardien', 16.6, y).relou('habitue', 19.2, y, 2);
  const il = b.island(26, 31.4, 5.6);
  b.in('habitue', b.tower(28.7, il, 1, { mats: ['metal', 'bois'], roof: 'creneaux' }).cell(0), 3);
  b.ramp(34.4, 31.4, 5.6, 'metal');
  return b.level({
    id: '5-10',
    name: 'Lancer frappé',
    friends: ['mar-1', 'mar-1', 'mar-1'],
    tip: 'MAR-1 : survole le toit, puis touche. Le palet pique par la fente.',
  });
}

function tourDeVerre() {
  const b = new Build(511);
  const [t1, t2] = b.terraces(8.5, [
    [5, 1.6],
    [9, 0.5],
  ]);
  b.in('habitue', chimney(b, t1.mid, t1.y, 3, 'pierre', 1.4));
  const t = b.tower(t2.mid, t2.y, 5, {
    rooms: 2,
    w: 2.6,
    h: 1.9,
    mats: ['glace', 'metal'],
    roof: 'creneaux',
  });
  b.in('pilier', t.cell(0, 0)).in('habitue', t.cell(1, 1), 2).in('habitue', t.cell(3, 0), 3);
  b.in('habitue', t.cell(4, 1), 4);
  const il = b.island(t2.b + 1.6, t2.b + 6.4, 4.6);
  b.add('tonneau-or', t2.b + 4, il);
  return b.level({ id: '5-11', name: 'La tour de verre', friends: ['mar-1', 'bubu', 'tom', 'roro', 'lolo'] });
}

function megaRobot() {
  const b = new Build(512);
  const [t] = b.terraces(9, [[9, 1.4]]);
  b.add('tonneau-fusee', 7.6, 0, { a: -38 });
  b.add('van', t.a + 1.6, t.y).relou('habitue', t.a + 1.6, t.y + 2.6);
  const w = b.tower(t.b - 1.7, t.y, 3, { w: 2.6, mats: ['metal', 'glace'], roof: 'creneaux' });
  b.in('gardien', w.cell(0)).in('habitue', w.cell(2), 2);
  const il = b.island(21, 25.4, 6.8);
  b.add('tnt', 22.4, il).add('baril', 24, il);
  const top = b.ledge(27, 42, 2, 0.5);
  b.relou('robot', 34.5, top);
  b.pillar(31, top, 4.4, 'metal', 0.5);
  b.pillar(38, top, 4.4, 'metal', 0.5);
  const roof = b.plank(34.5, top + 4.4, 7.8, 'pierre', 0.5);
  b.add('baril', 33, roof).add('baril', 36, roof);
  b.add('caisson', 32.1, top).add('caisson', 36.9, top);
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

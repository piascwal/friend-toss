/* Monde 4 — La Plage : dunes, murs, pneus, pilotis, tonneaux-fusées, phare, et le Champion. */
import { Build } from './build';
import { stilts, bunker } from './pieces';
import type { WorldDef } from './index';

function doubleSaut() {
  const b = new Build(401);
  b.rock([
    [10, -0.6],
    [12.6, 4.6],
    [14, 4.6],
    [16.6, -0.6],
  ]);
  b.in('habitue', b.tower(19.6, 0, 1, { roof: 'toit' }).cell(0));
  b.rock([
    [22.6, -0.6],
    [24.4, 3.4],
    [25.4, 3.4],
    [27.2, -0.6],
  ]);
  const t = b.tower(30.4, 0, 1, { rooms: 2, w: 2.8, roof: 'creneaux' });
  b.in('habitue', t.cell(0, 0), 2).in('gardien', t.cell(0, 1));
  return b.level({
    id: '4-1',
    name: 'Double saut',
    friends: ['soso', 'soso', 'soso'],
    tip: 'SOSO : touche en vol, elle rebondit en l’air. Parfait pour passer les dunes.',
  });
}

function lesDunes() {
  const b = new Build(402);
  b.clutter(11.6, 14.4, b.peak(13, 8, 3.6, 3), ['bois']);
  b.in('habitue', b.tower(18.2, 0, 1, { w: 2.6, roof: 'toit' }).cell(0));
  const t = b.tower(24.6, b.peak(24.6, 9, 4, 3.4), 2, { roof: 'toit' });
  b.in('gardien', t.cell(0)).in('habitue', t.cell(1), 2);
  b.in('habitue', b.tower(31.4, 0, 1, { roof: 'creneaux' }).cell(0), 3);
  return b.level({
    id: '4-2',
    name: 'Les dunes',
    friends: ['soso', 'mat', 'tom', 'roulian'],
    tip: 'Des relous cachés derrière les dunes : SOSO rebondit par-dessus.',
  });
}

function lesPneus() {
  const b = new Build(403);
  b.stack(12.5, 0, ['pneus', 'pneus', 'pneus', 'pneus']);
  b.stack(13.4, 0, ['pneus', 'pneus', 'pneus']);
  const f = b.tower(17.2, 0, 2, { w: 2.8, roof: 'toit' });
  b.in('habitue', f.cell(0)).in('habitue', f.cell(1), 2);
  b.stack(20.5, 0, ['pneus', 'pneus', 'pneus', 'pneus']);
  b.stack(21.4, 0, ['pneus', 'pneus', 'pneus', 'pneus']);
  const c = b.tower(26.6, b.ledge(23.6, 29.6, 1.4), 1, { rooms: 2, w: 2.8, roof: 'creneaux' });
  b.in('gardien', c.cell(0, 0)).in('habitue', c.cell(0, 1), 3);
  b.cage(32, 0, 'elo');
  return b.level({
    id: '4-3',
    name: 'Les pneus',
    friends: ['soso', 'lolo', 'jbg', 'mat'],
    tip: 'Les pneus sont indestructibles : passe par-dessus, ou tombe entre deux murs.',
  });
}

function pirouette() {
  const b = new Build(404);
  const c = b.tower(16.5, 0, 2, { rooms: [2, 1], w: 2.8, mats: ['pierre', 'bois'], roof: 'toit' });
  b.in('habitue', c.cell(0, 0)).in('gardien', c.cell(0, 1)).in('habitue', c.cell(1), 2);
  const top = b.island(21.8, 27.6, 4.4);
  b.in('habitue', b.tower(24.7, top, 1, { mats: ['pierre', 'metal'], roof: 'creneaux' }).cell(0), 3);
  return b.level({
    id: '4-4',
    name: 'La cabine de plage',
    friends: ['elo', 'elo', 'elo'],
    tip: 'ELO : touche en vol pour la Pirouette. Elle ricoche partout à l’intérieur des cabines.',
  });
}

function tonneauxFusees() {
  const b = new Build(405);
  b.add('tonneau-fusee', 9.5, 0, { a: -35 });
  b.add('tonneau-fusee', 10.8, 0, { a: -28 });
  const f = b.tower(17.5, 0, 3, { rooms: [2, 2, 1], w: 2.8, mats: ['bois', 'pierre'], roof: 'toit' });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(0, 1)).in('habitue', f.cell(1, 1), 2);
  b.in('habitue', f.cell(2), 3);
  const r = b.tower(26, b.ledge(23.4, 28.6, 1.6), 1, { roof: 'boule' });
  b.in('habitue', r.cell(0), 4);
  return b.level({
    id: '4-5',
    name: 'Tonneaux-fusées',
    friends: ['mat', 'elo', 'tom', 'jbg'],
    tip: 'Touche un tonneau-fusée : il part dans le sens où il pointe, puis explose.',
  });
}

function lePhare() {
  const b = new Build(406);
  b.in('habitue', stilts(b, 12.5, 0, 2.2));
  const top = b.ledge(19.6, 27.4, 2, 1.6);
  const t = b.tower(23.5, top, 4, { w: 2.6, h: 1.9, mats: ['pierre', 'glace'], fill: false, roof: 'toit' });
  b.in('gardien', t.cell(0)).in('habitue', t.cell(2), 2).in('habitue', t.cell(3), 3);
  b.clutter(25.4, 27.3, top, ['pierre']);
  return b.level({
    id: '4-6',
    name: 'Le phare',
    friends: ['lolo', 'soso', 'jbg', 'elo'],
    tip: 'Le phare est haut et étroit : ELO, en pirouette, ricoche d’un étage à l’autre.',
  });
}

function pilotis() {
  const b = new Build(407);
  b.in('habitue', stilts(b, 12.5, 0, 2));
  b.in('gardien', stilts(b, 18.2, 0, 3.6));
  b.in('habitue', stilts(b, 23.9, 0, 2.6), 2);
  b.relou('habitue', 18.2, 0, 3);
  b.cage(28.6, b.peak(28.6, 5, 2.8, 1.2), 'roro');
  return b.level({ id: '4-7', name: 'La cabane sur pilotis', friends: ['soso', 'elo', 'roulie', 'mat'] });
}

function smash() {
  const b = new Build(408);
  const top = b.tunnel(12.5, 22.5, 5, 2.4, 1.4);
  b.relou('habitue', 15.2, 0).add('tnt', 17.2, 0).relou('habitue', 19.2, 0, 2);
  b.in('habitue', b.tower(17.5, top, 1, { rooms: 2, w: 2.6, roof: 'creneaux' }).cell(0, 1), 3);
  b.add('pneus', 24.6, 0);
  b.in('gardien', b.tower(28, 0, 1, { roof: 'toit' }).cell(0));
  return b.level({
    id: '4-8',
    name: 'Smash',
    friends: ['roro', 'roro', 'roro'],
    tip: 'RORO : pendant son vol, touche l’endroit visé. Il y smashe une balle de padel… même sous la roche.',
  });
}

function laJetee() {
  const b = new Build(409);
  for (const x of [11, 15.5, 20, 24.5, 29]) b.pillar(x, 0, 2.5, 'bois', 0.5);
  const deck = b.plank(20, 2.5, 19, 'bois', 0.5);
  b.in('habitue', b.tower(13.4, deck, 1, { w: 2.8, roof: 'toit' }).cell(0));
  b.stack(17.6, deck, ['tonneau', 'tonneau']);
  const c = b.tower(23, deck, 1, { rooms: 2, w: 2.6, mats: ['glace', 'bois'], roof: 'toit' });
  b.in('gardien', c.cell(0, 0)).in('habitue', c.cell(0, 1), 2);
  b.relou('habitue', 17.7, 0, 3).relou('habitue', 27, 0, 4);
  b.clutter(27.6, 29.4, deck, ['bois']);
  return b.level({
    id: '4-9',
    name: 'La jetée',
    friends: ['roro', 'soso', 'jbg', 'lolo'],
    tip: 'Deux relous se cachent sous la jetée : RORO smashe pile entre les poteaux.',
  });
}

function chateauDeSable() {
  const b = new Build(410);
  const l = b.tower(13.5, 0, 3, { w: 2.6, mats: ['pierre', 'bois'], roof: 'rien' });
  const k = b.tower(22.5, b.ledge(18.4, 26.6, 2), 2, {
    rooms: 2,
    w: 2.8,
    h: 2,
    mats: ['pierre', 'bois'],
    fill: false,
    roof: 'rien',
  });
  const r = b.tower(31, 0, 3, { w: 2.6, mats: ['pierre', 'bois'], roof: 'rien' });
  b.in('habitue', l.cell(2)).in('pilier', k.cell(0, 0)).put('tonneau-or', k.cell(0, 1));
  b.in('habitue', k.cell(1, 1), 2).in('gardien', r.cell(0)).in('habitue', r.cell(2), 3);
  const p = b.arch(14.1, l.top, 20.6, k.top, Math.max(l.top, k.top) + 1, ['pierre']);
  const q = b.arch(24.4, k.top, 30.4, r.top, Math.max(k.top, r.top) + 1, ['pierre']);
  b.crenels(17.3, p.top, 4, 'pierre');
  b.crenels(27.4, q.top, 4, 'pierre');
  return b.level({ id: '4-10', name: 'Le château de sable', friends: ['elo', 'roro', 'lolo', 'jbm', 'tom'] });
}

function fuseesEnSerie() {
  const b = new Build(411);
  b.add('tonneau-fusee', 9.5, 0, { a: -30 });
  b.add('tonneau-fusee', 10.7, 0, { a: -38 });
  b.add('tonneau-fusee', 11.9, 0, { a: -25 });
  const s = b.tower(19.5, 0, 3, { rooms: 2, w: 2.6, mats: ['metal', 'bois'], roof: 'rien' });
  b.in('habitue', s.cell(0, 0)).put('tnt', s.cell(0, 1)).in('gardien', s.cell(1, 0));
  b.put('baril', s.cell(1, 1)).in('habitue', s.cell(2, 0), 2).in('habitue', s.cell(2, 1), 3);
  b.in('pilier', bunker(b, 27.5, 0, 1).cell(0, 0));
  return b.level({ id: '4-11', name: 'Feu d’artifice', friends: ['roro', 'mat', 'elo', 'jbg', 'soso'] });
}

function leChampion() {
  const b = new Build(412);
  b.add('tonneau-fusee', 11.5, 0, { a: -35 });
  const t = b.tower(16.5, 0, 3, { w: 2.6, mats: ['pierre', 'bois'], roof: 'creneaux' });
  b.in('gardien', t.cell(0)).in('habitue', t.cell(2));
  const top = b.ledge(21.6, 36.4, 1.5, 0.5);
  b.relou('champion', 29, top);
  b.stack(25, top, ['pneus', 'pneus', 'pneus']);
  b.stack(33, top, ['pneus', 'pneus', 'pneus']);
  const roof = b.plank(29, top + 3.39, 9.4, 'metal');
  b.add('baril', 27, roof).add('baril', 31, roof);
  b.add('tnt', 26.5, top);
  const s = b.tower(40, 0, 2, { w: 3.2, h: 2, fill: false, roof: 'toit' });
  b.in('pilier', s.cell(0)).in('habitue', s.cell(1), 2);
  b.cage(44, 0, 'indianne');
  return b.level({
    id: '4-12',
    name: 'BOSS : le Champion',
    friends: ['soso', 'roro', 'elo', 'lolo', 'jbm', 'roro'],
    tip: 'Les barils du toit tombent pile sur le Champion…',
  });
}

export const PLAGE: WorldDef = {
  id: 4,
  name: 'La Plage',
  theme: 'plage',
  tagline: 'Dunes, pilotis, pneus et tonneaux-fusées sous le soleil.',
  color: '#ffc23d',
  levels: [
    doubleSaut(),
    lesDunes(),
    lesPneus(),
    pirouette(),
    tonneauxFusees(),
    lePhare(),
    pilotis(),
    smash(),
    laJetee(),
    chateauDeSable(),
    fuseesEnSerie(),
    leChampion(),
  ],
};

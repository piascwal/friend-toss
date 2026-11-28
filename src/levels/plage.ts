/* Monde 4 — La Plage : dunes, murs, pneus, pilotis, tonneaux-fusées, phare, et le Champion. */
import { Build } from './build';
import { stilts, bunker } from './pieces';
import type { WorldDef } from './index';

function doubleSaut() {
  const b = new Build(401);
  const [d1, h1, d2, h2] = b.terraces(9, [
    [2, 3.4],
    [7.5, 0.6],
    [2, 2.8],
    [9.5, 0.8],
  ]);
  b.clutter(d1.a - 0.3, d1.b + 0.3, d1.y, ['bois']);
  b.in('habitue', b.tower(h1.mid, h1.y, 1, { roof: 'toit' }).cell(0));
  b.clutter(d2.a - 0.3, d2.b + 0.3, d2.y, ['bois', 'pierre']);
  const t = b.tower(h2.mid, h2.y, 1, { rooms: 2, w: 2.8, roof: 'creneaux' });
  b.in('habitue', t.cell(0, 0), 2).in('gardien', t.cell(0, 1));
  const il = b.island(h2.b + 1.8, h2.b + 6.2, 4.8);
  b.clutter(h2.b + 2.2, h2.b + 5.8, il, ['bois']);
  return b.level({
    id: '4-1',
    name: 'Double saut',
    friends: ['soso', 'soso', 'soso'],
    tip: 'SOSO : touche en vol, elle rebondit en l’air. Parfait pour passer les dunes.',
  });
}

function lesDunes() {
  const b = new Build(402);
  const [a, h1, c, h2] = b.terraces(8.5, [
    [3, 2.6],
    [7.5, 0.5],
    [6.5, 3.4],
    [7.5, 1],
  ]);
  b.clutter(a.a - 0.2, a.b + 0.2, a.y, ['bois']);
  b.in('habitue', b.tower(h1.mid, h1.y, 1, { w: 2.6, roof: 'toit' }).cell(0));
  b.clutter(h1.a - 0.5, h1.b + 0.5, b.island(h1.a - 0.5, h1.b + 0.5, 6.6), ['bois', 'pierre']);
  const t = b.tower(c.mid, c.y, 2, { w: 2.4, roof: 'toit' });
  b.in('gardien', t.cell(0)).in('habitue', t.cell(1), 2);
  b.in('habitue', b.tower(h2.mid, h2.y, 1, { roof: 'creneaux' }).cell(0), 3);
  return b.level({
    id: '4-2',
    name: 'Les dunes',
    friends: ['soso', 'mat', 'tom', 'roulian'],
    tip: 'Des relous cachés derrière les dunes : SOSO rebondit par-dessus.',
  });
}

function lesPneus() {
  const b = new Build(403);
  const [t1, t2, t3] = b.terraces(9, [
    [8.5, 1],
    [5, 0],
    [9, 1.6],
  ]);
  b.stack(t1.a + 0.45, t1.y, ['pneus', 'pneus', 'pneus', 'pneus']);
  b.stack(t1.a + 1.35, t1.y, ['pneus', 'pneus', 'pneus']);
  const f = b.tower(t1.b - 1.8, t1.y, 2, { w: 2.8, roof: 'toit' });
  b.in('habitue', f.cell(0)).in('habitue', f.cell(1), 2);
  b.stack(t2.mid - 0.45, 0, ['pneus', 'pneus', 'pneus', 'pneus']);
  b.stack(t2.mid + 0.45, 0, ['pneus', 'pneus', 'pneus', 'pneus']);
  const c = b.tower(t3.mid, t3.y, 1, { rooms: 2, w: 2.8, roof: 'creneaux' });
  b.in('gardien', c.cell(0, 0)).in('habitue', c.cell(0, 1), 3);
  b.cage(t3.b + 3.6, b.island(t3.b + 1.6, t3.b + 5.6, 5), 'elo');
  return b.level({
    id: '4-3',
    name: 'Les pneus',
    friends: ['soso', 'lolo', 'jbg', 'mat'],
    tip: 'Les pneus sont indestructibles : passe par-dessus, ou tombe entre deux murs.',
  });
}

function pirouette() {
  const b = new Build(404);
  const [t1, t2] = b.terraces(8.5, [
    [9.5, 1.2],
    [5, 3],
  ]);
  const c = b.tower(t1.mid, t1.y, 2, { rooms: [2, 1], w: 2.8, mats: ['pierre', 'bois'], roof: 'toit' });
  b.in('habitue', c.cell(0, 0)).in('gardien', c.cell(0, 1)).in('habitue', c.cell(1), 2);
  b.clutter(t2.a, t2.b, t2.y, ['pierre', 'bois']);
  const il = b.island(t2.b + 1.4, t2.b + 6.4, 6.2);
  b.in('habitue', b.tower(t2.b + 3.9, il, 1, { mats: ['pierre', 'metal'], roof: 'creneaux' }).cell(0), 3);
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
  const [t1, t2] = b.terraces(12, [
    [9.5, 1.2],
    [6, 2.4],
  ]);
  const f = b.tower(t1.mid, t1.y, 3, { rooms: [2, 2, 1], w: 2.8, mats: ['bois', 'pierre'], roof: 'toit' });
  b.in('habitue', f.cell(0, 0)).in('gardien', f.cell(0, 1)).in('habitue', f.cell(1, 1), 2);
  b.in('habitue', f.cell(2), 3);
  b.in('habitue', b.tower(t2.mid - 0.4, t2.y, 1, { w: 2.6, roof: 'boule' }).cell(0), 4);
  b.ramp(t2.b - 0.3, t2.b + 1.6, 6.2);
  b.clutter(t2.b + 2, t2.b + 5.8, b.island(t2.b + 1.6, t2.b + 6.2, 6.2), ['bois']);
  return b.level({
    id: '4-5',
    name: 'Tonneaux-fusées',
    friends: ['mat', 'elo', 'tom', 'jbg'],
    tip: 'Touche un tonneau-fusée : il part dans le sens où il pointe, puis explose.',
  });
}

function lePhare() {
  const b = new Build(406);
  const [t] = b.terraces(9.5, [[6, 0.8]]);
  b.in('habitue', stilts(b, t.mid, t.y, 2.2));
  const top = b.ledge(19.6, 27.4, 2, 1.6);
  const p = b.tower(23.5, top, 4, { w: 2.6, h: 1.9, mats: ['pierre', 'glace'], fill: false, roof: 'toit' });
  b.in('gardien', p.cell(0)).in('habitue', p.cell(2), 2).in('habitue', p.cell(3), 3);
  b.clutter(25.4, 27.3, top, ['pierre']);
  b.clutter(30.4, 34.2, b.island(30, 34.6, 5.6), ['pierre', 'bois']);
  return b.level({
    id: '4-6',
    name: 'Le phare',
    friends: ['lolo', 'soso', 'jbg', 'elo'],
    tip: 'Le phare est haut et étroit : ELO, en pirouette, ricoche d’un étage à l’autre.',
  });
}

function pilotis() {
  const b = new Build(407);
  const [t1, t2, t3] = b.terraces(9, [
    [5, 1.2],
    [6.5, 0],
    [6, 1.6],
  ]);
  b.in('habitue', stilts(b, t1.mid, t1.y, 2));
  b.in('gardien', stilts(b, t2.mid, 0, 3.6));
  b.relou('habitue', t2.mid, 0, 3);
  b.in('habitue', stilts(b, t3.mid, t3.y, 2), 2);
  b.cage(t3.b + 3.6, b.island(t3.b + 1.6, t3.b + 5.6, 5.4), 'roro');
  return b.level({ id: '4-7', name: 'La cabane sur pilotis', friends: ['soso', 'elo', 'roulie', 'mat'] });
}

function smash() {
  const b = new Build(408);
  const top = b.tunnel(12.5, 22.5, 5, 2.4, 1.4);
  b.relou('habitue', 15.2, 0).add('tnt', 17.2, 0).relou('habitue', 19.2, 0, 2);
  b.in('habitue', b.tower(17.5, top, 1, { rooms: 2, w: 2.6, roof: 'creneaux' }).cell(0, 1), 3);
  const [t] = b.terraces(23.6, [[6.5, 1.4]]);
  b.in('gardien', b.tower(t.mid, t.y, 1, { roof: 'toit' }).cell(0));
  b.clutter(31.9, 35.6, b.island(31.5, 36, 5.2), ['bois', 'pierre']);
  return b.level({
    id: '4-8',
    name: 'Smash',
    friends: ['roro', 'roro', 'roro'],
    tip: 'RORO : pendant son vol, touche l’endroit visé. Il y smashe une balle de padel… même sous la roche.',
  });
}

function laJetee() {
  const b = new Build(409);
  const [t1, t2, t3] = b.terraces(9, [
    [3.4, 1.2],
    [10, 0],
    [4, 0.8],
  ]);
  const deckY = 3.2;
  for (const [x, y] of [
    [t1.mid, t1.y],
    [t2.a + 0.8, 0],
    [t2.mid, 0],
    [t2.b - 0.8, 0],
    [t3.mid, t3.y],
  ] as const)
    b.pillar(x, y, deckY - y, 'bois', 0.5);
  const deck = b.plank((t1.mid + t3.mid) / 2, deckY, t3.mid - t1.mid + 1.4, 'bois', 0.5);
  b.in('habitue', b.tower(t1.mid + 2.2, deck, 1, { w: 2.8, roof: 'toit' }).cell(0));
  b.stack(t2.mid - 1.2, deck, ['tonneau', 'tonneau']);
  const c = b.tower(t2.b + 1.2, deck, 1, { rooms: 2, w: 2.6, mats: ['glace', 'bois'], roof: 'toit' });
  b.in('gardien', c.cell(0, 0)).in('habitue', c.cell(0, 1), 2);
  b.relou('habitue', (t2.a + t2.mid) / 2 + 0.4, 0, 3).relou('habitue', (t2.mid + t2.b) / 2 - 0.4, 0, 4);
  b.clutter(t2.mid - 2.6, t2.mid + 1.6, b.island(t2.mid - 3, t2.mid + 2, 9.2), ['bois', 'pierre']);
  return b.level({
    id: '4-9',
    name: 'La jetée',
    friends: ['roro', 'soso', 'jbg', 'lolo'],
    tip: 'Deux relous se cachent sous la jetée : RORO smashe pile entre les poteaux.',
  });
}

function chateauDeSable() {
  const b = new Build(410);
  const [t1, t2, t3] = b.terraces(10, [
    [5.5, 1.2],
    [9, 2.6],
    [5.5, 1.4],
  ]);
  const l = b.tower(t1.mid, t1.y, 3, { w: 2.6, mats: ['pierre', 'bois'], roof: 'rien' });
  const k = b.tower(t2.mid, t2.y, 2, {
    rooms: 2,
    w: 2.8,
    h: 2,
    mats: ['pierre', 'bois'],
    fill: false,
    roof: 'rien',
  });
  const r = b.tower(t3.mid, t3.y, 3, { w: 2.6, mats: ['pierre', 'bois'], roof: 'rien' });
  b.in('habitue', l.cell(2)).in('pilier', k.cell(0, 0)).in('habitue', k.cell(1, 1), 2);
  b.in('gardien', r.cell(0)).in('habitue', r.cell(2), 3);
  const p = b.arch(t1.mid + 0.6, l.top, t2.mid - 2.1, k.top, Math.max(l.top, k.top) + 1, ['pierre']);
  const q = b.arch(t2.mid + 2.1, k.top, t3.mid - 0.6, r.top, Math.max(k.top, r.top) + 1, ['pierre']);
  b.crenels((t1.mid + t2.mid) / 2 - 0.7, p.top, 3.4, 'pierre');
  b.crenels((t2.mid + t3.mid) / 2 + 0.7, q.top, 3.4, 'pierre');
  b.add('tonneau-or', t3.b + 3.4, b.island(t3.b + 1.4, t3.b + 5.4, 5.6));
  return b.level({ id: '4-10', name: 'Le château de sable', friends: ['elo', 'roro', 'lolo', 'jbm', 'tom'] });
}

function fuseesEnSerie() {
  const b = new Build(411);
  b.add('tonneau-fusee', 9.5, 0, { a: -30 });
  b.add('tonneau-fusee', 10.7, 0, { a: -38 });
  b.add('tonneau-fusee', 11.9, 0, { a: -25 });
  const [t1, t2] = b.terraces(13.5, [
    [8, 1],
    [5, 2.2],
  ]);
  const s = b.tower(t1.mid, t1.y, 3, { rooms: 2, w: 2.6, mats: ['metal', 'bois'], roof: 'rien' });
  b.in('habitue', s.cell(0, 0)).put('tnt', s.cell(0, 1)).in('gardien', s.cell(1, 0));
  b.put('baril', s.cell(1, 1)).in('habitue', s.cell(2, 0), 2).in('habitue', s.cell(2, 1), 3);
  b.in('pilier', bunker(b, t2.mid, t2.y, 1).cell(0, 0));
  b.clutter(t2.b + 2, t2.b + 5.6, b.island(t2.b + 1.6, t2.b + 6, 6), ['metal', 'bois']);
  return b.level({ id: '4-11', name: 'Feu d’artifice', friends: ['roro', 'mat', 'elo', 'jbg', 'soso'] });
}

function leChampion() {
  const b = new Build(412);
  b.add('tonneau-fusee', 9.5, 0, { a: -35 });
  const [t] = b.terraces(11, [[5, 1.4]]);
  const w = b.tower(t.mid, t.y, 3, { w: 2.6, mats: ['pierre', 'bois'], roof: 'creneaux' });
  b.in('gardien', w.cell(0)).in('habitue', w.cell(2));
  b.cage(19.8, b.island(18.2, 21.4, 6.6), 'indianne');
  const top = b.ledge(22.6, 37.4, 1.5, 0.5);
  b.relou('champion', 30, top);
  b.stack(26, top, ['pneus', 'pneus', 'pneus']);
  b.stack(34, top, ['pneus', 'pneus', 'pneus']);
  const roof = b.plank(30, top + 3.39, 9.4, 'metal');
  b.add('baril', 28, roof).add('baril', 32, roof);
  b.add('tnt', 27.5, top);
  const s = b.tower(41.5, b.peak(41.5, 6.6, 4.2, 1.6), 2, { w: 3.2, h: 2, fill: false, roof: 'toit' });
  b.in('pilier', s.cell(0)).in('habitue', s.cell(1), 2);
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

/* Monde 4 — La Plage : dunes, murs, pneus, pilotis, tonneaux-fusées, phare, et le Champion. */
import { Build } from './build';
import type { WorldDef } from './index';

function doubleSaut() {
  const b = new Build();
  b.pillar(13, 0, 6, 'metal', 0.6);
  b.pillar(13.6, 0, 6, 'pierre', 0.6);
  const f = b.fort(18.5, 0, 2, 2, { roof: 'bois' });
  b.in('fetard', f.cell(0, 0)).in('fetard', f.cell(1, 0), 2).in('videur', f.cell(0, 1));
  return b.level({
    id: '4-1',
    name: 'Double saut',
    friends: ['soso', 'soso', 'soso'],
    tip: 'SOSO : touche en vol, elle rebondit en l’air. Parfait pour passer le mur.',
  });
}

function lesDunes() {
  const b = new Build();
  b.relief([
    [-10, 0],
    [8, 0],
    [12, 1.2],
    [18, 1.2],
    [20, 0.4],
    [26, 0.4],
    [29, 2],
    [38, 2],
    [40, 0],
    [60, 0],
  ]);
  const a = b.fort(15, 1.2, 1, 2);
  b.in('fetard', a.cell(0, 0)).in('fetard', a.cell(0, 1), 2);
  b.in('videur', b.fort(23, 0.4, 1, 1).cell(0, 0));
  const c = b.fort(33.5, 2, 2, 2, { roof: 'bois' });
  b.in('fetard', c.cell(0, 0), 3).in('fetard', c.cell(1, 0), 4).in('fetard', c.cell(1, 1));
  return b.level({ id: '4-2', name: 'Les dunes', friends: ['soso', 'mat', 'tom', 'roulian'] });
}

function lesPneus() {
  const b = new Build();
  b.stack(12.5, 0, ['pneus', 'pneus', 'pneus']);
  b.stack(13.4, 0, ['pneus', 'pneus']);
  const f = b.fort(18, 0, 2, 2, { roof: 'bois' });
  b.in('fetard', f.cell(0, 0)).in('videur', f.cell(1, 0)).in('fetard', f.cell(1, 1), 2);
  b.cage(22.5, 0, 'elo');
  return b.level({
    id: '4-3',
    name: 'Les pneus',
    friends: ['soso', 'lolo', 'jbg', 'mat'],
    tip: 'Les pneus sont indestructibles : passe par-dessus.',
  });
}

function pirouette() {
  const b = new Build();
  b.pillar(13, 0, 4.2, 'metal');
  b.pillar(22, 0, 4.2, 'metal');
  b.plank(17.5, 4.2, 9.6, 'bois');
  const f = b.fort(17.5, 0, 3, 1);
  b.in('fetard', f.cell(0, 0)).in('videur', f.cell(1, 0)).in('fetard', f.cell(2, 0), 2);
  b.relou('fetard', 17.5, f.top, 3);
  return b.level({
    id: '4-4',
    name: 'La cabine de plage',
    friends: ['elo', 'elo', 'elo'],
    tip: 'ELO : touche en vol pour la Pirouette. Elle ricoche partout à l’intérieur.',
  });
}

function tonneauxFusees() {
  const b = new Build();
  b.add('tonneau-fusee', 9.5, 0, { a: -35 });
  b.add('tonneau-fusee', 10.8, 0, { a: -28 });
  const f = b.fort(17, 0, 2, 3, { mats: ['bois', 'pierre', 'bois'], roof: 'bois' });
  b.in('fetard', f.cell(0, 0))
    .in('videur', f.cell(1, 0))
    .in('fetard', f.cell(1, 1), 2)
    .in('fetard', f.cell(0, 2), 3);
  return b.level({
    id: '4-5',
    name: 'Tonneaux-fusées',
    friends: ['mat', 'elo', 'tom', 'jbg'],
    tip: 'Touche un tonneau-fusée : il part dans le sens où il pointe, puis explose.',
  });
}

function lePhare() {
  const b = new Build();
  const t = b.fort(17, 0, 1, 6, {
    mats: ['pierre', 'pierre', 'bois', 'bois', 'glace', 'glace'],
    roof: 'pierre',
  });
  b.in('videur', t.cell(0, 0))
    .in('fetard', t.cell(0, 1))
    .in('fetard', t.cell(0, 3), 2)
    .in('fetard', t.cell(0, 5), 3);
  b.in('fetard', b.fort(21, 0, 1, 1).cell(0, 0), 4);
  return b.level({ id: '4-6', name: 'Le phare', friends: ['lolo', 'soso', 'jbg', 'elo'] });
}

function pilotis() {
  const b = new Build();
  b.dominoes(15, 0, 3, 2.5, 4);
  const deck = b.plank(17.5, 4, 6);
  const f = b.fort(17.5, deck, 2, 1, { roof: 'bois' });
  b.in('fetard', f.cell(0, 0)).in('videur', f.cell(1, 0));
  b.relou('fetard', 16.25, 0, 2).relou('fetard', 18.75, 0, 3);
  b.cage(24, 0, 'roro');
  return b.level({ id: '4-7', name: 'La cabane sur pilotis', friends: ['soso', 'elo', 'roulie', 'mat'] });
}

function smash() {
  const b = new Build();
  b.plateau(13, 24, 2);
  b.pillar(15, 2, 3.4, 'pierre', 0.6);
  b.pillar(22, 2, 3.4, 'pierre', 0.6);
  b.plank(18.5, 5.4, 7.8, 'pierre', 0.5);
  b.relou('fetard', 17, 2).add('tnt', 19.3, 2).relou('fetard', 21, 2, 2);
  b.add('pneus', 25.5, 0);
  b.in('videur', b.fort(27.5, 0, 1, 1).cell(0, 0));
  return b.level({
    id: '4-8',
    name: 'Smash',
    friends: ['roro', 'roro', 'roro'],
    tip: 'RORO : pendant son vol, touche l’endroit visé. Il y smashe une balle de padel.',
  });
}

function laJetee() {
  const b = new Build();
  b.dominoes(13, 0, 4, 4, 3);
  const deck = b.plank(19, 3, 12.8);
  const f = b.fort(19, deck, 3, 1, { roof: 'bois' });
  b.in('fetard', f.cell(0, 0)).in('videur', f.cell(1, 0)).in('fetard', f.cell(2, 0), 2);
  b.relou('fetard', 15, 0, 3).relou('fetard', 23, 0, 4);
  return b.level({ id: '4-9', name: 'La jetée', friends: ['roro', 'soso', 'jbg', 'lolo'] });
}

function chateauDeSable() {
  const b = new Build();
  const f = b.fort(19, 0, 4, 3, { mats: ['pierre', 'bois', 'glace'], taper: true, roof: 'bois' });
  b.in('fetard', f.cell(0, 0))
    .in('pilier', f.cell(1, 0))
    .in('videur', f.cell(2, 0))
    .in('fetard', f.cell(3, 0), 2);
  b.in('fetard', f.cell(1, 1), 3).put('tnt', f.cell(2, 1)).in('fetard', f.cell(0, 2), 4);
  return b.level({ id: '4-10', name: 'Le château de sable', friends: ['elo', 'roro', 'lolo', 'jbm', 'tom'] });
}

function fuseesEnSerie() {
  const b = new Build();
  b.add('tonneau-fusee', 9.5, 0, { a: -30 });
  b.add('tonneau-fusee', 10.7, 0, { a: -38 });
  b.add('tonneau-fusee', 11.9, 0, { a: -25 });
  const f = b.fort(19, 0, 3, 2, { m: 'pierre', roof: 'pierre' });
  b.in('fetard', f.cell(0, 0))
    .put('tnt', f.cell(1, 0))
    .in('videur', f.cell(2, 0))
    .in('fetard', f.cell(1, 1), 2);
  b.in('pilier', b.fort(24.5, 0, 1, 1, { m: 'pierre' }).cell(0, 0));
  return b.level({ id: '4-11', name: 'Feu d’artifice', friends: ['roro', 'mat', 'elo', 'jbg', 'soso'] });
}

function leChampion() {
  const b = new Build();
  b.plateau(22, 36, 1.5);
  b.relou('champion', 29, 1.5);
  b.stack(25, 1.5, ['pneus', 'pneus', 'pneus']);
  b.stack(33, 1.5, ['pneus', 'pneus', 'pneus']);
  const roof = b.plank(29, 4.89, 9.4, 'metal');
  b.add('baril', 27, roof).add('baril', 31, roof);
  b.add('tnt', 26.5, 1.5);
  b.add('tonneau-fusee', 15, 0, { a: -35 });
  b.in('videur', b.fort(19, 0, 1, 1).cell(0, 0));
  b.relou('pilier', 38.5, 0);
  b.cage(41.5, 0, 'indianne');
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

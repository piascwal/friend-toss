/* Morceaux de décor prêts à poser, pensés pour un pouvoir : cheminée (tomber dedans), pilotis (casser
   les pieds), bunker (passer au ras du sol). Le reste des niveaux se compose avec `Build` (tours,
   arches, rochers). */
import { Build, ROOM_W, T, type Fort, type M } from './build';

/** Case libre (centre, bas) où loger un relou. */
type Cell = { x: number; y: number };

/**
 * Cheminée : deux murs épais et hauts encadrent un puits ouvert par le haut ; le relou est au fond.
 * Un tir à plat ne l'atteint pas : il faut tomber dedans (LOLO, le palet de MAR-1) ou abattre un mur.
 */
export function chimney(b: Build, x: number, y: number, h = 4, m: M = 'pierre', inner = 1.6): Cell {
  const w = 0.8;
  for (let fy = y; fy < y + h - 0.01; fy += 1) {
    const bh = Math.min(1, y + h - fy);
    b.block(x - inner / 2 - w / 2, fy, m, w, bh);
    b.block(x + inner / 2 + w / 2, fy, m, w, bh);
  }
  return { x, y };
}

/**
 * Cabane sur pilotis : deux longs poteaux, un plancher, une pièce dessus. Les pilotis cassés, tout tombe.
 * Renvoie la case de la pièce.
 */
export function stilts(b: Build, x: number, y: number, h: number, m: M = 'bois', roof: M = m): Cell {
  const w = ROOM_W + 0.6;
  b.pillar(x - w / 2 + 0.3, y, h, m, 0.35);
  b.pillar(x + w / 2 - 0.3, y, h, m, 0.35);
  const deck = b.plank(x, y + h, w + 0.2, m);
  return b.fort(x, deck, 1, 1, { m, roof }).cell(0, 0);
}

/**
 * Bunker : une rangée basse de pièces en pierre sous un plafond de métal, chargé de blocs.
 * Les tirs d'en haut rebondissent ; le chien de CLEM, au ras du sol, y entre.
 */
export function bunker(b: Build, x: number, y: number, cols: number, load: M = 'pierre'): Fort {
  const f = b.fort(x, y, cols, 1, { m: 'pierre', ceil: 'metal', h: 1.9 });
  const n = Math.max(1, Math.floor((cols * (ROOM_W - T) - 0.4) / 0.8));
  b.wall(x - (n * 0.8) / 2, f.top, n, 1, load, 0.8);
  return f;
}

/* Les mondes et leurs niveaux (un fichier par monde). Chaque monde apprend une ou deux mécaniques,
   les combine, puis finit par un boss ; un ami enfermé dans une cage rejoint la bande quand le niveau
   est gagné. */
import type { LevelDef, Theme } from '../sim/level';
import { CAMPING } from './camping';
import { FESTIVAL } from './festival';
import { MONTAGNE } from './montagne';
import { PLAGE } from './plage';
import { VILLE } from './ville';

export interface WorldDef {
  id: number;
  name: string;
  theme: Theme;
  tagline: string;
  /** Couleur principale (carte, HUD). */
  color: string;
  levels: LevelDef[];
}

export const WORLDS: WorldDef[] = [CAMPING, FESTIVAL, MONTAGNE, PLAGE, VILLE];

export const ALL_LEVELS = WORLDS.flatMap((w) => w.levels.map((l) => ({ ...l, world: w })));
export const LEVEL_BY_ID = Object.fromEntries(ALL_LEVELS.map((l) => [l.id, l]));

/** Ami libéré par chaque niveau (cage). */
export const UNLOCKS: Record<string, string> = Object.fromEntries(
  ALL_LEVELS.flatMap((l) => l.items.filter((i) => i.friend).map((i) => [l.id, i.friend!])),
);

/** Amis disponibles au départ. */
export const STARTERS = ['roulian'];

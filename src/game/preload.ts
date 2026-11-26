/* Préchargement des images d'un niveau (amis, objets, relous, décor du monde). */
import { load, posePath, preloadEnemy, spritePath } from '../assets';
import type { WorldDef } from '../levels';
import { ENEMIES, FRIEND_BY_ID, OBJECTS, type ObjDef } from '../sim/defs';
import type { LevelDef } from '../sim/level';

/** Le portrait et les grosses têtes : le jeu ne montre jamais les amis en pied. */
const POSES = ['portrait', 'head_ready', 'head_fly', 'head_power', 'head_hit', 'head_win', 'head_sad'];

export async function preloadLevel(level: LevelDef, world: WorldDef) {
  const jobs: Promise<unknown>[] = [];
  const friends = new Set([...level.friends, ...level.items.filter((i) => i.friend).map((i) => i.friend!)]);
  for (const id of friends) {
    const f = FRIEND_BY_ID[id];
    const extra = [
      f?.fxPose,
      f?.power === 'pet' ? 'pj_pet_run2' : undefined,
      f?.power === 'levitate' ? 'pj_mandala' : undefined,
    ];
    for (const p of [...POSES, ...extra]) {
      const path = p && posePath(id, p);
      if (path) jobs.push(load(path));
    }
  }
  for (const it of level.items) {
    const def = OBJECTS[it.k] as ObjDef;
    if (def.sprite) jobs.push(load(spritePath(def.sprite)));
  }
  level.enemies.forEach((e, i) => jobs.push(preloadEnemy(e.k, e.v ?? (i % ENEMIES[e.k].variants) + 1)));
  void world;
  await Promise.all(jobs);
}

/** Précharge ce que montre la présentation animée d'un ami (ses têtes, ses effets, les relous de la démo). */
export async function preloadShowcase(id: string) {
  const f = FRIEND_BY_ID[id];
  const extra = [
    f?.fxPose,
    f?.power === 'pet' ? 'pj_pet_run1' : undefined,
    f?.power === 'pet' ? 'pj_pet_run2' : undefined,
    f?.power === 'levitate' ? 'pj_mandala' : undefined,
  ];
  const jobs: Promise<unknown>[] = [];
  for (const p of [...POSES, ...extra]) {
    const path = p && posePath(id, p);
    if (path) jobs.push(load(path));
  }
  jobs.push(preloadEnemy('habitue', 1), preloadEnemy('habitue', 2), preloadEnemy('gardien', 1));
  await Promise.all(jobs);
}

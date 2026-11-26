/* Construction d'un niveau dans le monde physique : sol (relief et plateformes), objets, relous,
   paires de téléporteurs. */
import { Box, Chain, Circle, Polygon, Vec2 } from 'planck';
import { ENEMIES, MATS, OBJECTS, type EnemyDef, type EnemyKind, type ObjDef } from './defs';
import { terrainSurface, type ItemDef } from './level';
import { chamfered } from './shapes';
import type { Sim } from './sim';

/** Pose tout le niveau dans le monde physique de `sim`. */
export function buildLevel(sim: Sim) {
  buildGround(sim);
  for (const item of sim.level.items) addItem(sim, item);
  for (const [i, e] of sim.level.enemies.entries())
    addEnemy(sim, e.k, e.x, e.y, e.v ?? (i % ENEMIES[e.k].variants) + 1);
  linkPortals(sim);
}

function buildGround(sim: Sim) {
  const ground = sim.world.createBody({ type: 'static' });
  // sol : la surface du relief, et un fond plat très bas (filet de sécurité)
  ground.createFixture({
    shape: new Chain(
      terrainSurface(sim.level).map(([x, y]) => new Vec2(x, y)),
      false,
    ),
    friction: 0.9,
  });
  ground.createFixture({ shape: new Box(300, 5, new Vec2(sim.width / 2, -25), 0), friction: 0.9 });
  for (const g of sim.level.ground ?? []) {
    const bottom = g.bottom ?? -1;
    const hw = (g.x1 - g.x0) / 2;
    const hh = (g.top - bottom) / 2;
    ground.createFixture({ shape: new Box(hw, hh, new Vec2(g.x0 + hw, bottom + hh), 0), friction: 0.9 });
  }
  ground.setUserData(null);
}

function addItem(sim: Sim, item: ItemDef) {
  const def = OBJECTS[item.k] as ObjDef;
  const w = item.w ?? def.w;
  const h = item.h ?? def.h;
  const mat = MATS[def.mat];
  const a = ((item.a ?? 0) * Math.PI) / 180;
  // le y donné est le bas de l'objet avant rotation : on place le centre
  const cx = item.x - Math.sin(a) * (h / 2);
  const cy = item.y + Math.cos(a) * (h / 2);
  const special0 = def.special;
  const body = sim.world.createBody({
    // le tonneau-fusée reste sur son pas de tir jusqu'à l'allumage
    type: def.fixed || special0?.type === 'rocket' ? 'static' : 'dynamic',
    position: new Vec2(cx, cy),
    angle: a,
  });
  const special = def.special;
  const fixture = {
    density: def.density ?? mat.density,
    friction: mat.friction,
    restitution: mat.restitution,
    isSensor: special?.type === 'portal',
  };
  if (def.shape === 'circle') body.createFixture({ shape: new Circle(Math.min(w, h) / 2), ...fixture });
  else if (def.shape === 'triangle')
    body.createFixture({
      shape: new Polygon([new Vec2(-w / 2, -h / 2), new Vec2(w / 2, -h / 2), new Vec2(0, h / 2)]),
      ...fixture,
    });
  else if (special?.type === 'portal') {
    body.createFixture({ shape: new Box(w * 0.32, h * 0.38, new Vec2(0, 0), 0), ...fixture });
  } else body.createFixture({ shape: chamfered(w, h, Math.min(w, h) * 0.16), ...fixture });
  const hp = def.hp ?? mat.hp;
  const ent = sim.addEnt('block', body, w, h, def.shape, def.mat, hp);
  ent.obj = item.k;
  ent.objDef = def;
  ent.caged = item.friend;
}

function addEnemy(sim: Sim, k: EnemyKind, x: number, y: number, variant: number) {
  const def = ENEMIES[k] as EnemyDef;
  const body = sim.world.createBody({ type: 'dynamic', position: new Vec2(x, y + def.h / 2) });
  body.createFixture({
    shape: chamfered(def.w, def.h, 0.12),
    density: def.density ?? 1,
    friction: 0.8,
    restitution: 0.1,
  });
  const ent = sim.addEnt('enemy', body, def.w, def.h, 'box', 'enemy', def.hp);
  ent.enemy = k;
  ent.enemyDef = def;
  ent.variant = variant;
}

function linkPortals(sim: Sim) {
  const portals = sim.ents.filter((e) => e.objDef?.special?.type === 'portal');
  for (let i = 0; i + 1 < portals.length; i += 2) {
    portals[i]!.portalPair = portals[i + 1];
    portals[i + 1]!.portalPair = portals[i];
  }
}

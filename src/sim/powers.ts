/* Les pouvoirs des amis : une fonction courte par pouvoir.
   Chaque pouvoir reçoit la simulation, l'ami en vol et le point visé (pour le smash). */
import { Circle, Vec2 } from 'planck';
import { MATS, type Mat, type PowerId } from './defs';
import { isProjectile, type Ent, type EntKind } from './entity';
import { chamfered } from './shapes';
import type { Sim } from './sim';

type Point = { x: number; y: number };

interface Ctx {
  sim: Sim;
  e: Ent;
  p: Point;
  v: Point;
  speed: number;
  /** Direction du vol (unitaire). */
  dir: Point;
  target?: Point;
}

/** Projectile secondaire (balle, palet, chien, boule de feu, clone) lancé par un ami. */
function spawn(
  c: Ctx,
  kind: EntKind,
  at: Point,
  vel: Point,
  o: {
    r?: number;
    box?: [number, number];
    density: number;
    gravity?: number;
    dmg?: Partial<Record<Mat | 'enemy', number>>;
  },
): Ent {
  const body = c.sim.world.createBody({
    type: 'dynamic',
    position: new Vec2(at.x, at.y),
    bullet: true,
    fixedRotation: kind === 'pet',
  });
  const shape = o.box ? chamfered(o.box[0], o.box[1], 0.15) : new Circle(o.r ?? 0.2);
  body.createFixture({ shape, density: o.density, friction: kind === 'pet' ? 0 : 0.3, restitution: 0.3 });
  body.setLinearVelocity(new Vec2(vel.x, vel.y));
  if (o.gravity !== undefined) body.setGravityScale(o.gravity);
  const w = o.box?.[0] ?? (o.r ?? 0.2) * 2;
  const h = o.box?.[1] ?? (o.r ?? 0.2) * 2;
  const ent = c.sim.addEnt(kind, body, w, h, o.box ? 'box' : 'circle', 'friend', 1e9);
  ent.friend = c.e.friend;
  ent.launchedAt = c.sim.time;
  ent.dmg = o.dmg ?? c.e.dmg;
  ent.powerUsed = true;
  return ent;
}

const setVel = (e: Ent, x: number, y: number) => e.body.setLinearVelocity(new Vec2(x, y));

/** Givre : gèle les objets et relous dans un cône devant l'ami. */
function freezeCone(sim: Sim, x: number, y: number, dir: number) {
  sim.events.push({ t: 'freeze', x, y, dir });
  for (const e of sim.ents) {
    if (e.dead || (e.kind !== 'block' && e.kind !== 'enemy') || e.objDef?.fixed || e.maxHp >= 1e8) continue;
    const p = e.body.getPosition();
    const dx = (p.x - x) * dir;
    const dy = p.y - y;
    if (dx < -0.5 || dx > 9 || Math.abs(dy) > 2 + dx * 0.75) continue;
    e.frozen = true;
    e.hp = Math.min(e.hp, e.kind === 'enemy' ? e.hp * 0.5 : MATS.ice.hp);
  }
}

/** Rayon : transperce bois, glace, relous ; arrêté par la pierre, le métal et le sol. */
function fireBeam(sim: Sim, from: Point, dir: Point, src: Ent) {
  const len = 22;
  const found: { e: Ent | null; f: number }[] = [];
  sim.world.rayCast(
    new Vec2(from.x, from.y),
    new Vec2(from.x + dir.x * len, from.y + dir.y * len),
    (fx, _p, _n, f) => {
      const e = fx.getBody().getUserData() as Ent | null;
      if (e === src || fx.isSensor() || (e && isProjectile(e))) return -1;
      found.push({ e, f });
      return 1;
    },
  );
  found.sort((a, b) => a.f - b.f);
  let stop = 1;
  for (const { e, f } of found) {
    if (!e) {
      stop = f;
      break;
    }
    const hard = e.mat === 'stone' || e.mat === 'metal' || e.mat === 'rubber';
    sim.hurt(e, e.kind === 'enemy' ? 120 : hard ? 60 * (e.frozen ? 3 : 1) : 90);
    if (e.body.isDynamic())
      e.body.applyLinearImpulse(new Vec2(dir.x * 3, dir.y * 3), e.body.getPosition(), true);
    if (hard) {
      stop = f;
      break;
    }
  }
  sim.events.push({
    t: 'beam',
    x0: from.x,
    y0: from.y,
    x1: from.x + dir.x * len * stop,
    y1: from.y + dir.y * len * stop,
  });
}

const POWERS: Record<PowerId, (c: Ctx) => void> = {
  none: () => {},

  dash: ({ e, dir, speed }) => {
    const s = Math.max(speed * 1.9, 26);
    setVel(e, dir.x * s, dir.y * s);
    e.body.setGravityScale(0.35);
  },

  triple: (c) => {
    for (const deg of [-9, 9]) {
      const r = (deg * Math.PI) / 180;
      const vel = {
        x: c.v.x * Math.cos(r) - c.v.y * Math.sin(r),
        y: c.v.x * Math.sin(r) + c.v.y * Math.cos(r),
      };
      spawn(c, 'clone', { x: c.p.x, y: c.p.y + Math.sign(deg) * 0.6 }, vel, {
        r: c.e.friend!.radius * 0.9,
        density: c.e.friend!.density,
      });
    }
  },

  blast: ({ sim, e, p, v }) => {
    sim.explode(p.x, p.y, 3.8, 75, 45, e);
    setVel(e, v.x * 0.3, v.y * 0.3);
  },

  slam: ({ e, v }) => {
    e.mode = 'slam';
    setVel(e, v.x * 0.15, -30);
    e.body.setGravityScale(1.5);
    e.dmg = { ...e.dmg, wood: 2, ice: 2, enemy: 1.5 };
  },

  freeze: ({ sim, p, dir }) => freezeCone(sim, p.x, p.y, dir.x >= 0 ? 1 : -1),

  jump: ({ e, v }) => setVel(e, Math.max(Math.abs(v.x), 7) * Math.sign(v.x || 1), 13),

  spin: ({ sim, e }) => {
    e.mode = 'spin';
    e.modeUntil = sim.time + 5;
    e.body.getFixtureList()!.setRestitution(0.92);
    e.body.getFixtureList()!.setFriction(0.05);
    e.body.setAngularVelocity(-25);
  },

  smash: (c) => {
    const t = c.target ?? { x: c.p.x + c.dir.x * 10, y: c.p.y + c.dir.y * 10 };
    const d = Math.hypot(t.x - c.p.x, t.y - c.p.y) || 1;
    const u = { x: (t.x - c.p.x) / d, y: (t.y - c.p.y) / d };
    spawn(
      c,
      'ball',
      { x: c.p.x + u.x * 0.6, y: c.p.y + u.y * 0.6 },
      { x: u.x * 42, y: u.y * 42 },
      {
        r: 0.2,
        density: 30,
        gravity: 0.15,
        dmg: { enemy: 2.5, wood: 1.6, explosive: 3 },
      },
    );
    setVel(c.e, -u.x * 4, 4);
  },

  levitate: ({ sim, e, v, speed }) => {
    e.mode = 'levitate';
    e.modeUntil = sim.time + 2;
    e.body.setGravityScale(0);
    setVel(e, Math.max(speed, 12) * Math.sign(v.x || 1), 0);
  },

  pet: (c) => {
    const pet = spawn(
      c,
      'pet',
      { x: c.p.x + 0.5, y: c.p.y - 0.6 },
      { x: Math.max(c.v.x, 8), y: Math.min(c.v.y, -4) },
      {
        box: [0.95, 0.6],
        density: 4,
        dmg: { wood: 1.8, enemy: 1.6, ice: 2 },
      },
    );
    pet.mode = 'run';
  },

  beam: ({ sim, e, p, dir }) => fireBeam(sim, p, dir, e),

  fireball: (c) => {
    const fire = spawn(
      c,
      'ball',
      { x: c.p.x + c.dir.x * 0.7, y: c.p.y + c.dir.y * 0.7 },
      { x: c.dir.x * 26, y: c.dir.y * 26 },
      {
        r: 0.35,
        density: 6,
        gravity: 0,
        dmg: { enemy: 2 },
      },
    );
    fire.mode = 'fire';
    setVel(c.e, c.v.x * 0.5, c.v.y * 0.5 + 3);
  },

  puck: (c) => {
    spawn(
      c,
      'puck',
      { x: c.p.x + 0.3, y: c.p.y - 0.5 },
      { x: Math.sign(c.v.x || 1) * 16, y: -32 },
      {
        r: 0.22,
        density: 40,
        dmg: { wood: 2, ice: 2, stone: 1.6, enemy: 2 },
      },
    );
    setVel(c.e, c.v.x * 0.6, 11);
  },
};

/** Applique le pouvoir de l'ami `e`. */
export function usePower(sim: Sim, e: Ent, target?: Point) {
  const p = e.body.getPosition().clone();
  const v = e.body.getLinearVelocity().clone();
  const speed = Math.hypot(v.x, v.y);
  const dir = speed > 0.1 ? { x: v.x / speed, y: v.y / speed } : { x: 1, y: 0 };
  POWERS[e.friend!.power]({ sim, e, p, v, speed, dir, target });
}

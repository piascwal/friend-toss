/* Simulation d'un niveau : physique (planck), dégâts, explosions, pouvoirs des amis, score, victoire.
   Aucune dépendance au navigateur : l'affichage lit `ents` et vide `events` à chaque image. */
import { Box, Circle, Polygon, Vec2, World, type Body, type Contact, type Fixture } from 'planck';
import {
  ENEMIES,
  FRIEND_BY_ID,
  MATS,
  OBJECTS,
  type EnemyDef,
  type EnemyKind,
  type FriendDef,
  type Mat,
  type ObjDef,
  type ObjKind,
} from './defs';
import type { LevelDef } from './level';

export const GRAVITY = -11;
export const MAX_SPEED = 23;
/** Pivot du canon (m) et longueur du fût : l'ami sort par la bouche du canon. */
export const CANNON = { x: 0, y: 1.15 };
export const BARREL = 1.75;

/** Bouche du canon pour un tir dans la direction (vx, vy). */
export function muzzle(vx: number, vy: number) {
  const d = Math.hypot(vx, vy) || 1;
  return { x: CANNON.x + (vx / d) * BARREL, y: CANNON.y + (vy / d) * BARREL };
}
export const DT = 1 / 60;

const IMP_MIN = 2.2;
const IMP_MIN_ENEMY = 0.8;
const DMG_K = 1.8;
const FRIEND_DMG = 1.5;
const ENEMY_MUL = 2.4;
const KILL_SCORE = 5000;
const FRIEND_BONUS = 10000;

export type EntKind = 'block' | 'enemy' | 'friend' | 'clone' | 'ball' | 'puck' | 'pet';

export interface Ent {
  id: number;
  kind: EntKind;
  body: Body;
  w: number;
  h: number;
  shape: 'box' | 'circle' | 'triangle';
  mat: Mat | 'enemy' | 'friend';
  hp: number;
  maxHp: number;
  dead: boolean;
  obj?: ObjKind;
  objDef?: ObjDef;
  enemy?: EnemyKind;
  enemyDef?: EnemyDef;
  variant: number;
  friend?: FriendDef;
  /** Cage : ami enfermé. */
  caged?: string;
  frozen?: boolean;
  /** Temps restant de l'animation « touché ». */
  hurt: number;
  /** Tonneau-fusée allumé : temps avant explosion. */
  fuse?: number;
  // projectiles
  launchedAt?: number;
  impactAt?: number;
  slowFor?: number;
  powerUsed?: boolean;
  powerAt?: number;
  /** Dégâts par matériau (amis et projectiles de pouvoir). */
  dmg?: Partial<Record<Mat | 'enemy', number>>;
  /** Pouvoir à effet différé (séisme à l'impact, lévitation, course du chien). */
  mode?: 'slam' | 'levitate' | 'spin' | 'run';
  modeUntil?: number;
  portalCooldown?: number;
  /** Portail : index de son partenaire. */
  portalPair?: Ent;
}

export type SimEvent =
  | { t: 'break'; x: number; y: number; w: number; h: number; mat: Mat; angle: number }
  | { t: 'kill'; x: number; y: number; ent: Ent }
  | { t: 'score'; x: number; y: number; pts: number; color?: string }
  | { t: 'explode'; x: number; y: number; r: number; confetti?: boolean }
  | { t: 'impact'; x: number; y: number; force: number; mat: Mat | 'enemy' | 'friend' }
  | { t: 'power'; ent: Ent; x: number; y: number; target?: { x: number; y: number } }
  | { t: 'beam'; x0: number; y0: number; x1: number; y1: number }
  | { t: 'freeze'; x: number; y: number; dir: number }
  | { t: 'free'; friend: string; x: number; y: number }
  | { t: 'gold'; x: number; y: number }
  | { t: 'poof'; x: number; y: number; ent: Ent }
  | { t: 'launch'; ent: Ent }
  | { t: 'teleport'; x: number; y: number; x2: number; y2: number }
  | { t: 'rocket'; x: number; y: number }
  | { t: 'bounce'; x: number; y: number }
  | { t: 'shockwave'; x: number; y: number }
  | { t: 'end'; won: boolean };

export type Phase = 'aim' | 'flying' | 'settling' | 'won' | 'lost';

interface Hit {
  a: Ent;
  b: Ent | null;
  imp: number;
  x: number;
  y: number;
}

export class Sim {
  readonly world: World;
  readonly level: LevelDef;
  ents: Ent[] = [];
  events: SimEvent[] = [];
  time = 0;
  score = 0;
  queue: string[];
  phase: Phase = 'aim';
  /** Bord droit du niveau (m). */
  width: number;
  freed: string[] = [];
  gold = 0;
  /** Points de chaque tir (pour les statistiques). */
  shots = 0;
  /** Tracé du dernier tir. */
  trail: { x: number; y: number }[] = [];
  lastTrail: { x: number; y: number }[] = [];
  private nextId = 1;
  private hits: Hit[] = [];
  private damageOn = false;
  private pending: (() => void)[] = [];
  private calmFor = 0;
  private endAt = 0;
  private wonPending = false;

  constructor(level: LevelDef) {
    this.level = level;
    this.queue = [...level.friends];
    this.world = new World({ gravity: new Vec2(0, GRAVITY) });
    this.width = Math.max(30, ...level.items.map((i) => i.x + 4), ...level.enemies.map((e) => e.x + 4));
    this.buildGround();
    for (const item of level.items) this.addItem(item);
    for (const [i, e] of level.enemies.entries())
      this.addEnemy(e.k, e.x, e.y, e.v ?? (i % ENEMIES[e.k].variants) + 1);
    this.linkPortals();
    this.world.on('post-solve', (c, imp) => this.onPostSolve(c, imp.normalImpulses));
    this.world.on('begin-contact', (c) => this.onBegin(c));
    this.settle();
  }

  /* ------------------------------------------------------------ construction */

  private buildGround() {
    const ground = this.world.createBody({ type: 'static' });
    ground.createFixture({ shape: new Box(200, 5, new Vec2(this.width / 2, -5), 0), friction: 0.9 });
    for (const g of this.level.ground ?? []) {
      const bottom = g.bottom ?? -1;
      const hw = (g.x1 - g.x0) / 2;
      const hh = (g.top - bottom) / 2;
      ground.createFixture({ shape: new Box(hw, hh, new Vec2(g.x0 + hw, bottom + hh), 0), friction: 0.9 });
    }
    ground.setUserData(null);
  }

  private addItem(item: LevelDef['items'][number]) {
    const def = OBJECTS[item.k] as ObjDef;
    const w = item.w ?? def.w;
    const h = item.h ?? def.h;
    const mat = MATS[def.mat];
    const a = ((item.a ?? 0) * Math.PI) / 180;
    // le y donné est le bas de l'objet avant rotation : on place le centre
    const cx = item.x - Math.sin(a) * (h / 2);
    const cy = item.y + Math.cos(a) * (h / 2);
    const special0 = def.special;
    const body = this.world.createBody({
      // le tonneau-fusée reste sur son pas de tir jusqu'à l'allumage
      type: def.fixed || special0?.type === 'rocket' ? 'static' : 'dynamic',
      position: new Vec2(cx, cy),
      angle: a,
    });
    const special = def.special;
    const restitution = special?.type === 'bounce' ? special.restitution : mat.restitution;
    const fixture = {
      density: def.density ?? mat.density,
      friction: mat.friction,
      restitution,
      isSensor: special?.type === 'portal',
    };
    if (def.shape === 'circle') body.createFixture({ shape: new Circle(Math.min(w, h) / 2), ...fixture });
    else if (def.shape === 'triangle')
      body.createFixture({
        shape: new Polygon([new Vec2(-w / 2, -h / 2), new Vec2(w / 2, -h / 2), new Vec2(0, h / 2)]),
        ...fixture,
      });
    else if (special?.type === 'bounce') {
      // trampoline : toile en haut, pieds en dessous
      body.createFixture({ shape: new Box(w / 2, h * 0.12, new Vec2(0, h * 0.32), 0), ...fixture });
      body.createFixture({
        shape: new Box(w * 0.42, h * 0.3, new Vec2(0, -h * 0.15), 0),
        ...fixture,
        restitution: 0.1,
      });
    } else if (special?.type === 'portal') {
      body.createFixture({ shape: new Box(w * 0.32, h * 0.38, new Vec2(0, 0), 0), ...fixture });
    } else body.createFixture({ shape: chamfered(w, h, Math.min(w, h) * 0.16), ...fixture });
    const hp = def.hp ?? mat.hp;
    const ent = this.makeEnt('block', body, w, h, def.shape, def.mat, hp);
    ent.obj = item.k;
    ent.objDef = def;
    ent.caged = item.friend;
  }

  private addEnemy(k: EnemyKind, x: number, y: number, variant: number) {
    const def = ENEMIES[k] as EnemyDef;
    const body = this.world.createBody({ type: 'dynamic', position: new Vec2(x, y + def.h / 2) });
    body.createFixture({
      shape: chamfered(def.w, def.h, 0.12),
      density: def.density ?? 1,
      friction: 0.8,
      restitution: 0.1,
    });
    const ent = this.makeEnt('enemy', body, def.w, def.h, 'box', 'enemy', def.hp);
    ent.enemy = k;
    ent.enemyDef = def;
    ent.variant = variant;
  }

  private linkPortals() {
    const portals = this.ents.filter((e) => e.objDef?.special?.type === 'portal');
    for (let i = 0; i + 1 < portals.length; i += 2) {
      portals[i]!.portalPair = portals[i + 1];
      portals[i + 1]!.portalPair = portals[i];
    }
  }

  private makeEnt(
    kind: EntKind,
    body: Body,
    w: number,
    h: number,
    shape: 'box' | 'circle' | 'triangle',
    mat: Ent['mat'],
    hp: number,
  ): Ent {
    const ent: Ent = {
      id: this.nextId++,
      kind,
      body,
      w,
      h,
      shape,
      mat,
      hp,
      maxHp: hp,
      dead: false,
      hurt: 0,
      variant: 1,
    };
    body.setUserData(ent);
    this.ents.push(ent);
    return ent;
  }

  /** Laisse la structure se poser avant le premier tir (sans dégâts). */
  private settle() {
    for (let i = 0; i < 150; i++) this.world.step(DT, 8, 3);
    for (const e of this.ents) {
      e.body.setLinearVelocity(new Vec2(0, 0));
      e.body.setAngularVelocity(0);
    }
    this.hits = [];
    this.damageOn = true;
  }

  /* ------------------------------------------------------------ état */

  get enemiesLeft(): number {
    return this.ents.filter((e) => e.kind === 'enemy' && !e.dead).length;
  }

  get bosses(): Ent[] {
    return this.ents.filter((e) => e.enemyDef?.boss);
  }

  /** Projectiles encore en jeu (amis, clones, balle, palet, chien). */
  get flying(): Ent[] {
    return this.ents.filter((e) => !e.dead && e.kind !== 'block' && e.kind !== 'enemy');
  }

  /** L'ami lancé qui peut encore utiliser son pouvoir. */
  get current(): Ent | undefined {
    return this.ents.find((e) => e.kind === 'friend' && !e.dead && !e.powerUsed);
  }

  get canLaunch(): boolean {
    return this.phase === 'aim' && this.queue.length > 0;
  }

  /** Tous les points possibles des objets cassables (pour calculer les étoiles). */
  get maxScore(): number {
    let s = 0;
    for (const e of this.ents) {
      if (e.kind === 'enemy') s += e.enemyDef?.score ?? KILL_SCORE;
      else if (e.objDef && e.maxHp < 1e8 && !e.objDef.fixed) s += MATS[e.objDef.mat].score;
    }
    return s;
  }

  /* ------------------------------------------------------------ actions */

  /** Lance le prochain ami avec une vitesse (m/s). */
  launch(vx: number, vy: number): Ent | undefined {
    if (!this.canLaunch) return undefined;
    const id = this.queue.shift()!;
    const def = FRIEND_BY_ID[id]!;
    const body = this.world.createBody({
      type: 'dynamic',
      position: new Vec2(muzzle(vx, vy).x, muzzle(vx, vy).y),
      bullet: true,
    });
    body.createFixture({
      shape: chamfered(def.radius * 2, def.radius * 2, def.radius * 0.6),
      density: def.density,
      friction: 0.9,
      restitution: 0.25,
    });
    body.setLinearVelocity(new Vec2(vx, vy));
    body.setAngularVelocity(-2);
    const ent = this.makeEnt('friend', body, def.radius * 2, def.radius * 2, 'circle', 'friend', 1e9);
    ent.friend = def;
    ent.launchedAt = this.time;
    ent.dmg = { ...def.dmg };
    this.phase = 'flying';
    this.shots++;
    this.lastTrail = this.trail;
    this.trail = [];
    this.calmFor = 0;
    this.events.push({ t: 'launch', ent });
    return ent;
  }

  /** Déclenche le pouvoir de l'ami en vol (`target` : point visé, pour le smash). */
  activate(target?: { x: number; y: number }): boolean {
    const e = this.current;
    if (!e || !e.friend || e.impactAt !== undefined) return false;
    e.powerUsed = true;
    e.powerAt = this.time;
    const p = e.body.getPosition();
    const v = e.body.getLinearVelocity();
    const speed = Math.hypot(v.x, v.y);
    const dir = speed > 0.1 ? { x: v.x / speed, y: v.y / speed } : { x: 1, y: 0 };
    this.events.push({ t: 'power', ent: e, x: p.x, y: p.y, target });
    switch (e.friend.power) {
      case 'none':
        e.powerUsed = true;
        break;
      case 'dash': {
        const s = Math.max(speed * 1.9, 26);
        e.body.setLinearVelocity(new Vec2(dir.x * s, dir.y * s));
        e.body.setGravityScale(0.35);
        break;
      }
      case 'triple': {
        for (const deg of [-9, 9]) {
          const r = (deg * Math.PI) / 180;
          const nv = new Vec2(v.x * Math.cos(r) - v.y * Math.sin(r), v.x * Math.sin(r) + v.y * Math.cos(r));
          const body = this.world.createBody({
            type: 'dynamic',
            position: new Vec2(p.x, p.y + (deg > 0 ? 0.6 : -0.6)),
            bullet: true,
          });
          body.createFixture({
            shape: new Circle(e.friend.radius * 0.9),
            density: e.friend.density,
            friction: 0.6,
            restitution: 0.3,
          });
          body.setLinearVelocity(nv);
          const c = this.makeEnt('clone', body, e.w, e.h, 'circle', 'friend', 1e9);
          c.friend = e.friend;
          c.launchedAt = this.time;
          c.dmg = e.dmg;
          c.powerUsed = true;
        }
        break;
      }
      case 'blast':
        this.explode(p.x, p.y, 3.8, 75, 45, e);
        e.body.setLinearVelocity(new Vec2(v.x * 0.3, v.y * 0.3));
        break;
      case 'slam':
        e.mode = 'slam';
        e.body.setLinearVelocity(new Vec2(v.x * 0.15, -30));
        e.body.setGravityScale(1.5);
        e.dmg = { ...e.dmg, wood: 2, ice: 2, enemy: 1.5 };
        break;
      case 'freeze':
        this.freezeCone(p.x, p.y, dir.x >= 0 ? 1 : -1);
        break;
      case 'jump':
        e.body.setLinearVelocity(new Vec2(Math.max(Math.abs(v.x), 7) * Math.sign(v.x || 1), 13));
        break;
      case 'spin':
        e.mode = 'spin';
        e.modeUntil = this.time + 5;
        e.body.getFixtureList()!.setRestitution(0.92);
        e.body.getFixtureList()!.setFriction(0.05);
        e.body.setAngularVelocity(-25);
        break;
      case 'smash': {
        const t = target ?? { x: p.x + dir.x * 10, y: p.y + dir.y * 10 };
        const dx = t.x - p.x;
        const dy = t.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        const body = this.world.createBody({
          type: 'dynamic',
          position: new Vec2(p.x + (dx / d) * 0.6, p.y + (dy / d) * 0.6),
          bullet: true,
        });
        body.createFixture({ shape: new Circle(0.2), density: 30, friction: 0.3, restitution: 0.5 });
        body.setLinearVelocity(new Vec2((dx / d) * 42, (dy / d) * 42));
        body.setGravityScale(0.15);
        const ball = this.makeEnt('ball', body, 0.4, 0.4, 'circle', 'friend', 1e9);
        ball.friend = e.friend;
        ball.launchedAt = this.time;
        ball.dmg = { enemy: 2.5, wood: 1.6, explosive: 3 };
        ball.powerUsed = true;
        e.body.setLinearVelocity(new Vec2((-dx / d) * 4, 4));
        break;
      }
      case 'levitate':
        e.mode = 'levitate';
        e.modeUntil = this.time + 2;
        e.body.setGravityScale(0);
        e.body.setLinearVelocity(new Vec2(Math.max(speed, 12) * Math.sign(v.x || 1), 0));
        break;
      case 'pet': {
        const body = this.world.createBody({
          type: 'dynamic',
          position: new Vec2(p.x + 0.5, p.y - 0.6),
          fixedRotation: true,
        });
        body.createFixture({ shape: chamfered(0.95, 0.6, 0.15), density: 4, friction: 0, restitution: 0.1 });
        body.setLinearVelocity(new Vec2(Math.max(v.x, 8), Math.min(v.y, -4)));
        const pet = this.makeEnt('pet', body, 0.95, 0.6, 'box', 'friend', 1e9);
        pet.friend = e.friend;
        pet.launchedAt = this.time;
        pet.dmg = { wood: 1.8, enemy: 1.6, ice: 2 };
        pet.powerUsed = true;
        pet.mode = 'run';
        break;
      }
      case 'beam':
        this.fireBeam(p.x, p.y, dir.x, dir.y, e);
        break;
      case 'puck': {
        const body = this.world.createBody({
          type: 'dynamic',
          position: new Vec2(p.x + 0.3, p.y - 0.5),
          bullet: true,
        });
        body.createFixture({ shape: new Circle(0.22), density: 40, friction: 0.2, restitution: 0.3 });
        body.setLinearVelocity(new Vec2(Math.sign(v.x || 1) * 16, -32));
        const puck = this.makeEnt('puck', body, 0.44, 0.44, 'circle', 'friend', 1e9);
        puck.friend = e.friend;
        puck.launchedAt = this.time;
        puck.dmg = { wood: 2, ice: 2, stone: 1.6, enemy: 2 };
        puck.powerUsed = true;
        e.body.setLinearVelocity(new Vec2(v.x * 0.6, 11));
        break;
      }
    }
    return true;
  }

  /* ------------------------------------------------------------ boucle */

  step() {
    this.time += DT;
    this.world.step(DT, 8, 3);
    this.processHits();
    for (const fn of this.pending.splice(0)) fn();
    this.updateEnts();
    this.updatePhase();
  }

  private onPostSolve(c: Contact, normals: number[]) {
    if (!this.damageOn) return;
    const imp = normals.reduce((s, n) => s + n, 0);
    if (imp < IMP_MIN_ENEMY) return;
    const a = c.getFixtureA().getBody().getUserData() as Ent | null;
    const b = c.getFixtureB().getBody().getUserData() as Ent | null;
    const wm = c.getWorldManifold(null);
    const pt = wm?.points[0] ?? c.getFixtureA().getBody().getPosition();
    if (a) this.hits.push({ a, b, imp, x: pt.x, y: pt.y });
    if (b) this.hits.push({ a: b, b: a, imp, x: pt.x, y: pt.y });
  }

  private onBegin(c: Contact) {
    const fa = c.getFixtureA();
    const fb = c.getFixtureB();
    const a = fa.getBody().getUserData() as Ent | null;
    const b = fb.getBody().getUserData() as Ent | null;
    this.portalCheck(a, b, fb);
    this.portalCheck(b, a, fa);
    // l'or se ramasse au simple contact d'un ami
    for (const [x, y] of [
      [a, b],
      [b, a],
    ] as const) {
      if (x?.objDef?.special?.type === 'gold' && y && isProjectile(y))
        this.pending.push(() => this.destroy(x, true));
      if (x?.objDef?.special?.type === 'bounce' && y && !y.dead) {
        const p = x.body.getPosition();
        this.events.push({ t: 'bounce', x: p.x, y: p.y + x.h / 2 });
      }
    }
  }

  private portalCheck(portal: Ent | null, other: Ent | null, _f: Fixture) {
    if (!portal?.portalPair || !other || other.dead || other.kind === 'block' || other.kind === 'enemy')
      return;
    if ((other.portalCooldown ?? 0) > this.time) return;
    const to = portal.portalPair;
    other.portalCooldown = this.time + 0.8;
    this.pending.push(() => {
      const from = other.body.getPosition().clone();
      const v = other.body.getLinearVelocity();
      const s = Math.hypot(v.x, v.y) || 1;
      const out = to.body.getPosition();
      const pos = new Vec2(out.x + (v.x / s) * 1.3, out.y + (v.y / s) * 1.3);
      other.body.setTransform(pos, other.body.getAngle());
      to.portalPair && (other.portalCooldown = this.time + 0.8);
      this.events.push({ t: 'teleport', x: from.x, y: from.y, x2: pos.x, y2: pos.y });
    });
  }

  private damageMul(target: Ent, source: Ent | null): number {
    let m = 1;
    const key = target.kind === 'enemy' ? 'enemy' : (target.mat as Mat);
    if (source && isProjectile(source)) m *= FRIEND_DMG * (source.dmg?.[key] ?? 1);
    if (target.frozen) m *= 2.5;
    // un gros relou encaisse mieux les chocs (dégâts selon la variation de vitesse, pas l'impulsion)
    if (target.kind === 'enemy') m *= ENEMY_MUL / Math.max(1, target.body.getMass());
    return m;
  }

  private processHits() {
    const hits = this.hits;
    this.hits = [];
    for (const h of hits) {
      const e = h.a;
      if (e.dead) continue;
      // impact d'un projectile : fin du pouvoir différé
      if (isProjectile(e) && e.impactAt === undefined && h.b?.kind !== undefined) e.impactAt = this.time;
      if (isProjectile(e) && e.impactAt === undefined && !h.b && h.imp > 1) e.impactAt = this.time;
      // un ami qui touche le sol perd de son élan (il ne roule pas jusqu'aux structures)
      if (isProjectile(e) && !h.b && e.kind !== 'pet' && e.mode !== 'spin' && h.imp > 1.5) {
        const v = e.body.getLinearVelocity();
        e.body.setLinearVelocity(new Vec2(v.x * 0.55, v.y));
        e.body.setAngularDamping(3);
        e.body.setLinearDamping(0.6);
      }
      if (e.mode === 'slam' && h.imp > 2) {
        e.mode = undefined;
        const p = e.body.getPosition();
        this.events.push({ t: 'shockwave', x: p.x, y: p.y });
        this.pending.push(() => this.explode(p.x, p.y, 3.2, 45, 70, e));
      }
      // fusée : un choc allume la mèche
      if (e.objDef?.special?.type === 'rocket' && e.fuse === undefined && h.imp > 2.5) this.light(e);
      const min = e.kind === 'enemy' ? IMP_MIN_ENEMY : IMP_MIN;
      if (h.imp <= min || e.maxHp >= 1e8) continue;
      const dmg = (h.imp - min) * DMG_K * this.damageMul(e, h.b);
      if (dmg < 0.5) continue;
      if (h.imp > 4) this.events.push({ t: 'impact', x: h.x, y: h.y, force: h.imp, mat: e.mat });
      this.hurt(e, dmg);
    }
  }

  private hurt(e: Ent, dmg: number) {
    if (e.dead || e.maxHp >= 1e8) return;
    e.hp -= dmg;
    if (e.kind === 'enemy') e.hurt = 0.45;
    if (e.hp <= 0) this.pending.push(() => this.destroy(e, true));
  }

  private light(e: Ent) {
    const sp = e.objDef?.special;
    if (sp?.type !== 'rocket' || e.fuse !== undefined) return;
    e.fuse = sp.fuse;
    e.body.setType('dynamic');
    e.body.setAwake(true);
    const p = e.body.getPosition();
    this.events.push({ t: 'rocket', x: p.x, y: p.y });
  }

  /** Supprime une entité (cassée, tuée ou sortie du niveau). */
  destroy(e: Ent, scored: boolean) {
    if (e.dead) return;
    e.dead = true;
    const p = e.body.getPosition();
    const angle = e.body.getAngle();
    const sp = e.objDef?.special;
    if (e.kind === 'enemy') {
      const pts = e.enemyDef?.score ?? KILL_SCORE;
      if (scored) this.addScore(pts, p.x, p.y + e.h / 2, '#7dff6b');
      this.events.push({ t: 'kill', x: p.x, y: p.y, ent: e });
    } else if (e.kind === 'block' && e.objDef) {
      this.events.push({ t: 'break', x: p.x, y: p.y, w: e.w, h: e.h, mat: e.objDef.mat, angle });
      if (sp?.type === 'gold') {
        this.gold++;
        this.events.push({ t: 'gold', x: p.x, y: p.y });
      }
      if (sp?.type === 'cage' && e.caged) {
        this.freed.push(e.caged);
        this.events.push({ t: 'free', friend: e.caged, x: p.x, y: p.y });
        this.addScore(5000, p.x, p.y + 1.2, '#ffd23f');
      }
      if (scored) this.addScore(MATS[e.objDef.mat].score, p.x, p.y, MATS[e.objDef.mat].debris[0]);
    } else {
      this.events.push({ t: 'poof', x: p.x, y: p.y, ent: e });
    }
    this.world.destroyBody(e.body);
    if (sp?.type === 'explode') this.explode(p.x, p.y, sp.radius, sp.power, sp.damage, null, sp.confetti);
    if (sp?.type === 'rocket') this.explode(p.x, p.y, 3.6, 65, 120, null);
  }

  private addScore(pts: number, x: number, y: number, color?: string) {
    this.score += pts;
    this.events.push({ t: 'score', x, y, pts, color });
  }

  /** Explosion : souffle et dégâts décroissants avec la distance. */
  explode(
    x: number,
    y: number,
    r: number,
    power: number,
    damage: number,
    source: Ent | null,
    confetti = false,
  ) {
    this.events.push({ t: 'explode', x, y, r, confetti });
    for (const e of this.ents) {
      if (e.dead || e === source) continue;
      const p = e.body.getPosition();
      const dx = p.x - x;
      const dy = p.y - y;
      const reach = r + Math.max(e.w, e.h) / 2;
      const d = Math.hypot(dx, dy);
      if (d > reach) continue;
      const f = Math.max(0, 1 - d / reach);
      if (e.body.isDynamic()) {
        const m = Math.min(Math.max(e.body.getMass(), 0.5), 4);
        const n = d > 0.01 ? { x: dx / d, y: dy / d } : { x: 0, y: 1 };
        e.body.applyLinearImpulse(
          new Vec2(n.x * power * f * 0.25 * m, (n.y + 0.35) * power * f * 0.25 * m),
          p,
          true,
        );
      }
      if (e.objDef?.special?.type === 'rocket') this.light(e);
      if (isProjectile(e)) continue;
      let dmg = damage * f;
      if (e.frozen) dmg *= 2;
      if (e.objDef?.special?.type === 'explode') dmg = Math.max(dmg, e.hp + 1);
      this.hurt(e, dmg);
    }
  }

  /** Givre : gèle les objets et relous dans un cône devant ROULIE. */
  private freezeCone(x: number, y: number, dir: number) {
    this.events.push({ t: 'freeze', x, y, dir });
    for (const e of this.ents) {
      if (e.dead || (e.kind !== 'block' && e.kind !== 'enemy') || e.objDef?.fixed) continue;
      const p = e.body.getPosition();
      const dx = (p.x - x) * dir;
      const dy = p.y - y;
      if (dx < -0.5 || dx > 9) continue;
      if (Math.abs(dy) > 2 + dx * 0.75) continue;
      if (e.maxHp >= 1e8) continue;
      e.frozen = true;
      e.hp = Math.min(e.hp, e.kind === 'enemy' ? e.hp * 0.5 : MATS.ice.hp);
    }
  }

  /** Rayon : transperce bois, glace, relous ; arrêté par la pierre et le métal. */
  private fireBeam(x: number, y: number, dx: number, dy: number, src: Ent) {
    const len = 22;
    const end = { x: x + dx * len, y: y + dy * len };
    const found: { e: Ent | null; f: number }[] = [];
    this.world.rayCast(new Vec2(x, y), new Vec2(end.x, end.y), (fixture, _p, _n, fraction) => {
      const e = fixture.getBody().getUserData() as Ent | null;
      if (e === src || fixture.isSensor() || (e && isProjectile(e))) return -1;
      found.push({ e, f: fraction });
      return 1;
    });
    found.sort((a, b) => a.f - b.f);
    let stop = 1;
    for (const { e, f } of found) {
      if (!e) {
        stop = f;
        break;
      }
      if (e.kind === 'enemy') this.hurt(e, 120);
      else if (e.mat === 'stone' || e.mat === 'metal' || e.mat === 'rubber') {
        this.hurt(e, 60 * (e.frozen ? 3 : 1));
        stop = f;
        break;
      } else this.hurt(e, 90);
      if (e.body.isDynamic()) e.body.applyLinearImpulse(new Vec2(dx * 3, dy * 3), e.body.getPosition(), true);
    }
    this.events.push({ t: 'beam', x0: x, y0: y, x1: x + dx * len * stop, y1: y + dy * len * stop });
  }

  private updateEnts() {
    for (const e of this.ents) {
      if (e.dead) continue;
      if (e.hurt > 0) e.hurt -= DT;
      const p = e.body.getPosition();
      // sorti du niveau
      if (p.y < -12 || p.x < -30 || p.x > this.width + 40) {
        this.destroy(e, e.kind === 'enemy');
        continue;
      }
      if (e.fuse !== undefined) {
        const up = e.body.getWorldVector(new Vec2(0, 1));
        const thrust = (e.objDef?.special as { thrust: number }).thrust;
        e.body.applyForceToCenter(
          new Vec2(up.x * thrust * e.body.getMass(), up.y * thrust * e.body.getMass()),
          true,
        );
        e.fuse -= DT;
        if (e.fuse <= 0) this.destroy(e, true);
        continue;
      }
      if (!isProjectile(e)) continue;
      if (e.kind === 'friend' && !e.dead) this.trail.push({ x: p.x, y: p.y });
      if (e.mode === 'levitate' && this.time > (e.modeUntil ?? 0)) {
        e.mode = undefined;
        e.body.setGravityScale(1);
      }
      if (e.mode === 'run') {
        const v = e.body.getLinearVelocity();
        if (this.time - (e.launchedAt ?? 0) > 0.3 && Math.abs(v.y) < 1.5)
          e.body.setLinearVelocity(new Vec2(11, v.y));
        if (this.time - (e.launchedAt ?? 0) > 3.5) e.mode = undefined;
      }
      // fin de course : arrêté, ou trop longtemps en jeu
      const v = e.body.getLinearVelocity();
      const slow = Math.hypot(v.x, v.y) < 0.8 && e.mode !== 'levitate';
      e.slowFor = slow ? (e.slowFor ?? 0) + DT : 0;
      const age = this.time - (e.launchedAt ?? 0);
      const limit = e.kind === 'friend' ? 10 : 5;
      if ((e.slowFor ?? 0) > 0.9 || age > limit || (e.impactAt !== undefined && this.time - e.impactAt > 5))
        this.destroy(e, false);
    }
    if (this.ents.some((e) => e.dead)) this.ents = this.ents.filter((e) => !e.dead);
  }

  private moving(): boolean {
    for (const e of this.ents) {
      if (e.dead || !e.body.isDynamic() || !e.body.isAwake()) continue;
      const v = e.body.getLinearVelocity();
      if (Math.hypot(v.x, v.y) > 0.25 || Math.abs(e.body.getAngularVelocity()) > 0.3) return true;
    }
    return false;
  }

  private updatePhase() {
    if (this.phase === 'won' || this.phase === 'lost') return;
    const busy = this.flying.length > 0;
    const calm = !busy && !this.moving();
    this.calmFor = calm ? this.calmFor + DT : 0;
    if (this.enemiesLeft === 0 && !this.wonPending) {
      this.wonPending = true;
      this.endAt = this.time + 3;
    }
    if (this.wonPending) {
      if ((!busy && this.calmFor > 0.4) || this.time > this.endAt) this.finish(true);
      return;
    }
    if (busy) {
      // l'ami suivant peut partir dès que le précédent a fini sa course
      this.phase = 'flying';
      return;
    }
    if (this.queue.length > 0) {
      this.phase = 'aim';
      return;
    }
    this.phase = 'settling';
    if (!this.endAt) this.endAt = this.time + 6;
    if (this.calmFor > 1 || this.time > this.endAt) this.finish(this.enemiesLeft === 0);
  }

  private finish(won: boolean) {
    if (won) {
      for (const [i] of this.queue.entries())
        this.addScore(FRIEND_BONUS, CANNON.x - 2.4 - i * 1.1, 2, '#ffd23f');
    }
    this.phase = won ? 'won' : 'lost';
    this.events.push({ t: 'end', won });
  }

  /** Étoiles obtenues (0 si perdu). */
  stars(): number {
    if (this.phase !== 'won') return 0;
    const [s2, s3] = this.thresholds();
    return this.score >= s3 ? 3 : this.score >= s2 ? 2 : 1;
  }

  thresholds(): [number, number] {
    if (this.level.stars) return this.level.stars;
    return autoThresholds(this.level, this.initialMax);
  }

  /** Score maximal calculé au chargement. */
  readonly initialMax = 0;
}

/** Seuils d'étoiles : tuer tout le monde, casser une partie du décor et garder des amis. */
export function autoThresholds(level: LevelDef, maxScore: number): [number, number] {
  const enemyScore = level.enemies.reduce((s, e) => s + ((ENEMIES[e.k] as EnemyDef).score ?? KILL_SCORE), 0);
  const blocks = maxScore - enemyScore;
  const spare = Math.max(0, level.friends.length - Math.max(1, Math.ceil(level.enemies.length / 2.5)));
  const r = (n: number) => Math.round(n / 1000) * 1000;
  return [
    r(enemyScore + blocks * 0.3 + FRIEND_BONUS * Math.max(0, spare - 1) * 0.5),
    r(enemyScore + blocks * 0.5 + FRIEND_BONUS * Math.max(0, spare - 1)),
  ];
}

export const isProjectile = (e: Ent) =>
  e.kind === 'friend' || e.kind === 'clone' || e.kind === 'ball' || e.kind === 'puck' || e.kind === 'pet';

/** Boîte aux coins coupés (les piles tiennent mieux et roulent moins bizarrement). */
function chamfered(w: number, h: number, c = 0.04) {
  const hw = w / 2;
  const hh = h / 2;
  const k = Math.min(c, hw * 0.3, hh * 0.3);
  return new Polygon([
    new Vec2(-hw + k, -hh),
    new Vec2(hw - k, -hh),
    new Vec2(hw, -hh + k),
    new Vec2(hw, hh - k),
    new Vec2(hw - k, hh),
    new Vec2(-hw + k, hh),
    new Vec2(-hw, hh - k),
    new Vec2(-hw, -hh + k),
  ]);
}

/** Crée la simulation et mémorise le score maximal (pour les étoiles). */
export function createSim(level: LevelDef): Sim {
  const sim = new Sim(level);
  (sim as { initialMax: number }).initialMax = sim.maxScore;
  return sim;
}

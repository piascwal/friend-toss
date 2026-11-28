/* Simulation d'un niveau : physique (planck), dégâts, explosions, pouvoirs des amis, score, victoire.
   Aucune dépendance au navigateur : l'affichage lit `ents` et vide `events` à chaque image. */
import { Vec2, World, type Body, type Contact, type Fixture } from 'planck';
import { chamfered } from './shapes';
import {
  CANNON,
  DMG_K,
  DT,
  ENEMY_MUL,
  FRIEND_BONUS,
  FRIEND_DMG,
  GRAVITY,
  IMP_MIN,
  RESTING,
  SCALE,
  IMP_MIN_ENEMY,
  KILL_SCORE,
  muzzle,
} from './constants';
import { isProjectile, type Ent, type EntKind, type Phase, type SimEvent } from './entity';
import { usePower } from './powers';
import { ENEMIES, FRIEND_BY_ID, MATS, type EnemyDef, type Mat, type Shape } from './defs';
import type { LevelDef } from './level';
import { buildLevel } from './setup';

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
    buildLevel(this);
    this.world.on('post-solve', (c, imp) => this.onPostSolve(c, imp.normalImpulses));
    this.world.on('begin-contact', (c) => this.onBegin(c));
    this.settle();
  }

  /** Ajoute une entité (le corps physique est déjà créé). */
  addEnt(kind: EntKind, body: Body, w: number, h: number, shape: Shape, mat: Ent['mat'], hp: number): Ent {
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

  /** Depuis combien de temps (s) plus rien ne bouge dans le niveau. */
  get calmTime(): number {
    return this.calmFor;
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
    const ent = this.addEnt('friend', body, def.radius * 2, def.radius * 2, 'circle', 'friend', 1e9);
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
    this.events.push({ t: 'power', ent: e, x: p.x, y: p.y, target });
    usePower(this, e, target);
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
    const ba = c.getFixtureA().getBody();
    const bb = c.getFixtureB().getBody();
    // une charge posée (deux corps presque immobiles l'un sur l'autre) n'est pas un choc : une tour
    // lourde ne s'écrase pas toute seule
    const rel = Vec2.sub(ba.getLinearVelocity(), bb.getLinearVelocity()).length();
    if (rel < RESTING) return;
    const a = ba.getUserData() as Ent | null;
    const b = bb.getUserData() as Ent | null;
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
      if (e.mode === 'fire' && !e.dead) {
        // la boule de feu explose au premier contact
        e.mode = undefined;
        const p = e.body.getPosition();
        this.pending.push(() => {
          this.explode(p.x, p.y, 2.8, 60, 95, e);
          this.destroy(e, false);
        });
        continue;
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

  /** Inflige des dégâts ; à 0, l'entité casse (ou le relou tombe). */
  hurt(e: Ent, dmg: number) {
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
    r *= SCALE; // le souffle suit l'échelle du décor
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

  private updateEnts() {
    for (const e of this.ents) {
      if (e.dead) continue;
      if (e.hurt > 0) e.hurt -= DT;
      const p = e.body.getPosition();
      // sorti du niveau
      if (p.y < -15 || p.x < -30 || p.x > this.width + 40) {
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

/** Crée la simulation et mémorise le score maximal (pour les étoiles). */
export function createSim(level: LevelDef): Sim {
  const sim = new Sim(level);
  (sim as { initialMax: number }).initialMax = sim.maxScore;
  return sim;
}

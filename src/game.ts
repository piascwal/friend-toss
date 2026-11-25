/* Une partie : la simulation, l'affichage, la visée au doigt ou à la souris, le HUD et les effets. */
import { enemyStillUrl, load, pose, posePath, poseUrl, preloadEnemy, spritePath } from './assets';
import { sfx } from './audio';
import type { WorldDef } from './data/levels';
import { ENEMIES, FRIEND_BY_ID, OBJECTS, THROWER, type ObjDef } from './sim/defs';
import type { LevelDef } from './sim/level';
import { ANCHOR, createSim, DT, MAX_SPEED, type Ent, type Sim } from './sim/sim';
import { Renderer, type Scene } from './render/renderer';
import { THEMES } from './render/art';
import { up } from './ui';

export interface Result {
  won: boolean;
  score: number;
  stars: number;
  gold: boolean;
  freed: string[];
  thresholds: [number, number];
}

const POSES = ['idle', 'portrait', 'jump', 'fall', 'hit', 'down', 'win'];

/** Précharge les images d'un niveau. */
export async function preloadLevel(level: LevelDef, world: WorldDef) {
  const jobs: Promise<unknown>[] = [];
  const friends = new Set([
    ...level.friends,
    THROWER,
    ...level.items.filter((i) => i.friend).map((i) => i.friend!),
  ]);
  for (const id of friends) {
    const f = FRIEND_BY_ID[id];
    for (const p of [
      ...POSES,
      'crouch',
      'punch_heavy',
      f?.castPose,
      f?.fxPose,
      f?.power === 'pet' ? 'pj_pet_run2' : undefined,
      f?.power === 'levitate' ? 'pj_mandala' : undefined,
    ]) {
      const path = p && posePath(id, p);
      if (path) jobs.push(load(path));
    }
  }
  for (const it of level.items) {
    const def = OBJECTS[it.k] as ObjDef;
    if (def.sprite) jobs.push(load(spritePath(def.sprite)));
  }
  level.enemies.forEach((e, i) => jobs.push(preloadEnemy(e.k, e.v ?? (i % ENEMIES[e.k].variants) + 1)));
  for (const [id, file] of THEMES[world.theme].decor) jobs.push(load(`props/${id}/${file}`));
  await Promise.all(jobs);
}

export class Game {
  readonly sim: Sim;
  private renderer: Renderer;
  private scene: Scene = { throwerPose: 'idle', waiting: [] };
  private raf = 0;
  private last = 0;
  private acc = 0;
  private drag: { id: number; x: number; y: number } | null = null;
  private aimVel: { vx: number; vy: number; power: number } | null = null;
  private throwT = 0;
  private hop = 1;
  private loadedId: string | undefined;
  private ended = false;
  private hud: HTMLElement;
  private paused = false;
  private lastScore = -1;
  private enemyIcons = new Map<Ent, HTMLElement>();
  private disposers: (() => void)[] = [];

  constructor(
    private canvas: HTMLCanvasElement,
    hudRoot: HTMLElement,
    readonly level: LevelDef,
    readonly world: WorldDef,
    private cb: { end: (r: Result) => void; pause: () => void; restart: () => void },
  ) {
    this.sim = createSim(level);
    this.renderer = new Renderer(canvas);
    this.renderer.setLevel(level, world.theme, this.sim);
    this.hud = hudRoot;
    this.buildHud();
    this.bindInput();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    for (const d of this.disposers) d();
    this.hud.innerHTML = '';
  }

  setPaused(p: boolean) {
    this.paused = p;
    this.last = performance.now();
  }

  /* ------------------------------------------------------------ entrée */

  private bindInput() {
    const c = this.canvas;
    const on = <K extends keyof HTMLElementEventMap>(
      el: HTMLElement | Window,
      type: K,
      fn: (e: HTMLElementEventMap[K]) => void,
    ) => {
      el.addEventListener(type, fn as EventListener);
      this.disposers.push(() => el.removeEventListener(type, fn as EventListener));
    };
    on(c, 'pointerdown', (e) => this.down(e));
    on(window, 'pointermove', (e) => this.move(e));
    on(window, 'pointerup', (e) => this.up(e));
    on(window, 'pointercancel', () => this.cancelAim());
    on(window, 'resize', () => this.renderer.resize());
    on(window, 'keydown', (e) => {
      if (this.paused) return;
      if (e.code === 'Space') {
        e.preventDefault();
        this.trigger();
      }
      if (e.code === 'Escape' || e.code === 'KeyP') this.cb.pause();
      if (e.code === 'KeyR') this.cb.restart();
    });
  }

  private anchorScreen() {
    return this.renderer.toScreen(ANCHOR.x, ANCHOR.y);
  }

  private down(e: PointerEvent) {
    if (this.paused || this.ended) return;
    const r = this.canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (this.sim.current) {
      const w = this.renderer.toWorld(x, y);
      this.trigger(w);
      return;
    }
    if (!this.sim.canLaunch || this.hop < 1) return;
    const a = this.anchorScreen();
    const near = Math.hypot(x - a.x, y - a.y) < Math.max(80, this.renderer.cam.s * 2.2);
    if (near || x < r.width * 0.45) {
      this.drag = { id: e.pointerId, x, y };
      this.canvas.setPointerCapture?.(e.pointerId);
      this.updateAim(x, y);
    }
  }

  private move(e: PointerEvent) {
    if (!this.drag || e.pointerId !== this.drag.id) return;
    const r = this.canvas.getBoundingClientRect();
    this.updateAim(e.clientX - r.left, e.clientY - r.top);
  }

  private radius() {
    return Math.max(70, Math.min(140, this.canvas.clientHeight * 0.2));
  }

  private updateAim(x: number, y: number) {
    // on tire depuis l'endroit où le doigt s'est posé : le geste marche partout sur la gauche
    const d = this.drag!;
    let dx = x - d.x;
    let dy = y - d.y;
    const R = this.radius();
    const len = Math.hypot(dx, dy);
    if (len > R) {
      dx = (dx / len) * R;
      dy = (dy / len) * R;
    }
    const power = Math.min(1, len / R);
    this.aimVel = { vx: (-dx / R) * MAX_SPEED, vy: (dy / R) * MAX_SPEED, power };
    if (power > 0.05) sfx.stretch(power);
  }

  private up(e: PointerEvent) {
    if (!this.drag || e.pointerId !== this.drag.id) return;
    this.drag = null;
    const v = this.aimVel;
    this.aimVel = null;
    if (!v || v.power < 0.15 || !this.sim.canLaunch) return;
    const ent = this.sim.launch(v.vx, v.vy);
    if (ent) {
      this.throwT = 0.5;
      this.loadedId = undefined;
    }
  }

  private cancelAim() {
    this.drag = null;
    this.aimVel = null;
  }

  private trigger(target?: { x: number; y: number }) {
    const cur = this.sim.current;
    if (!cur || cur.friend?.power === 'none') return;
    this.sim.activate(target);
  }

  /* ------------------------------------------------------------ boucle */

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (this.paused) {
      this.renderer.draw(this.sim, this.sceneNow(), 0);
      return;
    }
    this.acc += dt;
    let n = 0;
    while (this.acc >= DT && n++ < 4) {
      this.acc -= DT;
      this.sim.step();
      this.handleEvents();
    }
    if (n >= 4) this.acc = 0;
    this.throwT = Math.max(0, this.throwT - dt);
    this.hop = Math.min(1, this.hop + dt * 3);
    this.renderer.draw(this.sim, this.sceneNow(), dt);
    this.updateHud();
  };

  private sceneNow(): Scene {
    const sim = this.sim;
    const next = sim.phase === 'aim' || sim.phase === 'flying' ? sim.queue[0] : undefined;
    if (next !== this.loadedId && sim.phase === 'aim') {
      this.loadedId = next;
      this.hop = 0;
    }
    const won = sim.phase === 'won';
    const s = this.scene;
    s.throwerPose = won ? 'win' : this.throwT > 0 ? 'punch_heavy' : this.drag ? 'crouch' : 'idle';
    s.celebrate = won;
    s.aim = this.drag && this.aimVel ? this.aimVel : undefined;
    s.waiting = sim.phase === 'aim' ? sim.queue.slice(1) : sim.queue.slice(sim.phase === 'flying' ? 0 : 1);
    if (sim.phase === 'aim' && this.loadedId) {
      const R = this.radius();
      const pull = s.aim
        ? { x: (-s.aim.vx / MAX_SPEED) * R, y: (-s.aim.vy / MAX_SPEED) * R }
        : { x: 0, y: 0 };
      const k = this.hop;
      const from = { x: -2.2, y: 0.7 };
      const scale = this.renderer.cam.s;
      const x = ANCHOR.x + pull.x / scale;
      const y = ANCHOR.y + pull.y / scale;
      s.loaded = {
        id: this.loadedId,
        x: from.x + (x - from.x) * k,
        y: from.y + (y - from.y) * k,
        hop: k < 1 ? k : 0,
      };
    } else s.loaded = undefined;
    return s;
  }

  /* ------------------------------------------------------------ événements */

  private handleEvents() {
    const R = this.renderer;
    for (const ev of this.sim.events.splice(0)) {
      switch (ev.t) {
        case 'launch': {
          sfx.launch();
          const f = ev.ent.friend!;
          R.text(ANCHOR.x + 0.5, ANCHOR.y + 1.6, f.shout, '#1a1020', 12, 1.3, true);
          R.smoke(ANCHOR.x, ANCHOR.y, 4, 0.35);
          break;
        }
        case 'break':
          R.breakFx(ev.x, ev.y, ev.w, ev.h, ev.mat);
          if (ev.mat === 'ice') sfx.ice();
          else if (ev.mat === 'stone') sfx.stone();
          else if (ev.mat === 'metal') sfx.metal();
          else sfx.wood();
          break;
        case 'kill':
          R.smoke(ev.x, ev.y, 9, 0.6);
          R.stars(ev.x, ev.y + 0.6, 6, '#ffffff');
          if (ev.ent.enemyDef?.boss) {
            R.addShake(1);
            R.text(ev.x, ev.y + 2.5, 'K.O. !', '#ff3d7f', 34, 2);
          }
          sfx.kill();
          this.killIcon(ev.ent);
          break;
        case 'score':
          R.text(ev.x, ev.y, `${ev.pts}`, ev.color ?? '#ffffff', ev.pts >= 5000 ? 20 : 13, 1.2);
          sfx.score();
          break;
        case 'explode':
          R.flash(ev.x, ev.y, ev.r, ev.confetti ? '#ff8ad8' : '#ffb347');
          R.ring(ev.x, ev.y, ev.r, '#ffffff', 0.35);
          if (ev.confetti)
            R.burst(ev.x, ev.y, ['#ff3d7f', '#ffd23f', '#3dd6ff', '#7dff6b', '#c56bff'], 60, 12, 0.18);
          else {
            R.burst(ev.x, ev.y, ['#ffd23f', '#ff7a1a', '#ff3d1a', '#5a2a10'], 26, 9, 0.25);
            R.smoke(ev.x, ev.y, 10, 1, 'rgba(70,60,60,0.85)');
          }
          R.addShake(0.6);
          sfx.boom();
          break;
        case 'impact':
          if (ev.force > 9) R.smoke(ev.x, ev.y, 2, 0.3, 'rgba(230,220,200,0.7)');
          sfx.thud(ev.force);
          break;
        case 'power':
          this.powerFx(ev.ent, ev.x, ev.y, ev.target);
          break;
        case 'beam':
          R.beam(ev.x0, ev.y0, ev.x1, ev.y1);
          R.flash(ev.x1, ev.y1, 1.2, '#7fe9ff');
          break;
        case 'freeze': {
          const shard = pose('roulie', 'pj_ice_shard');
          for (let i = 0; i < 7; i++) {
            const a = ((i - 3) * 11 * Math.PI) / 180;
            R.sprite(shard, ev.x, ev.y, Math.cos(a) * 14 * ev.dir, Math.sin(a) * 14, 0.9, 0.55);
          }
          R.burst(ev.x + ev.dir * 3, ev.y, ['#e6fbff', '#9fe3f5'], 24, 8, 0.15);
          sfx.ice();
          break;
        }
        case 'free':
          R.stars(ev.x, ev.y, 18);
          R.text(ev.x, ev.y + 2.2, `${FRIEND_BY_ID[ev.friend]?.name ?? ''} LIBERE !`, '#ffd23f', 18, 2.2);
          R.sprite(pose(ev.friend, 'win'), ev.x, ev.y + 0.6, 0, 1.2, 1.2, 2);
          sfx.free();
          break;
        case 'gold':
          R.stars(ev.x, ev.y, 20);
          R.text(ev.x, ev.y + 1.8, "TONNEAU D'OR !", '#ffd23f', 16, 2);
          sfx.gold();
          break;
        case 'poof':
          R.smoke(ev.x, ev.y, 6, 0.45);
          sfx.poof();
          break;
        case 'teleport':
          R.ring(ev.x, ev.y, 1.5, '#7fe9ff', 0.4);
          R.ring(ev.x2, ev.y2, 1.5, '#7fe9ff', 0.4);
          R.stars(ev.x2, ev.y2, 8, '#7fe9ff');
          sfx.teleport();
          break;
        case 'rocket':
          R.smoke(ev.x, ev.y, 5, 0.4, 'rgba(90,90,90,0.8)');
          sfx.launch();
          break;
        case 'bounce':
          sfx.bounce();
          break;
        case 'shockwave':
          R.sprite(pose('lolo', 'pj_shockwave'), ev.x, ev.y + 0.2, 0, 0, 4, 0.5);
          R.ring(ev.x, ev.y, 3.2, '#ffd23f', 0.45);
          R.addShake(0.9);
          sfx.boom();
          break;
        case 'end':
          this.end(ev.won);
          break;
      }
    }
  }

  private powerFx(e: Ent, x: number, y: number, target?: { x: number; y: number }) {
    const R = this.renderer;
    const f = e.friend!;
    sfx.power();
    R.text(x, y + 1.4, `${up(f.powerName)} !`, '#ffd23f', 14, 1);
    R.ring(x, y, 1.2, '#ffffff', 0.3);
    if (f.power === 'blast') {
      const wave = pose(f.id, 'pj_palm_wave');
      R.sprite(wave, x + 0.6, y, 10, 0, 1.8, 0.45);
      R.sprite(wave, x - 0.6, y, -10, 0, 1.8, 0.45);
      R.ring(x, y, 3.8, '#9fe3ff', 0.4);
      R.addShake(0.5);
    }
    if (f.power === 'triple') R.smoke(x, y, 6, 0.4, 'rgba(255,220,255,0.8)');
    if (f.power === 'smash' && target) R.ring(target.x, target.y, 0.8, '#ffd23f', 0.5);
    if (f.power === 'pet') R.text(x, y - 1, 'OUAF !', '#ffffff', 12, 1);
  }

  private end(won: boolean) {
    if (this.ended) return;
    this.ended = true;
    if (won) sfx.win();
    else sfx.lose();
    const sim = this.sim;
    setTimeout(
      () =>
        this.cb.end({
          won,
          score: sim.score,
          stars: sim.stars(),
          gold: sim.gold > 0,
          freed: sim.freed,
          thresholds: sim.thresholds(),
        }),
      won ? 1400 : 900,
    );
  }

  /* ------------------------------------------------------------ HUD */

  private buildHud() {
    const sim = this.sim;
    const [s2, s3] = sim.thresholds();
    this.hud.innerHTML = `
      <div class="hud-top">
        <div class="hud-left">
          <button class="pix-btn icon" data-act="pause" title="Pause">II</button>
          <button class="pix-btn icon" data-act="restart" title="Recommencer">↻</button>
          <div class="hud-level"><span class="hud-world" style="--c:${this.world.color}">${this.world.name}</span><b>${this.level.id} · ${this.level.name}</b></div>
        </div>
        <div class="hud-center">
          <div class="hud-enemies"></div>
          <div class="hud-boss" hidden><span></span><div class="bar"><i></i></div></div>
        </div>
        <div class="hud-right">
          <div class="hud-score"><small>SCORE</small><b>0</b></div>
          <div class="hud-starbar" title="${s2} / ${s3}">
            <div class="fill"></div>
            <span class="mk" style="left:${(s2 / s3) * 100}%">★</span>
            <span class="mk" style="left:100%">★</span>
          </div>
        </div>
      </div>
      <div class="hud-bottom">
        <div class="hud-queue"></div>
        <div class="hud-hint" hidden></div>
      </div>`;
    const icons = this.hud.querySelector('.hud-enemies')!;
    for (const e of sim.ents) {
      if (e.kind !== 'enemy') continue;
      const el = document.createElement('div');
      el.className = `enemy-icon${e.enemyDef?.boss ? ' boss' : ''}`;
      el.style.backgroundImage = `url("${enemyStillUrl(e.enemy!, e.variant)}")`;
      el.title = e.enemyDef!.label;
      icons.appendChild(el);
      this.enemyIcons.set(e, el);
    }
    const boss = sim.bosses[0];
    if (boss) {
      const b = this.hud.querySelector<HTMLElement>('.hud-boss')!;
      b.hidden = false;
      b.querySelector('span')!.textContent = boss.enemyDef!.label;
    }
    this.hud.querySelector('[data-act=pause]')!.addEventListener('click', () => this.cb.pause());
    this.hud.querySelector('[data-act=restart]')!.addEventListener('click', () => this.cb.restart());
    this.renderQueue();
  }

  private killIcon(e: Ent) {
    const el = this.enemyIcons.get(e);
    if (el) el.classList.add('dead');
  }

  private queueKey = '';
  private renderQueue() {
    const sim = this.sim;
    const flying = sim.current?.friend?.id;
    const key = `${sim.queue.join(',')}|${flying ?? ''}|${sim.phase}`;
    if (key === this.queueKey) return;
    this.queueKey = key;
    const q = this.hud.querySelector('.hud-queue')!;
    const items = sim.queue.map((id, i) => {
      const f = FRIEND_BY_ID[id]!;
      const cur = i === 0 && sim.phase === 'aim';
      return `<div class="q-friend${cur ? ' current' : ''}" title="${f.name} — ${f.powerName} : ${f.desc}">
        <img src="${poseUrl(id, 'portrait')}" alt="">
        ${cur ? `<div class="q-info"><b>${f.name}</b><span>${f.power === 'none' ? 'Sans pouvoir' : f.powerName}</span></div>` : ''}
      </div>`;
    });
    q.innerHTML = items.join('');
  }

  private updateHud() {
    const sim = this.sim;
    if (sim.score !== this.lastScore) {
      this.lastScore = sim.score;
      this.hud.querySelector('.hud-score b')!.textContent = sim.score.toLocaleString('fr-FR');
      const [, s3] = sim.thresholds();
      const fill = this.hud.querySelector<HTMLElement>('.hud-starbar .fill')!;
      fill.style.width = `${Math.min(100, (sim.score / s3) * 100)}%`;
      const [s2] = sim.thresholds();
      this.hud
        .querySelectorAll<HTMLElement>('.hud-starbar .mk')
        .forEach((m, i) => m.classList.toggle('on', sim.score >= (i ? s3 : s2)));
    }
    const boss = sim.bosses[0];
    if (boss) {
      const bar = this.hud.querySelector<HTMLElement>('.hud-boss .bar i')!;
      bar.style.width = `${Math.max(0, (boss.hp / boss.maxHp) * 100) * (boss.dead ? 0 : 1)}%`;
    }
    this.renderQueue();
    // rappel du pouvoir pendant le vol
    const hint = this.hud.querySelector<HTMLElement>('.hud-hint')!;
    const cur = sim.current;
    const show = !!cur && cur.friend!.power !== 'none' && cur.impactAt === undefined;
    if (show !== !hint.hidden) {
      hint.hidden = !show;
      if (show) {
        const f = cur.friend!;
        const touch = matchMedia('(pointer: coarse)').matches;
        const where = f.power === 'smash' ? 'Touche la cible' : touch ? 'Touche l’écran' : 'Clic ou Espace';
        hint.innerHTML = `<b>${where}</b> : ${f.powerName}`;
      }
    }
  }
}

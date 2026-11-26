/* Une partie : relie la simulation, l'affichage, les gestes, le HUD et les effets.
   La simulation avance à pas fixes (1/60 s) ; un ralenti fait avancer le temps moins vite. */
import { sfx } from '../audio';
import type { WorldDef } from '../levels';
import { Renderer, type Scene } from '../render/renderer';
import { BARREL, CANNON, DT } from '../sim/constants';
import type { LevelDef } from '../sim/level';
import { createSim, type Sim } from '../sim/sim';
import { playEvents } from './feedback';
import { Hud } from './hud';
import { Input, type Aim } from './input';

export interface Result {
  won: boolean;
  score: number;
  stars: number;
  gold: boolean;
  freed: string[];
  thresholds: [number, number];
}

export interface GameCallbacks {
  end: (r: Result) => void;
  pause: () => void;
  restart: () => void;
}

export class Game {
  readonly sim: Sim;
  readonly renderer: Renderer;
  private input: Input;
  private hud: Hud;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private slow = 0;
  private paused = false;
  private ended = false;
  // canon et ami chargé
  private angle = 0.6;
  private recoil = 0;
  private hop = 1;
  private loadedId: string | undefined;
  private scene: Scene = { cannon: { angle: 0.6, recoil: 0 }, waiting: [] };

  constructor(
    canvas: HTMLCanvasElement,
    hudRoot: HTMLElement,
    level: LevelDef,
    world: WorldDef,
    private cb: GameCallbacks,
  ) {
    this.sim = createSim(level);
    this.renderer = new Renderer(canvas, level, world.theme, this.sim);
    this.renderer.camera.startIntro(this.sim);
    this.hud = new Hud(hudRoot, this.sim, level, world, cb);
    this.input = new Input(canvas, this.actions());
    window.addEventListener('resize', this.onResize);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    this.input.destroy();
    this.hud.destroy();
  }

  setPaused(p: boolean) {
    this.paused = p;
    this.input.paused = p;
    this.last = performance.now();
  }

  private onResize = () => this.renderer.resize();

  /** Ce que les gestes du joueur déclenchent. */
  private actions() {
    const R = this.renderer;
    const sim = this.sim;
    return {
      onCannon: (x: number, y: number) => {
        const reach = Math.max(80, R.view.cam.s * 2.4);
        const pivot = R.view.toScreen(CANNON.x, CANNON.y);
        const mouth = R.view.toScreen(
          CANNON.x + Math.cos(this.angle) * BARREL * 0.8,
          CANNON.y + Math.sin(this.angle) * BARREL * 0.8,
        );
        return Math.hypot(x - pivot.x, y - pivot.y) < reach || Math.hypot(x - mouth.x, y - mouth.y) < reach;
      },
      canAim: () => sim.canLaunch && this.hop >= 1 && !this.ended,
      canPower: () => {
        const cur = sim.current;
        return !!cur && cur.impactAt === undefined && cur.friend?.power !== 'none';
      },
      introRunning: () => R.camera.introRunning,
      skipIntro: () => R.camera.skipIntro(),
      fire: (aim: Aim) => {
        if (!sim.launch(aim.vx, aim.vy)) return;
        this.recoil = 1;
        this.loadedId = undefined;
        R.camera.launched();
      },
      power: (x: number, y: number) => sim.activate(Number.isNaN(x) ? undefined : R.view.toWorld(x, y)),
      pan: (dx: number) => R.camera.panBy(dx),
      zoom: (f: number, x: number) => R.camera.zoomAt(f, x, sim),
      pause: () => this.cb.pause(),
      restart: () => this.cb.restart(),
      backToCannon: () => R.camera.backToCannon(),
    };
  }

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (!this.paused) this.advance(dt);
    this.renderer.draw(this.updateScene(), this.paused ? 0 : dt);
    this.hud.update();
  };

  private advance(dt: number) {
    // ralenti : le temps de la simulation avance au tiers pendant quelques instants
    this.slow = Math.max(0, this.slow - dt);
    this.acc += this.slow > 0 ? dt * 0.35 : dt;
    let n = 0;
    while (this.acc >= DT && n++ < 4) {
      this.acc -= DT;
      this.sim.step();
      playEvents(this.sim.events.splice(0), {
        fx: this.renderer.fx,
        killed: (e) => this.hud.kill(e),
        slowMo: (s) => (this.slow = Math.max(this.slow, s)),
        ended: (won) => this.end(won),
      });
    }
    if (n >= 4) this.acc = 0;
    this.recoil = Math.max(0, this.recoil - dt * 3);
    if (!this.renderer.camera.introRunning) this.hop = Math.min(1, this.hop + dt * 2.5);
  }

  private updateScene(): Scene {
    const sim = this.sim;
    const aim = this.input.aim;
    if (aim && aim.power > 0.08) this.angle = Math.atan2(aim.vy, aim.vx);
    const next = sim.phase === 'aim' ? sim.queue[0] : undefined;
    if (next && next !== this.loadedId) {
      this.loadedId = next;
      this.hop = 0;
    }
    const s = this.scene;
    s.cannon = { angle: this.angle, recoil: this.recoil };
    s.celebrate = sim.phase === 'won';
    s.sad = sim.phase === 'lost';
    s.aim = aim ?? undefined;
    s.waiting = sim.phase === 'aim' ? sim.queue.slice(1) : sim.queue.slice(sim.phase === 'flying' ? 0 : 1);
    s.loaded = sim.phase === 'aim' && this.loadedId ? { id: this.loadedId, hop: this.hop } : undefined;
    return s;
  }

  private end(won: boolean) {
    if (this.ended) return;
    this.ended = true;
    if (won) sfx.win();
    else sfx.lose();
    const sim = this.sim;
    const result: Result = {
      won,
      score: sim.score,
      stars: sim.stars(),
      gold: sim.gold > 0,
      freed: sim.freed,
      thresholds: sim.thresholds(),
    };
    setTimeout(() => this.cb.end(result), won ? 1400 : 900);
  }
}

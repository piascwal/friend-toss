/* Démonstration d'un pouvoir : une mini-scène jouée par le vrai moteur, sans gestes ni HUD.
   Le canon tire tout seul, le pouvoir se déclenche au bon moment avec un ralenti et son nom en grand. */
import { demoFor } from '../levels/demos';
import { Renderer, type Scene } from '../render/renderer';
import { DT, MAX_SPEED } from '../sim/constants';
import { FRIEND_BY_ID } from '../sim/defs';
import type { Theme } from '../sim/level';
import { createSim, type Sim } from '../sim/sim';
import { playEvents } from './feedback';

/** Moments de la démo (secondes depuis le début). */
const FIRE_AT = 1;
const MAX_TIME = 9;

export class DemoPlayer {
  private sim: Sim;
  private renderer: Renderer;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private t = 0;
  private slow = 0;
  private firedAt = -1;
  private powered = false;
  private done = false;
  private shot;
  private scene: Scene;

  constructor(
    canvas: HTMLCanvasElement,
    friendId: string,
    theme: Theme,
    private onDone: () => void,
  ) {
    const f = FRIEND_BY_ID[friendId]!;
    const demo = demoFor(friendId, f.power);
    this.shot = demo.shot;
    this.sim = createSim(demo.level);
    this.renderer = new Renderer(canvas, demo.level, theme, this.sim);
    const angle = (demo.shot.deg * Math.PI) / 180;
    this.scene = { cannon: { angle, recoil: 0 }, waiting: [], loaded: { id: friendId, hop: 1 } };
    this.renderer.camera.showAll();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
  }

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.t += dt;
    this.slow = Math.max(0, this.slow - dt);
    this.acc += this.slow > 0 ? dt * 0.3 : dt;
    while (this.acc >= DT) {
      this.acc -= DT;
      this.script();
      this.sim.step();
      playEvents(this.sim.events.splice(0), {
        fx: this.renderer.fx,
        killed: () => {},
        slowMo: (s) => (this.slow = Math.max(this.slow, s)),
        ended: () => {},
      });
    }
    this.scene.cannon.recoil = Math.max(0, this.scene.cannon.recoil - dt * 3);
    this.renderer.draw(this.scene, dt);
    const settled = this.firedAt >= 0 && this.sim.phase !== 'flying' && this.sim.time - this.firedAt > 2.5;
    if (!this.done && (settled || this.t > MAX_TIME)) {
      this.done = true;
      this.onDone();
    }
  };

  /** Le déroulé : tir, puis pouvoir au moment prévu (avec ralenti et nom du pouvoir en grand). */
  private script() {
    const sim = this.sim;
    if (this.firedAt < 0 && this.t >= FIRE_AT) {
      const r = (this.shot.deg * Math.PI) / 180;
      const speed = MAX_SPEED * this.shot.pw;
      sim.launch(Math.cos(r) * speed, Math.sin(r) * speed);
      this.firedAt = sim.time;
      this.scene.loaded = undefined;
      this.scene.cannon.recoil = 1;
      return;
    }
    const at = this.shot.at;
    if (
      !this.powered &&
      at !== undefined &&
      this.firedAt >= 0 &&
      sim.time - this.firedAt >= at &&
      sim.current
    ) {
      this.powered = true;
      sim.activate(this.nearestEnemy());
      this.slow = 1.2;
      this.renderer.fx.addShake(0.4);
    }
  }

  private nearestEnemy() {
    let best: { x: number; y: number } | undefined;
    for (const e of this.sim.ents)
      if (e.kind === 'enemy' && !e.dead && (!best || e.body.getPosition().x < best.x))
        best = e.body.getPosition().clone();
    return best;
  }
}

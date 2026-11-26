/* Affichage d'une partie : assemble la vue, la caméra, le décor, les acteurs, le canon et les effets,
   dans l'ordre (du fond vers l'avant). */
import type { LevelDef, Theme } from '../sim/level';
import type { Sim } from '../sim/sim';
import { drawBlock, drawEnemy, drawProjectile, drawTrail } from './actors';
import { Camera } from './camera';
import { drawCannon, type CannonScene } from './cannon';
import { Effects } from './effects';
import { Scenery } from './scenery';
import { View } from './view';

export type Scene = CannonScene;

export class Renderer {
  readonly view: View;
  readonly camera: Camera;
  readonly fx = new Effects();
  private scenery: Scenery;
  private time = 0;

  constructor(
    canvas: HTMLCanvasElement,
    level: LevelDef,
    theme: Theme,
    private sim: Sim,
  ) {
    this.view = new View(canvas);
    this.camera = new Camera(this.view);
    this.scenery = new Scenery(this.view, level, theme);
    this.camera.measure(sim);
  }

  resize() {
    this.view.resize();
    this.camera.measure(this.sim);
  }

  draw(scene: Scene, dt: number) {
    const { view: v, sim, fx } = this;
    this.time += dt;
    this.camera.update(sim, dt);
    const ctx = v.ctx;
    ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
    if (fx.shake > 0)
      ctx.translate((Math.random() - 0.5) * fx.shake * 10, (Math.random() - 0.5) * fx.shake * 10);
    this.scenery.drawBackground(this.time);
    this.scenery.drawGround();
    drawTrail(v, sim.lastTrail, 'rgba(255,255,255,0.35)');
    drawTrail(v, sim.trail, 'rgba(255,255,255,0.8)');
    for (const e of sim.ents) if (!e.dead && e.kind === 'block') drawBlock(v, fx, e, this.time);
    for (const e of sim.ents) if (!e.dead && e.kind === 'enemy') drawEnemy(v, e, this.time);
    drawCannon(v, scene, this.time);
    for (const e of sim.ents)
      if (!e.dead && e.kind !== 'block' && e.kind !== 'enemy') drawProjectile(v, e, this.time);
    fx.update(dt);
    fx.draw(v);
    fx.drawTexts(v, dt);
  }
}

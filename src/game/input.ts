/* Les gestes du joueur pendant une partie :
   - doigt posé sur le canon puis tiré vers l'arrière : visée, relâché : tir ;
   - doigt posé ailleurs : la vue glisse ; deux doigts ou molette : zoom ;
   - toucher pendant le vol : pouvoir de l'ami ; toucher pendant l'ouverture : on la passe.
   Le module ne connaît ni la physique ni le dessin : il appelle les actions qu'on lui donne. */
import { sfx } from '../audio';
import { MAX_SPEED } from '../sim/constants';

export interface Aim {
  vx: number;
  vy: number;
  power: number;
}

export interface InputActions {
  /** Le point (px) est-il sur le canon ? */
  onCannon(x: number, y: number): boolean;
  canAim(): boolean;
  /** Un ami vole et peut encore utiliser son pouvoir. */
  canPower(): boolean;
  introRunning(): boolean;
  skipIntro(): void;
  fire(aim: Aim): void;
  power(x: number, y: number): void;
  pan(dx: number): void;
  zoom(factor: number, x: number): void;
  pause(): void;
  restart(): void;
  backToCannon(): void;
}

export class Input {
  /** Visée en cours (pour l'affichage). */
  aim: Aim | null = null;
  private drag: { id: number; x: number; y: number } | null = null;
  private pointers = new Map<number, { x: number; y: number }>();
  private pan: { id: number; x: number } | null = null;
  private pinch: { d: number } | null = null;
  private off: (() => void)[] = [];
  paused = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private act: InputActions,
  ) {
    const on = <K extends keyof HTMLElementEventMap>(
      el: HTMLElement | Window,
      type: K,
      fn: (e: HTMLElementEventMap[K]) => void,
      opts?: AddEventListenerOptions,
    ) => {
      el.addEventListener(type, fn as EventListener, opts);
      this.off.push(() => el.removeEventListener(type, fn as EventListener));
    };
    on(canvas, 'pointerdown', (e) => this.down(e));
    on(window, 'pointermove', (e) => this.move(e));
    on(window, 'pointerup', (e) => this.up(e));
    on(window, 'pointercancel', (e) => this.cancel(e));
    on(canvas, 'wheel', (e) => this.wheel(e), { passive: false });
    on(window, 'keydown', (e) => this.key(e));
  }

  destroy() {
    for (const f of this.off) f();
  }

  /** Rayon du geste de visée (px) : tirer plus loin ne donne pas plus de puissance. */
  private radius() {
    return Math.max(70, Math.min(140, this.canvas.clientHeight * 0.2));
  }

  private local(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private down(e: PointerEvent) {
    if (this.paused) return;
    const { x, y } = this.local(e);
    this.pointers.set(e.pointerId, { x, y });
    this.canvas.setPointerCapture?.(e.pointerId);
    if (this.act.introRunning()) return this.act.skipIntro();
    if (this.pointers.size === 2) return this.startPinch();
    if (this.act.canPower()) return this.act.power(x, y);
    if (this.act.canAim() && this.act.onCannon(x, y)) {
      this.drag = { id: e.pointerId, x, y };
      this.updateAim(x, y);
    } else this.pan = { id: e.pointerId, x };
  }

  private move(e: PointerEvent) {
    if (!this.pointers.has(e.pointerId)) return;
    const { x, y } = this.local(e);
    this.pointers.set(e.pointerId, { x, y });
    if (this.pinch && this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()];
      const d = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      if (this.pinch.d > 0) this.act.zoom(d / this.pinch.d, (a!.x + b!.x) / 2);
      this.pinch.d = d;
    } else if (this.drag?.id === e.pointerId) this.updateAim(x, y);
    else if (this.pan?.id === e.pointerId) {
      this.act.pan(x - this.pan.x);
      this.pan.x = x;
    }
  }

  private up(e: PointerEvent) {
    this.pointers.delete(e.pointerId);
    if (this.pointers.size < 2) this.pinch = null;
    if (this.pan?.id === e.pointerId) this.pan = null;
    if (this.drag?.id !== e.pointerId) return;
    const aim = this.aim;
    this.drag = null;
    this.aim = null;
    if (aim && aim.power >= 0.15 && this.act.canAim()) this.act.fire(aim);
  }

  private cancel(e: PointerEvent) {
    this.pointers.delete(e.pointerId);
    this.drag = null;
    this.aim = null;
    this.pan = null;
    this.pinch = null;
  }

  private startPinch() {
    this.drag = null;
    this.aim = null;
    this.pan = null;
    const [a, b] = [...this.pointers.values()];
    this.pinch = { d: Math.hypot(a!.x - b!.x, a!.y - b!.y) };
  }

  /** On tire vers l'arrière depuis l'endroit où le doigt s'est posé. */
  private updateAim(x: number, y: number) {
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
    this.aim = { vx: (-dx / R) * MAX_SPEED, vy: (dy / R) * MAX_SPEED, power };
    if (power > 0.05) sfx.stretch(power);
  }

  private wheel(e: WheelEvent) {
    e.preventDefault();
    if (this.act.introRunning()) this.act.skipIntro();
    this.act.zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.offsetX);
  }

  private key(e: KeyboardEvent) {
    if (this.paused) return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (this.act.introRunning()) this.act.skipIntro();
      else if (this.act.canPower()) this.act.power(NaN, NaN);
    }
    if (e.code === 'Escape' || e.code === 'KeyP') this.act.pause();
    if (e.code === 'KeyR') this.act.restart();
    if (e.code === 'KeyC') this.act.backToCannon();
  }
}

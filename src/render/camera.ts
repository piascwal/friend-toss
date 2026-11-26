/* La caméra, façon jeu de lancer :
   - ouverture : arrêt sur la structure, puis glissement jusqu'au canon ;
   - visée : le canon à gauche et au moins le premier relou visible à droite ;
   - vol : elle suit l'ami (et dézoome s'il monte), puis reste un moment sur l'impact ;
   - libre : le joueur fait glisser la vue ou zoome ; elle reprend la main au tir suivant. */
import type { Sim } from '../sim/sim';
import type { View } from './view';

type Mode = 'intro' | 'aim' | 'follow' | 'watch' | 'free' | 'all';
type Frame = { x: number; s: number };

/** Marges de l'interface (px CSS) : rien d'important n'y est placé. */
const MARGIN_TOP = 64;
const MARGIN_BOTTOM = 72;

export class Camera {
  private mode: Mode = 'aim';
  private modeT = 0;
  private target: Frame = { x: -5, s: 30 };
  private introFrom: Frame = { x: -5, s: 30 };
  private free: Frame = { x: -5, s: 30 };
  /** Étendue du niveau (m) : du canon au dernier objet, et hauteur maximale. */
  private bounds = { x0: -5, x1: 40, y1: 12 };

  constructor(private view: View) {}

  /** Mesure le niveau (appelé au chargement). */
  measure(sim: Sim) {
    let x1 = 20;
    let y1 = 9;
    for (const e of sim.ents) {
      const p = e.body.getPosition();
      x1 = Math.max(x1, p.x + Math.max(e.w, e.h) / 2);
      y1 = Math.max(y1, p.y + e.h / 2);
    }
    this.bounds = { x0: -6.5, x1: x1 + 2.5, y1: y1 + 2 };
    this.jump(this.aimFrame(sim));
  }

  get introRunning() {
    return this.mode === 'intro';
  }

  startIntro(sim: Sim) {
    this.introFrom = this.structureFrame(this.aimFrame(sim).s);
    this.jump(this.introFrom);
    this.setMode('intro');
  }

  skipIntro() {
    if (this.mode === 'intro') this.setMode('aim');
  }

  launched() {
    this.setMode('follow');
  }

  backToCannon() {
    this.setMode('aim');
  }

  /** Toute la scène à l'écran (démonstrations). */
  showAll() {
    this.setMode('all');
  }

  /** Le joueur fait glisser la vue (px CSS). */
  panBy(dx: number) {
    this.takeOver();
    this.free.x -= dx / this.free.s;
    this.clampFree();
  }

  /** Le joueur zoome autour d'un point de l'écran (px CSS). */
  zoomAt(factor: number, px: number, sim: Sim) {
    this.takeOver();
    const wx = px / this.free.s + this.free.x;
    this.free.s = Math.min(this.aimFrame(sim).s * 1.6, Math.max(this.fitAll(), this.free.s * factor));
    this.free.x = wx - px / this.free.s;
    this.clampFree();
  }

  /** Avance la caméra d'une image. */
  update(sim: Sim, dt: number) {
    this.modeT += dt;
    const aim = this.aimFrame(sim);
    if (this.mode === 'intro') return this.updateIntro(aim);
    const lead = this.leadProjectile(sim);
    if (this.mode === 'follow' && !lead) this.setMode('watch');
    if (this.mode === 'watch' && sim.phase === 'aim' && this.modeT > 1.6) this.setMode('aim');
    if (lead && this.mode !== 'free' && this.mode !== 'all') this.mode = 'follow';
    if (this.mode === 'all') this.target = { x: this.bounds.x0, s: this.fitAll() };
    else if (this.mode === 'aim') this.target = aim;
    else if (this.mode === 'free') this.target = this.free;
    else if (this.mode === 'follow' && lead) this.target = this.followFrame(lead, aim.s);
    else if (this.mode === 'watch' && (sim.phase === 'won' || sim.phase === 'lost'))
      this.target = this.structureFrame(aim.s);
    const k = Math.min(1, dt * (this.mode === 'follow' ? 4 : this.mode === 'free' ? 12 : 2.4));
    const cam = this.view.cam;
    cam.x += (this.target.x - cam.x) * k;
    cam.s += (this.target.s - cam.s) * k;
    cam.y = this.groundY(cam.s);
  }

  /* ------------------------------------------------------------ cadrages */

  private updateIntro(aim: Frame) {
    const hold = 1.1;
    const dur = 2.2;
    const k = Math.min(1, Math.max(0, (this.modeT - hold) / dur));
    const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
    this.jump({
      x: this.introFrom.x + (aim.x - this.introFrom.x) * e,
      s: this.introFrom.s + (aim.s - this.introFrom.s) * e,
    });
    if (k >= 1) this.setMode('aim');
  }

  /** Visée : du canon jusqu'au premier relou (entre 14 et 30 m de large). */
  private aimFrame(sim: Sim): Frame {
    let ex = this.bounds.x1;
    for (const e of sim.ents)
      if (e.kind === 'enemy' && !e.dead) ex = Math.min(ex, e.body.getPosition().x + e.w / 2);
    const need = Math.min(Math.max(ex + 1.5 - this.bounds.x0, 14), 30);
    return { x: this.bounds.x0, s: Math.max(this.view.W / need, this.fitAll()) };
  }

  /** Structure : son bord droit, assez haut pour tout voir. */
  private structureFrame(s0: number): Frame {
    const s = Math.max(this.fitAll(), Math.min(s0, this.availH() / this.bounds.y1));
    return { x: Math.max(this.bounds.x0, this.bounds.x1 + 1 - this.view.W / s), s };
  }

  /** Suivi d'un ami en vol : il reste au tiers gauche, et la vue s'élargit s'il monte haut. */
  private followFrame(lead: { x: number; y: number }, sAim: number): Frame {
    const s = Math.max(this.fitAll(), Math.min(sAim, this.availH() / (lead.y + 2.5)));
    return { x: this.clampX(lead.x - (this.view.W / s) * 0.38, s), s };
  }

  /** Zoom arrière maximal : tout le niveau. */
  private fitAll() {
    const b = this.bounds;
    return Math.max(6, Math.min(this.view.W / (b.x1 + 2 - b.x0), this.availH() / b.y1));
  }

  private leadProjectile(sim: Sim) {
    let lead: { x: number; y: number } | undefined;
    for (const e of sim.flying) {
      const p = e.body.getPosition();
      if (!lead || p.x > lead.x) lead = { x: p.x, y: p.y };
    }
    return lead;
  }

  /* ------------------------------------------------------------ outils */

  private setMode(m: Mode) {
    this.mode = m;
    this.modeT = 0;
  }

  private takeOver() {
    if (this.mode !== 'free') this.free = { ...this.target };
    this.setMode('free');
  }

  private clampFree() {
    this.free.x = this.clampX(this.free.x, this.free.s);
  }

  private clampX(x: number, s: number) {
    return Math.min(
      Math.max(x, this.bounds.x0 - 2),
      Math.max(this.bounds.x0, this.bounds.x1 + 3 - this.view.W / s),
    );
  }

  /** Place la caméra sans transition. */
  private jump(f: Frame) {
    this.target = { ...f };
    Object.assign(this.view.cam, { x: f.x, s: f.s, y: this.groundY(f.s) });
  }

  private availH() {
    return this.view.H - MARGIN_TOP - MARGIN_BOTTOM;
  }

  /** Le sol (y = 0) reste juste au-dessus de la marge du bas. */
  private groundY(s: number) {
    return -MARGIN_BOTTOM / s;
  }
}

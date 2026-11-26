/* Le HUD d'une partie (HTML par-dessus le canevas) : relous restants, barre du boss, score et étoiles,
   file des amis, rappel du pouvoir pendant le vol. */
import { enemyStillUrl, headUrl } from '../assets';
import type { WorldDef } from '../levels';
import { FRIEND_BY_ID } from '../sim/defs';
import type { Ent } from '../sim/entity';
import type { LevelDef } from '../sim/level';
import type { Sim } from '../sim/sim';

export class Hud {
  /** Une icône par type de relou, avec le nombre restant. */
  private icons = new Map<string, { el: HTMLElement; left: number }>();
  private lastScore = -1;
  private queueKey = '';

  constructor(
    private root: HTMLElement,
    private sim: Sim,
    level: LevelDef,
    world: WorldDef,
    cb: { pause: () => void; restart: () => void },
  ) {
    const [s2, s3] = sim.thresholds();
    root.innerHTML = `
      <div class="hud-top">
        <div class="hud-left">
          <button class="pix-btn icon" data-act="pause" title="Pause">II</button>
          <button class="pix-btn icon" data-act="restart" title="Recommencer">↻</button>
          <div class="hud-level"><span class="hud-world" style="--c:${world.color}">${world.name}</span><b>${level.id} · ${level.name}</b></div>
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
    const icons = root.querySelector('.hud-enemies')!;
    for (const e of sim.ents) {
      if (e.kind !== 'enemy') continue;
      const group = this.icons.get(e.enemy!);
      if (group) {
        group.left++;
        continue;
      }
      const el = document.createElement('div');
      el.className = `enemy-icon${e.enemyDef?.boss ? ' boss' : ''}`;
      el.style.backgroundImage = `url("${enemyStillUrl(e.enemy!, e.variant)}")`;
      el.title = e.enemyDef!.label;
      icons.appendChild(el);
      this.icons.set(e.enemy!, { el, left: 1 });
    }
    for (const g of this.icons.values()) g.el.dataset.n = `×${g.left}`;
    const boss = sim.bosses[0];
    if (boss) {
      const b = root.querySelector<HTMLElement>('.hud-boss')!;
      b.hidden = false;
      b.querySelector('span')!.textContent = boss.enemyDef!.label;
    }
    root.querySelector('[data-act=pause]')!.addEventListener('click', cb.pause);
    root.querySelector('[data-act=restart]')!.addEventListener('click', cb.restart);
  }

  destroy() {
    this.root.innerHTML = '';
  }

  /** Un relou est tombé : son compteur baisse, l'icône est barrée quand il n'en reste plus. */
  kill(e: Ent) {
    const g = this.icons.get(e.enemy!);
    if (!g) return;
    g.left = Math.max(0, g.left - 1);
    g.el.dataset.n = `×${g.left}`;
    g.el.classList.toggle('dead', g.left === 0);
  }

  update() {
    this.updateScore();
    this.updateBoss();
    this.updateQueue();
    this.updateHint();
  }

  private updateScore() {
    const sim = this.sim;
    if (sim.score === this.lastScore) return;
    this.lastScore = sim.score;
    const [s2, s3] = sim.thresholds();
    this.root.querySelector('.hud-score b')!.textContent = sim.score.toLocaleString('fr-FR');
    this.root.querySelector<HTMLElement>('.hud-starbar .fill')!.style.width =
      `${Math.min(100, (sim.score / s3) * 100)}%`;
    this.root
      .querySelectorAll<HTMLElement>('.hud-starbar .mk')
      .forEach((m, i) => m.classList.toggle('on', sim.score >= (i ? s3 : s2)));
  }

  private updateBoss() {
    const boss = this.sim.bosses[0];
    if (!boss) return;
    const r = boss.dead ? 0 : Math.max(0, boss.hp / boss.maxHp);
    this.root.querySelector<HTMLElement>('.hud-boss .bar i')!.style.width = `${r * 100}%`;
  }

  private updateQueue() {
    const sim = this.sim;
    const key = `${sim.queue.join(',')}|${sim.phase}`;
    if (key === this.queueKey) return;
    this.queueKey = key;
    this.root.querySelector('.hud-queue')!.innerHTML = sim.queue
      .map((id, i) => {
        const f = FRIEND_BY_ID[id]!;
        const cur = i === 0 && sim.phase === 'aim';
        return `<div class="q-friend${cur ? ' current' : ''}" style="--fc:${f.color}" title="${f.name} — ${f.powerName} : ${f.desc}">
          <img src="${headUrl(id)}" alt="">
          ${cur ? `<div class="q-info"><b>${f.name}</b><span>${f.power === 'none' ? 'Sans pouvoir' : f.powerName}</span></div>` : ''}
        </div>`;
      })
      .join('');
  }

  /** Rappel du pouvoir pendant le vol. */
  private updateHint() {
    const hint = this.root.querySelector<HTMLElement>('.hud-hint')!;
    const cur = this.sim.current;
    const show = !!cur && cur.friend!.power !== 'none' && cur.impactAt === undefined;
    if (show === !hint.hidden) return;
    hint.hidden = !show;
    if (!show) return;
    const f = cur.friend!;
    const touch = matchMedia('(pointer: coarse)').matches;
    const where = f.power === 'smash' ? 'Touche la cible' : touch ? 'Touche l’écran' : 'Clic ou Espace';
    hint.innerHTML = `<b>${where}</b> : ${f.powerName}`;
  }
}

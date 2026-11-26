/* Ce que le joueur voit et entend quand il se passe quelque chose : chaque événement de la simulation
   devient des effets (débris, fumée, flashs, textes) et un son. Les grosses explosions ralentissent
   le temps un instant et secouent l'écran. */
import { pose } from '../assets';
import { sfx } from '../audio';
import { CANNON, muzzle } from '../sim/constants';
import { FRIEND_BY_ID } from '../sim/defs';
import type { Ent, SimEvent } from '../sim/entity';
import type { Effects } from '../render/effects';
import { up } from '../text';

export interface FeedbackTarget {
  fx: Effects;
  /** Un relou est tombé. */
  killed(e: Ent): void;
  /** Ralenti pendant `seconds`. */
  slowMo(seconds: number): void;
  ended(won: boolean): void;
}

const CONFETTI = ['#ff3d7f', '#ffd23f', '#3dd6ff', '#7dff6b', '#c56bff'];
const FIRE = ['#fff6c0', '#ffd23f', '#ff7a1a', '#ff3d1a', '#5a2a10'];

export function playEvents(events: SimEvent[], t: FeedbackTarget) {
  const fx = t.fx;
  for (const ev of events) {
    switch (ev.t) {
      case 'launch': {
        const f = ev.ent.friend!;
        const v = ev.ent.body.getLinearVelocity();
        const m = muzzle(v.x, v.y);
        fx.flash(m.x, m.y, 1.6, '#ffd27a');
        fx.smoke(m.x, m.y, 10, 0.55, 'rgba(235,235,235,0.9)');
        fx.addShake(0.3);
        fx.text(CANNON.x + 1, CANNON.y + 2.8, f.shout, '#1a1020', 12, 1.3, true);
        sfx.launch();
        break;
      }
      case 'break':
        fx.breakFx(ev.x, ev.y, ev.w, ev.h, ev.mat);
        (({ ice: sfx.ice, stone: sfx.stone, metal: sfx.metal }) as Record<string, () => void>)[ev.mat]?.() ??
          sfx.wood();
        break;
      case 'kill':
        fx.smoke(ev.x, ev.y, 10, 0.7);
        fx.stars(ev.x, ev.y + 0.6, 8, '#ffffff');
        if (ev.ent.enemyDef?.boss) {
          fx.addShake(1);
          fx.text(ev.x, ev.y + 2.5, 'K.O. !', '#ff3d7f', 34, 2);
          t.slowMo(0.8);
        }
        sfx.kill();
        t.killed(ev.ent);
        break;
      case 'score':
        fx.text(ev.x, ev.y, `${ev.pts}`, ev.color ?? '#ffffff', ev.pts >= 5000 ? 20 : 13, 1.2);
        sfx.score();
        break;
      case 'explode':
        explosion(fx, ev.x, ev.y, ev.r, !!ev.confetti);
        if (ev.r >= 4) t.slowMo(0.45);
        sfx.boom();
        break;
      case 'impact':
        if (ev.force > 9) fx.smoke(ev.x, ev.y, 2, 0.3, 'rgba(230,220,200,0.7)');
        sfx.thud(ev.force);
        break;
      case 'power':
        powerFx(fx, ev.ent, ev.x, ev.y, ev.target);
        break;
      case 'beam':
        fx.beam(ev.x0, ev.y0, ev.x1, ev.y1);
        fx.flash(ev.x1, ev.y1, 1.2, '#7fe9ff');
        break;
      case 'freeze': {
        const shard = pose('roulie', 'pj_ice_shard');
        for (let i = 0; i < 7; i++) {
          const a = ((i - 3) * 11 * Math.PI) / 180;
          fx.sprite(shard, ev.x, ev.y, Math.cos(a) * 14 * ev.dir, Math.sin(a) * 14, 0.9, 0.55);
        }
        fx.burst(ev.x + ev.dir * 3, ev.y, ['#e6fbff', '#9fe3f5'], 24, 8, 0.15);
        sfx.ice();
        break;
      }
      case 'free':
        fx.stars(ev.x, ev.y, 18);
        fx.text(ev.x, ev.y + 2.2, `${FRIEND_BY_ID[ev.friend]?.name ?? ''} LIBERE !`, '#ffd23f', 18, 2.2);
        fx.sprite(pose(ev.friend, 'win'), ev.x, ev.y + 0.6, 0, 1.2, 1.2, 2);
        sfx.free();
        break;
      case 'gold':
        fx.stars(ev.x, ev.y, 20);
        fx.text(ev.x, ev.y + 1.8, "TONNEAU D'OR !", '#ffd23f', 16, 2);
        sfx.gold();
        break;
      case 'poof':
        fx.smoke(ev.x, ev.y, 6, 0.45);
        sfx.poof();
        break;
      case 'teleport':
        fx.ring(ev.x, ev.y, 1.5, '#7fe9ff', 0.4);
        fx.ring(ev.x2, ev.y2, 1.5, '#7fe9ff', 0.4);
        fx.stars(ev.x2, ev.y2, 8, '#7fe9ff');
        sfx.teleport();
        break;
      case 'rocket':
        fx.smoke(ev.x, ev.y, 5, 0.4, 'rgba(90,90,90,0.8)');
        sfx.launch();
        break;
      case 'shockwave':
        fx.sprite(pose('lolo', 'pj_shockwave'), ev.x, ev.y + 0.2, 0, 0, 4, 0.5);
        fx.ring(ev.x, ev.y, 3.2, '#ffd23f', 0.45);
        fx.addShake(0.9);
        sfx.boom();
        break;
      case 'end':
        t.ended(ev.won);
        break;
    }
  }
}

/** Grosse explosion : flash, onde de choc, gerbe de feu, fumée, secousse. */
function explosion(fx: Effects, x: number, y: number, r: number, confetti: boolean) {
  fx.flash(x, y, r * 1.3, confetti ? '#ff8ad8' : '#ffb347');
  fx.ring(x, y, r, '#ffffff', 0.4);
  fx.ring(x, y, r * 0.6, '#ffd23f', 0.3);
  if (confetti) fx.burst(x, y, CONFETTI, 70, 13, 0.2);
  else {
    fx.burst(x, y, FIRE, 40, 11, 0.3);
    fx.smoke(x, y, 14, 1.1, 'rgba(70,60,60,0.85)');
  }
  fx.addShake(r >= 4 ? 1 : 0.6);
}

function powerFx(fx: Effects, e: Ent, x: number, y: number, target?: { x: number; y: number }) {
  const f = e.friend!;
  sfx.power();
  fx.text(x, y + 1.4, `${up(f.powerName)} !`, '#ffd23f', 14, 1);
  fx.ring(x, y, 1.2, f.color, 0.3);
  if (f.power === 'blast') {
    const wave = pose(f.id, 'pj_palm_wave');
    fx.sprite(wave, x + 0.6, y, 10, 0, 1.8, 0.45);
    fx.sprite(wave, x - 0.6, y, -10, 0, 1.8, 0.45);
    fx.ring(x, y, 3.8, '#9fe3ff', 0.4);
    fx.addShake(0.5);
  }
  if (f.power === 'triple') fx.smoke(x, y, 6, 0.4, 'rgba(255,220,255,0.8)');
  if (f.power === 'smash' && target) fx.ring(target.x, target.y, 0.8, '#ffd23f', 0.5);
  if (f.power === 'pet') fx.text(x, y - 1, 'OUAF !', '#ffffff', 12, 1);
  if (f.power === 'fireball') fx.flash(x, y, 1.4, '#ff7a1a');
}

/* Présentation animée d'un ami (effet « waouh ») :
   1. révélation : rayons de lumière, sa grosse tête qui surgit en riant, confettis, nom et pouvoir ;
   2. démonstration : une mini-scène jouée par le moteur, le pouvoir déclenché au bon moment ;
   3. explication : ce que fait le pouvoir, et Revoir / C'est parti. */
import { headUrl } from '../assets';
import { sfx } from '../audio';
import { DemoPlayer } from '../game/demo';
import { FRIEND_BY_ID } from '../sim/defs';
import type { Theme } from '../sim/level';
import { up } from '../text';
import { show } from './common';

const CONFETTI = ['#ff3d7f', '#ffd23f', '#3dd6ff', '#7dff6b', '#c56bff'];

/**
 * Affiche la présentation de l'ami `id`. `isNew` : il vient d'être libéré (sinon on revoit son pouvoir).
 */
export function showcaseScreen(id: string, isNew: boolean, theme: Theme, onClose: () => void) {
  const f = FRIEND_BY_ID[id]!;
  const confetti = Array.from(
    { length: 28 },
    (_, i) =>
      `<i style="--a:${(i * 360) / 28}deg;--d:${120 + (i % 5) * 40}px;--c:${CONFETTI[i % CONFETTI.length]};--t:${(i % 7) * 0.04}s"></i>`,
  ).join('');
  const el = show(
    `<div class="showcase" style="--fc:${f.color}">
      <div class="sc-rays"></div>
      <div class="sc-reveal">
        <small>${isNew ? 'NOUVEL AMI !' : 'SON POUVOIR'}</small>
        <div class="sc-head"><span class="sc-confetti">${confetti}</span><img src="${headUrl(id, 'win')}" alt=""></div>
        <h2>${f.name}</h2>
        <b class="sc-power">${f.power === 'none' ? 'SANS POUVOIR' : up(f.powerName)}</b>
      </div>
      <div class="sc-stage"><canvas></canvas></div>
      <div class="sc-end">
        <p>${f.desc}</p>
        <p class="g-tip">💡 ${f.tip}</p>
        <div class="row">
          <button class="pix-btn" data-act="again">↻ REVOIR</button>
          <button class="pix-btn big go" data-act="close">${isNew ? "C'EST PARTI !" : 'OK'}</button>
        </div>
      </div>
    </div>`,
    'showcase-screen',
  );
  const root = el.querySelector<HTMLElement>('.showcase')!;
  const canvas = el.querySelector('canvas')!;
  let player: DemoPlayer | null = null;
  const timers: number[] = [];

  const play = () => {
    player?.destroy();
    root.classList.remove('ended');
    root.classList.add('playing');
    player = new DemoPlayer(canvas, id, theme, () => root.classList.add('ended'));
  };
  const close = () => {
    timers.forEach(clearTimeout);
    player?.destroy();
    onClose();
  };

  sfx.free();
  // la révélation dure un peu, puis la scène prend la place
  timers.push(window.setTimeout(play, isNew ? 2200 : 1200));
  el.querySelector('[data-act=again]')!.addEventListener('click', play);
  el.querySelector('[data-act=close]')!.addEventListener('click', close);
}

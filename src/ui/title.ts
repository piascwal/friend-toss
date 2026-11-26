/* Écran titre. */
import { poseUrl } from '../assets';
import { cannonImage } from '../render/cannon-art';
import { FRIENDS } from '../sim/defs';
import { show, muteLabel, bindMute, appButtons, bindAppButtons } from './common';

export function titleScreen(onPlay: () => void) {
  const band = FRIENDS.slice(0, 7)
    .map((f, i) => `<img class="t-friend" style="--i:${i}" src="${poseUrl(f.id, 'jump')}" alt="">`)
    .join('');
  const el = show(
    `<div class="title">
      <div class="title-band">${band}</div>
      <h1 class="logo"><span>FRIEND</span><span>TOSS</span></h1>
      <p class="tagline">Lance tes potes. Dégage les relous.</p>
      <button class="pix-btn big" data-act="play">JOUER</button>
      <div class="title-foot">
        <img src="${cannonImage()}" alt="" class="t-thrower">
        <div class="title-tools">${appButtons()}<button class="pix-btn icon" data-act="mute">${muteLabel()}</button></div>
      </div>
    </div>`,
    'title-screen',
  );
  bindMute(el);
  bindAppButtons(el);
  el.querySelector('[data-act=play]')!.addEventListener('click', onPlay);
}

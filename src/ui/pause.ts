/* Écran de pause. */
import { show, muteLabel, bindMute, appButtons, bindAppButtons } from './common';

export function pauseScreen(onResume: () => void, onRestart: () => void, onMap: () => void) {
  const el = show(
    `<div class="card pause">
      <h2>PAUSE</h2>
      <button class="pix-btn big" data-act="resume">REPRENDRE</button>
      <button class="pix-btn" data-act="restart">RECOMMENCER</button>
      <button class="pix-btn" data-act="map">CARTE</button>
      <div class="row tools">${appButtons()}<button class="pix-btn icon" data-act="mute">${muteLabel()}</button></div>
    </div>`,
    'overlay',
  );
  bindMute(el);
  bindAppButtons(el);
  el.querySelector('[data-act=resume]')!.addEventListener('click', onResume);
  el.querySelector('[data-act=restart]')!.addEventListener('click', onRestart);
  el.querySelector('[data-act=map]')!.addEventListener('click', onMap);
}

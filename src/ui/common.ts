/* Outils communs aux écrans : affichage d'un écran (réduit pour tenir sans défiler), boutons son et
   plein écran, étoiles, vignettes, écran de chargement. */
import { isMuted, setMuted, sfx } from '../audio';
import { canFullscreen, isFullscreen, toggleFullscreen } from '../pwa';

const root = () => document.getElementById('screen')!;

let fitCard: (() => void) | null = null;
window.addEventListener('resize', () => fitCard?.());

/**
 * Affiche un écran. Les fenêtres (`.card`) sont réduites si besoin pour tenir dans l'écran :
 * rien ne défile jamais, même sur un téléphone en paysage.
 */
export function show(html: string, cls = ''): HTMLElement {
  const el = root();
  el.className = `screen ${cls}`;
  el.innerHTML = html;
  el.hidden = false;
  el.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => sfx.click()));
  const card = el.querySelector<HTMLElement>(':scope > .card');
  fitCard = card
    ? () => {
        card.style.transform = 'translate(-50%, -50%)';
        const m = 12;
        const k = Math.min(
          1,
          (el.clientHeight - 2 * m) / card.offsetHeight,
          (el.clientWidth - 2 * m) / card.offsetWidth,
        );
        card.style.transform = `translate(-50%, -50%) scale(${k})`;
      }
    : null;
  fitCard?.();
  // les images arrivent après coup : on réajuste quand elles sont chargées
  if (card)
    card
      .querySelectorAll('img')
      .forEach((img) => img.complete || img.addEventListener('load', () => fitCard?.(), { once: true }));
  return el;
}

/** Icône plein écran : quatre coins, en pixels. */
const FS_ICON = `<svg class="fs-icon" viewBox="0 0 8 8" width="16" height="16" shape-rendering="crispEdges"><path fill="currentColor" d="M0 0h3v1H1v2H0zM5 0h3v3H7V1H5zM0 5h1v2h2v1H0zM7 5h1v3H5V7h2z"/></svg>`;

/** Boutons plein écran et installation (cachés quand ils ne servent à rien). */
export function appButtons() {
  return `<button class="pix-btn icon" data-act="fullscreen" title="Plein écran" ${canFullscreen() ? '' : 'hidden'}>${FS_ICON}</button>`;
}

export function bindAppButtons(el: HTMLElement) {
  el.querySelectorAll<HTMLButtonElement>('[data-act=fullscreen]').forEach((b) =>
    b.addEventListener('click', async () => {
      await toggleFullscreen();
      b.classList.toggle('on', isFullscreen());
    }),
  );
}

export function hideScreen() {
  const el = root();
  el.hidden = true;
  el.innerHTML = '';
}

export const stars = (n: number, max = 3) =>
  Array.from({ length: max }, (_, i) => `<i class="st${i < n ? ' on' : ''}">★</i>`).join('');

export const muteLabel = () => (isMuted() ? '🔇' : '🔊');

export function bindMute(el: HTMLElement) {
  el.querySelectorAll<HTMLButtonElement>('[data-act=mute]').forEach((b) =>
    b.addEventListener('click', () => {
      setMuted(!isMuted());
      b.textContent = muteLabel();
    }),
  );
}

const SWATCH: Record<string, string> = {
  ice: 'linear-gradient(135deg,#e6fbff,#9fe3f5 50%,#5bb5d6)',
  stone: 'repeating-linear-gradient(90deg,#9b978f 0 14px,#5f5b56 14px 16px)',
  metal: 'linear-gradient(#eef3f8,#8e99a6 50%,#59636f)',
  wood: 'repeating-linear-gradient(#b9773f 0 6px,#8a5226 6px 7px)',
};
export const beamSwatch = (mat: string) => `swatch:${mat}`;

export function imgTag(src: string, cls = '') {
  if (src.startsWith('swatch:'))
    return `<span class="swatch ${cls}" style="background:${SWATCH[src.slice(7)]}"></span>`;
  return `<img class="${cls}" src="${src}" alt="">`;
}

export function loadingScreen(text = 'Chargement…') {
  show(`<div class="loading"><div class="spinner"></div><p>${text}</p></div>`, 'overlay');
}

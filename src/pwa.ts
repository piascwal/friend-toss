/* Application installable : plein écran, paysage, installation sur l'écran d'accueil, hors ligne. */

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let installEvent: InstallPrompt | null = null;
const listeners = new Set<() => void>();

/** Lancé depuis l'écran d'accueil (application installée). */
export const isStandalone = () =>
  matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const isTouch = () => matchMedia('(pointer: coarse)').matches;

const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** Installation possible : invite du navigateur (Android, ordinateur) ou consigne manuelle (iPhone). */
export const canInstall = () => !isStandalone() && (!!installEvent || isIos());

/** Prévient quand l'installation devient possible (ou ne l'est plus). */
export function onInstallChange(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function install(): Promise<'done' | 'ios' | 'none'> {
  if (installEvent) {
    await installEvent.prompt();
    await installEvent.userChoice;
    installEvent = null;
    listeners.forEach((f) => f());
    return 'done';
  }
  return isIos() ? 'ios' : 'none';
}

type FsElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
type FsDocument = Document & {
  webkitFullscreenElement?: Element;
  webkitExitFullscreen?: () => Promise<void>;
};

export const isFullscreen = () =>
  !!(document.fullscreenElement ?? (document as FsDocument).webkitFullscreenElement);
export const canFullscreen = () =>
  !isStandalone() &&
  !!(
    document.documentElement.requestFullscreen ??
    (document.documentElement as FsElement).webkitRequestFullscreen
  );

/** Plein écran, puis blocage en paysage quand le navigateur le permet. */
export async function enterFullscreen() {
  const el = document.documentElement as FsElement;
  try {
    if (!isFullscreen()) {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
      else await el.webkitRequestFullscreen?.();
    }
  } catch {
    /* refusé (iPhone, iframe) : le jeu reste jouable */
  }
  lockLandscape();
}

export async function toggleFullscreen() {
  if (isFullscreen()) {
    const d = document as FsDocument;
    await (d.exitFullscreen ? d.exitFullscreen() : d.webkitExitFullscreen?.())?.catch(() => {});
  } else await enterFullscreen();
}

function lockLandscape() {
  const o = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
  o?.lock?.('landscape').catch(() => {});
}

/** Au premier toucher sur mobile : plein écran et paysage (hors application installée, déjà plein écran). */
export function autoFullscreen() {
  if (isTouch() && !isStandalone()) void enterFullscreen();
  else if (isStandalone()) lockLandscape();
}

export const isPortrait = () => isTouch() && matchMedia('(orientation: portrait)').matches;

export function setupPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installEvent = e as InstallPrompt;
    listeners.forEach((f) => f());
  });
  window.addEventListener('appinstalled', () => {
    installEvent = null;
    listeners.forEach((f) => f());
  });
  if ('serviceWorker' in navigator && import.meta.env.PROD)
    window.addEventListener('load', () => void navigator.serviceWorker.register('./sw.js').catch(() => {}));
  // hauteur réelle de l'écran (barres du navigateur mobile comprises)
  const vh = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
  vh();
  window.addEventListener('resize', vh);
}

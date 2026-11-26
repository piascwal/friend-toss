/* Point d'entrée : enchaîne les écrans (titre, carte, niveau, résultats) et garde la progression. */
import '@fontsource/press-start-2p';
import './style.css';
import { loadCharacters, loadNpcs } from './assets';
import { ALL_LEVELS, LEVEL_BY_ID, UNLOCKS } from './levels';
import { Game, type Result } from './game/game';
import { preloadLevel } from './game/preload';
import { FRIENDS } from './sim/defs';
import { autoFullscreen, isPortrait, setupPwa } from './pwa';
import { loadProgress, saveProgress, type Progress } from './save';
import {
  guideScreen,
  hideScreen,
  introScreen,
  loadingScreen,
  mapScreen,
  pauseScreen,
  resultScreen,
  titleScreen,
} from './ui';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const hud = document.getElementById('hud')!;
let progress: Progress = loadProgress();
let game: Game | null = null;

function stopGame() {
  game?.destroy();
  game = null;
  document.body.classList.remove('playing');
}

function showMap(focus?: string) {
  stopGame();
  mapScreen(progress, openLevel, () => guideScreen(progress, () => showMap()), focus);
}

async function openLevel(id: string) {
  const level = LEVEL_BY_ID[id];
  if (!level) return;
  loadingScreen();
  await preloadLevel(level, level.world);
  const keys = introScreen(
    level,
    level.world,
    progress,
    progress.best[id] ?? 0,
    () => {
      progress.seen = [...new Set([...progress.seen, ...keys])];
      saveProgress(progress);
      play(id);
    },
    () => showMap(id),
  );
}

let pause = () => {};

function play(id: string) {
  stopGame();
  hideScreen();
  const level = LEVEL_BY_ID[id]!;
  document.body.classList.add('playing');
  pause = () => {
    if (!game) return;
    game.setPaused(true);
    pauseScreen(
      () => {
        hideScreen();
        game?.setPaused(false);
      },
      () => play(id),
      () => showMap(id),
    );
  };
  game = new Game(canvas, hud, level, level.world, {
    end: (r) => finish(id, r),
    pause: () => pause(),
    restart: () => play(id),
  });
}

function finish(id: string, r: Result) {
  const before = progress.stars[id] ?? 0;
  const best = progress.best[id] ?? 0;
  let newFriend: string | undefined;
  if (r.won) {
    if (!before && UNLOCKS[id]) newFriend = UNLOCKS[id];
    progress.stars[id] = Math.max(before, r.stars);
    progress.best[id] = Math.max(best, r.score);
    if (r.gold) progress.gold[id] = true;
    saveProgress(progress);
  }
  const i = ALL_LEVELS.findIndex((l) => l.id === id);
  const next = ALL_LEVELS[i + 1];
  resultScreen(
    LEVEL_BY_ID[id]!,
    r,
    best,
    newFriend,
    !!next,
    () => next && openLevel(next.id),
    () => play(id),
    () => showMap(next && r.won ? next.id : id),
  );
}

async function boot() {
  loadingScreen('Chargement de la bande…');
  await Promise.all([
    loadCharacters(FRIENDS.map((f) => f.id)),
    loadNpcs(),
    document.fonts?.load('16px "Press Start 2P"'),
  ]);
  titleScreen(() => {
    // geste du joueur : on peut passer en plein écran et bloquer le paysage
    autoFullscreen();
    showMap();
  });
  // accès direct à un niveau : #1-3
  const hash = location.hash.slice(1);
  if (LEVEL_BY_ID[hash]) void openLevel(hash);
}

setupPwa();
// téléphone remis en portrait pendant une partie : pause (l'écran « tourne ton téléphone » s'affiche)
matchMedia('(orientation: portrait)').addEventListener('change', () => {
  if (isPortrait() && game && document.getElementById('screen')!.hidden) pause();
});
void boot();

// outils de test dans la console
Object.assign(window, {
  friendToss: {
    unlockAll() {
      for (const l of ALL_LEVELS) progress.stars[l.id] = Math.max(progress.stars[l.id] ?? 0, 1);
      saveProgress(progress);
      showMap();
    },
    reset() {
      progress = { stars: {}, best: {}, gold: {}, seen: [] };
      saveProgress(progress);
      showMap();
    },
    get game() {
      return game;
    },
  },
});

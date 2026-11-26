/* Progression du joueur, gardée dans le navigateur. */
import { ALL_LEVELS, STARTERS, UNLOCKS } from './levels';

export interface Progress {
  /** Étoiles par niveau (meilleur résultat). */
  stars: Record<string, number>;
  best: Record<string, number>;
  /** Niveaux où le tonneau d'or a été ramassé. */
  gold: Record<string, boolean>;
  /** Choses déjà présentées (amis, objets, relous). */
  seen: string[];
}

const KEY = 'friend-toss-save-v1';

function blank(): Progress {
  return { stars: {}, best: {}, gold: {}, seen: [] };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...blank(), ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    /* stockage indisponible : on joue sans sauvegarde */
  }
  return blank();
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* rien */
  }
}

/** Un niveau est ouvert si c'est le premier, ou si le précédent est gagné. */
export function isOpen(p: Progress, id: string): boolean {
  const i = ALL_LEVELS.findIndex((l) => l.id === id);
  return i <= 0 || (p.stars[ALL_LEVELS[i - 1]!.id] ?? 0) > 0;
}

/** Amis de la bande : ceux du départ, plus ceux libérés par les niveaux gagnés. */
export function unlockedFriends(p: Progress): string[] {
  const out = [...STARTERS];
  for (const l of ALL_LEVELS) if ((p.stars[l.id] ?? 0) > 0 && UNLOCKS[l.id]) out.push(UNLOCKS[l.id]!);
  return out;
}

export const totalStars = (p: Progress) => Object.values(p.stars).reduce((s, n) => s + n, 0);
export const totalGold = (p: Progress) => Object.values(p.gold).filter(Boolean).length;

/* Les couleurs de chaque monde (ciel, collines, sol). */
import type { Theme } from '../sim/level';

export interface ThemeArt {
  sky: [string, string, string];
  far: string;
  mid: string;
  near: string;
  top: string;
  topLight: string;
  dirt: string;
  dirtDark: string;
  /** Objets de décor (famille/fichier, hauteur en m). */
  decor: [string, string, number][];
  night?: boolean;
}

export const THEMES: Record<Theme, ThemeArt> = {
  camping: {
    sky: ['#4fa8e8', '#8fd0f4', '#d9f2ff'],
    far: '#9cc9b0',
    mid: '#6fae78',
    near: '#4f8f58',
    top: '#5fb84a',
    topLight: '#8fdc5e',
    dirt: '#8a5a33',
    dirtDark: '#6a4024',
    decor: [
      ['sapin', '1.png', 4.2],
      ['arbre', '1.png', 3.8],
      ['sapin', '2.png', 3.6],
      ['buisson', '1.png', 1.2],
      ['feu', 'image.png', 0.9],
      ['arbre', '2.png', 4],
      ['fougere', 'image.png', 0.8],
      ['souche', 'image.png', 0.7],
      ['sapin', '3.png', 4.4],
      ['buisson', '2.png', 1.3],
    ],
  },
  festival: {
    sky: ['#3b2a78', '#c4589c', '#ffb36b'],
    far: '#5a3a86',
    mid: '#7a4a8c',
    near: '#4a2f63',
    top: '#7aa04a',
    topLight: '#a6cc66',
    dirt: '#6b4a3a',
    dirtDark: '#4f3428',
    decor: [
      ['buvette', 'image.png', 3.2],
      ['torche', '1.png', 2],
      ['food-duke', 'image.png', 3.4],
      ['barriere', 'image.png', 1],
      ['portique-dance', 'image.png', 4.5],
      ['torche', '2.png', 2],
      ['food-glace', 'image.png', 3.4],
      ['toilettes', 'image.png', 2.3],
      ['stand-bmx', 'image.png', 3.6],
      ['table-pique', 'image.png', 1.2],
    ],
  },
  montagne: {
    sky: ['#6fb6ee', '#b5dcf7', '#f2faff'],
    far: '#c9d8ea',
    mid: '#9fb3c8',
    near: '#7d93a8',
    top: '#f4fbff',
    topLight: '#ffffff',
    dirt: '#7b8794',
    dirtDark: '#5b6672',
    decor: [
      ['erable-neige', 'image.png', 4.6],
      ['buisson-neige', 'image.png', 1.1],
      ['sapin', '2.png', 4],
      ['cairn', 'image.png', 1.2],
      ['rocher-neige', '2.png', 1.2],
      ['erable-neige', 'image.png', 3.8],
      ['sapin', '1.png', 3.4],
    ],
  },
  plage: {
    sky: ['#38b4f0', '#8ad8fa', '#e2f8ff'],
    far: '#2a9fd8',
    mid: '#7fd3e8',
    near: '#e8c477',
    top: '#f2d28a',
    topLight: '#fff0b8',
    dirt: '#d9b066',
    dirtDark: '#b88c46',
    decor: [
      ['palmier', '1.png', 4.6],
      ['parasol', '1.png', 2.2],
      ['transat', 'image.png', 1],
      ['palmier', '2.png', 4.2],
      ['parasol', '2.png', 2.2],
      ['plante', '1.png', 0.9],
      ['palmier', '3.png', 4.4],
      ['parasol', '3.png', 2.2],
    ],
  },
  ville: {
    sky: ['#0f0c2e', '#2b1f5c', '#6a3f8f'],
    far: '#241d4a',
    mid: '#2f2660',
    near: '#1a1538',
    top: '#5a5a66',
    topLight: '#8a8a96',
    dirt: '#3a3a44',
    dirtDark: '#2a2a32',
    night: true,
    decor: [
      ['lampadaire', 'image.png', 3.6],
      ['borne', 'image.png', 0.8],
      ['poubelle', '1.png', 1],
      ['lampadaire', 'image.png', 3.6],
      ['voiture', '2.png', 1.6],
      ['plante', '4.png', 1],
    ],
  },
};

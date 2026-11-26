/* Matériaux des modules et objets : solidité, poids, points, couleurs des débris. */

export type Mat = 'wood' | 'ice' | 'stone' | 'metal' | 'rubber' | 'gold' | 'explosive';

export interface MatDef {
  label: string;
  density: number;
  hp: number;
  friction: number;
  restitution: number;
  score: number;
  /** Couleurs des débris (du plus clair au plus sombre). */
  debris: string[];
}

export const MATS: Record<Mat, MatDef> = {
  wood: {
    label: 'Bois',
    density: 0.7,
    hp: 40,
    friction: 0.7,
    restitution: 0.1,
    score: 300,
    debris: ['#d69a5a', '#a8693a', '#6e3f22'],
  },
  ice: {
    label: 'Glace',
    density: 0.55,
    hp: 16,
    friction: 0.15,
    restitution: 0.05,
    score: 400,
    debris: ['#e6fbff', '#9fe3f5', '#5bb5d6'],
  },
  stone: {
    label: 'Pierre',
    density: 2.2,
    hp: 150,
    friction: 0.8,
    restitution: 0.05,
    score: 500,
    debris: ['#c9c5bd', '#8e8a83', '#5a5652'],
  },
  metal: {
    label: 'Métal',
    density: 1.6,
    hp: 230,
    friction: 0.5,
    restitution: 0.1,
    score: 600,
    debris: ['#dfe6ee', '#9aa6b4', '#59636f'],
  },
  rubber: {
    label: 'Caoutchouc',
    density: 0.9,
    hp: 1e9,
    friction: 0.9,
    restitution: 0.75,
    score: 0,
    debris: ['#444', '#222', '#111'],
  },
  gold: {
    label: 'Or',
    density: 0.9,
    hp: 8,
    friction: 0.6,
    restitution: 0.1,
    score: 3000,
    debris: ['#fff2a8', '#ffd23f', '#c48a00'],
  },
  explosive: {
    label: 'Explosif',
    density: 0.8,
    hp: 10,
    friction: 0.6,
    restitution: 0.1,
    score: 500,
    debris: ['#ffdd55', '#ff7a1a', '#7a2a10'],
  },
};

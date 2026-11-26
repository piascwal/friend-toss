/* Les relous (ennemis) : la liste courte, et un boss par monde. */

export interface EnemyDef {
  label: string;
  npc: string;
  /** Variantes utilisables (images). */
  variants: number;
  /** Boîte physique (m). */
  w: number;
  h: number;
  hp: number;
  /** Image affichée : planche animée (repos, touche) ou suite d'images (boss). */
  anim: 'sheet' | 'frames' | 'still';
  /** Taille du dessin par rapport à la boîte. */
  drawScale?: number;
  boss?: boolean;
  score?: number;
  intro?: string;
  density?: number;
}

export const ENEMIES = {
  // la liste courte des relous, choisis compacts et massifs : un petit, un moyen, un gros (plus un boss par monde)
  habitue: {
    label: 'Habitué',
    npc: 'habitue',
    variants: 2,
    w: 0.85,
    h: 1.5,
    hp: 22,
    anim: 'still',
    intro: 'L’habitué : le petit relou. Fragile, une chute suffit.',
  },
  gardien: {
    label: 'Gardien',
    npc: 'gardien',
    variants: 1,
    w: 0.95,
    h: 1.6,
    hp: 60,
    anim: 'sheet',
    intro: 'Le gardien de hockey : tout en protections, il encaisse. Fais-lui tomber quelque chose dessus.',
  },
  pilier: {
    label: 'Pilier',
    npc: 'pilier',
    variants: 2,
    w: 1.2,
    h: 1.75,
    hp: 120,
    anim: 'sheet',
    density: 1.2,
    intro: 'Le pilier de rugby : le gros relou. Il faut l’écraser ou le faire exploser.',
  },
  // boss
  dj: {
    label: 'DJ Boucle',
    npc: 'dj',
    variants: 7,
    w: 3.6,
    h: 3.7,
    hp: 260,
    anim: 'frames',
    boss: true,
    score: 30000,
    density: 0.5,
    intro: 'DJ Boucle a privatisé le festival. Coupe-lui le son !',
  },
  'yeti-alpha': {
    label: 'Yéti Alpha',
    npc: 'yeti-alpha',
    variants: 6,
    w: 2.8,
    h: 2.9,
    hp: 240,
    anim: 'frames',
    boss: true,
    score: 30000,
    density: 0.8,
    intro: 'Le Yéti Alpha garde le sommet. Il est énorme : fais-lui tomber la montagne dessus.',
  },
  champion: {
    label: 'Le Champion',
    npc: 'champion',
    variants: 2,
    w: 2.0,
    h: 2.7,
    hp: 240,
    anim: 'frames',
    boss: true,
    score: 30000,
    density: 0.7,
    intro: 'Le Champion de BMX a pris la plage. Il esquive tout… sauf ce qui tombe du ciel.',
  },
  robot: {
    label: 'Méga-Robot',
    npc: 'robot',
    variants: 1,
    w: 2.6,
    h: 3.2,
    hp: 360,
    anim: 'still',
    boss: true,
    score: 50000,
    density: 1,
    intro: 'Le Méga-Robot est blindé : il faudra toute la bande pour le démonter.',
  },
} satisfies Record<string, EnemyDef>;

export type EnemyKind = keyof typeof ENEMIES;
export const enemyDef = (k: EnemyKind): EnemyDef => ENEMIES[k];

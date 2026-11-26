/* La bande : chaque ami lancé, son pouvoir, sa couleur. */
import type { Mat } from './materials';

export type PowerId =
  | 'none'
  | 'dash'
  | 'triple'
  | 'blast'
  | 'slam'
  | 'freeze'
  | 'jump'
  | 'spin'
  | 'smash'
  | 'levitate'
  | 'pet'
  | 'beam'
  | 'puck'
  | 'fireball';

export interface FriendDef {
  id: string;
  name: string;
  /** Couleur de l'ami en jeu (contour de sa tête en vol, HUD). */
  color: string;
  power: PowerId;
  powerName: string;
  /** Ce que fait le pouvoir, en une phrase. */
  desc: string;
  /** Conseil de jeu. */
  tip: string;
  /** Pose montrée au déclenchement du pouvoir. */
  castPose?: string;
  /** Image de l'effet (projectile du pouvoir). */
  fxPose?: string;
  /** Multiplicateur des dégâts infligés, par matériau. */
  dmg: Partial<Record<Mat | 'enemy', number>>;
  /** Densité du corps lancé. */
  density: number;
  radius: number;
  /** Cri au lancer. */
  shout: string;
}

export const FRIENDS: FriendDef[] = [
  {
    id: 'roulian',
    color: '#ff9d2e',
    name: 'ROULIAN',
    power: 'none',
    powerName: 'Poids mort',
    desc: 'Pas de pouvoir : il se laisse lancer. Mais quelle inertie !',
    tip: 'Vise la base des structures en bois.',
    castPose: 'sp_nonchalant',
    dmg: {},
    density: 3.4,
    radius: 0.45,
    shout: 'Bon… si vous voulez.',
  },
  {
    id: 'mat',
    color: '#e8333a',
    name: 'MAT',
    power: 'dash',
    powerName: 'Ruée',
    desc: 'Touche en vol : il fonce tout droit, deux fois plus vite. Il traverse le bois.',
    tip: 'Déclenche la ruée juste avant le bois pour le transpercer.',
    castPose: 'sp_dash_punch',
    dmg: { wood: 2.2 },
    density: 2.6,
    radius: 0.42,
    shout: 'DIRECT !',
  },
  {
    id: 'tom',
    color: '#b06bff',
    name: 'TOM',
    power: 'triple',
    powerName: 'Vision triple',
    desc: 'Touche en vol : il voit triple… et il y a vraiment trois TOM. Idéal contre la glace.',
    tip: 'Trois petits impacts : parfait pour plusieurs cibles fragiles.',
    castPose: 'sp_sway',
    fxPose: 'pj_bottle',
    dmg: { ice: 2.5, wood: 0.8 },
    density: 2.4,
    radius: 0.4,
    shout: 'Hips !',
  },
  {
    id: 'jbm',
    color: '#a0652e',
    name: 'JBM',
    power: 'blast',
    powerName: 'Paume de souffle',
    desc: 'Touche en vol : une onde de choc repousse tout autour de lui.',
    tip: 'Déclenche-la au cœur de la structure, pas avant.',
    castPose: 'sp_palm_strike',
    fxPose: 'pj_palm_wave',
    dmg: {},
    density: 3,
    radius: 0.46,
    shout: 'Hadoken !',
  },
  {
    id: 'lolo',
    color: '#3d9bff',
    name: 'LOLO',
    power: 'slam',
    powerName: 'Séisme',
    desc: "Touche en vol : il pique droit vers le sol et l'impact fait trembler tout autour. Il broie la pierre.",
    tip: "Place-le à la verticale d'une tour en pierre, puis touche.",
    castPose: 'sp_ground_slam',
    fxPose: 'pj_shockwave',
    dmg: { stone: 2.6, metal: 1.5 },
    density: 4.2,
    radius: 0.5,
    shout: 'ÇA VA TREMBLER !',
  },
  {
    id: 'roulie',
    color: '#7fe9ff',
    name: 'ROULIE',
    power: 'freeze',
    powerName: 'Givre',
    desc: 'Touche en vol : un éventail de glace gèle tout devant elle. Ce qui est gelé casse comme du verre.',
    tip: 'Gèle la pierre ou le métal, puis envoie un ami lourd.',
    castPose: 'sp_energy_cast',
    fxPose: 'pj_ice_shard',
    dmg: { ice: 1.5 },
    density: 2.6,
    radius: 0.42,
    shout: 'On se calme !',
  },
  {
    id: 'soso',
    color: '#ff3d7f',
    name: 'SOSO',
    power: 'jump',
    powerName: 'Double saut',
    desc: 'Touche en vol : elle rebondit en l’air et repart vers le haut.',
    tip: 'Pour passer par-dessus un mur ou retomber pile derrière.',
    castPose: 'sp_rising_spin',
    dmg: {},
    density: 2.6,
    radius: 0.42,
    shout: 'Hop là !',
  },
  {
    id: 'elo',
    color: '#ff8ad8',
    name: 'ELO',
    power: 'spin',
    powerName: 'Pirouette',
    desc: 'Touche en vol : elle tourbillonne et rebondit sur tout ce qu’elle touche.',
    tip: 'Dans un espace fermé, elle ricoche partout.',
    castPose: 'sp_pirouette',
    dmg: { enemy: 1.6 },
    density: 2.6,
    radius: 0.42,
    shout: 'Et un, deux, trois !',
  },
  {
    id: 'roro',
    color: '#ffd23f',
    name: 'RORO',
    power: 'smash',
    powerName: 'Smash',
    desc: 'Touche l’écran en vol : il smashe une balle de padel exactement vers ce point.',
    tip: 'Le seul tir précis du jeu : vise un relou caché ou un baril.',
    castPose: 'sp_racket_smash',
    fxPose: 'pj_padel_ball',
    dmg: {},
    density: 2.6,
    radius: 0.42,
    shout: 'Vamos !',
  },
  {
    id: 'indianne',
    color: '#3dcf8e',
    name: 'INDIANNE',
    power: 'levitate',
    powerName: 'Lévitation',
    desc: 'Touche en vol : elle flotte tout droit, sans retomber, pendant deux secondes.',
    tip: 'Pour entrer dans un tunnel ou viser très loin.',
    castPose: 'sp_levitate',
    fxPose: 'pj_mandala',
    dmg: {},
    density: 2.6,
    radius: 0.42,
    shout: 'Ommm…',
  },
  {
    id: 'clem',
    color: '#ff7a1a',
    name: 'CLEM',
    power: 'pet',
    powerName: 'Va chercher !',
    desc: 'Touche en vol : son chien saute et fonce au ras du sol en bousculant tout.',
    tip: 'Le chien attaque les fondations : idéal contre les tours posées au sol.',
    castPose: 'sp_call_pet',
    fxPose: 'pj_pet_run1',
    dmg: {},
    density: 2.6,
    radius: 0.42,
    shout: 'Allez, attaque !',
  },
  {
    id: 'bubu',
    color: '#2f6bff',
    name: 'BUBU',
    power: 'beam',
    powerName: 'Rayon',
    desc: 'Touche en vol : un rayon d’énergie transperce tout en ligne droite (sauf la pierre et le métal).',
    tip: 'Aligne plusieurs relous derrière du bois ou de la glace.',
    castPose: 'sp_energy_cast',
    fxPose: 'pj_beam',
    dmg: {},
    density: 2.6,
    radius: 0.44,
    shout: 'Kaaa… méhaa !',
  },
  {
    id: 'mar-1',
    color: '#1d2a8a',
    name: 'MAR-1',
    power: 'puck',
    powerName: 'Lancer frappé',
    desc: 'Touche en vol : un palet part en piqué vers le bas, et elle rebondit vers le haut.',
    tip: 'Survole la structure, puis frappe : le palet tombe dedans.',
    castPose: 'sp_slapshot',
    fxPose: 'pj_puck',
    dmg: {},
    density: 2.4,
    radius: 0.4,
    shout: 'Dans la lucarne !',
  },
];

FRIENDS.push({
  id: 'jbg',
  color: '#c9d3e0',
  name: 'JBG',
  power: 'fireball',
  powerName: 'Boule de feu',
  desc: 'Touche en vol : il lance une boule de feu tout droit, qui explose au premier contact.',
  tip: 'Vise un point faible au loin : la boule file sans retomber.',
  castPose: 'sp_energy_cast',
  dmg: {},
  density: 2.8,
  radius: 0.44,
  shout: 'Prends ça !',
});

export const FRIEND_BY_ID: Record<string, FriendDef> = Object.fromEntries(FRIENDS.map((f) => [f.id, f]));

/** L'ami qui représente le jeu (carte, icônes). */
export const MASCOT = 'roulian';

/* Définitions du jeu : matériaux, objets des structures, relous (ennemis) et amis lancés.
   Les tailles sont en mètres (un ami mesure environ 1,6 m debout). Aucune dépendance au navigateur :
   la simulation tourne aussi dans les tests (vérification que chaque niveau est faisable). */

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

/** Une image de la banque : dossier (props, npcs) / famille / fichier. */
export interface SpriteRef {
  dir: 'props' | 'npcs' | 'tex';
  id: string;
  file: string;
}

export type Special =
  | { type: 'explode'; radius: number; power: number; damage: number; confetti?: boolean }
  | { type: 'rocket'; thrust: number; fuse: number }
  | { type: 'bounce'; restitution: number }
  | { type: 'portal' }
  | { type: 'gold' }
  | { type: 'cage' };

export interface ObjDef {
  label: string;
  sprite?: SpriteRef;
  w: number;
  h: number;
  mat: Mat;
  shape: 'box' | 'circle' | 'triangle';
  /** Objet fixe (trampoline, téléporteur). */
  fixed?: boolean;
  special?: Special;
  /** Points de vie (sinon ceux du matériau). */
  hp?: number;
  /** Densité (sinon celle du matériau). */
  density?: number;
  /** Explication montrée la première fois que l'objet apparaît. */
  intro?: string;
}

const prop = (id: string, file = 'image.png'): SpriteRef => ({ dir: 'props', id, file });

export const OBJECTS = {
  caisse: { label: 'Caisse', sprite: prop('caisse'), w: 1.2, h: 1.2, mat: 'wood', shape: 'box' },
  'petite-caisse': {
    label: 'Planche',
    sprite: prop('tuile-bois'),
    w: 0.8,
    h: 0.8,
    mat: 'wood',
    shape: 'box',
    hp: 28,
  },
  tonneau: { label: 'Tonneau', sprite: prop('tonneau'), w: 0.9, h: 1.07, mat: 'wood', shape: 'box' },
  'tonneau-wog': {
    label: 'Tonneau WOG',
    sprite: prop('tonneau-wog'),
    w: 1.0,
    h: 1.22,
    mat: 'wood',
    shape: 'box',
    hp: 60,
  },
  tronc: {
    label: 'Tronc',
    sprite: prop('tronc', '1.png'),
    w: 1.5,
    h: 0.8,
    mat: 'wood',
    shape: 'box',
    hp: 70,
    density: 1,
  },
  'tonneau-or': {
    label: "Tonneau d'or",
    sprite: prop('tonneau-or'),
    w: 0.9,
    h: 1.1,
    mat: 'gold',
    shape: 'box',
    special: { type: 'gold' },
    intro: "Tonneau d'or : touche-le pour le ramasser. Il y en a un caché dans certains niveaux !",
  },
  baril: {
    label: 'Baril explosif',
    sprite: prop('baril'),
    w: 1.0,
    h: 1.26,
    mat: 'explosive',
    shape: 'box',
    special: { type: 'explode', radius: 4.2, power: 70, damage: 140 },
    intro: 'Baril explosif : explose au moindre choc et emporte tout autour de lui.',
  },
  caisson: {
    label: 'Caisson explosif',
    sprite: prop('caisson'),
    w: 1.1,
    h: 1.12,
    mat: 'explosive',
    shape: 'box',
    hp: 30,
    special: { type: 'explode', radius: 3.4, power: 55, damage: 110 },
    intro: 'Caisson explosif : plus solide que le baril, il faut bien le secouer.',
  },
  'caisson-rose': {
    label: 'Caisson à confettis',
    sprite: prop('caisson-rose'),
    w: 1.1,
    h: 1.14,
    mat: 'explosive',
    shape: 'box',
    hp: 14,
    special: { type: 'explode', radius: 5, power: 90, damage: 40, confetti: true },
    intro: 'Caisson à confettis : souffle énorme, mais casse peu. Parfait pour renverser une tour.',
  },
  bidon: {
    label: "Bidon d'essence",
    sprite: prop('bidon'),
    w: 0.7,
    h: 0.75,
    mat: 'explosive',
    shape: 'box',
    hp: 6,
    special: { type: 'explode', radius: 2.6, power: 30, damage: 90 },
  },
  'tonneau-fusee': {
    label: 'Tonneau-fusée',
    sprite: prop('tonneau-fusee'),
    w: 1.0,
    h: 1.22,
    mat: 'metal',
    shape: 'box',
    hp: 1e9,
    density: 0.8,
    special: { type: 'rocket', thrust: 70, fuse: 1.4 },
    intro: 'Tonneau-fusée : un choc allume la mèche, il décolle dans le sens où il pointe puis explose.',
  },
  'trampoline-bois': {
    label: 'Trampoline',
    sprite: prop('trampoline-bois'),
    w: 1.4,
    h: 1.3,
    mat: 'rubber',
    shape: 'box',
    fixed: true,
    special: { type: 'bounce', restitution: 1.05 },
    intro: 'Trampoline : renvoie tout ce qui tombe dessus. Vise-le pour atteindre les coins cachés.',
  },
  'trampoline-metal': {
    label: 'Super trampoline',
    sprite: prop('trampoline-metal'),
    w: 1.4,
    h: 1.3,
    mat: 'rubber',
    shape: 'box',
    fixed: true,
    special: { type: 'bounce', restitution: 1.35 },
  },
  portail: {
    label: 'Téléporteur',
    sprite: prop('teleporteur', '1.png'),
    w: 2.6,
    h: 1.65,
    mat: 'metal',
    shape: 'box',
    fixed: true,
    special: { type: 'portal' },
    intro: "Téléporteurs : ce qui entre dans l'un ressort de l'autre, à la même vitesse.",
  },
  'portail-sortie': {
    label: 'Téléporteur (sortie)',
    sprite: prop('teleporteur', '2.png'),
    w: 2.6,
    h: 1.65,
    mat: 'metal',
    shape: 'box',
    fixed: true,
    special: { type: 'portal' },
  },
  cage: {
    label: 'Cage',
    sprite: prop('cage', '1.png'),
    w: 1.6,
    h: 1.3,
    mat: 'metal',
    shape: 'box',
    hp: 30,
    density: 0.8,
    special: { type: 'cage' },
    intro: 'Un ami est enfermé ! Casse la cage pour le libérer : il rejoint la bande.',
  },
  pneus: {
    label: 'Pneus',
    sprite: prop('pneus'),
    w: 0.9,
    h: 1.13,
    mat: 'rubber',
    shape: 'box',
    intro: 'Pneus : indestructibles et rebondissants.',
  },
  poubelle: {
    label: 'Poubelle',
    sprite: prop('poubelle', '2.png'),
    w: 0.8,
    h: 1.17,
    mat: 'metal',
    shape: 'box',
    hp: 90,
    density: 0.6,
  },
  rocher: {
    label: 'Rocher',
    sprite: prop('rocher', '3.png'),
    w: 1.4,
    h: 1.35,
    mat: 'stone',
    shape: 'circle',
    hp: 220,
  },
  'rocher-plat': {
    label: 'Rocher enneigé',
    sprite: prop('rocher-neige', '1.png'),
    w: 1.9,
    h: 1.08,
    mat: 'stone',
    shape: 'box',
  },
  menhir: { label: 'Menhir', sprite: prop('menhir'), w: 0.75, h: 1.45, mat: 'stone', shape: 'box' },
  dolmen: { label: 'Dolmen', sprite: prop('dolmen'), w: 2.6, h: 1.35, mat: 'stone', shape: 'box', hp: 260 },
  enceinte: {
    label: 'Enceinte',
    sprite: prop('enceinte-34', '1.png'),
    w: 1.1,
    h: 1.52,
    mat: 'metal',
    shape: 'box',
    hp: 110,
    density: 0.9,
  },
  'enceinte-rose': {
    label: 'Enceinte rose',
    sprite: prop('enceinte-rose'),
    w: 1.1,
    h: 1.15,
    mat: 'metal',
    shape: 'box',
    hp: 90,
    density: 0.9,
  },
  borne: {
    label: "Borne d'incendie",
    sprite: prop('borne'),
    w: 0.7,
    h: 0.9,
    mat: 'metal',
    shape: 'box',
    hp: 400,
  },
  van: {
    label: 'Van',
    sprite: prop('van'),
    w: 4.4,
    h: 2.6,
    mat: 'metal',
    shape: 'box',
    hp: 1e9,
    density: 0.5,
  },
  voiture: {
    label: 'Voiture',
    sprite: prop('voiture', '1.png'),
    w: 4.4,
    h: 1.75,
    mat: 'metal',
    shape: 'box',
    hp: 1e9,
    density: 0.5,
  },
  // poutres et poteaux (dimensions données par le niveau) : texture dessinée par le jeu
  planche: { label: 'Poutre', w: 3, h: 0.3, mat: 'wood', shape: 'box' },
  'planche-glace': {
    label: 'Bloc de glace',
    w: 3,
    h: 0.3,
    mat: 'ice',
    shape: 'box',
    intro: 'Glace : se brise au moindre choc et glisse.',
  },
  'planche-pierre': {
    label: 'Bloc de pierre',
    w: 3,
    h: 0.3,
    mat: 'stone',
    shape: 'box',
    intro: 'Pierre : lourde et solide. LOLO la pulvérise.',
  },
  'planche-metal': {
    label: 'Poutrelle',
    w: 3,
    h: 0.3,
    mat: 'metal',
    shape: 'box',
    intro: 'Métal : presque incassable, il faut le faire tomber.',
  },
  // modules ronds (roulent) et triangles (toits), dimensions données par le niveau
  rond: { label: 'Roue en bois', w: 1, h: 1, mat: 'wood', shape: 'circle' },
  'rond-glace': { label: 'Boule de glace', w: 1, h: 1, mat: 'ice', shape: 'circle' },
  'rond-pierre': {
    label: 'Boulet de pierre',
    w: 1,
    h: 1,
    mat: 'stone',
    shape: 'circle',
    intro: 'Boulet de pierre : pousse-le, il dévale et écrase tout.',
  },
  'rond-metal': { label: 'Boulet de métal', w: 1, h: 1, mat: 'metal', shape: 'circle' },
  coin: { label: 'Toit en bois', w: 1.2, h: 0.8, mat: 'wood', shape: 'triangle' },
  'coin-glace': { label: 'Toit de glace', w: 1.2, h: 0.8, mat: 'ice', shape: 'triangle' },
  'coin-pierre': { label: 'Toit de pierre', w: 1.2, h: 0.8, mat: 'stone', shape: 'triangle' },
  'coin-metal': { label: 'Toit de métal', w: 1.2, h: 0.8, mat: 'metal', shape: 'triangle' },
} satisfies Record<string, ObjDef>;

export type ObjKind = keyof typeof OBJECTS;
export const objDef = (k: ObjKind): ObjDef => OBJECTS[k];

/* ---------------------------------------------------------------- relous */

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
  fetard: {
    label: 'Fêtard',
    npc: 'fetard',
    variants: 4,
    w: 0.62,
    h: 1.25,
    hp: 22,
    anim: 'sheet',
    intro: 'Les fêtards squattent nos coins préférés. Fais-les tomber !',
  },
  videur: {
    label: 'Videur',
    npc: 'videur',
    variants: 2,
    w: 0.72,
    h: 1.42,
    hp: 70,
    anim: 'sheet',
    intro: 'Le videur encaisse : il faut taper fort ou le faire chuter.',
  },
  yeti: { label: 'Yéti', npc: 'yeti', variants: 1, w: 1.05, h: 1.5, hp: 90, anim: 'sheet', drawScale: 1.05 },
  pigeon: {
    label: 'Pigeon',
    npc: 'pigeon',
    variants: 4,
    w: 0.7,
    h: 0.7,
    hp: 8,
    anim: 'still',
    intro: 'Les pigeons sont fragiles, mais perchés tout en haut.',
  },
  goeland: { label: 'Goéland', npc: 'goeland', variants: 1, w: 0.85, h: 0.8, hp: 12, anim: 'still' },
  influenceur: {
    label: 'Influenceur',
    npc: 'influenceur',
    variants: 1,
    w: 0.62,
    h: 1.25,
    hp: 30,
    anim: 'sheet',
  },
  trader: { label: 'Trader', npc: 'trader', variants: 1, w: 0.66, h: 1.25, hp: 40, anim: 'sheet' },
  supporter: { label: 'Supporter', npc: 'supporter', variants: 1, w: 0.66, h: 1.25, hp: 32, anim: 'sheet' },
  bouliste: { label: 'Bouliste', npc: 'bouliste', variants: 1, w: 0.7, h: 1.25, hp: 45, anim: 'sheet' },
  marin: { label: 'Marin', npc: 'marin', variants: 2, w: 0.75, h: 1.3, hp: 50, anim: 'still' },
  presse: { label: 'Pressé', npc: 'presse', variants: 1, w: 0.66, h: 1.25, hp: 40, anim: 'sheet' },
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
  baffle: {
    label: 'Enceinte du DJ',
    npc: 'enceinte',
    variants: 4,
    w: 1.2,
    h: 1.9,
    hp: 90,
    anim: 'frames',
    score: 8000,
    density: 0.8,
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

/* ---------------------------------------------------------------- amis */

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
  | 'puck';

export interface FriendDef {
  id: string;
  name: string;
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

export const FRIEND_BY_ID: Record<string, FriendDef> = Object.fromEntries(FRIENDS.map((f) => [f.id, f]));

/** L'ami qui représente le jeu (carte, icônes). */
export const MASCOT = 'roulian';

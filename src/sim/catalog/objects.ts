/* Objets des structures : modules de construction et objets de la banque (caisses, barils, TNT…). */
import type { Mat } from './materials';

/** Une image de la banque : dossier (props, npcs) / famille / fichier. */
export interface SpriteRef {
  dir: 'props' | 'npcs' | 'tex';
  id: string;
  file: string;
}

export type Special =
  | { type: 'explode'; radius: number; power: number; damage: number; confetti?: boolean }
  | { type: 'rocket'; thrust: number; fuse: number }
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
    special: { type: 'explode', radius: 4.4, power: 85, damage: 150 },
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
  tnt: {
    label: 'Caisse de TNT',
    w: 1,
    h: 1,
    mat: 'explosive',
    shape: 'box',
    hp: 8,
    special: { type: 'explode', radius: 4.6, power: 100, damage: 170 },
    intro: 'TNT : une grosse explosion au moindre choc. Vise-la pour tout faire sauter en chaîne.',
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

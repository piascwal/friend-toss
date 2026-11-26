/* Ce que contient un niveau en cours : entités (objets, relous, projectiles) et événements pour l'affichage. */
import type { Body } from 'planck';
import type { EnemyDef, EnemyKind, FriendDef, Mat, ObjDef, ObjKind } from './defs';

export type EntKind = 'block' | 'enemy' | 'friend' | 'clone' | 'ball' | 'puck' | 'pet';

export interface Ent {
  id: number;
  kind: EntKind;
  body: Body;
  w: number;
  h: number;
  shape: 'box' | 'circle' | 'triangle';
  mat: Mat | 'enemy' | 'friend';
  hp: number;
  maxHp: number;
  dead: boolean;
  obj?: ObjKind;
  objDef?: ObjDef;
  enemy?: EnemyKind;
  enemyDef?: EnemyDef;
  variant: number;
  friend?: FriendDef;
  /** Cage : ami enfermé. */
  caged?: string;
  frozen?: boolean;
  /** Temps restant de l'animation « touché ». */
  hurt: number;
  /** Tonneau-fusée allumé : temps avant explosion. */
  fuse?: number;
  // projectiles
  launchedAt?: number;
  impactAt?: number;
  slowFor?: number;
  powerUsed?: boolean;
  powerAt?: number;
  /** Dégâts par matériau (amis et projectiles de pouvoir). */
  dmg?: Partial<Record<Mat | 'enemy', number>>;
  /** Pouvoir à effet différé (séisme à l'impact, lévitation, course du chien). */
  mode?: 'slam' | 'levitate' | 'spin' | 'run' | 'fire';
  modeUntil?: number;
  portalCooldown?: number;
  /** Portail : index de son partenaire. */
  portalPair?: Ent;
}

export type SimEvent =
  | { t: 'break'; x: number; y: number; w: number; h: number; mat: Mat; angle: number }
  | { t: 'kill'; x: number; y: number; ent: Ent }
  | { t: 'score'; x: number; y: number; pts: number; color?: string }
  | { t: 'explode'; x: number; y: number; r: number; confetti?: boolean }
  | { t: 'impact'; x: number; y: number; force: number; mat: Mat | 'enemy' | 'friend' }
  | { t: 'power'; ent: Ent; x: number; y: number; target?: { x: number; y: number } }
  | { t: 'beam'; x0: number; y0: number; x1: number; y1: number }
  | { t: 'freeze'; x: number; y: number; dir: number }
  | { t: 'free'; friend: string; x: number; y: number }
  | { t: 'gold'; x: number; y: number }
  | { t: 'poof'; x: number; y: number; ent: Ent }
  | { t: 'launch'; ent: Ent }
  | { t: 'teleport'; x: number; y: number; x2: number; y2: number }
  | { t: 'rocket'; x: number; y: number }
  | { t: 'shockwave'; x: number; y: number }
  | { t: 'end'; won: boolean };

export type Phase = 'aim' | 'flying' | 'settling' | 'won' | 'lost';

/** Amis lancés et projectiles de pouvoir. */
export const isProjectile = (e: Ent) =>
  e.kind === 'friend' || e.kind === 'clone' || e.kind === 'ball' || e.kind === 'puck' || e.kind === 'pet';

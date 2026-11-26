/* Chargement des images de la banque (copiées dans public/assets/ par `npm run sprites`).
   Chaque image est détourée (bords transparents retirés) une fois chargée. */
import { ENEMIES, type EnemyDef, type EnemyKind, type SpriteRef } from './sim/defs';

const BASE = `${import.meta.env.BASE_URL}assets/`;

export type Pic = HTMLCanvasElement;

interface Entry {
  promise: Promise<Pic | null>;
  pic: Pic | null;
}

const cache = new Map<string, Entry>();

/** Image détourée ; `null` tant qu'elle n'est pas chargée (ou si elle manque). */
export function pic(path: string): Pic | null {
  void load(path);
  return cache.get(path)!.pic;
}

export function load(path: string): Promise<Pic | null> {
  let e = cache.get(path);
  if (!e) {
    const entry: Entry = { pic: null, promise: Promise.resolve(null) };
    entry.promise = new Promise<Pic | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        entry.pic = trim(img);
        resolve(entry.pic);
      };
      img.onerror = () => resolve(null);
      img.src = BASE + path;
    });
    cache.set(path, entry);
    e = entry;
  }
  return e.promise;
}

/** Retire les bords transparents. */
function trim(img: HTMLImageElement): Pic {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
  let x0 = width;
  let y0 = height;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (data[(y * width + x) * 4 + 3]! > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) return c;
  const out = document.createElement('canvas');
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out.getContext('2d')!.drawImage(c, -x0, -y0);
  return out;
}

/* ------------------------------------------------------------ personnages */

interface CharacterFile {
  id: string;
  name: string;
  color: string;
  size?: number;
  files: Record<string, string>;
}

const characters = new Map<string, CharacterFile>();

export async function loadCharacters(ids: string[]) {
  await Promise.all(
    ids.map(async (id) => {
      const res = await fetch(`${BASE}characters/${id}/character.json`);
      if (res.ok) characters.set(id, (await res.json()) as CharacterFile);
    }),
  );
}

export function characterInfo(id: string): CharacterFile | undefined {
  return characters.get(id);
}

/** Chemin de l'image d'une pose (avec replis). */
/** Chemin d'une image d'un ami (effet de pouvoir…), sans repli : jamais le personnage en pied à la place. */
export function posePath(id: string, pose: string): string | null {
  const file = characters.get(id)?.files[pose];
  return file ? `characters/${id}/${file}` : null;
}

/** Expressions des grosses têtes (poses `head_…` de la banque). */
export type Mood = 'ready' | 'fly' | 'power' | 'hit' | 'win' | 'sad';

/**
 * Tête d'un ami avec une expression : la grosse tête de la banque, sinon sa tête « prête », sinon son
 * portrait. Le jeu ne montre jamais les amis en pied.
 */
export function headPath(id: string, mood: Mood = 'ready'): string | null {
  const c = characters.get(id);
  const file = c?.files[`head_${mood}`] ?? c?.files.head_ready ?? c?.files.portrait;
  return file ? `characters/${id}/${file}` : null;
}

export const headUrl = (id: string, mood: Mood = 'ready') => BASE + (headPath(id, mood) ?? '');

export function head(id: string, mood: Mood = 'ready'): Pic | null {
  const path = headPath(id, mood);
  return path ? pic(path) : null;
}

export function pose(id: string, name: string): Pic | null {
  const path = posePath(id, name);
  return path ? pic(path) : null;
}

/* ------------------------------------------------------------ relous */

interface NpcAnim {
  sheet: string;
  frameWidth: number;
  frameHeight: number;
  animations: { name: string; row: number; frames: number; fps: number }[];
}
interface NpcFile {
  id: string;
  variants: { image?: string; animation?: NpcAnim }[];
}

const npcs = new Map<string, NpcFile>();

export async function loadNpcs() {
  const ids = [...new Set(Object.values(ENEMIES).map((e) => e.npc))];
  await Promise.all(
    ids.map(async (id) => {
      const res = await fetch(`${BASE}npcs/${id}/npc.json`);
      if (res.ok) npcs.set(id, (await res.json()) as NpcFile);
    }),
  );
  // relous sans image fixe : on découpe la première image de leur planche
  const jobs: Promise<void>[] = [];
  for (const [kind, def] of Object.entries(ENEMIES) as [EnemyKind, EnemyDef][]) {
    const npc = npcs.get(def.npc);
    npc?.variants.forEach((v, i) => {
      if (!v.image && v.animation) jobs.push(cutStill(kind, i + 1, npc));
    });
  }
  await Promise.all(jobs);
}

export interface Frame {
  img: CanvasImageSource;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

const sheets = new Map<string, HTMLImageElement>();

function sheet(path: string): HTMLImageElement | null {
  let img = sheets.get(path);
  if (!img) {
    img = new Image();
    img.src = BASE + path;
    sheets.set(path, img);
  }
  return img.complete && img.naturalWidth ? img : null;
}

/** Image d'un relou à l'instant `t` (animation « repos » ou « touche »). */
export function enemyFrame(kind: EnemyKind, variant: number, t: number, hurt: boolean): Frame | null {
  const def = ENEMIES[kind] as EnemyDef;
  const npc = npcs.get(def.npc);
  if (def.anim === 'frames') {
    const n = Math.max(1, def.variants);
    const i = (Math.floor(t * 6) % n) + 1;
    const p = pic(`npcs/${def.npc}/${i}.png`);
    return p ? { img: p, sx: 0, sy: 0, sw: p.width, sh: p.height } : null;
  }
  const v = npc?.variants[variant - 1] ?? npc?.variants[0];
  if (def.anim === 'sheet' && v?.animation) {
    const a = v.animation;
    const anim = a.animations.find((x) => x.name === (hurt ? 'touche' : 'repos'));
    const img = sheet(`npcs/${def.npc}/${a.sheet}`);
    if (!img) return null;
    // sans animation de repos (planche de marche seule) : première image, immobile
    if (!anim)
      return { img, sx: 0, sy: a.animations[0]!.row * a.frameHeight, sw: a.frameWidth, sh: a.frameHeight };
    const f = Math.floor(t * anim.fps) % anim.frames;
    return { img, sx: f * a.frameWidth, sy: anim.row * a.frameHeight, sw: a.frameWidth, sh: a.frameHeight };
  }
  const file = v?.image ?? `${variant}.png`;
  const p = pic(`npcs/${def.npc}/${file}`);
  return p ? { img: p, sx: 0, sy: 0, sw: p.width, sh: p.height } : null;
}

/** Image fixe d'un relou (HUD, guide). */
export function enemyStillPath(kind: EnemyKind, variant = 1): string {
  const def = ENEMIES[kind] as EnemyDef;
  const v = npcs.get(def.npc)?.variants[variant - 1];
  return `npcs/${def.npc}/${v?.image ?? `${variant}.png`}`;
}

/** Première image des relous qui n'ont qu'une planche d'animation (calculée au chargement). */
const sheetStills = new Map<string, string>();

export function enemyStillUrl(kind: EnemyKind, variant = 1): string {
  return sheetStills.get(`${kind}/${variant}`) ?? BASE + enemyStillPath(kind, variant);
}

/** Découpe la première image d'une planche d'animation (pour le HUD et le guide). */
async function cutStill(kind: EnemyKind, variant: number, npc: NpcFile) {
  const a = npc.variants[variant - 1]?.animation;
  if (!a) return;
  const img = new Image();
  img.src = `${BASE}npcs/${npc.id}/${a.sheet}`;
  await img.decode().catch(() => undefined);
  if (!img.naturalWidth) return;
  const c = document.createElement('canvas');
  c.width = a.frameWidth;
  c.height = a.frameHeight;
  c.getContext('2d')!.drawImage(img, 0, -a.animations[0]!.row * a.frameHeight);
  sheetStills.set(`${kind}/${variant}`, c.toDataURL());
}

/** Précharge les images d'un relou. */
export function preloadEnemy(kind: EnemyKind, variant: number): Promise<unknown> {
  const def = ENEMIES[kind] as EnemyDef;
  if (def.anim === 'frames')
    return Promise.all(Array.from({ length: def.variants }, (_, i) => load(`npcs/${def.npc}/${i + 1}.png`)));
  const v = npcs.get(def.npc)?.variants[variant - 1];
  if (def.anim === 'sheet' && v?.animation) {
    const img = new Image();
    const path = `npcs/${def.npc}/${v.animation.sheet}`;
    sheets.set(path, img);
    return new Promise((r) => {
      img.onload = img.onerror = r;
      img.src = BASE + path;
    });
  }
  return load(enemyStillPath(kind, variant));
}

/* ------------------------------------------------------------ objets */

export const spritePath = (s: SpriteRef) => `${s.dir}/${s.id}/${s.file}`;
export const spriteUrl = (s: SpriteRef) => BASE + spritePath(s);
export const propUrl = (id: string, file = 'image.png') => `${BASE}props/${id}/${file}`;
export const propPic = (id: string, file = 'image.png') => pic(`props/${id}/${file}`);

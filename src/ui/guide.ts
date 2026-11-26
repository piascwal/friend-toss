/* Le guide : la bande, les relous, les objets (vignettes à gauche, fiche à droite). */
import { enemyStillUrl, poseUrl, spriteUrl } from '../assets';
import { sfx } from '../audio';
import { ALL_LEVELS, UNLOCKS } from '../levels';
import { cannonImage } from '../render/cannon-art';
import { type Progress, unlockedFriends } from '../save';
import {
  ENEMIES,
  type EnemyDef,
  type EnemyKind,
  FRIENDS,
  MATS,
  OBJECTS,
  type ObjDef,
  type ObjKind,
} from '../sim/defs';
import { up } from '../text';
import { show, imgTag, beamSwatch } from './common';

interface GuideItem {
  img: string;
  name: string;
  sub: string;
  text: string;
  tip?: string;
  locked?: boolean;
}

export function guideScreen(p: Progress, onBack: () => void) {
  const have = new Set(unlockedFriends(p));
  const where = (id: string) => Object.entries(UNLOCKS).find(([, f]) => f === id)?.[0];
  const friends: GuideItem[] = [
    {
      img: cannonImage(),
      name: 'Le canon',
      sub: 'LE LANCEUR',
      text: "Pose le doigt sur le canon, tire vers l'arrière pour viser et doser la puissance, relâche : boum.",
    },
    ...FRIENDS.map((f): GuideItem =>
      have.has(f.id)
        ? {
            img: poseUrl(f.id, f.castPose ?? 'jump'),
            name: f.name,
            sub: f.power === 'none' ? 'SANS POUVOIR' : up(f.powerName),
            text: f.desc,
            tip: f.tip,
          }
        : {
            img: poseUrl(f.id, 'idle'),
            name: '???',
            sub: 'ENFERME',
            text: `À libérer au niveau ${where(f.id) ?? '?'}.`,
            locked: true,
          },
    ),
  ];
  const seenEnemy = (k: string) =>
    ALL_LEVELS.some((l) => (p.stars[l.id] ?? 0) > 0 && l.enemies.some((e) => e.k === k));
  const enemies = (Object.keys(ENEMIES) as EnemyKind[])
    .filter((k) => ALL_LEVELS.some((l) => l.enemies.some((e) => e.k === k)))
    .map((k): GuideItem => {
      const d = ENEMIES[k] as EnemyDef;
      const known = seenEnemy(k);
      const tough = d.hp >= 200 ? 'Boss' : d.hp >= 60 ? 'Costaud' : d.hp >= 30 ? 'Solide' : 'Fragile';
      return {
        img: enemyStillUrl(k),
        name: known ? d.label : '???',
        sub: up(tough),
        text: known ? (d.intro ?? 'Un relou de plus à dégager.') : 'Pas encore croisé.',
        locked: !known,
      };
    });
  const kinds = [...new Set(ALL_LEVELS.flatMap((l) => l.items.map((i) => i.k)))] as ObjKind[];
  const objects = kinds.map((k): GuideItem => {
    const d = OBJECTS[k] as ObjDef;
    return {
      img: d.sprite ? spriteUrl(d.sprite) : beamSwatch(d.mat),
      name: d.label,
      sub: up(MATS[d.mat].label),
      text: d.intro ?? matText(d.mat),
    };
  });
  const tabs: Record<string, GuideItem[]> = { friends, enemies, objects };
  const el = show(
    `<div class="guide">
      <header class="guide-head">
        <button class="pix-btn" data-act="back">◀ CARTE</button>
        <nav class="tabs"><button class="pix-btn tab on" data-tab="friends">LA BANDE</button><button class="pix-btn tab" data-tab="enemies">LES RELOUS</button><button class="pix-btn tab" data-tab="objects">LES OBJETS</button></nav>
      </header>
      <div class="g-body">
        <div class="g-thumbs"></div>
        <div class="g-detail"></div>
      </div>
    </div>`,
    'guide-screen',
  );
  el.querySelector('[data-act=back]')!.addEventListener('click', onBack);
  const thumbs = el.querySelector<HTMLElement>('.g-thumbs')!;
  const detail = el.querySelector<HTMLElement>('.g-detail')!;
  const pick = (items: GuideItem[], i: number) => {
    const it = items[i]!;
    thumbs.querySelectorAll('.g-thumb').forEach((t, k) => t.classList.toggle('on', k === i));
    detail.className = `g-detail${it.locked ? ' locked' : ''}`;
    detail.innerHTML = `<div class="g-img">${imgTag(it.img)}</div><div class="g-text"><b>${it.name}</b><small>${it.sub}</small><p>${it.text}</p>${it.tip ? `<p class="g-tip">💡 ${it.tip}</p>` : ''}</div>`;
  };
  const open = (tab: string) => {
    const items = tabs[tab]!;
    el.querySelectorAll<HTMLElement>('.tab').forEach((x) => x.classList.toggle('on', x.dataset.tab === tab));
    thumbs.style.setProperty('--n', String(items.length));
    thumbs.innerHTML = items
      .map(
        (it, i) =>
          `<button class="g-thumb${it.locked ? ' locked' : ''}" data-i="${i}">${imgTag(it.img)}</button>`,
      )
      .join('');
    thumbs.querySelectorAll<HTMLButtonElement>('.g-thumb').forEach((b) =>
      b.addEventListener('click', () => {
        sfx.click();
        pick(items, Number(b.dataset.i));
      }),
    );
    pick(items, 0);
    sizeThumbs();
  };
  // la grille de vignettes prend la plus grande taille qui tient sans défiler
  const sizeThumbs = () => {
    const n = thumbs.children.length;
    // marge intérieure (4 px) et contour des vignettes (3 px) de chaque côté
    const W = thumbs.clientWidth - 16;
    const H = thumbs.clientHeight - 16;
    const gap = 6;
    let best = 24;
    for (let c = 1; c <= n; c++) {
      const rows = Math.ceil(n / c);
      const size = Math.min((W - gap * (c - 1)) / c, (H - gap * (rows - 1)) / rows, 96);
      if (size > best) best = size;
    }
    thumbs.style.setProperty('--cell', `${Math.floor(best)}px`);
  };
  const ro = new ResizeObserver(sizeThumbs);
  ro.observe(thumbs);
  el.querySelectorAll<HTMLButtonElement>('.tab').forEach((t) =>
    t.addEventListener('click', () => open(t.dataset.tab!)),
  );
  open('friends');
}

function matText(mat: string): string {
  return (
    {
      wood: 'Bois : se casse bien. MAT le transperce.',
      ice: 'Glace : fragile et glissante. TOM adore.',
      stone: 'Pierre : lourde et solide. LOLO la pulvérise.',
      metal: 'Métal : presque incassable, mieux vaut le faire tomber. Gelé, il devient fragile.',
      rubber: 'Caoutchouc : indestructible, ça rebondit.',
      explosive: 'Explosif : boum.',
      gold: 'Bonus.',
    }[mat] ?? ''
  );
}

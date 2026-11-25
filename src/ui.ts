/* Écrans du jeu (HTML) : titre, carte des mondes, présentation d'un niveau, pause, résultats, guide. */
import { enemyStillUrl, poseUrl, propUrl, spriteUrl } from './assets';
import { isMuted, setMuted, sfx } from './audio';
import { ALL_LEVELS, UNLOCKS, WORLDS, type WorldDef } from './data/levels';
import type { Result } from './game';
import { cannonImage, THEMES } from './render/art';
import {
  ENEMIES,
  FRIEND_BY_ID,
  FRIENDS,
  MATS,
  OBJECTS,
  MASCOT,
  type EnemyDef,
  type EnemyKind,
  type ObjDef,
  type ObjKind,
} from './sim/defs';
import type { LevelDef } from './sim/level';
import { canFullscreen, isFullscreen, toggleFullscreen } from './pwa';
import { isOpen, totalGold, totalStars, unlockedFriends, type Progress } from './save';

const root = () => document.getElementById('screen')!;

/** Majuscules sans accents : la police pixel n'a pas les capitales accentuées. */
export const up = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

let fitCard: (() => void) | null = null;
window.addEventListener('resize', () => fitCard?.());

/**
 * Affiche un écran. Les fenêtres (`.card`) sont réduites si besoin pour tenir dans l'écran :
 * rien ne défile jamais, même sur un téléphone en paysage.
 */
function show(html: string, cls = ''): HTMLElement {
  const el = root();
  el.className = `screen ${cls}`;
  el.innerHTML = html;
  el.hidden = false;
  el.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => sfx.click()));
  const card = el.querySelector<HTMLElement>(':scope > .card');
  fitCard = card
    ? () => {
        card.style.transform = 'translate(-50%, -50%)';
        const m = 12;
        const k = Math.min(
          1,
          (el.clientHeight - 2 * m) / card.offsetHeight,
          (el.clientWidth - 2 * m) / card.offsetWidth,
        );
        card.style.transform = `translate(-50%, -50%) scale(${k})`;
      }
    : null;
  fitCard?.();
  // les images arrivent après coup : on réajuste quand elles sont chargées
  if (card)
    card
      .querySelectorAll('img')
      .forEach((img) => img.complete || img.addEventListener('load', () => fitCard?.(), { once: true }));
  return el;
}

/** Icône plein écran : quatre coins, en pixels. */
const FS_ICON = `<svg class="fs-icon" viewBox="0 0 8 8" width="16" height="16" shape-rendering="crispEdges"><path fill="currentColor" d="M0 0h3v1H1v2H0zM5 0h3v3H7V1H5zM0 5h1v2h2v1H0zM7 5h1v3H5V7h2z"/></svg>`;

/** Boutons plein écran et installation (cachés quand ils ne servent à rien). */
function appButtons() {
  return `<button class="pix-btn icon" data-act="fullscreen" title="Plein écran" ${canFullscreen() ? '' : 'hidden'}>${FS_ICON}</button>`;
}

function bindAppButtons(el: HTMLElement) {
  el.querySelectorAll<HTMLButtonElement>('[data-act=fullscreen]').forEach((b) =>
    b.addEventListener('click', async () => {
      await toggleFullscreen();
      b.classList.toggle('on', isFullscreen());
    }),
  );
}

export function hideScreen() {
  const el = root();
  el.hidden = true;
  el.innerHTML = '';
}

const stars = (n: number, max = 3) =>
  Array.from({ length: max }, (_, i) => `<i class="st${i < n ? ' on' : ''}">★</i>`).join('');

const muteLabel = () => (isMuted() ? '🔇' : '🔊');

function bindMute(el: HTMLElement) {
  el.querySelectorAll<HTMLButtonElement>('[data-act=mute]').forEach((b) =>
    b.addEventListener('click', () => {
      setMuted(!isMuted());
      b.textContent = muteLabel();
    }),
  );
}

/* ------------------------------------------------------------ titre */

export function titleScreen(onPlay: () => void) {
  const band = FRIENDS.slice(0, 7)
    .map((f, i) => `<img class="t-friend" style="--i:${i}" src="${poseUrl(f.id, 'jump')}" alt="">`)
    .join('');
  const el = show(
    `<div class="title">
      <div class="title-band">${band}</div>
      <h1 class="logo"><span>FRIEND</span><span>TOSS</span></h1>
      <p class="tagline">Lance tes potes. Dégage les relous.</p>
      <button class="pix-btn big" data-act="play">JOUER</button>
      <div class="title-foot">
        <img src="${cannonImage()}" alt="" class="t-thrower">
        <div class="title-tools">${appButtons()}<button class="pix-btn icon" data-act="mute">${muteLabel()}</button></div>
      </div>
    </div>`,
    'title-screen',
  );
  bindMute(el);
  bindAppButtons(el);
  el.querySelector('[data-act=play]')!.addEventListener('click', onPlay);
}

/* ------------------------------------------------------------ carte */

/** Positions des niveaux sur le chemin d'un monde (en %). */
const NODE_POS = [
  [9, 62],
  [24, 34],
  [40, 64],
  [56, 36],
  [71, 64],
  [88, 40],
];

export function mapScreen(p: Progress, onLevel: (id: string) => void, onGuide: () => void, focus?: string) {
  const current = ALL_LEVELS.find((l) => isOpen(p, l.id) && !p.stars[l.id])?.id ?? ALL_LEVELS.at(-1)!.id;
  const worlds = WORLDS.map((w) => worldPanel(w, p, current)).join('');
  const dots = WORLDS.map(
    (w, i) => `<button class="dot" data-i="${i}" style="--c:${w.color}" title="${w.name}"></button>`,
  ).join('');
  const el = show(
    `<div class="map-layout">
      <header class="map-head">
        <h1 class="logo small"><span>FRIEND</span><span>TOSS</span></h1>
        <div class="map-stats">
          <span class="chip"><i class="sym">★</i> ${totalStars(p)}/${ALL_LEVELS.length * 3}</span>
          <span class="chip gold"><img src="${propUrl('tonneau-or')}" alt=""> ${totalGold(p)}</span>
          <span class="chip band"><img src="${poseUrl(MASCOT, 'portrait')}" alt=""> ${unlockedFriends(p).length}/${FRIENDS.length}</span>
        </div>
        <div class="map-actions">
          <button class="pix-btn" data-act="guide">GUIDE</button>
          ${appButtons()}
          <button class="pix-btn icon" data-act="mute">${muteLabel()}</button>
        </div>
      </header>
      <div class="map-pager">
        <button class="pix-btn icon arrow" data-act="prev">◀</button>
        <div class="map-window"><div class="map-track">${worlds}</div></div>
        <button class="pix-btn icon arrow" data-act="next">▶</button>
      </div>
      <nav class="dots">${dots}</nav>
    </div>`,
    'map-screen',
  );
  bindMute(el);
  bindAppButtons(el);
  el.querySelector('[data-act=guide]')!.addEventListener('click', onGuide);
  // un monde à la fois : flèches, points, ou glisser du doigt
  const track = el.querySelector<HTMLElement>('.map-track')!;
  const focusId = focus ?? current;
  let page = Math.max(
    0,
    WORLDS.findIndex((w) => w.levels.some((l) => l.id === focusId)),
  );
  const go = (i: number) => {
    page = Math.max(0, Math.min(WORLDS.length - 1, i));
    track.style.transform = `translateX(${-page * 100}%)`;
    el.querySelectorAll('.dot').forEach((d, k) => d.classList.toggle('on', k === page));
    el.querySelector<HTMLButtonElement>('[data-act=prev]')!.disabled = page === 0;
    el.querySelector<HTMLButtonElement>('[data-act=next]')!.disabled = page === WORLDS.length - 1;
  };
  track.style.transition = 'none';
  go(page);
  requestAnimationFrame(() => (track.style.transition = ''));
  el.querySelector('[data-act=prev]')!.addEventListener('click', () => go(page - 1));
  el.querySelector('[data-act=next]')!.addEventListener('click', () => go(page + 1));
  el.querySelectorAll<HTMLButtonElement>('.dot').forEach((d) =>
    d.addEventListener('click', () => go(Number(d.dataset.i))),
  );
  let swipe: { x: number; y: number } | null = null;
  let swiped = false;
  const win = el.querySelector<HTMLElement>('.map-window')!;
  win.addEventListener('pointerdown', (e) => {
    swipe = { x: e.clientX, y: e.clientY };
    swiped = false;
  });
  win.addEventListener('pointerup', (e) => {
    if (!swipe) return;
    const dx = e.clientX - swipe.x;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - swipe.y)) {
      swiped = true;
      go(page + (dx < 0 ? 1 : -1));
    }
    swipe = null;
  });
  el.querySelectorAll<HTMLButtonElement>('.node').forEach((n) =>
    n.addEventListener('click', () => {
      if (swiped) return;
      if (n.classList.contains('locked')) {
        n.classList.remove('shake');
        void n.offsetWidth;
        n.classList.add('shake');
        return;
      }
      onLevel(n.dataset.id!);
    }),
  );
}

function worldPanel(w: WorldDef, p: Progress, current: string): string {
  const art = THEMES[w.theme];
  const open = isOpen(p, w.levels[0]!.id);
  const got = w.levels.reduce((s, l) => s + (p.stars[l.id] ?? 0), 0);
  const nodes = w.levels
    .map((l, i) => {
      const [x, y] = NODE_POS[i]!;
      const lo = isOpen(p, l.id);
      const st = p.stars[l.id] ?? 0;
      const boss = l.enemies.find((e) => (ENEMIES[e.k] as EnemyDef).boss);
      const free = UNLOCKS[l.id];
      const badge = free
        ? `<span class="cage-badge${st ? ' freed' : ''}" title="${st ? 'Libéré' : 'À libérer'} : ${FRIEND_BY_ID[free]?.name}"><img src="${poseUrl(free, 'portrait')}" alt=""></span>`
        : '';
      const gold = l.items.some((it) => it.k === 'tonneau-or')
        ? `<span class="gold-badge${p.gold[l.id] ? ' got' : ''}"><img src="${propUrl('tonneau-or')}" alt=""></span>`
        : '';
      return `<button class="node${lo ? '' : ' locked'}${boss ? ' boss' : ''}${l.id === current ? ' current' : ''}" data-id="${l.id}" style="left:${x}%;top:${y}%">
        ${boss ? `<img class="boss-face" src="${enemyStillUrl(boss.k)}" alt="">` : ''}
        <span class="num">${lo ? l.id : '🔒'}</span>
        <span class="nstars">${stars(st)}</span>
        ${badge}${gold}
        ${l.id === current ? `<img class="you" src="${poseUrl(l.friends[0] ?? MASCOT, 'idle')}" alt="">` : ''}
      </button>`;
    })
    .join('');
  const path = NODE_POS.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
  const decor = art.decor
    .slice(0, 7)
    .map(
      ([id, file, h], i) =>
        `<img class="m-decor" style="left:${(i * 15 + 3) % 100}%;height:${Math.min(46, h * 9)}%" src="${propUrl(id, file)}" alt="">`,
    )
    .join('');
  return `<section class="world${open ? '' : ' closed'}" style="--c:${w.color};--sky0:${art.sky[0]};--sky1:${art.sky[1]};--sky2:${art.sky[2]};--top:${art.top};--dirt:${art.dirt};--far:${art.far}">
    <div class="world-scene">
      <div class="m-far"></div>
      ${decor}
      <div class="m-ground"></div>
      <div class="world-head">
        <span class="wnum">MONDE ${w.id}</span>
        <h2>${w.name}</h2>
        <span class="chip"><i class="sym">★</i> ${got}/18</span>
        <p>${w.tagline}</p>
      </div>
      <svg class="m-path" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${path}"/></svg>
      ${nodes}
      ${open ? '' : '<div class="world-lock"><span>🔒 Bats le boss du monde précédent</span></div>'}
    </div>
  </section>`;
}

/* ------------------------------------------------------------ présentation d'un niveau */

interface Novelty {
  key: string;
  img: string;
  name: string;
  text: string;
  kind: string;
}

/** Ce que le niveau présente pour la première fois (amis, objets, relous). */
export function novelties(level: LevelDef, p: Progress): Novelty[] {
  const out: Novelty[] = [];
  for (const id of new Set(level.friends)) {
    const f = FRIEND_BY_ID[id]!;
    const key = `f:${id}`;
    if (!p.seen.includes(key))
      out.push({
        key,
        img: poseUrl(id, f.castPose ?? 'jump'),
        name: `${f.name} · ${f.powerName}`,
        text: f.desc,
        kind: 'Ami',
      });
  }
  for (const k of new Set(level.items.map((i) => i.k))) {
    const def = OBJECTS[k] as ObjDef;
    const key = `o:${k}`;
    if (def.intro && !p.seen.includes(key))
      out.push({
        key,
        img: def.sprite ? spriteUrl(def.sprite) : beamSwatch(def.mat),
        name: def.label,
        text: def.intro,
        kind: 'Objet',
      });
  }
  for (const k of new Set(level.enemies.map((e) => e.k))) {
    const def = ENEMIES[k] as EnemyDef;
    const key = `e:${k}`;
    if (def.intro && !p.seen.includes(key))
      out.push({
        key,
        img: enemyStillUrl(k),
        name: def.label,
        text: def.intro,
        kind: def.boss ? 'Boss' : 'Relou',
      });
  }
  return out;
}

const SWATCH: Record<string, string> = {
  ice: 'linear-gradient(135deg,#e6fbff,#9fe3f5 50%,#5bb5d6)',
  stone: 'repeating-linear-gradient(90deg,#9b978f 0 14px,#5f5b56 14px 16px)',
  metal: 'linear-gradient(#eef3f8,#8e99a6 50%,#59636f)',
  wood: 'repeating-linear-gradient(#b9773f 0 6px,#8a5226 6px 7px)',
};
const beamSwatch = (mat: string) => `swatch:${mat}`;

function imgTag(src: string, cls = '') {
  if (src.startsWith('swatch:'))
    return `<span class="swatch ${cls}" style="background:${SWATCH[src.slice(7)]}"></span>`;
  return `<img class="${cls}" src="${src}" alt="">`;
}

export function introScreen(
  level: LevelDef,
  world: WorldDef,
  p: Progress,
  best: number,
  onGo: () => void,
  onBack: () => void,
) {
  // trois nouveautés au plus : les autres seront présentées au niveau suivant
  const news = novelties(level, p).slice(0, 3);
  const band = level.friends
    .map((id) => `<img src="${poseUrl(id, 'portrait')}" title="${FRIEND_BY_ID[id]?.name}" alt="">`)
    .join('');
  const free = UNLOCKS[level.id];
  const el = show(
    `<div class="card intro${news.length ? ' two' : ''}" style="--c:${world.color}">
      <div class="col">
        <div class="card-head"><span class="wnum">${world.name}</span><h2>${level.id} · ${level.name}</h2></div>
        ${level.tip ? `<p class="tip">💡 ${level.tip}</p>` : ''}
        <div class="intro-band"><h3>TA BANDE</h3><div class="band">${band}</div></div>
        ${free ? `<p class="free-note"><img src="${poseUrl(free, 'portrait')}" alt=""> ${FRIEND_BY_ID[free]?.name} est enfermé ici : gagne pour le libérer !</p>` : ''}
        ${best ? `<p class="best">Record : ${best.toLocaleString('fr-FR')}</p>` : ''}
        <div class="row">
          <button class="pix-btn" data-act="back">CARTE</button>
          <button class="pix-btn big go" data-act="go">C'EST PARTI !</button>
        </div>
      </div>
      ${
        news.length
          ? `<div class="col news"><h3>NOUVEAU</h3>${news
              .map(
                (n) =>
                  `<div class="new"><div class="new-img">${imgTag(n.img)}</div><div><small>${n.kind}</small><b>${n.name}</b><p>${n.text}</p></div></div>`,
              )
              .join('')}</div>`
          : ''
      }
    </div>`,
    'overlay',
  );
  el.querySelector('[data-act=go]')!.addEventListener('click', onGo);
  el.querySelector('[data-act=back]')!.addEventListener('click', onBack);
  return news.map((n) => n.key);
}

/* ------------------------------------------------------------ pause */

export function pauseScreen(onResume: () => void, onRestart: () => void, onMap: () => void) {
  const el = show(
    `<div class="card pause">
      <h2>PAUSE</h2>
      <button class="pix-btn big" data-act="resume">REPRENDRE</button>
      <button class="pix-btn" data-act="restart">RECOMMENCER</button>
      <button class="pix-btn" data-act="map">CARTE</button>
      <div class="row tools">${appButtons()}<button class="pix-btn icon" data-act="mute">${muteLabel()}</button></div>
    </div>`,
    'overlay',
  );
  bindMute(el);
  bindAppButtons(el);
  el.querySelector('[data-act=resume]')!.addEventListener('click', onResume);
  el.querySelector('[data-act=restart]')!.addEventListener('click', onRestart);
  el.querySelector('[data-act=map]')!.addEventListener('click', onMap);
}

/* ------------------------------------------------------------ résultats */

export function resultScreen(
  level: LevelDef,
  r: Result,
  best: number,
  newFriend: string | undefined,
  hasNext: boolean,
  onNext: () => void,
  onRetry: () => void,
  onMap: () => void,
) {
  const f = newFriend ? FRIEND_BY_ID[newFriend] : undefined;
  const laughing = [...new Set(level.enemies.map((e) => e.k))]
    .slice(0, 3)
    .map((k) => `<img src="${enemyStillUrl(k as EnemyKind)}" alt="">`)
    .join('');
  const el = show(
    `<div class="card result ${r.won ? 'won' : 'lost'}${f ? ' two' : ''}">
      <div class="col">
      <h2>${r.won ? 'BRAVO, NIVEAU REUSSI !' : 'RATE…'}</h2>
      ${r.won ? `<div class="big-stars">${[0, 1, 2].map((i) => `<i class="st" data-i="${i}">★</i>`).join('')}</div>` : `<div class="laugh">${laughing}</div><p>Les relous rigolent encore. Retente ta chance !</p>`}
      <div class="res-score"><small>SCORE</small><b>0</b>${r.won && r.score >= best ? '<span class="record">NOUVEAU RECORD !</span>' : `<span>Record : ${Math.max(best, r.score).toLocaleString('fr-FR')}</span>`}</div>
      ${r.won ? `<p class="thr">★★ ${r.thresholds[0].toLocaleString('fr-FR')} · ★★★ ${r.thresholds[1].toLocaleString('fr-FR')}</p>` : ''}
      ${r.gold ? `<p class="gold-line"><img src="${propUrl('tonneau-or')}" alt=""> Tonneau d'or ramassé !</p>` : ''}
      <div class="row">
        <button class="pix-btn" data-act="map">CARTE</button>
        <button class="pix-btn" data-act="retry">REJOUER</button>
        ${r.won && hasNext ? '<button class="pix-btn big go" data-act="next">SUIVANT ▶</button>' : ''}
      </div>
      </div>
      ${
        f
          ? `<div class="col unlock"><img src="${poseUrl(f.id, 'win')}" alt=""><div><small>REJOINT LA BANDE</small><b>${f.name}</b><span>Pouvoir : ${f.powerName}</span><p>${f.desc}</p></div></div>`
          : ''
      }
    </div>`,
    'overlay',
  );
  el.querySelector('[data-act=map]')!.addEventListener('click', onMap);
  el.querySelector('[data-act=retry]')!.addEventListener('click', onRetry);
  el.querySelector('[data-act=next]')?.addEventListener('click', onNext);
  // score qui défile, puis étoiles une à une
  const out = el.querySelector('.res-score b')!;
  const t0 = performance.now();
  const tick = (now: number) => {
    const k = Math.min(1, (now - t0) / 900);
    out.textContent = Math.round(r.score * k).toLocaleString('fr-FR');
    if (k < 1 && el.isConnected) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  el.querySelectorAll<HTMLElement>('.big-stars .st').forEach((s, i) => {
    if (i < r.stars)
      setTimeout(
        () => {
          s.classList.add('on');
          sfx.star(i);
        },
        600 + i * 380,
      );
  });
}

/* ------------------------------------------------------------ guide */

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

/* ------------------------------------------------------------ chargement */

export function loadingScreen(text = 'Chargement…') {
  show(`<div class="loading"><div class="spinner"></div><p>${text}</p></div>`, 'overlay');
}

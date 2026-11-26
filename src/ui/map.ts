/* La carte des mondes : un monde par page (flèches, points, glisser), niveaux reliés par un chemin. */
import { enemyStillUrl, headUrl, propUrl } from '../assets';
import { ALL_LEVELS, UNLOCKS, WORLDS, type WorldDef } from '../levels';
import { THEMES } from '../render/themes';
import { type Progress, isOpen, totalGold, totalStars, unlockedFriends } from '../save';
import { ENEMIES, type EnemyDef, FRIENDS, FRIEND_BY_ID, MASCOT } from '../sim/defs';
import { show, stars, muteLabel, bindMute, appButtons, bindAppButtons } from './common';

/** Positions des niveaux sur le chemin d'un monde (en %) : un zigzag régulier de gauche à droite. */
function nodePos(n: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => [5 + (i * 90) / Math.max(1, n - 1), i % 2 ? 38 : 62]);
}

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
          <span class="chip band"><img src="${headUrl(MASCOT)}" alt=""> ${unlockedFriends(p).length}/${FRIENDS.length}</span>
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
  const pos = nodePos(w.levels.length);
  const nodes = w.levels
    .map((l, i) => {
      const [x, y] = pos[i]!;
      const lo = isOpen(p, l.id);
      const st = p.stars[l.id] ?? 0;
      const boss = l.enemies.find((e) => (ENEMIES[e.k] as EnemyDef).boss);
      const free = UNLOCKS[l.id];
      const badge = free
        ? `<span class="cage-badge${st ? ' freed' : ''}" title="${st ? 'Libéré' : 'À libérer'} : ${FRIEND_BY_ID[free]?.name}"><img src="${headUrl(free, st ? 'win' : 'sad')}" alt=""></span>`
        : '';
      const gold = l.items.some((it) => it.k === 'tonneau-or')
        ? `<span class="gold-badge${p.gold[l.id] ? ' got' : ''}"><img src="${propUrl('tonneau-or')}" alt=""></span>`
        : '';
      return `<button class="node${lo ? '' : ' locked'}${boss ? ' boss' : ''}${l.id === current ? ' current' : ''}" data-id="${l.id}" style="left:${x}%;top:${y}%">
        ${boss ? `<img class="boss-face" src="${enemyStillUrl(boss.k)}" alt="">` : ''}
        <span class="num">${lo ? l.id : '🔒'}</span>
        <span class="nstars">${stars(st)}</span>
        ${badge}${gold}
        ${l.id === current ? `<img class="you" src="${headUrl(l.friends[0] ?? MASCOT)}" alt="">` : ''}
      </button>`;
    })
    .join('');
  const path = pos.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
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

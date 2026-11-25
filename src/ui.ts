/* Écrans du jeu (HTML) : titre, carte des mondes, présentation d'un niveau, pause, résultats, guide. */
import { enemyStillUrl, poseUrl, propUrl, spriteUrl } from './assets';
import { isMuted, setMuted, sfx } from './audio';
import { ALL_LEVELS, UNLOCKS, WORLDS, type WorldDef } from './data/levels';
import type { Result } from './game';
import { THEMES } from './render/art';
import {
  ENEMIES,
  FRIEND_BY_ID,
  FRIENDS,
  MATS,
  OBJECTS,
  THROWER,
  type EnemyDef,
  type EnemyKind,
  type ObjDef,
  type ObjKind,
} from './sim/defs';
import type { LevelDef } from './sim/level';
import { isOpen, totalGold, totalStars, unlockedFriends, type Progress } from './save';

const root = () => document.getElementById('screen')!;

/** Majuscules sans accents : la police pixel n'a pas les capitales accentuées. */
export const up = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

function show(html: string, cls = ''): HTMLElement {
  const el = root();
  el.className = `screen ${cls}`;
  el.innerHTML = html;
  el.hidden = false;
  el.scrollTop = 0;
  el.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => sfx.click()));
  return el;
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
      <div class="title-sky"></div>
      <div class="title-band">${band}</div>
      <h1 class="logo"><span>FRIEND</span><span>TOSS</span></h1>
      <p class="tagline">Lance tes potes. Dégage les relous.</p>
      <button class="pix-btn big" data-act="play">JOUER</button>
      <div class="title-foot">
        <img src="${poseUrl(THROWER, 'idle')}" alt="" class="t-thrower">
        <button class="pix-btn icon" data-act="mute">${muteLabel()}</button>
      </div>
    </div>`,
    'title-screen',
  );
  bindMute(el);
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
  const el = show(
    `<header class="map-head">
      <h1 class="logo small"><span>FRIEND</span><span>TOSS</span></h1>
      <div class="map-stats">
        <span class="chip"><i class="sym">★</i> ${totalStars(p)} / ${ALL_LEVELS.length * 3}</span>
        <span class="chip gold"><img src="${propUrl('tonneau-or')}" alt=""> ${totalGold(p)}</span>
        <span class="chip band"><img src="${poseUrl(THROWER, 'portrait')}" alt=""> ${unlockedFriends(p).length} / ${FRIENDS.length}</span>
      </div>
      <div class="map-actions">
        <button class="pix-btn" data-act="guide">LA BANDE</button>
        <button class="pix-btn icon" data-act="mute">${muteLabel()}</button>
      </div>
    </header>
    <div class="map">${worlds}</div>`,
    'map-screen',
  );
  bindMute(el);
  el.querySelector('[data-act=guide]')!.addEventListener('click', onGuide);
  el.querySelectorAll<HTMLButtonElement>('.node').forEach((n) =>
    n.addEventListener('click', () => {
      if (n.classList.contains('locked')) {
        n.classList.remove('shake');
        void n.offsetWidth;
        n.classList.add('shake');
        return;
      }
      onLevel(n.dataset.id!);
    }),
  );
  const target = el.querySelector<HTMLElement>(`.node[data-id="${focus ?? current}"]`);
  target?.closest('.world')?.scrollIntoView({ block: 'center' });
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
        ${l.id === current ? `<img class="you" src="${poseUrl(THROWER, 'idle')}" alt="">` : ''}
      </button>`;
    })
    .join('');
  const path = NODE_POS.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ');
  const decor = art.decor
    .slice(0, 7)
    .map(
      ([id, file, h], i) =>
        `<img class="m-decor" style="left:${(i * 15 + 3) % 100}%;height:${Math.min(46, h * 9)}%;--d:${i}" src="${propUrl(id, file)}" alt="">`,
    )
    .join('');
  return `<section class="world${open ? '' : ' closed'}" style="--c:${w.color};--sky0:${art.sky[0]};--sky1:${art.sky[1]};--sky2:${art.sky[2]};--top:${art.top};--dirt:${art.dirt};--far:${art.far}">
    <div class="world-head">
      <span class="wnum">MONDE ${w.id}</span>
      <h2>${w.name}</h2>
      <p>${w.tagline}</p>
      <span class="chip"><i class="sym">★</i> ${got} / 18</span>
    </div>
    <div class="world-scene">
      <div class="m-far"></div>
      ${decor}
      <div class="m-ground"></div>
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
  const news = novelties(level, p);
  const band = level.friends
    .map((id) => `<img src="${poseUrl(id, 'portrait')}" title="${FRIEND_BY_ID[id]?.name}" alt="">`)
    .join('');
  const free = UNLOCKS[level.id];
  const el = show(
    `<div class="card intro" style="--c:${world.color}">
      <div class="card-head"><span class="wnum">${world.name}</span><h2>${level.id} · ${level.name}</h2></div>
      ${level.tip ? `<p class="tip">💡 ${level.tip}</p>` : ''}
      ${
        news.length
          ? `<div class="news"><h3>NOUVEAU</h3>${news
              .map(
                (n) =>
                  `<div class="new"><div class="new-img">${imgTag(n.img)}</div><div><small>${n.kind}</small><b>${n.name}</b><p>${n.text}</p></div></div>`,
              )
              .join('')}</div>`
          : ''
      }
      <div class="intro-band"><h3>TA BANDE</h3><div class="band">${band}</div></div>
      ${free ? `<p class="free-note"><img src="${poseUrl(free, 'portrait')}" alt=""> ${FRIEND_BY_ID[free]?.name} est enfermé ici : gagne pour le libérer !</p>` : ''}
      ${best ? `<p class="best">Record : ${best.toLocaleString('fr-FR')}</p>` : ''}
      <div class="row">
        <button class="pix-btn" data-act="back">CARTE</button>
        <button class="pix-btn big go" data-act="go">C'EST PARTI !</button>
      </div>
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
      <button class="pix-btn icon" data-act="mute">${muteLabel()}</button>
    </div>`,
    'overlay',
  );
  bindMute(el);
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
    `<div class="card result ${r.won ? 'won' : 'lost'}">
      <h2>${r.won ? 'BRAVO, NIVEAU REUSSI !' : 'RATE…'}</h2>
      ${r.won ? `<div class="big-stars">${[0, 1, 2].map((i) => `<i class="st" data-i="${i}">★</i>`).join('')}</div>` : `<div class="laugh">${laughing}</div><p>Les relous rigolent encore. Retente ta chance !</p>`}
      <div class="res-score"><small>SCORE</small><b>0</b>${r.won && r.score >= best ? '<span class="record">NOUVEAU RECORD !</span>' : `<span>Record : ${Math.max(best, r.score).toLocaleString('fr-FR')}</span>`}</div>
      ${r.won ? `<p class="thr">★★ ${r.thresholds[0].toLocaleString('fr-FR')} · ★★★ ${r.thresholds[1].toLocaleString('fr-FR')}</p>` : ''}
      ${r.gold ? `<p class="gold-line"><img src="${propUrl('tonneau-or')}" alt=""> Tonneau d'or ramassé !</p>` : ''}
      ${
        f
          ? `<div class="unlock"><img src="${poseUrl(f.id, 'win')}" alt=""><div><small>REJOINT LA BANDE</small><b>${f.name}</b><span>Pouvoir : ${f.powerName}</span><p>${f.desc}</p></div></div>`
          : ''
      }
      <div class="row">
        <button class="pix-btn" data-act="map">CARTE</button>
        <button class="pix-btn" data-act="retry">REJOUER</button>
        ${r.won && hasNext ? '<button class="pix-btn big go" data-act="next">SUIVANT ▶</button>' : ''}
      </div>
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

export function guideScreen(p: Progress, onBack: () => void) {
  const have = new Set(unlockedFriends(p));
  const where = (id: string) => Object.entries(UNLOCKS).find(([, f]) => f === id)?.[0];
  const friends = [
    `<div class="g-card thrower"><img src="${poseUrl(THROWER, 'idle')}" alt=""><div><b>JBG</b><small>LE LANCEUR</small><p>Il ne vole pas : c'est lui qui lance toute la bande. Tire vers l'arrière, relâche.</p></div></div>`,
    ...FRIENDS.map((f) =>
      have.has(f.id)
        ? `<div class="g-card"><img src="${poseUrl(f.id, f.castPose ?? 'jump')}" alt=""><div><b>${f.name}</b><small>${f.power === 'none' ? 'SANS POUVOIR' : up(f.powerName)}</small><p>${f.desc}</p><p class="g-tip">💡 ${f.tip}</p></div></div>`
        : `<div class="g-card locked"><img src="${poseUrl(f.id, 'idle')}" alt=""><div><b>???</b><small>ENFERME</small><p>À libérer au niveau ${where(f.id) ?? '?'}.</p></div></div>`,
    ),
  ].join('');
  const seenEnemy = (k: string) =>
    ALL_LEVELS.some((l) => (p.stars[l.id] ?? 0) > 0 && l.enemies.some((e) => e.k === k));
  const enemies = (Object.keys(ENEMIES) as EnemyKind[])
    .filter((k) => ALL_LEVELS.some((l) => l.enemies.some((e) => e.k === k)))
    .map((k) => {
      const d = ENEMIES[k] as EnemyDef;
      const known = seenEnemy(k);
      const tough = d.hp >= 200 ? 'Boss' : d.hp >= 60 ? 'Costaud' : d.hp >= 30 ? 'Solide' : 'Fragile';
      return `<div class="g-card${known ? '' : ' locked'}"><img src="${enemyStillUrl(k)}" alt=""><div><b>${known ? d.label : '???'}</b><small>${up(tough)}</small><p>${known ? (d.intro ?? 'Un relou de plus à dégager.') : 'Pas encore croisé.'}</p></div></div>`;
    })
    .join('');
  const kinds = [...new Set(ALL_LEVELS.flatMap((l) => l.items.map((i) => i.k)))] as ObjKind[];
  const objects = kinds
    .map((k) => {
      const d = OBJECTS[k] as ObjDef;
      const m = MATS[d.mat];
      const img = d.sprite ? spriteUrl(d.sprite) : beamSwatch(d.mat);
      return `<div class="g-card obj">${imgTag(img)}<div><b>${d.label}</b><small>${up(m.label)}</small><p>${d.intro ?? matText(d.mat)}</p></div></div>`;
    })
    .join('');
  const el = show(
    `<div class="guide">
      <header class="guide-head"><button class="pix-btn" data-act="back">◀ CARTE</button><h2>LE GUIDE</h2></header>
      <nav class="tabs"><button class="pix-btn tab on" data-tab="friends">LA BANDE</button><button class="pix-btn tab" data-tab="enemies">LES RELOUS</button><button class="pix-btn tab" data-tab="objects">LES OBJETS</button></nav>
      <div class="g-grid" data-pane="friends">${friends}</div>
      <div class="g-grid" data-pane="enemies" hidden>${enemies}</div>
      <div class="g-grid" data-pane="objects" hidden>${objects}</div>
    </div>`,
    'guide-screen',
  );
  el.querySelector('[data-act=back]')!.addEventListener('click', onBack);
  el.querySelectorAll<HTMLButtonElement>('.tab').forEach((t) =>
    t.addEventListener('click', () => {
      el.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x === t));
      el.querySelectorAll<HTMLElement>('[data-pane]').forEach(
        (pane) => (pane.hidden = pane.dataset.pane !== t.dataset.tab),
      );
    }),
  );
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

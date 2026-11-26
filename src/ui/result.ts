/* Résultats d'un niveau : étoiles, score, record, tonneau d'or, ami libéré. */
import { enemyStillUrl, poseUrl, propUrl } from '../assets';
import { sfx } from '../audio';
import type { Result } from '../game/game';
import { type EnemyKind, FRIEND_BY_ID } from '../sim/defs';
import type { LevelDef } from '../sim/level';
import { show } from './common';

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

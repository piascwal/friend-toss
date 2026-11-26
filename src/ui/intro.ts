/* Présentation d'un niveau : conseil, nouveautés (amis, objets, relous), bande, ami à libérer. */
import { enemyStillUrl, poseUrl, spriteUrl } from '../assets';
import { UNLOCKS, type WorldDef } from '../levels';
import type { Progress } from '../save';
import { ENEMIES, type EnemyDef, FRIEND_BY_ID, OBJECTS, type ObjDef } from '../sim/defs';
import type { LevelDef } from '../sim/level';
import { show, imgTag, beamSwatch } from './common';

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

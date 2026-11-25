/* Bruitages synthétisés (WebAudio), façon console 8 bits : aucun fichier à charger. */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
try {
  muted = localStorage.getItem('friend-toss-mute') === '1';
} catch {
  /* stockage indisponible */
}

function ac(): AudioContext | null {
  if (muted) return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export const isMuted = () => muted;
export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem('friend-toss-mute', m ? '1' : '0');
  } catch {
    /* rien */
  }
}

function tone(type: OscillatorType, f0: number, f1: number, dur: number, vol = 0.5, delay = 0) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

let noiseBuf: AudioBuffer | null = null;
function noise(dur: number, vol: number, freq: number, q = 1, delay = 0) {
  const c = ac();
  if (!c || !master) return;
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + delay;
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f).connect(g).connect(master);
  s.start(t);
  s.stop(t + dur);
}

const last = new Map<string, number>();
/** Évite qu'un même son se répète cent fois dans la même image. */
function throttle(key: string, ms: number) {
  const now = performance.now();
  if ((last.get(key) ?? 0) + ms > now) return false;
  last.set(key, now);
  return true;
}

export const sfx = {
  stretch: (p: number) => throttle('stretch', 60) && tone('square', 200 + p * 300, 210 + p * 300, 0.05, 0.08),
  launch: () => {
    noise(0.35, 0.5, 900, 0.8);
    tone('square', 300, 900, 0.25, 0.15);
  },
  power: () => {
    tone('square', 600, 1400, 0.15, 0.2);
    tone('triangle', 900, 1800, 0.2, 0.2, 0.05);
  },
  wood: () => throttle('wood', 50) && noise(0.12, 0.6, 700, 2),
  ice: () => throttle('ice', 50) && (tone('triangle', 2400, 1600, 0.15, 0.25), noise(0.1, 0.3, 4000, 3)),
  stone: () => throttle('stone', 60) && noise(0.2, 0.7, 250, 1.5),
  metal: () =>
    throttle('metal', 60) && (tone('square', 880, 700, 0.18, 0.12), tone('square', 1320, 1100, 0.15, 0.08)),
  thud: (f: number) => throttle('thud', 70) && noise(0.1, Math.min(0.5, f / 40), 160, 1),
  boom: () => {
    noise(0.8, 1, 120, 0.6);
    noise(0.4, 0.6, 600, 0.8);
    tone('sawtooth', 120, 30, 0.6, 0.3);
  },
  kill: () => throttle('kill', 80) && (tone('square', 500, 120, 0.25, 0.2), noise(0.2, 0.3, 1200, 1)),
  score: () => throttle('score', 90) && tone('square', 1200, 1250, 0.05, 0.06),
  bounce: () => throttle('bounce', 120) && tone('triangle', 200, 700, 0.25, 0.35),
  teleport: () => {
    tone('sine', 300, 1600, 0.3, 0.25);
    tone('sine', 1600, 300, 0.3, 0.2, 0.15);
  },
  free: () => [523, 659, 784, 1046].forEach((f, i) => tone('square', f, f, 0.12, 0.15, i * 0.09)),
  gold: () => [988, 1319].forEach((f, i) => tone('square', f, f, 0.12, 0.15, i * 0.08)),
  poof: () => throttle('poof', 80) && noise(0.25, 0.25, 2000, 0.6),
  win: () =>
    [523, 659, 784, 1046, 784, 1046].forEach((f, i) =>
      tone('square', f, f, i === 5 ? 0.5 : 0.14, 0.15, i * 0.12),
    ),
  lose: () => [392, 349, 311, 262].forEach((f, i) => tone('triangle', f, f * 0.97, 0.3, 0.25, i * 0.22)),
  star: (i: number) => tone('square', 784 * Math.pow(1.26, i), 784 * Math.pow(1.26, i), 0.2, 0.18),
  click: () => tone('square', 660, 660, 0.04, 0.1),
};

// Synthesized sound design — no audio files, works offline, instant.
// Every interaction has a designed sound: ticks, pops, chimes, whooshes.

let ctx = null;
let master = null;
let muted = localStorage.getItem('limber.sound') === '0';
let noiseBuf = null;

function ensure() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq = 440, end = freq, dur = 0.12, type = 'sine', vol = 0.5, delay = 0, attack = 0.004 }) {
  const c = ensure();
  if (!c || muted) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(end, 1), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise({ dur = 0.25, vol = 0.18, from = 800, to = 200, delay = 0 }) {
  const c = ensure();
  if (!c || muted) return;
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t0 = c.currentTime + delay;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 0.9;
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

export const sound = {
  setMuted(m) {
    muted = m;
    localStorage.setItem('limber.sound', m ? '0' : '1');
    if (master) master.gain.value = m ? 0 : 0.5;
  },
  get muted() { return muted; },

  // --- UI ---
  hover: () => tone({ freq: 760, end: 900, dur: 0.035, type: 'sine', vol: 0.10 }),
  click: () => { tone({ freq: 480, end: 640, dur: 0.06, type: 'triangle', vol: 0.28 }); },
  pop: () => tone({ freq: 300, end: 520, dur: 0.07, type: 'sine', vol: 0.3 }),
  toggle: () => tone({ freq: 620, end: 880, dur: 0.08, type: 'sine', vol: 0.25 }),
  whoosh: () => noise({ dur: 0.3, vol: 0.12, from: 900, to: 250 }),
  back: () => tone({ freq: 500, end: 320, dur: 0.07, type: 'triangle', vol: 0.22 }),
  error: () => { tone({ freq: 220, end: 180, dur: 0.14, type: 'square', vol: 0.12 }); },

  // --- player ---
  start: () => {
    tone({ freq: 523, dur: 0.12, type: 'sine', vol: 0.3 });
    tone({ freq: 659, dur: 0.12, type: 'sine', vol: 0.3, delay: 0.09 });
    tone({ freq: 784, dur: 0.2, type: 'sine', vol: 0.32, delay: 0.18 });
  },
  tick: () => tone({ freq: 880, end: 880, dur: 0.045, type: 'sine', vol: 0.22 }),
  go: () => { tone({ freq: 990, dur: 0.16, type: 'sine', vol: 0.3 }); },
  switchEx: () => noise({ dur: 0.22, vol: 0.1, from: 600, to: 180 }),
  breatheIn: () => tone({ freq: 330, end: 392, dur: 0.5, type: 'sine', vol: 0.06 }),
  breatheOut: () => tone({ freq: 392, end: 330, dur: 0.5, type: 'sine', vol: 0.06 }),
  done: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: 0.35, type: 'sine', vol: 0.3, delay: i * 0.11 }));
    noise({ dur: 0.5, vol: 0.08, from: 1200, to: 300, delay: 0.45 });
  },
  streak: () => {
    [392, 523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: 0.16, type: 'triangle', vol: 0.26, delay: i * 0.07 }));
  },
  levelUp: () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone({ freq: f, dur: 0.18, type: 'triangle', vol: 0.24, delay: i * 0.08 }));
    noise({ dur: 0.6, vol: 0.08, from: 1400, to: 400, delay: 0.5 });
  },
};

// tiny haptics helper (mobile)
export function buzz(pattern = 12) {
  try {
    if (localStorage.getItem('limber.vibrate') !== '0' && navigator.vibrate) navigator.vibrate(pattern);
  } catch { /* noop */ }
}

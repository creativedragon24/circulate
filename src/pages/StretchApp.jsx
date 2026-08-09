import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, EXERCISES, SESSIONS, ex as exById } from '../data/exercises.js';
import ExerciseImg from '../components/ExerciseImg.jsx';
import Confetti from '../components/Confetti.jsx';
import { Logo } from './Landing.jsx';
import { SoundToggle } from '../components/ui.jsx';
import { sound, buzz } from '../lib/sound.js';
import { store } from '../lib/store.js';

const ENCOURAGE = ['Breathe in…', 'And out…', 'You’ve got this.', 'Almost there…'];

const GENTLE_HINTS = {
  'neck-stretch': 'No pulling — let gravity lean your head.',
  'shoulder-rolls': 'Smaller circles. Still circles.',
  'arm-reach': 'Bend the elbows a little if shoulders say no.',
  'spinal-twist': 'Only as far as the seatbelt allows.',
  'wrist-stretch': 'Pull with the fingers only.',
  'ankle-circles': 'Slow, small circles — the size of a coin.',
  'knee-hug': 'No need to reach the chest. Every inch counts.',
  'hamstring': 'Bend the knee a little. Heels can stay down.',
  'chest-open': 'Hold a scarf between the hands.',
};

/* ================================================================ MOVE SHEET */
function MoveSheet({ id, onClose, onStart }) {
  const e = id ? exById(id) : null;
  const c = e ? CATEGORIES.find(x => x.id === e.cat) : null;
  const [gentle, setGentle] = useState(false);
  const [hold, setHold] = useState(e?.hold ?? 30);

  useEffect(() => {
    if (e) { setGentle(false); setHold(e.hold); }
  }, [id]);

  return (
    <AnimatePresence>
      {e && (
        <motion.div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => { sound.back(); onClose(); }} />
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] border border-line bg-paper shadow-lift md:rounded-[2rem]"
          >
            <div className="relative">
              <div className="overflow-hidden rounded-t-[2rem] md:rounded-none" style={{ background: c.soft }}>
                <ExerciseImg src={e.img} alt={e.name} className="aspect-[16/10] w-full" breathe />
              </div>
              <button onClick={() => { sound.back(); onClose(); }}
                className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-paper/90 text-lg shadow-pop backdrop-blur">✕</button>
              <span className="absolute right-4 top-4 rounded-full bg-paper/90 px-3 py-1 font-display text-[11px] font-extrabold uppercase tracking-wider shadow-pop" style={{ color: c.color }}>
                {c.emoji} {c.label}
              </span>
            </div>
            <div className="px-6 pb-8 pt-4">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-extrabold">{e.name}</h2>
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: `${c.color}1a`, color: c.color }}>
                  {e.side === 'both' ? 'both sides' : e.side === 'repeat' ? 'repeat' : 'hold'}
                </span>
              </div>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{e.blurb}</p>

              {/* gentle */}
              <div className={`mt-4 rounded-2xl border p-4 transition-colors ${gentle ? 'border-pink/40 bg-pink/10' : 'border-line'}`}>
                <button onClick={() => { sound.toggle(); buzz(8); setGentle(!gentle); }} className="flex w-full items-center justify-between">
                  <span className="font-display font-bold">🪶 Gentle mode</span>
                  <span className={`relative h-7 w-12 rounded-full transition-colors ${gentle ? 'bg-pink' : 'bg-line'}`}>
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${gentle ? 'left-6' : 'left-1'}`} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {gentle && (
                    <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <span className="mt-3 block text-sm font-semibold leading-relaxed text-ink">{e.gentle}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* tips */}
              <ul className="mt-4 space-y-2">
                {e.tips.map(t => (
                  <li key={t} className="flex gap-2.5 text-sm leading-relaxed text-ink">
                    <span className="mt-0.5 text-teal">✓</span>{t}
                  </li>
                ))}
              </ul>

              {/* hold stepper */}
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-line p-4">
                <p className="font-display font-bold">Hold</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => { sound.click(); setHold(h => Math.max(10, h - 5)); }} className="press h-9 w-9 rounded-full border border-line bg-paper text-base font-bold">−</button>
                  <span className="w-14 text-center font-display text-xl font-extrabold">{hold}s</span>
                  <button onClick={() => { sound.click(); setHold(h => Math.min(120, h + 5)); }} className="press h-9 w-9 rounded-full border border-line bg-paper text-base font-bold">+</button>
                </div>
              </div>

              <button
                onClick={() => { sound.start(); buzz(20); onStart([[e.id, hold, gentle]], e.name); }}
                className="press mt-5 w-full rounded-full py-4 font-display text-lg font-extrabold text-white shadow-lift"
                style={{ background: c.color }}
              >
                ▶ Stretch {gentle ? '· gentle' : ''}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================ SETTINGS MODAL */
function SettingsModal({ onClose, onReset }) {
  const [vib, setVib] = useState(localStorage.getItem('limber.vibrate') !== '0');
  return (
    <motion.div className="fixed inset-0 z-[75] flex items-end justify-center md:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => { sound.back(); onClose(); }} />
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-sm rounded-t-[2rem] border border-line bg-paper p-6 shadow-lift md:rounded-[2rem]"
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-extrabold">Settings</p>
          <button onClick={() => { sound.back(); onClose(); }} className="press flex h-9 w-9 items-center justify-center rounded-full border border-line text-base">✕</button>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-line p-4">
            <p className="font-display font-bold text-sm">📳 Haptics</p>
            <button onClick={() => { const n = !vib; setVib(n); localStorage.setItem('limber.vibrate', n ? '1' : '0'); sound.toggle(); }}
              className={`relative h-7 w-12 rounded-full transition-colors ${vib ? 'bg-teal' : 'bg-line'}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${vib ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <p className="px-1 text-xs leading-relaxed text-ink-soft">
            🔒 Everything lives on this device. No account, no server, no tracking.
          </p>
          <button onClick={() => { if (confirm('Reset your streak and minutes? This cannot be undone.')) { sound.error(); onReset(); onClose(); } }}
            className="press w-full rounded-full border border-coral/40 py-2.5 font-display text-sm font-bold text-coral">
            Reset everything
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ================================================================ PLAYER */
const PHASE = { READY: 'ready', HOLD: 'hold', NEXT: 'next', DONE: 'done' };

function Player({ session, onExit }) {
  const queue = useMemo(() => session.queue.map(([id, hold, gentle]) => ({ e: exById(id), hold, gentle })), [session]);
  const [i, setI] = useState(0);
  const [side, setSide] = useState(0);
  const [phase, setPhase] = useState(PHASE.READY);
  const [left, setLeft] = useState(3);
  const [paused, setPaused] = useState(false);
  const [msg, setMsg] = useState(0);
  const [burst, setBurst] = useState(0);
  const [done, setDone] = useState(null);
  const startedAt = useRef(null);

  const cur = queue[i];
  const c = CATEGORIES.find(x => x.id === cur.e.cat);
  const startHold = () => { setLeft(cur.hold); setPhase(PHASE.HOLD); sound.go(); buzz(15); };

  const totalEx = queue.reduce((n, x) => n + (x.e.side === 'both' ? 2 : 1), 0);
  const doneEx = queue.slice(0, i).reduce((n, x) => n + (x.e.side === 'both' ? 2 : 1), 0) + (side === 1 ? 1 : 0);

  const advance = () => {
    const e = queue[i].e;
    if (e.side === 'both' && side === 0) { setSide(1); setPhase(PHASE.NEXT); return; }
    if (i + 1 < queue.length) { setI(i + 1); setSide(0); setPhase(PHASE.NEXT); return; }
    finish();
  };
  const finish = () => {
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    const res = store.addSession({ minutes, routine: session.name, exCount: totalEx });
    setDone({ minutes, res, exCount: totalEx });
    setPhase(PHASE.DONE);
    sound.done();
    buzz([30, 40, 30, 40, 80]);
    setBurst(b => b + 1);
    if (res.celebrated) setTimeout(() => sound.streak(), 900);
    window.dispatchEvent(new Event('limber:stats'));
  };

  useEffect(() => {
    if (phase === PHASE.READY) {
      setLeft(3);
      const id = setInterval(() => setLeft(v => {
        if (v <= 1) { clearInterval(id); startHold(); return 0; }
        sound.tick(); buzz(8); return v - 1;
      }), 1000);
      return () => clearInterval(id);
    }
    if (phase === PHASE.NEXT) {
      sound.switchEx();
      const id = setTimeout(startHold, 3400);
      return () => clearTimeout(id);
    }
    if (phase === PHASE.HOLD && !paused) {
      const id = setInterval(() => setLeft(v => {
        if (v <= 1) { clearInterval(id); advance(); return 0; }
        if (v === 5 || v === 4) { sound.tick(); buzz(8); }
        if (v % 10 === 0) setMsg(m => (m + 1) % ENCOURAGE.length);
        return v - 1;
      }), 1000);
      return () => clearInterval(id);
    }
  }, [phase, paused, i, side]);

  useEffect(() => { startedAt.current ??= Date.now(); }, []);

  const R = 132, CIRC = 2 * Math.PI * R;
  const pct = phase === PHASE.HOLD ? 1 - left / cur.hold : 0;
  const gentleHint = cur.gentle ? GENTLE_HINTS[cur.e.id] : null;

  const unit = 1 / queue.length;
  const overallPct = Math.min(1, Math.max(0,
    i * unit +
    (cur.e.side === 'both' ? side * 0.5 * unit : 0) +
    (phase === PHASE.HOLD ? 0.5 * unit * (1 - left / cur.hold) : 0)
  ));

  return (
    <motion.div
      initial={{ opacity: 0, rotateX: -35, scale: 1.04, transformPerspective: 1200 }}
      animate={{ opacity: 1, rotateX: 0, scale: 1 }}
      exit={{ opacity: 0, rotateX: 30, scale: 0.96, transformPerspective: 1200 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[80] flex flex-col bg-ink text-cream"
    >
      <Confetti run={burst} />

      {/* session progress bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-cream/10">
        <div className="h-full rounded-r-full bg-gradient-to-r from-teal to-lime transition-[width] duration-1000 ease-linear" style={{ width: `${overallPct * 100}%` }} />
      </div>

      <div className="flex items-center justify-between px-5 pt-5">
        <button onClick={() => { sound.back(); onExit(); }} className="press flex h-11 w-11 items-center justify-center rounded-full border border-cream/15 text-lg">✕</button>
        <div className="text-center">
          <p className="font-display text-sm font-extrabold">{session.name}</p>
          <p className="text-xs text-cream/50">move {Math.min(doneEx + 1, totalEx)} of {totalEx}</p>
        </div>
        <SoundToggle className="border-cream/15! bg-transparent!" />
      </div>

      <div className="flex justify-center gap-1.5 px-5 pt-3">
        {Array.from({ length: queue.length }).map((_, j) => (
          <span key={j} className={`h-1.5 rounded-full transition-all ${j < i ? 'w-6 bg-teal' : j === i ? 'w-8 bg-cream' : 'w-1.5 bg-cream/25'}`} />
        ))}
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-5">
        {phase === PHASE.DONE ? (
          <div className="w-full max-w-sm text-center">
            <motion.p initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }} className="text-6xl">🎉</motion.p>
            <h2 className="mt-3 font-display text-3xl font-extrabold">Landing felt better already.</h2>
            {done.res.celebrated && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber/15 px-4 py-2 font-display text-sm font-extrabold text-amber">
                🔥 {done.res.stats.streak}-day streak
              </p>
            )}
            <p className="mt-4 text-sm text-cream/60">{done.minutes} min · {done.exCount} moves</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => { sound.back(); onExit(); }} className="press rounded-full bg-cream px-7 py-3 font-display font-extrabold text-ink">Done</button>
              <button onClick={() => { setI(0); setSide(0); setPhase(PHASE.READY); startedAt.current = Date.now(); sound.start(); }}
                className="press rounded-full border border-cream/25 px-7 py-3 font-display font-extrabold">Again</button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              <svg width="300" height="300" viewBox="0 0 300 300" className="-rotate-90">
                <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <circle cx="150" cy="150" r={R} fill="none" stroke={c.color} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct)} style={{ transition: paused ? 'none' : 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {phase === PHASE.READY ? (
                  <span className="font-display text-7xl font-extrabold" style={{ color: c.color }}>{left}</span>
                ) : phase === PHASE.NEXT ? (
                  <div className="w-52 text-center">
                    <ExerciseImg src={cur.e.img} alt={cur.e.name} className="mx-auto aspect-[4/3] w-44 rounded-2xl" breathe />
                    <p className="mt-2 font-display text-sm font-extrabold text-cream/80">get into position…</p>
                  </div>
                ) : (
                  <div className="w-52 overflow-hidden rounded-2xl">
                    <ExerciseImg src={cur.e.img} alt={cur.e.name} className="aspect-[4/3] w-full" breathe={!paused} />
                  </div>
                )}
              </div>
            </div>

            <p className="mt-1 font-display text-lg font-extrabold">{phase === PHASE.NEXT ? cur.e.name : cur.e.name}</p>
            <div className="mt-1 flex items-center gap-2 text-sm text-cream/60">
              <span className="rounded-full px-3 py-1 font-bold" style={{ background: `${c.color}33`, color: c.color }}>
                {cur.e.side === 'both' ? (side === 0 ? 'side 1' : 'side 2 →') : cur.e.side === 'repeat' ? 'repeat' : 'hold'}
              </span>
              <span>{gentleHint ? `🪶 ${gentleHint}` : phase === PHASE.HOLD ? `“${ENCOURAGE[msg % ENCOURAGE.length]}”` : ''}</span>
            </div>

            <p className="mt-2 font-display text-6xl font-extrabold tabular-nums">
              {phase === PHASE.NEXT ? '—' : Math.max(left, 0)}
            </p>
          </>
        )}
      </div>

      {phase !== PHASE.DONE && (
        <div className="flex items-center justify-center gap-6 pb-10 pt-2">
          <button onClick={() => { sound.whoosh(); if (side === 1) setSide(0); else if (i > 0) { setI(i - 1); setSide(queue[i - 1].e.side === 'both' ? 1 : 0); } setPhase(PHASE.NEXT); }}
            disabled={i === 0 && side === 0}
            className="press flex h-12 w-12 items-center justify-center rounded-full border border-cream/15 text-lg disabled:opacity-25">⏮</button>
          <button onClick={() => { setPaused(!paused); paused ? sound.start() : sound.click(); }}
            className="press flex h-16 w-16 items-center justify-center rounded-full bg-cream text-2xl text-ink shadow-lift">
            {paused ? '▶' : '⏸'}
          </button>
          <button onClick={() => { sound.whoosh(); advance(); }} className="press flex h-12 w-12 items-center justify-center rounded-full border border-cream/15 text-lg">⏭</button>
        </div>
      )}
    </motion.div>
  );
}

/* ================================================================ HOME */
function Home({ onStartSession, onOpenEx, streak, weekMin }) {
  const main = SESSIONS[0];
  const others = SESSIONS.slice(1);
  const mins = main.items.reduce((s, [_, h]) => s + h, 0) / 60;

  return (
    <div className="mx-auto max-w-3xl px-5 pb-14 pt-6">
      {/* hero card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2rem] border border-line bg-paper shadow-pop">
        <img src="img/window-sky.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" draggable={false} />
        <div className="relative flex flex-col items-center px-6 py-10 text-center">
          <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-ink-soft">In your seat · no seatmate required</p>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => { sound.start(); buzz(20); onStartSession(main.id); }}
            aria-label="Start In-Flight Reset"
            className="press relative mt-6 flex h-40 w-40 items-center justify-center rounded-full shadow-lift"
            style={{ background: 'linear-gradient(135deg,#FF6B5B,#FFB84D)' }}
          >
            <span className="absolute inset-0 animate-ping rounded-full opacity-20" style={{ background: 'linear-gradient(135deg,#FF6B5B,#FFB84D)' }} />
            <span className="relative flex h-36 w-36 flex-col items-center justify-center rounded-full bg-paper shadow-inner">
              <span className="text-4xl">▶</span>
              <span className="mt-1 font-display text-lg font-extrabold">Start</span>
            </span>
          </motion.button>
          <p className="mt-5 font-display text-2xl font-extrabold">{main.name}</p>
          <p className="mt-1 text-sm font-semibold text-ink-soft">{Math.round(mins)} min · {main.items.length} moves · gentle mode included</p>
          <p className="mt-4 text-xs font-bold text-ink-soft/80">🔥 {streak}-day streak · {weekMin} min this week</p>
        </div>
      </motion.div>

      {/* other sessions */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {others.map((s, i) => (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
            onClick={() => { sound.pop(); buzz(10); onStartSession(s.id); }}
            className="press rounded-2xl border border-line bg-paper p-4 text-left shadow-pop hover:shadow-lift"
          >
            <span className="text-2xl">{s.emoji}</span>
            <p className="mt-1.5 font-display font-extrabold">{s.name}</p>
            <p className="text-xs font-semibold text-ink-soft">{s.minutes} min · {s.items.length} moves</p>
          </motion.button>
        ))}
      </div>

      {/* all moves */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-extrabold">All moves</p>
          <p className="text-xs font-semibold text-ink-soft">tap one to go solo</p>
        </div>
        <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
          {EXERCISES.map((e, i) => {
            const c = CATEGORIES.find(x => x.id === e.cat);
            return (
              <motion.button
                key={e.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}
                onClick={() => { sound.pop(); buzz(8); onOpenEx(e.id); }}
                className="press w-32 shrink-0 overflow-hidden rounded-2xl border border-line bg-paper text-left shadow-pop"
              >
                <div className="relative overflow-hidden" style={{ background: c.soft }}>
                  <ExerciseImg src={e.img} alt={e.name} className="aspect-[4/3] w-full" />
                  <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-paper" style={{ background: c.color }} />
                </div>
                <p className="truncate px-2 py-1.5 font-display text-xs font-bold">{e.name}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================ PAGE */
export default function StretchApp() {
  const [session, setSession] = useState(null);
  const [openEx, setOpenEx] = useState(null);
  const [settings, setSettings] = useState(false);
  const [streak, setStreak] = useState(store.stats().streak);
  const [weekMin, setWeekMin] = useState(store.weekMinutes());

  useEffect(() => {
    const pending = sessionStorage.getItem('limber.openEx');
    if (pending) { sessionStorage.removeItem('limber.openEx'); setOpenEx(pending); }
  }, []);

  useEffect(() => {
    const sync = () => { setStreak(store.stats().streak); setWeekMin(store.weekMinutes()); };
    window.addEventListener('limber:stats', sync);
    return () => window.removeEventListener('limber:stats', sync);
  }, []);

  const startSession = sid => {
    const s = SESSIONS.find(x => x.id === sid);
    setSession({ queue: s.items.map(([id, h]) => [id, h, false]), name: s.name });
  };

  return (
    <div className="min-h-screen">
      {/* header */}
      <header className="sticky top-0 z-40 glass">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="font-display text-lg font-extrabold tracking-tight">Limber</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 shadow-pop">
              <span>🔥</span><span className="font-display text-sm font-extrabold">{streak}</span>
              <span className="hidden text-[11px] font-semibold text-ink-soft sm:block">day{streak === 1 ? '' : 's'}</span>
            </span>
            <SoundToggle />
            <button onClick={() => { sound.click(); setSettings(true); }} aria-label="Settings"
              className="press flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-base shadow-pop">⚙️</button>
          </div>
        </div>
      </header>

      <Home onStartSession={startSession} onOpenEx={setOpenEx} streak={streak} weekMin={weekMin} />

      <MoveSheet id={openEx} onClose={() => setOpenEx(null)} onStart={(queue, name) => { setOpenEx(null); setSession({ queue, name }); }} />
      <AnimatePresence>
        {settings && <SettingsModal onClose={() => setSettings(false)} onReset={() => { store.reset(); setStreak(0); setWeekMin(0); }} />}
        {session && <Player session={session} onExit={() => setSession(null)} />}
      </AnimatePresence>
    </div>
  );
}

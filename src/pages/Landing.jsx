import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { CATEGORIES, EXERCISES } from '../data/exercises.js';
import ExerciseImg from '../components/ExerciseImg.jsx';
import Tilt from '../components/Tilt.jsx';
import SeatToy from '../components/SeatToy.jsx';
import Confetti from '../components/Confetti.jsx';
import { SoundToggle, Reveal, Spark } from '../components/ui.jsx';
import { sound, buzz } from '../lib/sound.js';

const openApp = () => { sound.whoosh(); setTimeout(() => { window.location.hash = '#/app'; }, 120); };
const openExercise = id => {
  sessionStorage.setItem('limber.openEx', id);
  sound.whoosh();
  setTimeout(() => { window.location.hash = '#/app'; }, 120);
};

/* ================================================================ NAV */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? 'glass shadow-pop' : ''}`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#/" className="flex items-center gap-2.5" onClick={() => sound.click()}>
          <Logo />
          <span className="font-display text-lg font-extrabold tracking-tight">Limber</span>
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {[['#moves', 'Moves'], ['#try', 'Try it'], ['#/app', 'App']].map(([href, label]) => (
            <a key={href} href={href} className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
              onMouseEnter={() => sound.hover()}>{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <SoundToggle />
          <button onClick={openApp} className="press hidden rounded-full bg-ink px-5 py-2.5 font-display text-sm font-bold text-cream shadow-pop sm:block">
            Open app
          </button>
        </div>
      </div>
    </motion.header>
  );
}

export function Logo({ size = 34 }) {
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
        <defs>
          <linearGradient id="lg-logo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FF6B5B" /><stop offset="0.55" stopColor="#FFB84D" />
            <stop offset="1" stopColor="#7B61FF" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#lg-logo)" />
        <circle cx="20" cy="14" r="4.6" fill="#fff" />
        <path d="M20 20c-2 4-4 6-7 6h14c-3 0-5-2-7-6z" fill="#fff" opacity="0.96" />
        <path d="M15 20l-3.5-4M25 20l3.5-4" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity="0.9" />
      </svg>
    </span>
  );
}

/* ================================================================ HERO — 3D scroll */
const FAN = [
  { id: 'neck-stretch', rot: 16, z: -46, side: true },
  { id: 'arm-reach', rot: 0, z: 0, side: false },
  { id: 'spinal-twist', rot: -16, z: -46, side: true },
];

function HeroFan() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[540px] select-none" style={{ perspective: 1200 }}>
      <div className="absolute inset-0 -z-10 scale-110 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle at 35% 25%, rgba(91,155,255,.4), transparent 55%), radial-gradient(circle at 70% 80%, rgba(255,107,91,.4), transparent 55%)' }} />

      {/* idle 3D sway */}
      <div className="animate-sway3d absolute inset-0">
        {FAN.map((f, i) => {
          const e = EXERCISES.find(x => x.id === f.id);
          const c = CATEGORIES.find(x => x.id === e.cat);
          return (
            <div key={f.id} className="absolute inset-0 z3" style={{ transform: `rotateY(${f.rot}deg) translateZ(${f.z}px)` }}>
              <motion.div
                initial={{ opacity: 0, y: 46, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.16, duration: 0.7, ease: [0.21, 0.65, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Tilt max={f.side ? 14 : 20} scale={f.side ? 1.0 : 1.04} glare={!f.side} className="h-full">
                  <button
                    onClick={() => { sound.pop(); buzz(8); openExercise(e.id); }}
                    onMouseEnter={() => sound.hover()}
                    className={`press flex h-full w-full flex-col items-center rounded-[2rem] border border-line bg-paper p-4 shadow-lift ${f.side ? 'pt-6' : ''}`}
                  >
                    <div className="flex w-full flex-1 items-center justify-center overflow-hidden rounded-2xl"
                      style={{ background: c.soft }}>
                      <ExerciseImg src={e.img} alt={e.name} className="h-full w-full" />
                    </div>
                    <p className="mt-2.5 font-display text-base font-extrabold">{e.name}</p>
                    <p className="text-xs font-semibold" style={{ color: c.color }}>{e.hold}s · in your seat</p>
                  </button>
                </Tilt>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** tap the window → seatbelt light ding */
function WindowWidget() {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => { setOn(!on); on ? sound.back() : sound.start(); buzz(10); }}
      className="group relative block h-28 w-28 rounded-full border-[7px] border-[#B9C4D4] bg-[#DFE7F2] shadow-pop transition-transform hover:scale-105 active:scale-95"
      aria-label="Tap the window"
      title="Tap the window"
    >
      <img src="img/window-sky.webp" alt="Clouds outside the window" className="h-full w-full rounded-full object-cover" draggable={false} />
      <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider transition-all ${on ? 'bg-amber text-ink opacity-100' : 'bg-ink/60 text-transparent opacity-60'}`}
        style={{ boxShadow: on ? '0 0 14px rgba(255,184,77,.9)' : 'none' }}>
        {on ? 'FASTEN SEATBELT' : '··'}
      </span>
      <span className={`pointer-events-none absolute inset-0 rounded-full ${on ? 'animate-ping bg-amber/30' : ''}`} />
    </button>
  );
}

function Hero() {
  const ref = useRef(null);
  // ---- 3D scroll: the whole hero tilts back and recedes as you scroll ----
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const heroRotX = useTransform(scrollYProgress, [0, 1], [0, 22]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const heroOp = useTransform(scrollYProgress, [0, 0.65], [1, 0.1]);
  const heroTransform = useMotionTemplate`perspective(1300px) rotateX(${heroRotX}deg) scale(${heroScale})`;

  // little plane that flies across on scroll
  const planeX = useTransform(scrollYProgress, [0, 1], ['-8vw', '108vw']);
  const planeRot = useTransform(scrollYProgress, [0, 1], [-6, 10]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-32 pb-10 sm:pt-36">
      {/* parallax blobs */}
      <motion.div className="pointer-events-none absolute inset-0 -z-10" style={{ y: useTransform(scrollYProgress, [0, 1], [0, 260]), opacity: useTransform(scrollYProgress, [0, 0.8], [1, 0]) }}>
        <div className="animate-blob absolute -left-32 top-8 h-96 w-96 rounded-full opacity-50" style={{ background: 'radial-gradient(circle, #FFE9E4, transparent 65%)' }} />
        <div className="animate-blob-slow absolute -right-24 top-40 h-[26rem] w-[26rem] rounded-full opacity-60" style={{ background: 'radial-gradient(circle, #E6F0FF, transparent 65%)' }} />
        <Spark x={10} y={24} size={16} /><Spark x={88} y={34} size={20} color="#FFB84D" />
      </motion.div>

      {/* flying plane (scroll-linked) */}
      <motion.div className="pointer-events-none absolute top-24 z-20 text-4xl" style={{ x: planeX, rotate: planeRot }}>
        ✈️
      </motion.div>

      <motion.div
        className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-[1fr_1.05fr]"
        style={{ transform: heroTransform, y: heroY, opacity: heroOp, transformStyle: 'preserve-3d' }}
      >
        <div className="text-center lg:text-left">
          <Reveal>
            <h1 className="display-xl text-balance text-[3.4rem] leading-[0.94] sm:text-7xl lg:text-[5rem]">
              Stretch at
              <br />
              <em className="text-shine font-black not-italic">35,000 ft.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-5 max-w-sm text-balance text-lg text-ink-soft lg:mx-0">
              The in-flight stretch break. All in your seat, no seatmate required.
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <button onClick={() => { sound.start(); buzz(); openApp(); }}
                className="press rounded-full bg-ink px-8 py-4 font-display text-base font-bold text-cream shadow-lift">
                Start the flight reset
              </button>
              <button onClick={() => { sound.click(); document.querySelector('#try')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="press rounded-full border border-line bg-paper px-8 py-4 font-display text-base font-bold text-ink shadow-pop">
                Play with it ↓
              </button>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <div className="mt-6 flex items-center justify-center gap-4 lg:justify-start">
              <WindowWidget />
              <p className="max-w-[140px] text-left text-[11px] font-semibold text-ink-soft/70">
                Tap the window. It’s a button. Obviously.
              </p>
            </div>
          </Reveal>
        </div>
        <HeroFan />
      </motion.div>

      {/* marquee */}
      <div className="mt-12 border-y border-line bg-paper/70 py-3 backdrop-blur">
        <div className="marquee overflow-hidden">
          {[0, 1].map(k => (
            <div key={k} className="flex shrink-0 items-center gap-10">
              {['In your seat', 'Free forever', 'Works offline', 'No seatmate required', '5-minute breaks', 'Gentle mode'].map(x => (
                <span key={x} className="flex items-center gap-10 font-display text-sm font-bold uppercase tracking-[0.12em] text-ink/70">
                  {x} <span className="text-sky">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================ MOVES */
function Moves() {
  return (
    <section id="moves" className="mx-auto max-w-6xl px-5 py-20">
      <div className="mb-8 text-center">
        <Reveal>
          <h2 className="display-xl text-4xl sm:text-5xl">9 moves. All in your seat.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-3 text-ink-soft">Designed for row 27C. Tap any card to try it.</p>
        </Reveal>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {EXERCISES.map((e, i) => {
          const c = CATEGORIES.find(x => x.id === e.cat);
          return (
            <motion.button
              key={e.id}
              initial={{ opacity: 0, rotateX: -40, y: 60 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.07, ease: [0.21, 0.65, 0.36, 1] }}
              onClick={() => { sound.pop(); buzz(8); openExercise(e.id); }}
              onMouseEnter={() => sound.hover()}
              className="group overflow-hidden rounded-3xl border border-line bg-paper p-3 text-left shadow-pop transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="relative overflow-hidden rounded-2xl" style={{ background: c.soft }}>
                <ExerciseImg src={e.img} alt={e.name} className="aspect-[4/3] w-full" />
                <span className="absolute right-2 top-2 rounded-full bg-paper/90 px-2 py-0.5 text-[10px] font-bold" style={{ color: c.color }}>
                  {c.emoji} {c.label}
                </span>
              </div>
              <p className="mt-2.5 px-1 font-display text-sm font-bold">{e.name}</p>
              <p className="px-1 pb-1 text-[11px] font-medium text-ink-soft">{e.hold}s · {e.side === 'both' ? 'both sides' : e.side}</p>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

/* ================================================================ TRY IT (interactive toy) */
function TryIt() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const rotX = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [28, 0, 0, -18]);
  const transform = useMotionTemplate`perspective(1200px) rotateX(${rotX}deg)`;

  return (
    <section id="try" className="mx-auto max-w-6xl overflow-hidden px-5 py-20">
      <div className="text-center">
        <Reveal>
          <h2 className="display-xl text-4xl sm:text-5xl">Stretch the passenger.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-3 text-ink-soft">(Don’t actually. This one is a toy. Drag the slider.)</p>
        </Reveal>
      </div>
      <Reveal delay={0.15} className="mt-10 flex justify-center">
        <motion.div ref={ref} style={{ transform }}>
          <SeatToy />
        </motion.div>
      </Reveal>
    </section>
  );
}

/* ================================================================ CTA + FOOTER */
function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-center shadow-lift">
          <img src="img/window-sky.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" draggable={false} />
          <div className="relative">
            <p className="font-display text-4xl font-extrabold text-cream sm:text-5xl">
              Your seatbelt sign is off.<br /><span className="text-shine">Your muscles are not.</span>
            </p>
            <div className="mt-8 flex justify-center">
              <button onClick={openApp} className="press rounded-full bg-cream px-8 py-3.5 font-display text-base font-bold text-ink shadow-pop">
                Open Limber — free
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 py-8 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <Logo size={26} />
          <p className="text-sm font-bold">Limber</p>
        </div>
        <p className="text-xs text-ink-soft">Free forever · No account · Made at 35,000 ft 🫠</p>
        <SoundToggle />
      </div>
    </footer>
  );
}

/* ================================================================ PAGE */
export default function Landing() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />
      <Moves />
      <TryIt />
      <Cta />
      <Footer />
    </div>
  );
}

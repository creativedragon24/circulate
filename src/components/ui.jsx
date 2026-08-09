import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { sound } from '../lib/sound.js';

/* ---------------------------------------------------------- Sound toggle */
export function SoundToggle({ className = '' }) {
  const [on, setOn] = useState(!sound.muted);
  useEffect(() => {
    const sync = () => setOn(!sound.muted);
    window.addEventListener('limber:soundchange', sync);
    return () => window.removeEventListener('limber:soundchange', sync);
  }, []);
  return (
    <button
      aria-label={on ? 'Mute sounds' : 'Unmute sounds'}
      className={`press flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-lg shadow-pop ${className}`}
      onClick={() => {
        const next = !on;
        sound.setMuted(!next);
        setOn(next);
        if (next) sound.toggle();
      }}
    >
      {on ? '🔊' : '🔇'}
    </button>
  );
}

/* ---------------------------------------------------------- Reveal on scroll */
export function Reveal({ children, delay = 0, y = 26, className = '', once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.65, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------------------------------------- Section heading */
export function SectionHead({ kicker, title, sub, tone = '#FF6B5B' }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <Reveal>
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-display text-xs font-bold uppercase tracking-[0.14em]"
          style={{ color: tone, background: `${tone}18` }}
        >
          {kicker}
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="display-xl mt-5 text-balance text-4xl text-ink sm:text-5xl">{title}</h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.16}>
          <p className="mt-4 text-balance text-lg text-ink-soft">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- Pill chip */
export function Pill({ children, active, onClick, tone = '#FF6B5B' }) {
  return (
    <button
      onClick={() => { sound.click(); onClick?.(); }}
      className={`press rounded-full px-4 py-2 font-display text-sm font-semibold transition-colors ${
        active ? 'text-white' : 'bg-paper text-ink-soft border border-line hover:text-ink'
      }`}
      style={active ? { background: tone } : undefined}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------- Star field (tiny SVG sparks) */
export function Spark({ x, y, size = 14, color = '#FFB84D', className = '' }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" className={className}
      style={{ position: 'absolute', left: `${x}%`, top: `${y}%` }} aria-hidden
    >
      <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill={color} />
    </svg>
  );
}

/* ---------------------------------------------------------- Difficulty dots */
export function DiffDots({ diff }) {
  return (
    <span className="inline-flex items-center gap-1" title={`Difficulty ${diff}/3`}>
      {[1, 2, 3].map(d => (
        <span key={d} className="h-1.5 w-1.5 rounded-full" style={{ background: d <= diff ? '#FF6B5B' : '#E5E0D4' }} />
      ))}
    </span>
  );
}

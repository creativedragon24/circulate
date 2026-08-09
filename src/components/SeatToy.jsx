import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { sound } from '../lib/sound.js';

const INK = '#33375C';
const SKIN = '#F2B48F';
const HAIR = '#54423A';
const PANTS = '#3E4368';
const SHIRT = '#FF6B5B';
const SEAT = '#C9D4E3';

const MSGS = [
  'Nice. The seatmate is impressed.',
  'You’re basically a yoga influencer now.',
  'The clouds are watching. They approve.',
  'This is the most exercise this seat has ever seen.',
  'Perfect form. 10/10. No notes.',
];

/**
 * neal.fun-style interactive toy: drag the slider to stretch the passenger.
 * The figure is parametric SVG — arms rotate with the slider, head tilts.
 */
export default function SeatToy() {
  const [a, setA] = useState(0);            // 0..1 stretch amount
  const [msg, setMsg] = useState(0);
  const lastTick = useRef(0);

  // arm group rotates around the shoulder (drawn pointing down at a=0)
  const armRot = a * 150;                    // 0 → 150° (arms overhead)
  const headTilt = a * 26;
  const wow = a > 0.88;

  const onChange = v => {
    const now = Date.now();
    if (now - lastTick.current > 60) {
      sound.tick();
      lastTick.current = now;
    }
    setA(v);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-paper p-6 shadow-lift">
        <div className="flex justify-center">
          <svg width="300" height="250" viewBox="0 0 300 250" aria-label="Interactive stretch toy">
            {/* floor */}
            <ellipse cx="150" cy="238" rx="120" ry="7" fill="rgba(43,46,74,0.08)" />

            {/* seat */}
            <rect x="88" y="120" width="124" height="26" rx="10" fill={SEAT} stroke={INK} strokeWidth="4" />
            <rect x="76" y="52" width="26" height="108" rx="12" fill={SEAT} stroke={INK} strokeWidth="4" />
            <line x1="84" y1="120" x2="84" y2="152" stroke={INK} strokeWidth="4" strokeLinecap="round" />
            <line x1="216" y1="120" x2="216" y2="152" stroke={INK} strokeWidth="4" strokeLinecap="round" />

            {/* legs (static, seated) */}
            <line x1="150" y1="142" x2="150" y2="190" stroke={INK} strokeWidth="17" strokeLinecap="round" />
            <line x1="150" y1="142" x2="150" y2="190" stroke={PANTS} strokeWidth="10" strokeLinecap="round" />
            <line x1="150" y1="188" x2="126" y2="232" stroke={INK} strokeWidth="14" strokeLinecap="round" />
            <line x1="150" y1="188" x2="126" y2="232" stroke={SKIN} strokeWidth="8" strokeLinecap="round" />
            <circle cx="124" cy="236" r="7" fill={INK} /><circle cx="124" cy="236" r="4.5" fill={SKIN} />

            {/* torso (rotates slightly forward with stretch) */}
            <g transform={`rotate(${a * 8} 150 142)`}>
              <line x1="150" y1="142" x2="150" y2="96" stroke={INK} strokeWidth="21" strokeLinecap="round" />
              <line x1="150" y1="142" x2="150" y2="96" stroke={SHIRT} strokeWidth="14" strokeLinecap="round" />
            </g>

            {/* head (tilts with stretch) */}
            <g transform={`rotate(${headTilt} 150 96)`}>
              <line x1="150" y1="96" x2="150" y2="84" stroke={INK} strokeWidth="9" strokeLinecap="round" />
              <line x1="150" y1="96" x2="150" y2="84" stroke={SKIN} strokeWidth="6" strokeLinecap="round" />
              <circle cx="150" cy="66" r="17" fill={INK} />
              <circle cx="150" cy="66" r="14" fill={SKIN} />
              <path d="M 135 60 A 16 17 0 0 1 165 60" fill="none" stroke={HAIR} strokeWidth="6" strokeLinecap="round" />
            </g>

            {/* arm (rotates up with slider) */}
            <g transform={`rotate(${-armRot} 150 100)`}>
              <line x1="150" y1="100" x2="150" y2="146" stroke={INK} strokeWidth="15" strokeLinecap="round" />
              <line x1="150" y1="100" x2="150" y2="146" stroke={SHIRT} strokeWidth="9" strokeLinecap="round" />
              <line x1="150" y1="146" x2="146" y2="178" stroke={INK} strokeWidth="12" strokeLinecap="round" />
              <line x1="150" y1="146" x2="146" y2="178" stroke={SKIN} strokeWidth="7" strokeLinecap="round" />
              <circle cx="145" cy="181" r="6.5" fill={INK} /><circle cx="145" cy="181" r="4" fill={SKIN} />
            </g>

            {/* sparkle when fully stretched */}
            {wow && (
              <g>
                <path d="M 216 78 l 3.4 11.8 11.8 3.4 -11.8 3.4 -3.4 11.8 -3.4 -11.8 -11.8 -3.4 11.8 -3.4 z" fill="#FFB84D" />
                <path d="M 96 180 l 2.6 9 9 2.6 -9 2.6 -2.6 9 -2.6 -9 -9 -2.6 9 -2.6 z" fill="#2EC4B6" />
              </g>
            )}
          </svg>
        </div>

        <p className="mt-3 h-6 text-center text-sm font-bold text-ink-soft">
          {wow ? '✨ ' + MSGS[msg % MSGS.length] : 'Drag to stretch the passenger →'}
        </p>

        {/* slider */}
        <div className="mt-3 flex items-center gap-3 px-2">
          <span className="text-lg">😌</span>
          <input
            type="range" min="0" max="100" value={Math.round(a * 100)} aria-label="Stretch amount"
            onChange={e => onChange(parseInt(e.target.value) / 100)}
            onPointerUp={() => { if (a > 0.88) { setMsg(m => m + 1); sound.pop(); } }}
            className="limber-slider w-full"
          />
          <span className="text-lg">🤸</span>
        </div>

        <div className="mt-4 flex justify-center">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => { sound.start(); window.location.hash = '#/app'; }}
            className="press rounded-full bg-ink px-6 py-2.5 font-display text-sm font-bold text-cream shadow-pop"
          >
            Try the real session →
          </motion.button>
        </div>
      </div>
    </div>
  );
}

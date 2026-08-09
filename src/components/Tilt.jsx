import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';

/**
 * 3D mouse-tilt card. Transform is built with useMotionTemplate so the
 * perspective is baked into the element itself — works anywhere.
 * max: degrees of tilt (0–40). scale: hover scale.
 */
export default function Tilt({ children, className = '', max = 16, scale = 1.03, glare = false }) {
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 190, damping: 22, mass: 0.6 });
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 190, damping: 22, mass: 0.6 });
  const transform = useMotionTemplate`perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  const glareBg = useTransform([mx, my], ([x, y]) =>
    `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.38), transparent 60%)`);

  const onMove = useCallback(e => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }, [mx, my]);

  const onLeave = useCallback(() => { mx.set(0.5); my.set(0.5); }, [mx, my]);

  return (
    <div ref={ref} className="relative" onMouseMove={onMove} onMouseLeave={onLeave}>
      <motion.div
        className={`tilt-card relative ${className}`}
        style={{ transform, transformStyle: 'preserve-3d' }}
        whileHover={{ scale }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        {children}
        {glare && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ background: glareBg }}
          />
        )}
      </motion.div>
    </div>
  );
}

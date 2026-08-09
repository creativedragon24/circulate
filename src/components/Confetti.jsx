import { useEffect, useRef } from 'react';

const COLORS = ['#FF6B5B', '#FFB84D', '#7B61FF', '#FF7FA8', '#2EC4B6', '#5B9BFF', '#B8E34A'];

/** Lightweight canvas confetti. Pass `run` = a number; each change re-bursts. */
export default function Confetti({ run = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!run) return;
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.width = window.innerWidth * dpr;
    const H = canvas.height = window.innerHeight * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const N = 90;
    const parts = Array.from({ length: N }, () => ({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 220,
      y: window.innerHeight * 0.62,
      vx: (Math.random() - 0.5) * 9,
      vy: -(Math.random() * 10 + 5),
      g: 0.35 + Math.random() * 0.15,
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }));

    let frame = 0;
    const id = setInterval(() => {
      frame++;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let alive = false;
      for (const p of parts) {
        p.vy += p.g; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y < window.innerHeight + 30) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - (p.y - window.innerHeight * 0.3) / (window.innerHeight * 0.8));
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        else ctx.beginPath(), ctx.arc(0, 0, p.size / 2, 0, 7), ctx.fill();
        ctx.restore();
      }
      if (frame > 140 || !alive) clearInterval(id);
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [run]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[90]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from './pages/Landing.jsx';
import StretchApp from './pages/StretchApp.jsx';

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || '#/');
  useEffect(() => {
    const on = () => {
      setHash(window.location.hash || '#/');
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

/** Phone-frame preview of the app — handy for checking the mobile layout
 *  without a device. The wrapper transform keeps the app's fixed overlays
 *  (player, modals) inside the frame. */
function MobilePreview() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-ink/95 px-4 py-8">
      <div className="mb-5 flex flex-col items-center gap-1.5 text-center">
        <p className="font-display text-sm font-extrabold text-cream">📱 Mobile preview</p>
        <p className="max-w-xs text-xs text-cream/50">
          How the app looks on a phone. For a real device view: open the page in a new tab and use DevTools device mode.
        </p>
        <a href="#/app" className="mt-1 text-xs font-bold text-amber hover:underline">Open full app →</a>
      </div>
      <div
        className="w-full max-w-[390px] overflow-hidden rounded-[2.4rem] border-[10px] border-ink bg-ink shadow-lift"
        style={{ transform: 'translateZ(0)', height: 'min(820px, calc(100vh - 170px))', minHeight: 600 }}
      >
        <StretchApp />
      </div>
    </div>
  );
}

// 3D door-flip between pages — the app "swings in" in 3D when you start it.
const pageMotion = {
  initial: { opacity: 0, rotateY: -60, scale: 0.88, transformPerspective: 1300 },
  animate: { opacity: 1, rotateY: 0, scale: 1, transformPerspective: 1300 },
  exit: { opacity: 0, rotateY: 55, scale: 0.9, transformPerspective: 1300 },
};

export default function App() {
  const hash = useHashRoute();
  const route = hash.startsWith('#/app') ? 'app' : hash.startsWith('#/mobile') ? 'mobile' : 'landing';

  useEffect(() => {
    document.title = route === 'app' || route === 'mobile' ? 'Limber — Stretch at 35,000 ft' : 'Limber — Stretch at 35,000 ft';
  }, [route]);

  const page = route === 'app' ? <StretchApp /> : route === 'mobile' ? <MobilePreview /> : <Landing />;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={route}
        {...pageMotion}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: 'preserve-3d', transformOrigin: '50% 60%' }}
      >
        {page}
      </motion.div>
    </AnimatePresence>
  );
}

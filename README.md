# ✈️ Limber — Stretch at 35,000 ft

**The in-flight stretch break.** A free, offline-first PWA designed for people sitting in an airplane seat — every move works in row 27C, no seatmate required.

Minimal, colourful, 3D and playful (neal.fun energy): 3D scroll animation, an interactive "stretch the passenger" toy, a tappable window with a seatbelt-light easter egg, and satisfying sounds everywhere.

---

## ✨ What you get

**Landing page** (`#/`)
- **3D scroll hero**: the whole hero tilts back in 3D as you scroll, with parallax blobs and a little ✈️ that flies across the screen scroll-linked
- 3D fan of exercise cards that sways on its own and tilts with your mouse
- **Interactive toy** — drag a slider to stretch a passenger (parametric figure, arms rotate, head tilts, ticks + sparkles)
- Tappable airplane window → seatbelt-light easter egg (ding!)
- 9 AI-generated illustrations, all seated in an airplane seat

**The app** (`#/app`) — deliberately minimal, one screen:
- Big breathing **Start** button → *In-Flight Reset* (5 min, 8 moves)
- Two more sessions: *Quick Deplane* (2 min), *Landing Glow* (8 min)
- **All moves** — horizontal strip, tap one to go solo (sheet: gentle mode, hold stepper)
- **Player** — 3D pop-in, countdown, progress ring, session progress bar, pause/skip, side 1→2, gentle hints, confetti + streak celebration
- 🔥 streak + weekly minutes, gear → tiny settings modal (haptics, reset)
- No tabs, no search, no build-a-routine, no stats wall. Just stretch.

**The moves** — 9, all doable in an airplane seat: Neck Stretch, Shoulder Rolls, Sky Reach, Window Twist, Wrist Stretch, Ankle Circles (bye-bye swelling), Knee Hug, Seated Fold, Chest Opener. Each has a gentle mode.

**PWA** — installable, offline-first (service worker precaches everything, images are ~5–10 KB each), auto-updating, synthesized sounds, self-hosted fonts.

**Mobile preview** — `#/mobile` renders the app in a phone frame right in the browser.

---

## 🎨 The illustrations

Generated flat illustrations (consistent character, airplane seat, window + clouds) — one per exercise:
- `public/exercises/*.webp` (9 images, ~70 KB total)
- `public/img/window-sky.webp` (hero/CTA banner)
- originals kept in `tools/assets/gen/` (gitignored)

---

## 🛠 Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 (tokens in `index.css`) |
| Animation / 3D | Framer Motion (useScroll + useTransform 3D, springs, motion template transforms) + CSS 3D |
| PWA | vite-plugin-pwa (Workbox) — manifest, maskable icons, offline precache |
| Sound | Web Audio synthesis — clicks, ticks, chimes, streak jingle |
| Illustrations | AI-generated webp + parametric SVG toy (`SeatToy.jsx`) |
| Fonts | @fontsource Sora (display) + Inter (body), self-hosted |

## 🚀 Run it

```bash
npm install
npm run dev          # dev server (hot reload)
npm run build        # production build + service worker
npm run preview      # serve the production build
```

### Test suites (Playwright)

```bash
node tools/smoke.mjs           # 22 runtime checks (3D scroll, tilt, toy, player…)
node tools/smoke-prod.mjs      # PWA manifest/SW/offline + full session flow
node tools/mobile-check.mjs    # mobile viewport checks + screenshots
node tools/test-ghpages.mjs    # subpath (GitHub Pages) simulation — needs the simulator
```

### Deploy — GitHub Pages
Pre-configured (relative paths, hash routing). See `DEPLOY.md` for the full guide. Also works on Cloudflare Pages / Netlify / Vercel with zero config.

---

Made at 35,000 ft 🫠

// Generates the full PWA icon set from a hand-drawn SVG design.
// node tools/gen-icons.mjs
import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/icons', { recursive: true });

// Icon artwork: gradient squircle + white stretching figure + sparkle.
const FIGURE = `
  <circle cx="100" cy="72" r="17" fill="#fff"/>
  <line x1="100" y1="89" x2="100" y2="102" stroke="#fff" stroke-width="9" stroke-linecap="round"/>
  <line x1="100" y1="98" x2="100" y2="172" stroke="#fff" stroke-width="15" stroke-linecap="round"/>
  <line x1="93" y1="172" x2="90" y2="226" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
  <line x1="107" y1="172" x2="110" y2="226" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
  <line x1="90" y1="226" x2="88" y2="270" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
  <line x1="110" y1="226" x2="112" y2="270" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
  <circle cx="88" cy="273" r="5.5" fill="#fff"/>
  <circle cx="112" cy="273" r="5.5" fill="#fff"/>
  <line x1="79" y1="102" x2="72" y2="148" stroke="#fff" stroke-width="11" stroke-linecap="round"/>
  <line x1="72" y1="148" x2="70" y2="194" stroke="#fff" stroke-width="11" stroke-linecap="round"/>
  <circle cx="70" cy="197" r="5.5" fill="#fff"/>
  <!-- tilted head group: neck-side stretch -->
  <g transform="rotate(-30 100 102)">
    <line x1="122" y1="96" x2="146" y2="64" stroke="#fff" stroke-width="11" stroke-linecap="round"/>
    <line x1="146" y1="64" x2="168" y2="46" stroke="#fff" stroke-width="11" stroke-linecap="round"/>
    <circle cx="171" cy="44" r="5.5" fill="#fff"/>
  </g>`;

const sparkle = `<path d="M176 118 l3.2 11.4 11.4 3.2 -11.4 3.2 -3.2 11.4 -3.2 -11.4 -11.4 -3.2 11.4 -3.2z" fill="#fff" opacity="0.95"/>`;

function iconSvg(safe = 1) {
  // safe: fraction of full size reserved for the figure (maskable-safe)
  const s = 200;
  const fig = `<g transform="translate(${s / 2} ${s / 2}) scale(${(safe * 0.62) / 100} ${(safe * 0.62) / 100}) translate(-100 -130)">${FIGURE}</g>`;
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FF6B5B"/>
        <stop offset="0.55" stop-color="#FFB84D"/>
        <stop offset="1" stop-color="#7B61FF"/>
      </linearGradient>
    </defs>
    <rect width="200" height="200" rx="46" fill="url(#g)"/>
    ${fig}
    <g transform="scale(1.1)">${sparkle}</g>
  </svg>`;
}

const sizes = [
  { file: 'public/icons/icon-192.png', size: 192, safe: 1 },
  { file: 'public/icons/icon-512.png', size: 512, safe: 1 },
  { file: 'public/icons/icon-maskable-512.png', size: 512, safe: 0.78 },
  { file: 'public/icons/apple-touch-icon.png', size: 180, safe: 1 },
];

for (const { file, size, safe } of sizes) {
  await sharp(Buffer.from(iconSvg(safe))).resize(size, size).png().toFile(file);
  console.log('✓', file);
}

// favicon
await sharp(Buffer.from(iconSvg(1))).resize(64, 64).png().toFile('public/icons/favicon.png');
console.log('✓ public/icons/favicon.png');

// Runtime smoke test — catches blank pages, console errors, broken flows.
// Usage: node tools/smoke.mjs [baseUrl]
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:5173/';
const results = [];
const ok = (name, pass, extra = '') => {
  results.push([name, pass]);
  console.log(`${pass ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));

// ---------- landing ----------
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1400);
ok('landing h1 renders', (await page.textContent('h1')).includes('35,000 ft'));
ok('hero CTA present', await page.getByText('Start the flight reset', { exact: true }).count() === 1);
ok('3D fan: 3 cards', (await page.locator('.animate-sway3d button').count()) === 3);
ok('9 move cards', (await page.locator('#moves button').count()) === 9);
ok('move cards use generated images', (await page.locator('#moves img').count()) >= 9);
ok('marquee', (await page.locator('.marquee').count()) === 1);

// --- 3D scroll: hero tilts back as you scroll ---
const heroTransform = async () => page.evaluate(() => {
  const el = document.querySelector('section > div.mx-auto.grid');
  return el ? el.style.transform : '';
});
const t0 = await heroTransform();
await page.mouse.wheel(0, 700);
await page.waitForTimeout(700);
const t1 = await heroTransform();
ok('3D scroll tilts hero (rotateX)', t0 !== t1 && /rotateX\((\d+\.?\d*)deg\)/.test(t1) && !t1.includes('rotateX(0deg)'), t1?.slice(0, 70));

// --- 3D tilt responds to mouse (on fan card) ---
const tiltCard = page.locator('.animate-sway3d .tilt-card').nth(1);
await tiltCard.locator('..').evaluate(el => {
  const r = el.getBoundingClientRect();
  el.dispatchEvent(new MouseEvent('mousemove', { clientX: r.left + r.width * 0.92, clientY: r.top + r.height * 0.12, bubbles: true }));
});
await page.waitForTimeout(700);
const after = await tiltCard.getAttribute('style');
ok('3D tilt responds to mouse', /rotateX\(-?\d+\.?\d*deg\)/.test(after ?? '') && !after.includes('rotateX(0deg)'), after?.slice(0, 70));

// --- window easter egg ---
await page.getByLabel('Tap the window').click();
await page.waitForTimeout(400);
ok('window seatbelt light toggles', (await page.textContent('body')).includes('FASTEN SEATBELT'));

// --- interactive toy ---
await page.locator('input[type=range]').fill('100');
await page.waitForTimeout(400);
ok('drag toy responds (sparkle at full stretch)', (await page.locator('.limber-slider').count()) === 1 && (await page.textContent('#try')).includes('yoga influencer') || (await page.textContent('#try')).includes('impressed'));

// ---------- app ----------
await page.getByText('Start the flight reset', { exact: true }).click().catch(() => {});
if (!page.url().includes('#/app')) await page.evaluate(() => { location.hash = '#/app'; });
await page.waitForTimeout(1300);
const home = await page.textContent('body');
ok('app home renders', home.includes('In-Flight Reset') && home.includes('All moves'));

// start main session
await page.getByLabel('Start In-Flight Reset').click();
await page.waitForTimeout(1200);
ok('player countdown', /3|2|1/.test(await page.textContent('body')) && (await page.locator('p.tabular-nums').count()) === 1);

await page.waitForTimeout(3500);
ok('player hold phase', (await page.textContent('body')).includes('Neck Stretch'));

// hold timer counts down
const timerText = async () => (await page.locator('p.tabular-nums').textContent()).trim();
const tt0 = parseInt(await timerText());
await page.waitForTimeout(3000);
const tt1 = parseInt(await timerText());
ok(`hold timer counts (${tt0} → ${tt1})`, tt1 < tt0 && tt1 >= tt0 - 5);

// progress bar grows
const barPct = async () => page.evaluate(() => {
  const bar = document.querySelector('.absolute.inset-x-0.top-0.h-1 > div');
  return bar ? parseFloat(bar.style.width) : -1;
});
const p1 = await barPct();
await page.waitForTimeout(2500);
ok(`progress bar grows (${p1.toFixed(1)}% → ${(await barPct()).toFixed(1)}%)`, await barPct() > p1);

// pause
await page.getByRole('button', { name: '⏸' }).click();
await page.waitForTimeout(400);
const pausedT = parseInt(await timerText());
await page.waitForTimeout(2000);
ok('pause freezes timer', pausedT === parseInt(await timerText()));
await page.getByRole('button', { name: '▶' }).click();
await page.waitForTimeout(1200);

// skip to side 2 / next
await page.getByRole('button', { name: '⏭' }).click();
await page.waitForTimeout(600);
ok('skip → transition', (await page.textContent('body')).includes('get into position'));
await page.waitForTimeout(4200);
ok('advances (side 2 or next move)', (await page.textContent('body')).includes('side 2') || (await page.textContent('body')).includes('Shoulder Rolls'));

// exit player
await page.getByRole('button', { name: '✕' }).first().click();
await page.waitForTimeout(500);

// move sheet
await page.getByText('Neck Stretch', { exact: true }).first().click();
await page.waitForTimeout(700);
ok('move sheet opens', (await page.textContent('body')).includes('Gentle mode'));
await page.getByText('🪶 Gentle mode').click();
await page.waitForTimeout(300);
ok('gentle hint reveals', (await page.textContent('body')).includes('No pulling'));
await page.getByRole('button', { name: '✕' }).first().click();
await page.waitForTimeout(400);

// settings modal
await page.getByRole('button', { name: 'Settings' }).click();
await page.waitForTimeout(500);
ok('settings modal', (await page.textContent('body')).includes('Haptics'));
await page.getByRole('button', { name: '✕' }).first().click();
await page.waitForTimeout(300);

// ---------- mobile preview route ----------
await page.evaluate(() => { location.hash = '#/mobile'; });
await page.waitForTimeout(1200);
ok('mobile preview frame', (await page.textContent('body')).includes('Mobile preview') && (await page.textContent('body')).includes('In-Flight Reset'));

// ---------- console errors ----------
const realErrors = errors.filter(e => !e.includes('favicon') && !e.includes('Autoplay') && !e.includes('audio'));
ok(`no console/page errors (${realErrors.length})`, realErrors.length === 0, realErrors.slice(0, 3).join(' | '));

// screenshots
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1600);
await page.screenshot({ path: 'tools/shots/landing.png' });
await page.evaluate(() => { location.hash = '#/app'; });
await page.waitForTimeout(1300);
await page.screenshot({ path: 'tools/shots/app.png' });
await page.evaluate(() => { location.hash = '#/mobile'; });
await page.waitForTimeout(1300);
await page.screenshot({ path: 'tools/shots/mobile-preview.png' });

await browser.close();
const failed = results.filter(r => !r[1]).length;
console.log(failed ? `\n${failed} FAILURES` : '\nALL CHECKS PASSED');
process.exit(failed ? 1 : 0);

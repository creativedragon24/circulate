// Production build test: PWA installability, offline mode, full session completion.
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:4173/';
const results = [];
const ok = (name, pass, extra = '') => {
  results.push([name, pass]);
  console.log(`${pass ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));

// ---------- PWA basics ----------
await page.goto(BASE, { waitUntil: 'networkidle' });
ok('manifest serves', (await page.request.get(BASE + 'manifest.webmanifest')).status() === 200);
const swReady = await page.evaluate(() =>
  navigator.serviceWorker.ready.then(r => !!r.active).catch(() => false));
ok('service worker registered & active', swReady);
const manifest = await page.evaluate(async () => {
  const m = await (await fetch('manifest.webmanifest')).json();
  return { name: m.name, icons: m.icons.length, display: m.display };
});
ok('manifest has icons + standalone', manifest.icons === 3 && manifest.display === 'standalone', manifest.name);

// ---------- complete a quick single-move session ----------
await page.evaluate(() => { location.hash = '#/app'; });
await page.waitForTimeout(1300);
await page.getByText('Neck Stretch', { exact: true }).first().click();
await page.waitForTimeout(700);
// shorten hold to 10s (30 → 10 = 4 clicks)
for (let k = 0; k < 4; k++) await page.getByRole('button', { name: '−' }).click();
await page.getByRole('button', { name: /Stretch · gentle|▶ Stretch/ }).click();
// poll for completion
let done = '';
for (let i = 0; i < 40; i++) {
  done = await page.textContent('body');
  if (done.includes('Landing felt better already.')) break;
  await page.waitForTimeout(2000);
}
ok('completion screen', done.includes('Landing felt better already.'));
ok('streak celebrated', done.includes('1-day streak'));

// home shows streak
await page.getByRole('button', { name: 'Done', exact: true }).click();
await page.waitForTimeout(600);
const home = await page.textContent('body');
ok('home shows streak + minutes', home.includes('1-day streak') && home.includes('min this week'));

// ---------- offline mode ----------
await page.evaluate(() => { location.hash = '#/'; });
await page.waitForTimeout(700);
await ctx.setOffline(true);
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1800);
const offlineText = await page.textContent('body');
ok('works fully offline (SW cache)', offlineText.includes('35,000 ft') && offlineText.includes('In your seat'));

// ---------- errors ----------
const real = errors.filter(e => !e.includes('favicon') && !e.includes('Autoplay'));
ok(`no console errors (${real.length})`, real.length === 0, real.slice(0, 2).join(' | '));

await ctx.setOffline(false);
await browser.close();
const failed = results.filter(r => !r[1]).length;
console.log(failed ? `\n${failed} FAILURES` : '\nALL PRODUCTION CHECKS PASSED');
process.exit(failed ? 1 : 0);

// Simulates GitHub Pages: serves the built site at /limber/ (a subpath)
// and verifies everything loads, the PWA registers, and offline works.
// Usage: node tools/test-ghpages.mjs
import { chromium } from 'playwright';

const BASE = 'http://localhost:8899/limber/';
const results = [];
const ok = (n, p, e = '') => { results.push([n, p]); console.log(`${p ? '✓' : '✗'} ${n}${e ? ' — ' + e : ''}`); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
const badReqs = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('requestfailed', r => badReqs.push(r.url()));
page.on('response', r => { if (r.status() >= 400) badReqs.push(`${r.status()} ${r.url()}`); });

// ---------- landing on subpath ----------
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1600);
ok('landing renders on subpath', (await page.textContent('h1')).includes('35,000 ft'));
ok('9 move cards on subpath', (await page.locator('#moves button').count()) === 9);

// ---------- app ----------
await page.evaluate(() => { location.hash = '#/app'; });
await page.waitForTimeout(1200);
ok('app renders on subpath', (await page.textContent('body')).includes('In-Flight Reset'));

// exercise sheet
await page.getByText('Neck Stretch', { exact: true }).first().click();
await page.waitForTimeout(700);
ok('exercise sheet opens', (await page.textContent('body')).includes('Gentle mode'));

// ---------- manifest + service worker ----------
const mf = await page.evaluate(async () => {
  const r = await fetch('./manifest.webmanifest');
  const j = await r.json();
  return { ok: r.ok, start_url: j.start_url, scope: j.scope, icons: j.icons.map(i => i.src) };
});
ok('manifest fetchable at subpath', mf.ok);
ok('manifest start_url/scope relative', mf.start_url === './' && mf.scope === './');
ok('manifest icons relative', mf.icons.every(i => !i.startsWith('/')));

const sw = await page.evaluate(() => navigator.serviceWorker.ready.then(r => ({
  active: !!r.active,
  scope: r.scope,
  scriptURL: r.active ? r.active.scriptURL : '',
})));
ok('service worker active', sw.active);
ok('sw scope is the subpath', sw.scope === 'http://localhost:8899/limber/', sw.scope);

// ---------- offline on subpath ----------
await page.evaluate(() => { location.hash = '#/'; });
await page.waitForTimeout(800);
await page.context().setOffline(true);
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);
const offline = await page.textContent('body');
ok('works offline at subpath', offline.includes('35,000 ft') && offline.includes('In your seat'));
await page.context().setOffline(false);

// ---------- no 404s anywhere ----------
const realBad = badReqs.filter(u => !u.includes('favicon'));
ok(`no failed/404 requests (${realBad.length})`, realBad.length === 0, realBad.slice(0, 3).join(' | '));

const realErrors = errors.filter(e => !e.includes('Autoplay'));
ok(`no console errors (${realErrors.length})`, realErrors.length === 0, realErrors.slice(0, 2).join(' | '));

await browser.close();
const failed = results.filter(r => !r[1]).length;
console.log(failed ? `\n${failed} FAILURES` : '\nALL GITHUB-PAGES-SIMULATION CHECKS PASSED');
process.exit(failed ? 1 : 0);

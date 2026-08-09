// Mobile viewport checks + screenshots for the record.
import { chromium } from 'playwright';
const BASE = 'http://localhost:5173/';
const results = [];
const ok = (n, p, e = '') => { results.push([n, p]); console.log(`${p ? '✓' : '✗'} ${n}${e ? ' — ' + e : ''}`); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
ok('mobile landing renders', (await page.textContent('h1')).includes('35,000 ft'));
ok('no horizontal scroll on landing', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2));
await page.screenshot({ path: 'tools/shots/landing-mobile.png' });

await page.evaluate(() => { location.hash = '#/app'; });
await page.waitForTimeout(1300);
ok('app home renders', (await page.textContent('body')).includes('In-Flight Reset'));
ok('no horizontal scroll on app', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2));
await page.screenshot({ path: 'tools/shots/app-mobile.png' });

// start session on mobile
await page.getByLabel('Start In-Flight Reset').click();
await page.waitForTimeout(1500);
ok('player opens on mobile', (await page.textContent('body')).includes('move 1 of'));
await page.screenshot({ path: 'tools/shots/player-mobile.png' });
await page.getByRole('button', { name: '✕' }).first().click();
await page.waitForTimeout(500);

// move sheet on mobile
await page.getByText('Knee Hug', { exact: true }).first().click();
await page.waitForTimeout(700);
ok('sheet opens on mobile', (await page.textContent('body')).includes('Gentle mode'));
await page.screenshot({ path: 'tools/shots/sheet-mobile.png' });

ok(`no page errors (${errors.length})`, errors.length === 0, errors.join(' | '));
await browser.close();
const failed = results.filter(r => !r[1]).length;
console.log(failed ? `\n${failed} FAILURES` : '\nALL MOBILE CHECKS PASSED');
process.exit(failed ? 1 : 0);

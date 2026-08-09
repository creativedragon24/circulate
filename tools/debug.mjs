import { chromium } from 'playwright';
const BASE = process.argv[2] || 'http://localhost:5173/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', e => console.log('PAGEERROR:', String(e)));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// 1) category filter
const wristPills = await page.getByRole('button', { name: /Wrists/ }).count();
console.log('pills matching /Wrists/:', wristPills);
await page.getByRole('button', { name: /Wrists/ }).first().click();
await page.waitForTimeout(800);
console.log('cards after filter:', await page.locator('#moves button.group').count());
console.log('card names:', await page.locator('#moves button.group p').allTextContents());
await page.getByRole('button', { name: /All \(21\)/ }).click();
await page.waitForTimeout(600);

// 2) faq
await page.locator('#faq button').nth(2).click();
await page.waitForTimeout(500);
const faqText = await page.textContent('#faq');
console.log('faq has PWA answer:', faqText.includes('PWA'), '| has posture answer:', faqText.includes('un-install'));

// 3) player skip
await page.evaluate(() => { location.hash = '#/app'; });
await page.waitForTimeout(1000);
await page.getByText('Neck Side Stretch').first().click();
await page.waitForTimeout(600);
await page.getByRole('button', { name: /Stretch now/ }).click();
await page.waitForTimeout(4500); // past countdown into hold
let t = await page.textContent('body');
console.log('in hold:', t.includes('side 1'), '| paused btn exists:', await page.getByRole('button', { name: '⏸' }).count());
await page.getByRole('button', { name: '⏸' }).click().catch(e => console.log('pause click err', e.message));
await page.waitForTimeout(300);
console.log('after pause — has ▶ resume:', await page.getByRole('button', { name: '▶' }).count());
await page.getByRole('button', { name: '⏭' }).click().catch(e => console.log('skip click err', e.message));
await page.waitForTimeout(700);
t = await page.textContent('body');
console.log('after skip — get into position:', t.includes('get into position'));
console.log('after skip — side 2:', t.includes('side 2'));
console.log('after skip — excerpt:', t.slice(t.indexOf('move'), t.indexOf('move') + 90));

// 4) stats
await page.getByRole('button', { name: '✕' }).first().click();
await page.waitForTimeout(400);
await page.locator('nav button', { hasText: 'Stats' }).first().click();
await page.waitForTimeout(600);
const statsBody = await page.textContent('body');
console.log('day streak count:', (statsBody.match(/day streak/g) || []).length);
console.log('sessions label:', (statsBody.match(/sessions/g) || []).length);

await browser.close();
